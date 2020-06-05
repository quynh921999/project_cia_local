// if node is in changeset, remove it; if not, add it to changeset
let changeOption = {
    title: function (elm, d, i) {
        if (Data.changeSet.findIndex(change => change.id === d.data.id) >= 0) return "Unchange";
        else return "Change";
    },
    action: function (elm, d, i) {
        d3.select('.d3-context-menu').style('display', 'none');
        // if (Data.changeSet.findIndex(change => change.id === d.data.id) >= 0) ChangeSetView.removeChange(d.data.id);
        // else ChangeSetView.addToChangeSet({id: d.data.id, changes: [2], name: d.data.name}); // change type 2
        // TREE_API.calculateImpact(Data.changeSet.map(change => change.id)).done((res) => {
        //     if (!res.error) {
        //         window.location.reload();
        //     }
        // });
    }
};

var showClassDiagramOption = {
    title: "View Class Diagram",
    action: function (elm, d, i) {
        d3.select('.d3-context-menu').style('display', 'none');
        // tabFullList.forEach(function (tab) {
        //     if (tab.id === CLASS_DIAGRAM_VIEW_ID){
        //         CentralView.event.addTab(tab);
        //     }
        // });
        // console.log("view class diagram" , d.data.id);
        // $.get("api/tree/getLayerClassDiagram/" + d.data.id , function (data,status) {
        //    if(status === "success"){
        //        if(data.data.blocks.length !== 0){
        //            if (ClassDiagram == null) {
        //                ClassDiagram = new Diagram(d3.select("#class-diagramg") , data.data);
        //                ClassDiagram.drawDiagram();
        //            }
        //            else {
        //                ClassDiagram.resetData(data.data);
        //            }
        //
        //            CentralView.switchTab("class-diagram");
        //        }
        //    }
        // });
    }
};

var showDataFlowDiagramOption = {
    title: "Data Flow Diagram",
    action: function (elm, d, i) {
        d3.select('.d3-context-menu').style('display', 'none');
        // console.log("view data flow" , d.data.id);
        // $.get("api/tree/getDataFlow/" + d.data.id , function (data,status) {
        //     if(status === "success"){
        //         console.log(data);
        //         if(data.data.blocks.length !== 0){
        //             if (ClassDiagram == null) {
        //                 ClassDiagram = new DataFlowDiagram(d3.select("#class-diagramg") , data.data);
        //                 //ClassDiagram.drawDiagram();
        //             }
        //             else {
        //                 ClassDiagram.resetData(data.data);
        //             }
        //
        //             CentralView.switchTab("class-diagram");
        //         }
        //     }
        // });
    }
};

let viewClassDiagram2 = {
    title: "View Class Diagram (2)",
    action: function (elm, d, i) {
        d3.select('.d3-context-menu').style('display', 'none');
        // tabFullList.forEach(function (tab) {
        //     if (tab.id === CLASS_DIAGRAM_VIEW_ID){
        //         CentralView.event.addTab(tab);
        //     }
        // });
        // let level = Prompter.prompt("Enter the dependency level", 1);
        // console.log('level: ' + level);
        // $.get("api/tree/getClassDiagram2/" + d.data.id + "?level=" + level, function (data,status) {
        //     if(status === "success"){
        //         console.log(data);
        //         if(data.data.blocks.length !== 0){
        //             CentralView.switchTab(CLASS_DIAGRAM_VIEW_ID);
        //             $("#" + CLASS_DIAGRAM_VIEW_ID + "g").empty();
        //             if (ClassDiagram == null) {
        //                 ClassDiagram = new Diagram(d3.select("#class-diagramg") , data.data);
        //                 ClassDiagram.drawDiagram();
        //             }
        //             else {
        //                 ClassDiagram.resetData(data.data);
        //             }
        //
        //             CentralView.switchTab("class-diagram");
        //         }
        //     }
        // });
    }
};

let viewSourceCodeOption = {
    title: "View Source Code",
    action: function (elm, d, i) {
        d3.select('.d3-context-menu').style('display', 'none');
        // SourceCodeViewClass.draw(d);
    }
};

