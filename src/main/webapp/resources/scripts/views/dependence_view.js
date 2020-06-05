var DependenceView = {};

class DependenceViewClass extends DependenceGraphTemplate {
    constructor(data, dependencies, view) {
        super(data, dependencies, view);

        // init data containers
        this.impactIDs = [];
        this.changeIDs = [];
        this.includeIDs = new Map();

        console.log("Building Dependency Graph...");

        // dependency displaying mode
        this.dependencyDisplayingMode = DEPENDENCY_DISPLAYING_MODE.ALL;
        this.lastActiveNode = this.root;

        // init menu
        this.normalMenu = [changeOption, viewSourceCodeOption, showClassDiagramOption];
        this.fileMenu = [changeOption, viewSourceCodeOption, viewClassDiagram2];

        let graph = this;

        let getAllNodesTask = new Promise((resolve, reject) => {
            TREE_API.getAllNodes().done((res) => {
                if (!res.error) {
                    let data = res.data;
                    console.log(data);
                    var numRow = Math.floor(Math.sqrt(data.length));
                    for (let i = 0; i < data.length; i++) {
                        var n = new Node();
                        n.graph = graph;
                        n.data = Object.assign({}, data[i]);
                        n.data.id = data[i].id;
                        n.data.kind = data[i].kind;
                        n.data.name = data[i].name;
                        n.data.hasChildren = data[i].hasChildren;
                        n.data.children = data[i].children;
                        n.setPosition(FULLGRAPH_CONFIG.ROOT_POSITION.x + (i % numRow) * (FULLGRAPH_CONFIG.MIN_WIDTH_NODE + 40), FULLGRAPH_CONFIG.ROOT_POSITION.y + 50 + Math.floor(i / numRow) * 60);
                        this.newNode(n);
                    }
                    resolve('done');
                } else reject(data);
            });
        });

        getAllNodesTask.then((res) => {
            // create dependency arrows
            DependenceView.processLink(null);
        })

        // get all priority includeIDs from server
        let getIncludeIDsTask = new Promise((resolve, reject) => {
            TREE_API.getAllIncludeIds().done((res) => {
                if (!res.error) {
                    let data = res.data;
                    for (let i = 0; i < data.length; i++) {
                        let node = data[i];
                        node.ids.push(node.id);
                        graph.includeIDs.set(node.id, node.ids);
                    }
                    resolve('done');
                } else reject(data);
            });
        });

        getIncludeIDsTask.then((res) => {
            // tạo nút gốc
            let childrenData = [];
            let childList = [];
            let temp = 0;
            graph.root.data.children.forEach((e, i) => {
                let node = new Node(e, graph);
                if (e.kind == "jar" || e.kind == "dbschema" || e.kind == "webservice") {
                    node.setPosition(FULLGRAPH_CONFIG.ROOT_POSITION.x + temp * 300, 100);
                    childrenData.push(node);
                    temp++;
                } else {
                    childList.push(e);
                }
            });

            this.root.children = childrenData;
            DependenceView.processLink(null);

            console.log("Done Building Dependency Graph!");
            $('#preloader').fadeOut('slow');
        }).catch((error) => {
            console.log(error);
            alert('Error! Please refresh!')
        });
    }

    expandNode(node) {

        // update Depth
        this.getNodeView(node).remove();
        this.newNode(node, this.view);

        let childrenData = node.data.children;
        // console.log(childrenData);
        if (childrenData == null)
            return;
        //console.log(childrenData);
        node.children = [];

        // Gắn các node con vào node cha trên graph
        this.createChildrenGraphNode(node, childrenData);

        // cập nhật lại vị trí
        this.lastActiveNode = node;
        this.view.select(".id" + node.data.id).attr("class", "id" + node.data.id);
        this.resizeNodeByChildren(node);
        this.collisionSolve(node);
        this.processLink(node);
        this.highlight();

    }

    collapseNode(node) {
        this.lastActiveNode = node;
        this.getNodeView(node).remove();
        node.collapse();
        this.newNode(node);
        this.processLink(node);
        this.highlight();
    }

    processLink(node) {
        switch (this.dependencyDisplayingMode) {
            case DEPENDENCY_DISPLAYING_MODE.NONE:
                this.updateNoneLink();
                break;
            case DEPENDENCY_DISPLAYING_MODE.PARTIAL:
                this.updatePartialLink(node);
                break;
            case DEPENDENCY_DISPLAYING_MODE.ALL:
                this.updateFullLink();
                break;
        }
    }

    updateNoneLink() {
        this.linkData = [];
        this.drawLink();
    }

    updatePartialLink(node) {
        let graph = this;
        let nearestSiblingId = this.getNearestOlderSiblingId(node);
        this.linkData = [];
        this.dependences.forEach(function (depends) {
            depends.dependency.forEach(function (depend) {
                if ((depends.id > node.data.id && depends.id < nearestSiblingId) || (depend.id > node.data.id && depend.id < nearestSiblingId)) {
                    let destID = depend.id;
                    graph.getNearestNodeOnGraph(depends.id, function (error, srcNode) {
                        if (error) return;
                        var src = srcNode.node.datum();
                        graph.getNearestNodeOnGraph(destID, function (error, destNode) {
                            if (error) return;
                            if (depends.id == Data.getClassIDfromPropertyID(destID)) return;
                            let dest = destNode.node.datum();
                            if (src.data.id == dest.data.id) return;
                            // console.log(src,dest);
                            if (graph.linkData.find(function (d) {
                                    return src.data.id == d.source.data.id && dest.data.id == d.destination.data.id
                                }) == undefined) {
                                let link = new Link(src, dest, depend.typeDependency, depend.weight);
                                graph.linkData.push(link);
                            }
                        })
                    })
                }

            });
        });
        this.drawLink();
    }


    highlight() {
        // this.view.selectAll(".title").attr("fill", FULLGRAPH_CONFIG.TITLE_COLOR);

/*
        for (let i = 0; i < this.root.children.length; i++) {
            if (this.root.children[i].data.kind === "jar") {
                this.getNearestNodeOnGraph(this.root.children[i].data.id, function (error, foundNode) {
                    if (!error) {
                        foundNode.node.select(".title").attr("fill", FULLGRAPH_CONFIG.EXTERNAL_LIB);
                        // console.log(foundNode.node);
                    }
                });
                this.highlightExternalLibraryView(this.root.children[i])
            }
        }*/

        // let graph = this;
        // this.changeIDs.forEach(function (id) {
        //     graph.getNearestNodeOnGraph(id, function (error, foundNode) {
        //         if (!error) {
        //             foundNode.node.select(".title").attr("fill", FULLGRAPH_CONFIG.CHANGE_HIGHLIGHT_COLOR);
        //         }
        //     });
        // });

    }

    onContextMenuNode(data) {
        let menu = this.normalMenu;
        if (data.kind == 'file') menu = this.fileMenu;
        return d3.contextMenu(menu);
    }

    highlightExternalLibraryView(node) {
        for (let i = 0; i < node.children.length; i++) {
            this.highlightExternalLibraryView(node.children[i]);
            this.getNearestNodeOnGraph(node.children[i].data.id, function (error, foundNode) {
                if (!error) {
                    foundNode.node.select(".title").attr("fill", FULLGRAPH_CONFIG.EXTERNAL_LIB);
                }
            })
        }
    }

}