/* Hiển thị Impact Set sau khi phân tích
 *
 *
 */
let ImpactSetView = {
    view: {},
    svg: {},
    impactIds:[]
};

ImpactSetView.resize = function () {
    View.resize("impact-set", ImpactSetView.buttons);
}

ImpactSetView.createView = function () {
    ImpactSetView.view = View.newView("Impact set", ".impact-set", false)
        .attr("width", "100%").attr("height", "100%");
    ImpactSetView.view.style("background-color", CHANGESETVIEW_CONFIG.BACKGROUND_COLOR);
    View.createAction("impact-set", ImpactSetView.buttons);
    ImpactSetView.createLoader();
};
ImpactSetView.createLoader = function(){
    ImpactSetView.loader = ImpactSetView.view.append("img").attr("class", "loader")
        .attr("src", "resources/images/ajax-loader.gif");
    ImpactSetView.hideLoader();
};

ImpactSetView.load = function (impactObject) {
    console.log(impactObject);
    ImpactSetView.view.selectAll("text").remove();
    if(!Utils.isValidObject(impactObject)) {
        ImpactSetView.view.append("div").append("p").html("Impact Set Empty");
        return;
    }

    // get impact node ids from server response
    let ids = [];
    impactObject.map((isNode, idx) => {
       if (isNode.id) {
           ids.push(isNode.id);
       }
    });

    // DependenceView.setImpactIDs(ids);

    if (ChangeImpactDependenceView) {
        delete ChangeImpactDependenceView;
        ChangeImpactDependenceView = {};
    }
    ChangeImpactDependenceViewClass.init(Data.changeSet.map(d => d.id), ids);

    this.display();
};

ImpactSetView.addImpactIds = function(id) {
    this.impactIds.push(id);
};

ImpactSetView.display = function() {
    // make sure ChangeImpactDependenceView has been initialized
    if (ChangeImpactDependenceView == null || !(typeof ChangeImpactDependenceView.searchNode == 'function')) {
        return;
    }

    // find nodes correspond with received ids
    let nodes = [];
    this.impactIds.forEach(function (id) {
        if (id > 0) {
            let isGraphNode = ChangeImpactDependenceView.searchNode(id); // special exclusiveness for change impact view
            if (typeof isGraphNode != 'undefined') {
                nodes.push(isGraphNode.data);
            }
        }
    });

    if (nodes.length == 0) return;

    let node = ImpactSetView.view.selectAll("div.impact-node")
        .data(nodes, function (d) {
            return d.id;
        });
    let nodeEnter = node.enter().append("div").attr("class","impact-node");
    nodeEnter.append("p").html(function (data) {
        if (data.kind == "attribute")
            return " - " + ChangeImpactDependenceView.searchNode(data.classID).data.name + "." + data.name;
        else if (data.kind == "method") {
            return " - " + ChangeImpactDependenceView.searchNode(data.classID).data.name + "." + data.name + "()";
        } else
            return " - " + data.name;
    });

    // view source code
    nodeEnter.on("click", function (data) {
        SourceCodeViewClass.draw({data: data});
    });
};

ImpactSetView.showLoader = function(){
    ImpactSetView.loader.style("display", "block");
};
ImpactSetView.hideLoader = function(){
    ImpactSetView.loader.style("display", "none");
};
ImpactSetView.clearAll = function(){
    ImpactSetView.view.selectAll("div").remove();
};

ImpactSetView.exportData = function() {
    if (!ChangeImpactDependenceView.impactIDs || ChangeImpactDependenceView.impactIDs.length == 0) {  // special exclusiveness for change impact view
        Notifier.displayError("Empty Impact Set!");
        return ;
    }
    let export_nodes = {
        cs_nodes: ChangeImpactDependenceView.changeIDs,
        fis_nodes: ChangeImpactDependenceView.impactIDs
    };

    Notifier.displayProcessingTask("Exporting...");
    EXTENSION_API.exportImpactSet(export_nodes).done(() => Notifier.removeNotification());
};

ImpactSetView.buttons = [{icon: "export_icon.png", id: "export", title: "Export Data", action: ImpactSetView.exportData}];