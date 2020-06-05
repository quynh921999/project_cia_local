/**
 * Hiển thị project dưới dạng cây thư mục
 */
class TreeViewClass {
    init(data, viewName, className) {
        this.nodes = {};
        this.data = data;
        this.isSearch = false;
        this.initEvent();
        this.initMenu();
    }

    constructor(data, viewName, className, closable) {
        this.init(data);
        this.classname = className.replace(".", "");

        this.view = View.newView(viewName, className, closable);
        if (this.constructor === ProjectSearchViewClass) {
            this.view.style("background-color", CHANGESETVIEW_CONFIG.BACKGROUND_COLOR);
            this.loader = this.view.append("img").attr("class", "loader")
                .attr("src", "resources/images/ajax-loader.gif");
        }

        this.svg = this.view.append("svg")
            .attr("width", "100%").attr("height", "100%");
        this.rect = View.draw_background(this.svg, PROJECTVIEW_CONFIG.BACKGROUND_COLOR);
        this.g = this.svg.append('g')
            .attr("transform",
                "translate(" + PROJECTVIEW_CONFIG.PADDING_LEFT + "," + PROJECTVIEW_CONFIG.PADDING_TOP + ")")
            .attr("class", "content");

        this.update();
    }

    hideLoader() {
        if (this.loader !== undefined)
            this.loader.style("display", "none");
    }

    addSearchBox() {
        let domClassname = "." + this.classname;
        let bounding = d3.select(domClassname).node().getBoundingClientRect();
        this.searchForm = d3.select(domClassname).select(".title").append(
            "foreignObject").attr("x",
            bounding.width - PROJECTVIEW_CONFIG.SEARCH_BOX_WIDTH - 5).attr("y", -1)
            .attr("width", PROJECTVIEW_CONFIG.SEARCH_BOX_WIDTH).attr("height",
                VIEW_CONFIG.HEADER_HEIGHT - 2);
        // .append("xhtml:form").classed("form-horizontal", true)
        // .append("xhtml:div").attr("xmlns",
        // "http://www.w3.org/1999/xhtml").attr("class", "form-group-sm has-feedback
        // pull-right");

        this.searchForm.append("xhtml:input").attr("type", "text").attr("id", "search-box")
            .attr("class", "").attr("placeholder", "Search").on("change",
            function () {
                DivManager.event.search(d3.select(this).node());
            })

        // form.append("xhtml:span").attr("class","glyphicon glyphicon-search
        // form-control-feedback");
    }

    removeSearchBox() {
        let domClassname = "." + this.classname;
        let bounding = d3.select(domClassname).node().getBoundingClientRect();
        let form = d3.select(domClassname).select(".title").select(
            "foreignObject");

        if (Utils.isValidObject(form))
            form.remove()
    }

    setData(data) {
        this.data = data;
    }

    getData() {
        return this.data
    }

    expandAll() {
        Utils.expandAll(this.data);
    }

    resize() {
        let domClassname = "." + this.classname;
        this.svg.attr("height", Math.max(this.nodes.length
            * PROJECTVIEW_CONFIG.NODE_HEIGHT * 1.4, parseInt(d3.select(
            domClassname).select(".main-view").style("height")))).attr(
            "width",
            Math.max(d3.select(domClassname).select(".content").node()
                    .getBoundingClientRect().width
                + PROJECTVIEW_CONFIG.PADDING_LEFT, parseInt(d3.select(
                    domClassname).select(".main-view").style("width")) - 10));

        var bounding = d3.select(domClassname).node().getBoundingClientRect();

        d3.select(domClassname).select("foreignObject").attr("x",
            bounding.width - PROJECTVIEW_CONFIG.SEARCH_BOX_WIDTH - 5).attr("width",
            PROJECTVIEW_CONFIG.SEARCH_BOX_WIDTH);
    }