class Node {
    constructor(data, graph) {
        this.children = [];
        this.graph = graph;
        this.data = data;
        this.x = 0;
        this.y = 0;
        this.width = FULLGRAPH_CONFIG.MIN_WIDTH_NODE;
        this.height = FULLGRAPH_CONFIG.MIN_HEIGHT_NODE;
    }

    collapse() {
        this.width = FULLGRAPH_CONFIG.MIN_WIDTH_NODE;
        this.height = FULLGRAPH_CONFIG.MIN_HEIGHT_NODE;
        this.children = [];
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    getFileNode() {
        return this.doGetFileNode(this);
    }

    doGetFileNode(node) {
        if (!node || node.data.kind === "file") {
            return node;
        } else {
            return this.doGetFileNode(node.parent);
        }
    }
}

class Link extends Segment {
    constructor(source, destination, typeDependency, weight) {
        super(source, destination);
        this.typeDependency = typeDependency;
        this.weight = weight;
        this.updateLine();
    }

    updateLine() {
        super.updateLine(0);
    }
}

class DependenceGraphTemplate extends GraphTemplate {
    constructor(dataAsTree, dependencies, view) {
        super(dataAsTree, view);

        // inject
        this.dependences = dependencies;

        // init data containers
        this.linkData = [];

        // init link views
        this.links = view.select(".link_fullgraph").selectAll("g").remove();
    }

    updateNode(node) {
        let nodeView = this.view.select(".id" + node.data.id);
        nodeView.attr("x", node.x).attr("y", node.y).attr("width", node.width).attr("height", node.height);
        nodeView.select(".title").attr("x", node.x).attr("y", node.y);
        nodeView.select(".icon").attr("x", node.x + FULLGRAPH_CONFIG.ICON_POSITION.x).attr("y", node.y + FULLGRAPH_CONFIG.ICON_POSITION.y);
        nodeView.select(".title-text").attr("x", node.x + FULLGRAPH_CONFIG.TEXT_POSITION.x).attr("y", node.y + FULLGRAPH_CONFIG.TEXT_POSITION.y);
    }

    addChild(parent, child) {
        let childNode = new Node(child, this);
        childNode.parent = parent;
        parent.children.push(childNode);
    }

    newNode(node) {
        // Khởi tạo g
        let parentView = (node.parent && this.getNodeView(node.parent)) || this.view;
        let nodeView = parentView.append("g").data([node]).call(NodeEvent.drag);
        nodeView.attr("class", "id" + node.data.id);
        nodeView.attr("x", node.x).attr("y", node.y);

        let color;
        if (node.data.change === 'unchanged') {
            color = FULLGRAPH_CONFIG.TITLE_COLOR;
        } else if (node.data.change === 'removed') {
            color = "red";
        } else if (node.data.change === 'changed') {
            color = "blue";
        } else if (node.data.change === 'added') {
            color = "green";
        }

        // Tạo nền, tiêu đề,...
        // let background = nodeView.append("rect").classed("background", true)
        //     .attr("x", node.x+ FULLGRAPH_CONFIG.PADDING_NODE).attr("y", node.y + FULLGRAPH_CONFIG.PADDING_NODE)
        //     .attr("rx","3").attr("ry","3")
        //     .attr("width", node.width).attr("height", node.height);

        let title = nodeView.append("rect").attr("class", "title")
            .attr("x", node.x).attr("y", node.y)
            .attr("rx", FULLGRAPH_CONFIG.PADDING_NODE).attr("ry", FULLGRAPH_CONFIG.PADDING_NODE)
            .attr("width", node.width).attr("height", FULLGRAPH_CONFIG.TITLE_HEIGHT_NODE)
            .attr("fill", color)
            .on("mouseover", NodeEvent.highlightDependences)
            .on('mouseout', NodeEvent.unhighlightDependences);

        let icon = nodeView.append("image").attr("class", "icon")
            .attr("x", node.x + FULLGRAPH_CONFIG.ICON_POSITION.x).attr("y", node.y + FULLGRAPH_CONFIG.ICON_POSITION.y)
            .attr("width", FULLGRAPH_CONFIG.ICON_SIZE).attr("height", FULLGRAPH_CONFIG.ICON_SIZE)
            .attr("xlink:href", this.getIconLink(node.data))
            .on("mouseover", NodeEvent.onMouseOverTitleText)
            .on('mouseout', NodeEvent.onMouseOutTitleText);

        let text = nodeView.append("text").attr("class", "title-text")
            .attr("x", node.x + FULLGRAPH_CONFIG.TEXT_POSITION.x).attr("y", node.y + FULLGRAPH_CONFIG.TEXT_POSITION.y)
            .attr("fill", "white").attr("font-size", CLASSDRAWER_CONFIG.NORMAL_FONT_SIZE)
            .text(Utils.convertNameToShorterForDependenceView(node.data))
            .on("mouseover", NodeEvent.onMouseOverTitleText)
            .on("mouseout", NodeEvent.onMouseOutTitleText);


        nodeView.on("contextmenu", this.onContextMenuNode(node.data));
        this.updateNode(node);

        if (node.data.change !== "unchanged") {
            ChangeSetView.addToChangeSet({id: node.data.id, changes: [2], name: node.data.name});
        }
    }

