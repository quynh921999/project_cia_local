let ChangeImpactDependenceView = {};

class ChangeImpactDependenceViewClass extends DependenceGraphTemplate {
    constructor(dataAsTree, dependencies, changeIDs, impactIDs, includeIDs, view) {
        super(dataAsTree, dependencies, view);

        // inject
        this.impactIDs = impactIDs;
        this.changeIDs = changeIDs;
        this.includeIDs = includeIDs;

        // init menu
        this.fileMenu = [viewSourceCodeOption];

        // init root node
        this.newNode(this.root,this.view);
    }

    static init(changeIDs, impactIDs) {
        // let graph = ChangeImpactDependenceView;

        console.log("Building Change Impact Graph...");
        Notifier.displayProcessingTask("Processing...");
        let dataAsTree, dependencies;
        let includeIDs = new Map();

        let getTreeDataTask = new Promise((resolve, reject) => {
            ANALYZED_TREE_API.getRootNodeData().done(res => {
                if(!res.error) {
                    let data = res.data;
                    var parser = new Parser();
                    dataAsTree = parser.parseObject(data);
                    resolve('done');
                } else reject('error while getting tree data');
            });
        });

        let getDependencyDataTask = new Promise((resolve, reject) => {
            ANALYZED_TREE_API.getAllDependencies().done(res => {
                if(!res.error) {
                    let data = res.data;
                    dependencies = data;
                    resolve('done');
                } else reject('error while getting dependency data');
            });
        });

        let getIncludeIDsTask = new Promise((resolve, reject) => {
            ANALYZED_TREE_API.getAllIncludeIds().done((res) => {
                if (!res.error) {
                    let data = res.data;
                    for (let i = 0; i < data.length; i++) {
                        let node = data[i];
                        node.ids.push(node.id);
                        includeIDs.set(node.id, node.ids);
                    }
                    resolve('done');
                } else reject('error while getting included ids');
            });
        });

        Promise.all([getTreeDataTask, getDependencyDataTask, getIncludeIDsTask]).then(res => {
            ChangeImpactDependenceView = new ChangeImpactDependenceViewClass(
                dataAsTree,
                dependencies,
                changeIDs, impactIDs, includeIDs,
                CentralView.getTab(CHANGE_IMPACT_VIEW_ID).view);
            console.log("Done building Change Impact Graph!");
            Notifier.removeNotification();

            CentralView.switchTab(CHANGE_IMPACT_VIEW_ID);

        }).catch(error => {
            alert(error);
        })
    }

    clear() {
        this.view.selectAll('g').remove();
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
                var node = graph.view.select(".id"+ids[i]);
                if(node.node() != null) return cb(undefined, {node: node, id: ids[i]});
            }
        } else {
            ANALYZED_TREE_API.getIncludeIds(nodeId).done(function(res) {
                if (!res.error) {
                    let data = res.data;
                    graph.includeIDs.set(nodeId, data);
                    data.push(nodeId);
                    for (let i = data.length - 1; i >= 0; i--) {
                        var node = graph.view.select(".id"+data[i]);
                        if(node.node() != null) return cb(undefined, {node: node, id: data[i]});
                    }
                }
            });
        }
        return cb(new Error('not found node'));
    }

    // onDoubleClickNode(node) {
    //     NodeEvent.onDoubleClickNode(node, LOAD_DATA.CHANGE_IMPACT_VIEW);
    // }


    onContextMenuNode(data){
        if (data.kind == 'file') {
            return d3.contextMenu(this.fileMenu);
        } else {
            return d3.contextMenu([]);
        }
    }
}