    update() {
        if (!Utils.isEmptyArray(this.data)) {
            this.hideLoader();
        }

        let classBinding = this;
        let nodeClassname = this.classname + "-node";
        this.nodes = Utils.getAllExpandingNodeWithDepth(this.data, 0);

        this.nodes.forEach(function (d, i) {
            d.classBinding = classBinding;
            d.y_pro = d.depth * PROJECTVIEW_CONFIG.NODE_HEIGHT;
            d.x_pro = i * PROJECTVIEW_CONFIG.NODE_PADDING_LEFT;
        });

        var node = this.g.selectAll("g." + nodeClassname).data(this.nodes, function (d) {
            return d.id;
        });

        var nodeEnter = node.enter().append("g").attr("class", nodeClassname).on("click",
            this.Event.click).attr("transform", function (d, i) {
                return "translate(" + d.y_pro + "," + d.x_pro + ")";
            }).attr("opacity", 0);

        nodeEnter.on("contextmenu", this.onContextMenuNode());

        nodeEnter.append("image").attr("width", PROJECTVIEW_CONFIG.ARROW_ICON_SIZE)
            .attr("height", PROJECTVIEW_CONFIG.ARROW_ICON_SIZE).attr("y", 5).attr(
            "class", "arrow_icon").attr(
            "xlink:href", function (d) {
                if (d.hasChildren === false) {
                    return "";
                }
                else {
                    if ((!Utils.isValidObject(d.children) || d.children.length === 0)
                        && (!Utils.isValidObject(d._children) || d._children.length === 0)) {
                        return "resources/images/arrow-right.svg";
                    }
                    else {
                        return "resources/images/" +
                            (d._children ? "arrow-down.svg" : "arrow-right.svg");
                    }
                }
            });

        nodeEnter.append("image").attr("width", PROJECTVIEW_CONFIG.ICON_SIZE).attr(
            "height", PROJECTVIEW_CONFIG.ICON_SIZE).attr("x",
            PROJECTVIEW_CONFIG.ARROW_ICON_SIZE + 4).attr("y", 3).attr("class",
            "icon").attr("xlink:href", function (d) {
            return "resources/images/" + d.kind + ".svg";
        });

        nodeEnter.append("text").attr("x", PROJECTVIEW_CONFIG.TEXT_POSITION.x)
            .attr("y", PROJECTVIEW_CONFIG.TEXT_POSITION.y).attr("dy", ".35em")
            .attr("text-anchor", "start")
            .attr("font-size", "14px").attr("fill", function (data) {
                if (data.matched !== undefined && data.matched) {
                    return PROJECTVIEW_CONFIG.SEARCH_TEXT_COLOR;
                } else
                    return PROJECTVIEW_CONFIG.TEXT_COLOR;
        }).text(function (d) {
            return d.name;
        }).on("mouseover", Event.showNameWhenMouseOver).on("mouseout",
            Event.clearWhenMouseOut);

        // Transition nodes to their new position.
        var nodeUpdate = node.transition().duration(
            PROJECTVIEW_CONFIG.TRANSITION_DURATION).attr("opacity", 1).attr(
            "transform", function (d) {
                return "translate(" + d.y_pro + "," + d.x_pro + ")";
            });

        nodeUpdate.select("text").attr("fill", function (data) {
            if (data.matched !== undefined && data.matched === true) {
                return PROJECTVIEW_CONFIG.SEARCH_TEXT_COLOR;
            } else
                return PROJECTVIEW_CONFIG.TEXT_COLOR;
        });

        nodeUpdate.select(".arrow_icon").attr(
            "xlink:href",
            function (d) {
                if (d.hasChildren === false) {
                    return "";
                }
                else {
                    if ((!Utils.isValidObject(d.children) || d.children.length === 0)
                        && (!Utils.isValidObject(d._children) || d._children.length === 0)) {
                        return "resources/images/arrow-right.svg";
                    }
                    else {
                        return "resources/images/" +
                            (d._children ? "arrow-down.svg" : "arrow-right.svg");
                    }
                }
            });

        var nodeExit = node.exit().remove();
        this.resize();
    }