    expandNode(node) {
        let childrenData = node.data.children;
        // console.log(childrenData);
        if (childrenData == null)
            return;
        //console.log(childrenData);

        node.children = [];

        // Gắn các node con vào node cha trên graph
        this.createChildrenGraphNode(node, childrenData);

        // cập nhật lại vị trí
        this.view.select(".id" + node.data.id).attr("class", "id" + node.data.id);
        this.resizeNodeByChildren(node);
        this.collisionSolve(node);
        this.updateFullLink();
        this.highlight();
    }

    createChildrenGraphNode(parent, children) {
        let numRow = Math.floor(Math.sqrt(children.length));

        children.forEach((child, i) => {
            let childNode = new Node(child, this);
            childNode.parent = parent;
            childNode.setPosition(parent.x + (i % numRow) * (FULLGRAPH_CONFIG.MIN_WIDTH_NODE + 40), parent.y + 50 + Math.floor(i / numRow) * 60);
            parent.children.push(childNode);
            this.newNode(childNode);
        });
    }

    collapseNode(node) {
        this.getNodeView(node).remove();
        node.collapse();
        this.newNode(node);
        this.updateFullLink();
        this.highlight();
    }

    moveNode(node, dx, dy) {
        node.x += dx;
        node.y += dy;
        if (node.children) {
            node.children.forEach(d => {
                this.moveNode(d, dx, dy);
            });
        }
        this.updateNode(node);
        this.updateLinkOfNode(node);
    }

    collisionSolve(changedNode) {
        let changes = [changedNode];
        let parent = changedNode.parent;
        // Nếu là node gốc return
        if (!parent) return;
        if (this.getNodeView(parent).node() == null) return;
        let graph = this;
        let sibling = parent.children.slice(0, parent.children.length);
        while (changes.length > 0) {
            let change = changes.pop();
            sibling.splice(sibling.indexOf(change), 1);
            sibling.forEach(function (d, i) {
                let collision = Utils.checkCollision(change, d);
                if (collision[0] !== 0 && collision[1] !== 0) {
                    if (Math.abs(collision[0]) <= Math.abs(collision[1])) {
                        graph.moveNode(d, collision[0], 0);
                    } else {
                        graph.moveNode(d, 0, collision[1]);
                    }
                    changes.push(d);
                }
            });
            graph.updateNode(change);
        }
        // tiép tục cập nhật lớp cha
        this.resizeNodeByChildren(parent);
        this.collisionSolve(parent);
    }

    updateLinkOfNode(node) {
        this.links.filter(link => {
            if (link.source === node || link.destination === node) {
                link.updateLine();
                return true;
            }
            return false;
        })
            .attr("x1", link => link.begin.x).attr("y1", link => link.begin.y)
            .attr("x2", link => link.end.x).attr("y2", link => link.end.y);
    }

