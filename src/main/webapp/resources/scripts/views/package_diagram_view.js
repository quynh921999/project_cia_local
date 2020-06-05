let PackageDiagramView = {};

class PackageDiagramViewClass extends DependenceGraphTemplate {
    constructor(dataAsTree, dependencies, includeIds, view) {
        super(dataAsTree, dependencies, view);

        // init data containers
        this.includeIDs = includeIds;

        // init root node
        this.newNode(this.root,this.view);
    }

    static init() {
        console.log("Building Package Diagram...");
        let dataAsTree, dependencies, includeIds = new Map();
        let getTreeDataTask = new Promise((resolve, reject) => {
            PACKAGE_DIAGRAM_API.getRootNodeData().done(res => {
                if(!res.error) {
                    let data = res.data;
                    var parser = new Parser();
                    dataAsTree = parser.parseObject(data);
                    resolve('done');
                } else reject('error while getting tree data');
            });
        });

        let getDependencyDataTask = new Promise((resolve, reject) => {
            PACKAGE_DIAGRAM_API.getAllDependencies().done(res => {
                if(!res.error) {
                    let data = res.data;
                    dependencies = data[0];

                    // load include ids cache
                    let includeIdsData = data[1];
                    for (let i = 0; i < includeIdsData.length; i++) {
                        let node = includeIdsData[i];
                        node.ids.push(node.id);
                        includeIds.set(node.id, node.ids);
                    }
                    resolve('done');
                } else reject('error while getting dependency data');
            });
        });

        Promise.all([getTreeDataTask, getDependencyDataTask]).then(res => {
            PackageDiagramView = new PackageDiagramViewClass(dataAsTree, dependencies, includeIds, CentralView.getTab(PACKAGE_DIAGRAM_VIEW_ID).view);
            console.log("Done building Package Diagram!");

        }).catch(error => {
            alert(error);
        })
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
            PACKAGE_DIAGRAM_API.getIncludeIds(nodeId).done(function(res) {
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
    //     NodeEvent.onDoubleClickNode(node, LOAD_DATA.PACKAGE_DIAGRAM_VIEW);
    // }

    highlight() {

    }
}