    findNodeById(id) {
        this.nodes.forEach(node => {
            if (node.id === id) return node;
        });
    }
    initEvent() {
        this.Event = {
            click(d) {
                /*
                 If current has non-empty _children attribute, so we can think it is opening. Close this node.
                 */
                if (Utils.isValidObject(d._children) && d._children.length > 0) {
                    Utils.collapse(d);
                    d.classBinding.update(false);
                }
                else {
                    let extraChildren = d.children;

                    /*
                     Current node has empty _children but all its children are stored in children attribute.
                     So we can think that it is closed. Transfer all children object from children to _children to open it.
                     */
                    if (Utils.isValidObject(extraChildren) && extraChildren.length > 0) {
                        Utils.expand(d);
                        d.classBinding.update(false);
                    }
                    /* Current node has no child in both children and _children attributes.
                     * So we can load its children from server
                     */
                    else {
                        let children = d._children;
                        if (!Utils.isValidObject(children) || children.length === 0) {
                            Utils.loadChildrenData(d, LOAD_DATA.PROJECT_VIEW).then(data => {
                                if (data == null) return;
                                let newNode = Data.processPartitionData(data);
                                Utils.expand(newNode);
                                ProjectView.update(false);
                            });
                        }
                    }
                }
            }
        }
    }

    initMenu() {
        // let changeOption = {
        //     title: function (elm, d, i) {
        //         if(Data.changeSet.findIndex(change => change.id == d.id)>=0) return "Unchange";
        //         else return "Change";
        //     },
        //     action: function(elm,d,i){
        //         d3.select('.d3-context-menu').style('display', 'none');
        //         if(Data.changeSet.findIndex(change => change.id == d.id)>=0) ChangeSetView.removeChange(d.id);
        //         else ChangeSetView.addToChangeSet({id: d.id, changes: [2], name: d.name});
        //     }
        // };

        let expandAllOption = {
            title : "Expand All",
            action : function(elm, d, i) {
                Utils.expandAll(d);
                ProjectView.update();
                d3.select('.d3-context-menu').style('display', 'none');
            }
        };

        // let viewDependencyOption = {
        //     title : "View dependencies",
        //     action : function(elm, d, i) {
        //         // CentralView.switchTab("dependence");
        //         // DependenceView.makeGraph(Data.getOriginNodeById(d.id));
        //         // DependenceView = new DependenceViewClass(Data.getNodeById(d.id), Data.dependences, CentralView.getTab("dependence").view);
        //         Data.changeSet = [];
        //         ChangeSetView.addToChangeSet({id: d.id, name: d.name, changes: [2]});
        //         ChangeSetView.uploadChangeset();
        //         d3.select('.d3-context-menu').style('display', 'none');
        //     }
        // };
        //
        // let viewSourceCodeOption = {
        //     title: "View Source Code",
        //     action: function(elm,d,i){
        //         d3.select('.d3-context-menu').style('display', 'none');
        //         SourceCodeViewClass.draw({data: d});
        //     }
        // };
        //
        // let viewDataFlowDiagram = {
        //     title: "View Data Flow",
        //     action: function (elm, d, i) {
        //         d3.select('.d3-context-menu').style('display', 'none');
        //         tabFullList.forEach(function (tab) {
        //             if (tab.id === DATAFLOW_DIAGRAM_VIEW_ID){
        //                 CentralView.event.addTab(tab);
        //             }
        //         });
        //         DTFUtils.createDTFDiagram(d.id, DATA_FLOW_MODE.FULL);
        //     }
        // }

        this.normalMenu = [/*changeOption,*/ expandAllOption/*, viewDependencyOption*/];
        this.fileMenu = [/*changeOption,*/ expandAllOption/*, viewDependencyOption, viewSourceCodeOption, viewDataFlowDiagram*/];
    }

    onContextMenuNode() {
        return d3.contextMenu(this.fileMenu);
    }
}