    drawLink() {
        // console.log(2);

        this.links.remove();

        this.links = this.view.append('g').attr("class", "link_fullgraph").selectAll("line").data(this.linkData).enter()
            .append("line")
            .attr("x1", link => link.begin.x).attr("y1", link => link.begin.y)
            .attr("x2", link => link.end.x).attr("y2", link => link.end.y)
            .style("opacity", 0.25)
            .attr("marker-end", "url(#end-arrow-fullgraph)").attr("stroke", FULLGRAPH_CONFIG.LINE_STROKE_COLOR)
            .on("mouseover", Event.showDetailWhenMouseOverLine)
            .on("mouseout", Event.clearWhenMouseOutLine);

        this.links.filter(link => (link.source.data.change !== "unchanged"))
            .style("opacity", 1.0)
            .attr('stroke', FULLGRAPH_CONFIG.DEPEND_STROKE_COLOR)
            .attr("marker-end", "url(#depend-arrow-fullgraph)");
        this.links.filter(link => (link.destination.data.change !== "unchanged"))
            .style("opacity", 1.0)
            .attr('stroke', FULLGRAPH_CONFIG.DEPENDED_STROKE_COLOR)
            .attr("marker-end", "url(#depended-arrow-fullgraph)");
    }

    // include itself
    // first check in includeIDs map cache, else
    // second check from server api
    // from the second invocation, nodeId is included of its includeIds
    getNearestNodeOnGraph(nodeId, cb) {
        let graph = this;
        let ids = this.includeIDs.get(nodeId);
        if (ids) {
            // ids.push(nodeId);
            for (let i = ids.length - 1; i >= 0; i--) {
                let node = graph.view.select(".id" + ids[i]);
                if (node.node() != null) return cb(undefined, {node: node, id: ids[i]});
            }
        } else {
            TREE_API.getIncludeIds(nodeId).done(function (res) {
                if (!res.error) {
                    let data = res.data;
                    graph.includeIDs.set(nodeId, data);
                    data.push(nodeId);
                    for (let i = data.length - 1; i >= 0; i--) {
                        let node = graph.view.select(".id" + data[i]);
                        if (node.node() != null) return cb(undefined, {node: node, id: data[i]});
                    }
                }
            });
        }
        return cb(new Error('[' + nodeId + ']' + 'node not found'));
    }


    updateFullLink() {
        this.linkData = [];
        // Duyệt danh sách dependences tất cả các phụ thuộc có liên quan
        let graph = this;
        this.dependences.forEach(function (depends) {
            graph.getNearestNodeOnGraph(depends.id, function (error, srcNode) {
                if (error) return;
                let src = srcNode.node.datum();

                depends.dependency.forEach(function (depend) {
                    let destID = depend.id;
                    graph.getNearestNodeOnGraph(destID, function (error, destNode) {
                        if (error) return;
                        if (depends.id === Data.getClassIDfromPropertyID(destID)) return;
                        let dest = destNode.node.datum();
                        if (src.data.id === dest.data.id) return;
                        // console.log(src,dest);
                        // if (graph.linkData.find(function (d) {
                        //         return src.data.id === d.source.data.id && dest.data.id === d.destination.data.id
                        //     }) === undefined) {
                        //     let link = new Link(src, dest, depend.typeDependency, depend.weight);
                        //     graph.linkData.push(link);
                        //     // console.log(link.source.data.id + "->" + link.destination.data.id);
                        // }
                        let link = new Link(src, dest, depend.typeDependency, depend.weight);
                        graph.linkData.push(link);
                    })
                })

            });
        });
        this.linkData;
        this.drawLink();
    }

    getNearestOlderSiblingId(node) {
        let nodeData = node.data;
        if (nodeData.parent == null) return Number.MAX_SAFE_INTEGER;
        let siblings = nodeData.parent.children;
        for (let count = siblings.length - 1; count >= 0; count--) {
            if (siblings[count].id === nodeData.id) {
                if (count === siblings.length - 1) {
                    return this.getNearestOlderSiblingId(node.parent);
                } else return siblings[count + 1].id;
            }
        }
        return null;
    }

    setChangeIDs(ids) {
        this.changeIDs = ids;
        this.highlight();
    }

    setImpactIDs(ids) {
        this.impactIDs = ids;
        this.highlight();
    }

