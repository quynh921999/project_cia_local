var ChangeSetView = {
    view: {},
    level: 1
// svg: {}
};

ChangeSetView.resize = function () {
    // ChangeSetView.svg.attr("height",
    // Math.max(ChangeSetView.view.node().getBoundingClientRect().height*1.5,parseInt(d3.select(".change-set").select(".main-view").style("height"))));
    // View.createAction("change-set", ChangeSetView.buttons);
    View.resize("change-set", ChangeSetView.buttons);
};

ChangeSetView.createView = function () {
    this.view = View.newView("Change set", ".change-set", false)
        .attr("width", "100%").attr("height", "100%");
    this.view.style("background-color", CHANGESETVIEW_CONFIG.BACKGROUND_COLOR);
    View.createAction("change-set", ChangeSetView.buttons);
};

ChangeSetView.update = function (changedNode) {
    var originNode = Data.getOriginNodeById(changedNode.id);
    console.log(originNode, Data.getNodeById(changedNode.id));
    var changes = [];
    changes = ChangeSetView.checkUpdate(originNode, changedNode);
    // console.log(changedNode, changes);
    if (changes.length > 0) {
        this.addToChangeSet({id: changedNode.id, changes: changes});
        this.display();
    } else {
        Data.removeChange(changedNode.id);
        this.display();
    }
};
ChangeSetView.checkUpdate = function (originNode, changeNode) {
    var changes = changeNode.changes;
    var keys = Object.keys(changes);
    var changedResult = [];
    keys.forEach(function (key) {
        if (key == "paramater") {
            var temp = ChangeSetView.compareParamaters(originNode, changes);
            if (temp > 0)
                changedResult.push(temp);
        }
        if (originNode[key] != changes[key]) {
            if (key == "visibility") {
                if (VISIBILITY.indexOf(changes[key]) > VISIBILITY.indexOf(originNode[key])) {
                    changedResult.push(CHANGE_TYPE.DOWN_VISIBILITY);
                } else {
                    changedResult.push(CHANGE_TYPE.UP_VISIBILITY);
                }
            } else if (key == "name") {
                changedResult.push(CHANGE_TYPE.RENAME);
            } else if (key == "type") {
                changedResult.push(CHANGE_TYPE.CHANGE_TYPE);
            } else if (key == "return") {
                changedResult.push(CHANGE_TYPE.CHANGE_RETURN);
            } else if (key == "isStatic") {
                if (changes[key])
                    changedResult.push(CHANGE_TYPE.ADD_STATIC);
                else
                    changedResult.push(CHANGE_TYPE.REMOVE_STATIC);
            } else if (key == "isFinal") {
                if (changes[key]) changedResult.push(CHANGE_TYPE.ADD_FINAL);
                else changedResult.push(CHANGE_TYPE.REMOVE_FINAL);
            }
        }
    });
    return changedResult;
};
ChangeSetView.compareParamaters = function (originNode, changes) {
    console.log(originNode, changes);
    if (originNode.paramater.length != changes.paramater.length) {
        return CHANGE_TYPE.SIZE_OF_PARAMATERS;
    }
    for (var i = 0; i < originNode.paramater.length; i++) {
        if (originNode.paramater[i].type != changes.paramater[i].type)
            return CHANGE_TYPE.TYPE_OF_PARAMETER;
    }
    return -1;
};
ChangeSetView.addToChangeSet = function (changeNode) {
    console.log(changeNode);
    for (var i = 0; i < Data.changeSet.length; i++) {
        if (Data.changeSet[i].id == changeNode.id) {
            Data.changeSet[i] = changeNode;
            DependenceView.setChangeIDs(Data.changeSet.map(d => d.id));
            return;
        }
    }
    console.log("Push " + changeNode.id + " into change set");
    Data.changeSet.push(changeNode);
    ChangeSetView.display();
    DependenceView.setChangeIDs(Data.changeSet.map(d => d.id));
};
ChangeSetView.display = function () {
    ChangeSetView.view.selectAll("div").remove();
    ChangeSetView.view.selectAll("foreignObject").remove();

    var nodes = Data.changeSet;
    nodes.forEach(function (node) {
        var div = ChangeSetView.view.append("div").attr("class", "change-node").datum(node);
        div.append("p").attr("class", "change-name").html("- " + node.name);
        var menu = [{}];
        menu[0].title = "Remove " + node.name;
        menu[0].action = function (elm, data, i) {
            d3.select('.d3-context-menu').style('display', 'none');
            ChangeSetView.removeChange(data.id);
            ChangeSetView.display();
            //var originData = Data.resetToOrigin(data.id);
            //Data.updateData(originData);
            // PropertyView.updateNewNode(originData);
            //ClassView.updateNode(data.classID);
        }
        div.on("contextmenu", d3.contextMenu(menu));

        // view source code
        div.on("click", function() {
            SourceCodeViewClass.draw({data: Data.getNodeById(node.id)});
        })
    });
    ChangeSetView.resize();
};
ChangeSetView.clearAllChangeSet = function () {
    $("#reset-form_btn-reset-data").click();
    Data.clearAllChanges();
    DependenceView.changeIDs = [];
    DependenceView.impactIDs = [];
    DependenceView.highlight();

    if (ChangeImpactDependenceView != null)
        ChangeImpactDependenceView.clear();

    ChangeSetView.display();
    ImpactSetView.clearAll();
}

ChangeSetView.removeChange = function (id) {
    Data.removeChange(id);
    DependenceView.setChangeIDs(Data.changeSet.map(d => d.id));
    ChangeSetView.display();
};


ChangeSetView.uploadChangeset = function () {
    //process data
    var data = {
        csStr: Data.processChangeSet(),
        callLevel: ChangeSetView.level
    }
    if (!data.csStr) {
        Notifier.displayError("Empty Change Set!");
        return;
    }

    tabFullList.forEach(function (tab) {
        if (tab.id == CHANGE_IMPACT_VIEW_ID){
            CentralView.event.addTab(tab);
        }
    })

    Notifier.displayProcessingTask("Analyzing...");

    console.log(data);
    ImpactSetView.clearAll();
    //ImpactSetView.showLoader();

    if (env.waitingImpactSetResponse) return;
    else {
        env.waitingImpactSetResponse = true;
        TREE_API.analyze(data).done(res => {
            if (res) ImpactSetView.load(res);
            // ImpactSetView.hideLoader();
            env.waitingImpactSetResponse = false;
            Notifier.removeNotification();
        }).fail(() => {
            Notifier.displayError("Encountered error while analyzing!");
        });
    }
};

ChangeSetView.addChangeSetFromUpload = function () {
    $('#cs-upload').click();
}

ChangeSetView.addToChangeSetFromUpload = function (raw_data) {
    console.log(raw_data)
    if (raw_data == null || raw_data == '')
        return;
    else {
        var changedRawList = JSON.parse(raw_data);
        console.log(changedRawList);
        changedRawList.forEach((raw_elem) => {
            var csId = raw_elem.id;
            ChangeSetView.addToChangeSet({id: csId, changes: [2], name: raw_elem.name});
        });
    }
}

ChangeSetView.buttons = [{icon: "process_icon.png", id: "process", title: "Analyze", action: ChangeSetView.uploadChangeset},
    {icon: "reload.png", id: "reload", title: "Clean All", action: ChangeSetView.clearAllChangeSet},
    {icon: "upload.png", id: "upload", title: "Upload Change Set", action: ChangeSetView.addChangeSetFromUpload}]