    resizeNodeByChildren(parent) {
        if (!parent) return;
        if (!parent.children || parent.children.length == 0) return;
        if (this.getNodeView(parent).node() == null) return;
        // if() return;
        let padding = 2 * FULLGRAPH_CONFIG.PADDING_NODE;
        let minTopLeft = {x: 999999, y: 999999};
        let maxBotRight = {x: -999999, y: -999999};

        // Tìm vị trí bot-right và top-left xa nhất trong các node con
        parent.children.forEach(function (d, i) {
            if (d.x < minTopLeft.x) {
                minTopLeft.x = d.x;
            }
            if (d.x + d.width > maxBotRight.x) {
                maxBotRight.x = d.x + d.width;
            }
            if (d.y < minTopLeft.y) {
                minTopLeft.y = d.y;
            }
            if (d.y + d.height > maxBotRight.y) {
                maxBotRight.y = d.y + d.height;
            }
        });

        // cập nhật node cha
        parent.x = minTopLeft.x - padding;
        parent.y = minTopLeft.y - padding - FULLGRAPH_CONFIG.TITLE_HEIGHT_NODE;
        parent.width = maxBotRight.x - minTopLeft.x + 2 * padding;
        parent.height = maxBotRight.y - minTopLeft.y + 2 * padding + FULLGRAPH_CONFIG.TITLE_HEIGHT_NODE;
        this.updateNode(parent);
        this.resizeNodeByChildren(parent.parent);
        this.updateLinkOfNode(parent);
    }

    highlight() {
        //this.view.selectAll(".title").attr("fill", FULLGRAPH_CONFIG.TITLE_COLOR);

        // let color;
        // if (node.data.change === 'unchanged') {
        //     color = FULLGRAPH_CONFIG.TITLE_COLOR;
        // } else if (node.data.change === 'removed') {
        //     color = "red";
        // } else if (node.data.change === 'changed') {
        //     color = "#bfbf30";
        // } else if (node.data.change === 'added') {
        //     color = "green";
        // }
        let graph = this;
        // display impact set view following by dependency graph data
        // clear existed impact set before displaying new one
        ImpactSetView.impactIds = [];
        ImpactSetView.clearAll();

        let realImpactIDs = this.impactIDs.filter(id => this.changeIDs.indexOf(id) < 0);

        let highlightTask = new Promise((resolve, reject) => {
            realImpactIDs.forEach(function (id) {
                graph.getNearestNodeOnGraph(id, function (error, foundNode) {
                    if (!error) {
                        // foundNode.node.select(".title").attr("fill", FULLGRAPH_CONFIG.IMPACT_HIGHLIGHT_COLOR);
                        ImpactSetView.addImpactIds(foundNode.id);
                        ImpactSetView.display();
                    }
                });
            });
            resolve('done');
        });

        // highlightTask.then((res) => {
        //     this.changeIDs.forEach(function (id) {
        //         graph.getNearestNodeOnGraph(id, function (error, foundNode) {
        //             if (!error) {
        //                  foundNode.node.select(".title").attr("fill", FULLGRAPH_CONFIG.CHANGE_HIGHLIGHT_COLOR);
        //             }
        //         });
        //     });
        // }).catch((error) => {
        //     console.log("Encountered error when highlighting");
        //     console.log(error);
        // });
    }

    getIncludeIdsMap() {
        return this.includeIDs;
    }

    getChildrenData(data) {
        Utils.expand(data);
        return data.children;
    }

    getNodeView(node) {
        return this.view.select(".id" + node.data.id)
    }

    getIconLink(data) {
        return "resources/images/" + data.kind + ".svg";
    }

    searchNode(id) {
        return this.recursiveSearch(id, this.root);
    }

    recursiveSearch(id, node) {
        if (node.data.id === id) {
            return node;
        }

        let childrenList = node.children;
        let res = null;
        if (Utils.isValidObject(childrenList)) {
            childrenList.forEach(node => {
                let temp = this.recursiveSearch(id, node);
                if (temp != null) res = temp;
            });
        }
        return res;
    }

    onContextMenuNode(data) {
        return d3.contextMenu([]);
    }

    onMouseOverNode(data) {

    }

    onMouseOutNode(data) {

    }

    // onDoubleClickNode(node) {
    //     NodeEvent.onDoubleClickNode(node, LOAD_DATA.DEPENDENCY_VIEW);
    // }

}

let NodeEvent = {};

NodeEvent.dragged = function (node) {
    d3.event.sourceEvent.stopPropagation();
    node.graph.moveNode(node, d3.event.dx, d3.event.dy);
    node.graph.collisionSolve(node);
};
NodeEvent.dragstarted = function (node) {
    d3.event.sourceEvent.stopPropagation();
    Event.clearWhenMouseOut(node);
};
NodeEvent.dragended = function (node) {
    d3.event.sourceEvent.stopPropagation();
};

// NodeEvent.onDoubleClickNode = function (node, type) {
//     d3.event.stopPropagation();
//
//     if (node.children != null && node.children.length > 0) {
//         node.graph.collapseNode(node);
//         node.graph.resizeNodeByChildren(node.parent);
//
//     } else if (node.data.children == null || node.data.children.length == 0) {
//         switch (type) {
//             case LOAD_DATA.CHANGE_IMPACT_VIEW:
//                 console.log('[ANALYZED_TREE_API] Getting data for [' + node.data.name + ']...');
//                 Notifier.displayProcessingTask("Processing...");
//
//                 ANALYZED_TREE_API.getNodeData(node.data.id).done(res => {
//                     if (!res.error) {
//                         let data = res.data;
//                         // find node on graph
//                         let parentGraphNode = ChangeImpactDependenceView.searchNode(data.id);
//                         let parentNode = parentGraphNode.data;
//
//                         // process data
//                         let parser = new Parser();
//                         let part = parser.parseObject(data);
//                         parentNode.children = [];
//                         let childrenList = [];
//                         part.children.forEach(node => {
//                             node.parent = parentNode;
//                             node.depth = parentNode.depth + 1;
//                             childrenList.push(node);
//                         });
//                         parentNode.children = parentNode.children.concat(childrenList);
//
//                         // attach parent node with new children to graph
//                         ChangeImpactDependenceView.expandNode(parentGraphNode);
//                         console.log('[ANALYZED_TREE_API] Done getting data for [' + data.name + ']!');
//                         Notifier.removeNotification();
//                     } else {
//                         console.log('[ANALYZED_TREE_API] Nothing to get!');
//                         Notifier.displayError("Nothing to get!");
//                     }
//                 });
//                 break;
//             case LOAD_DATA.PACKAGE_DIAGRAM_VIEW:
//                 console.log('[PACKAGE_DIAGRAM_API] Getting data for [' + node.data.name + ']...');
//                 Notifier.displayProcessingTask("Processing...");
//                 PACKAGE_DIAGRAM_API.getNodeData(node.data.id).done(res => {
//                     if (!res.error) {
//                         let data = res.data;
//                         // find node on graph
//                         let parentGraphNode = PackageDiagramView.searchNode(data.id);
//                         let parentNode = parentGraphNode.data;
//
//                         // process data
//                         let parser = new Parser();
//                         let part = parser.parseObject(data);
//                         parentNode.children = [];
//                         let childrenList = [];
//                         part.children.forEach(node => {
//                             node.parent = parentNode;
//                             node.depth = parentNode.depth + 1;
//                             childrenList.push(node);
//                         });
//                         parentNode.children = parentNode.children.concat(childrenList);
//
//                         // attach parent node with new children to graph
//                         PackageDiagramView.expandNode(parentGraphNode);
//                         Notifier.removeNotification();
//                         console.log('[PACKAGE_DIAGRAM_API] Done getting data for [' + data.name + ']!');
//                     } else {
//                         console.log('[PACKAGE_DIAGRAM_API] Nothing to get!');
//                         Notifier.displayError("Nothing to get!")
//
//                     }
//                 });
//                 break;
//             default:
//                 console.log("[TREE_API] Getting data for [" + node.data.name + ']...');
//                 Notifier.displayProcessingTask("Processing...");
//
//                 Utils.loadChildrenData(node.data, type).then(data => {
//                     if (data == null) {
//                         console.log('[TREE_API] Nothing to get!');
//                         Notifier.displayError("Nothing to get!");
//                         return;
//                     } else {
//                         let newNode = Data.processPartitionData(data);
//                         console.log("[TREE_API] Done getting data for [" + data.name + ']!');
//                         let parentGraphNode = DependenceView.searchNode(data.id);
//                         parentGraphNode.data.children = newNode.children;
//                         DependenceView.expandNode(parentGraphNode);
//                         Notifier.removeNotification();
//                     }
//                 });
//         }
//
//     } else {
//         NodeEvent.expandNode(node);
//     }
// };

NodeEvent.expandNode = function (node) {
    node.graph.expandNode(node);
    node.graph.resizeNodeByChildren(node);
    node.graph.collisionSolve(node);
    node.graph.updateNode(node);
};

NodeEvent.onMouseOverTitleText = function (node) {
    NodeEvent.highlightDependences(node);
    Event.showDetailWhenMouseOver(this, node.data);
};

NodeEvent.onMouseOutTitleText = function (node) {
    NodeEvent.unhighlightDependences(node);
    Event.clearWhenMouseOut(this, node.data);
};

NodeEvent.highlightDependences = function (node) {
    d3.event.stopPropagation();
    let links = node.graph.links;
    links.filter(link => (link.source === node))
        .style("opacity", 1.0)
        .attr('stroke', FULLGRAPH_CONFIG.DEPEND_STROKE_COLOR)
        .attr("marker-end", "url(#depend-arrow-fullgraph)");

    links.filter(link => (link.destination === node))
        .style("opacity", 1.0)
        .attr('stroke', FULLGRAPH_CONFIG.DEPENDED_STROKE_COLOR)
        .attr("marker-end", "url(#depended-arrow-fullgraph)");

    links.filter(link => (link.source !== node && link.destination !== node))
        .style("opacity", 0.25)
        .attr('stroke', FULLGRAPH_CONFIG.LINE_STROKE_COLOR)
        .attr("marker-end", "url(#end-arrow-fullgraph)");

    links.sort((linkA, linkB) => {
        if (linkA.source === node) {
            if (linkB.source !== node) {
                return 1;
            } else {
                return 0;
            }
        } else {
            if (linkB.source !== node) {
                return 0;
            } else {
                return -1;
            }
        }
    });
};

NodeEvent.highlightDependence = function (depend) {
    d3.event.stopPropagation();
    depend.source.graph.links.filter(link => (link.source === depend.source && link.destination === depend.destination))
        .style("opacity", 1.0)
        .attr('stroke', FULLGRAPH_CONFIG.SELECTED_DEPEND_STROKE_COLOR)
        .attr("marker-end", "url(#selected-depend-arrow-fullgraph)");
};

NodeEvent.unhighlightDependence = function (depend) {
    d3.event.stopPropagation();
    depend.source.graph.links.filter(link => (link.source === depend.source && link.destination === depend.destination))
        .style("opacity", 0.25)
        .attr('stroke', FULLGRAPH_CONFIG.LINE_STROKE_COLOR)
        .attr("marker-end", "url(#end-arrow-fullgraph)");
};

NodeEvent.unhighlightDependences = function (node) {
    d3.event.stopPropagation();
    let links = node.graph.links;
    links.filter(link => ((link.source === node || link.destination === node)
        && link.source.data.change === "unchanged" && link.destination.data.change === "unchanged"))
        .style("opacity", 0.25)
        .attr('stroke', FULLGRAPH_CONFIG.LINE_STROKE_COLOR)
        .attr("marker-end", "url(#end-arrow-fullgraph)");

    links.filter(link => (link.source.data.change !== "unchanged"))
        .style("opacity", 1.0)
        .attr('stroke', FULLGRAPH_CONFIG.DEPEND_STROKE_COLOR)
        .attr("marker-end", "url(#depend-arrow-fullgraph)");

    links.filter(link => (link.destination.data.change !== "unchanged"))
        .style("opacity", 1.0)
        .attr('stroke', FULLGRAPH_CONFIG.DEPENDED_STROKE_COLOR)
        .attr("marker-end", "url(#depended-arrow-fullgraph)");
};

NodeEvent.drag = d3.behavior.drag()
    .origin(node => node)
    .on("dragstart", NodeEvent.dragstarted)
    .on("drag", NodeEvent.dragged)
    .on("dragend", NodeEvent.dragended);


