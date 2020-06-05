/**
 * Object quản lí view chung của Dependence View và Class View Tạo tab, svg cho
 * 2 view trên, print graph
 */

const DEPENDENCE_VIEW_ID = "dependence";
const CYCLOMATIC_VIEW_ID = "cyclomatic-view";
const LOC_VIEW_ID = "loc-view";
const SOURCE_CODE_VIEW_ID = "sourcecode-view";
const CHANGE_IMPACT_VIEW_ID = "change-impact";
const PACKAGE_DIAGRAM_VIEW_ID = "package-diagram";
const CLASS_DIAGRAM_VIEW_ID = "class-diagram";
const DATAFLOW_DIAGRAM_VIEW_ID = "df-diagram";

var TabAction = {
    onDisplayDependencyModeChange: function() {
        var selectValue = d3.select('select').property('value');

        if(selectValue ==  'None') {
            DependenceView.dependencyDisplayingMode = DEPENDENCY_DISPLAYING_MODE.NONE;
            console.log(selectValue);

        } else if(selectValue == 'Partial'){
            DependenceView.dependencyDisplayingMode = DEPENDENCY_DISPLAYING_MODE.PARTIAL;
            console.log(selectValue);

        } else if(selectValue == 'All'){
            DependenceView.dependencyDisplayingMode = DEPENDENCY_DISPLAYING_MODE.ALL;
            console.log(selectValue);
        }

        console.log("Updating links...");
        DependenceView.processLink(DependenceView.lastActiveNode);
        console.log("Done updating links...");
    },
    onDataFlowModeChange: function() {
        console.log("Data flow mode changed");
        let d3SelectObj = d3.select('select');
        let selectValue = d3SelectObj.property('value');
        let newMode;

        switch (selectValue) {
            case "To Database":
                newMode = DATA_FLOW_MODE.VIEW_TO_DATABASE;
                d3SelectObj.property('value', "To Database");
                break;
            case "To View":
                newMode = DATA_FLOW_MODE.FULL;
                d3SelectObj.property('value', "To View");
                break;
        }

        if (DataflowDiagram != null && newMode != undefined) {
            DTFUtils.createDTFDiagram(DataflowDiagram.getRootId(), newMode);
        }
    }
};

let tabFullList = [
    {name: "Dependence View",
        id: "dependence",
        options: {
            id: "selectbox",
            data: ["None", "Partial", "All"],
            action: TabAction.onDisplayDependencyModeChange
        }
    }/*,
    {name: "Change Impact View", id: "change-impact"},
    {name: "Package Diagram", id: "package-diagram"},
    {name: "Class Diagram", id: "class-diagram"},
    {name : "UI Tier", id: "ui-tier"},
    {name : "ERD", id: "erd"},
    {name: "Data Flow Diagram",
        id: DATAFLOW_DIAGRAM_VIEW_ID,
        options: {
            id: "selectbox",
            data: ["To View", "To Database"],
            action: TabAction.onDataFlowModeChange
        }
    },
    {name: "Cyclomatic View", id: CYCLOMATIC_VIEW_ID},
    {name: "Line of Code (LOC) View", id: LOC_VIEW_ID},
    {name: "Source Code View", id: SOURCE_CODE_VIEW_ID}*/];
let tabContain = [];
let layerId = false;  // true when layer is belong to source code view and vice versa

var CentralView = {
    view: {},
    svgBounding: {},
    /***************************************************************************
     * Tạo view mới
     **************************************************************************/
    createView: function(){
        var div_rect = d3.select("body").select(".class-view").node().getBoundingClientRect();

        // create mainView
        var mainView = d3.select("body").select(".class-view").append("div")
            .attr("class","main-view")
            .style("width", div_rect.width+"px")
            .style("height", div_rect.height-VIEW_CONFIG.HEADER_HEIGHT+"px");

        // create title view
        CentralView.title = d3.select("body").select(".class-view").append("div").classed("view-title", true)
            .attr("width","100%")
            .attr("height",VIEW_CONFIG.HEADER_HEIGHT)
            .append("svg")
            .attr("width","100%")
            .attr("height",VIEW_CONFIG.HEADER_HEIGHT);

        // create common views
        CentralView.view = mainView.append("svg")
            .attr("id", "common-views")
            .attr("class", "cv-layer")
            .attr("width", "100%")
            .attr("height", "100%")
            .on("dblclick", function(){d3.event.stopPropagation();});

        // create source code view
        let layer_2 = mainView.append("div").attr("id", "cv-layer-2").attr("class", "cv-layer");
        CentralView.source_code_view = layer_2.append("div")
            .attr("id", "code-editor")
            .style("width", div_rect.width+"px")
            .style("height", div_rect.height-VIEW_CONFIG.HEADER_HEIGHT+"px");

        // create status view. !!! status view must be below common views and source code view
        CentralView.status = mainView.append("div").classed("view-status", true)
            .attr("width","100%")
            .attr("height",VIEW_CONFIG.HEADER_HEIGHT/2)
            .append("svg").classed("status", true)
            .attr("width","100%")
            .attr("height",VIEW_CONFIG.HEADER_HEIGHT)
            .attr('style' , 'position:absolute;bottom:' + VIEW_CONFIG.NAVIGATION +'px');

        CentralView.svgBounding = CentralView.view.node().getBoundingClientRect();
        CentralView.defMarks();
        View.draw_background(CentralView.view,CLASSVIEW_CONFIG.BACKGROUND_COLOR);
        CentralView.createTab(tabFullList,CentralView.title,CentralView.view);
        // CentralView.createStatusBar(CentralView.status);
        CentralView.switchTab(DEPENDENCE_VIEW_ID);
        CentralView.closeUnnecessaryTabYet();
        console.log("done create central view");
    },
    closeUnnecessaryTabYet: function () {
        tabFullList.forEach(function (tab) {
            if(tab.id !== DEPENDENCE_VIEW_ID && tab.id !== SOURCE_CODE_VIEW_ID){
                CentralView.event.closeTab(CentralView.title, tab);
            }
        })
    },
    resize: function(){
        let div_rect = d3.select("body").select(".class-view").node().getBoundingClientRect();
        CentralView.svgBounding = div_rect;
        d3.select("body").select(".class-view").select(".main-view")
            .style("width", div_rect.width+"px")
            .style("height", div_rect.height-VIEW_CONFIG.HEADER_HEIGHT+"px");

        CentralView.redrawTab();

        // let rightHide = document.getElementById("right-hide");
        // let leftHide = document.getElementById("left-hide");
        // let rightView = document.getElementsByClassName("right-view")[0].getBoundingClientRect();
        // let leftView = document.getElementsByClassName("left-view")[0].getBoundingClientRect();

        // let width = div_rect.width - 20;
        // rightHide.setAttribute("x", width);

        // if (leftView.width < 5) {
        //     leftHide.setAttribute("href", "resources/images/next.svg");
        // } else leftHide.setAttribute("href", "resources/images/back.svg");
        // if (rightView.width < 5) {
        //     rightHide.setAttribute("href", "resources/images/back.svg");
        // } else rightHide.setAttribute("href", "resources/images/next.svg");

        // let typeX = rightView.width + 30;
        // let selectbox = document.getElementById("selectbox");
        // selectbox.setAttribute("style", "position:fixed;bottom:0px;z-index:1;right:"+typeX+"px");

        // document.getElementById("add-tab").setAttribute("x", div_rect.width - CLASSVIEW_CONFIG.TAB_SERVICE_ICON_SIZE - 2.5*CLASSVIEW_CONFIG.ICON_MARGIN);
        document.getElementsByClassName("status")[0].setAttribute("style", "position: absolute; bottom: 45px;");
    },
    createStatusBar: function (title) {
        let title_rect = title.node().getBoundingClientRect();
        let width = title_rect.width;
        let leftView = d3.select("body").select(".left-view").node();
        let central = d3.select("body").select(".class-view").node();
        let rightView = d3.select("body").select(".right-view").node();
        CentralView.status = title.append("rect")
            .classed("status-bar", true)
            .attr("width","100%")
            .attr("height",title_rect.height)
            .attr("fill",VIEW_CONFIG.TITLE_COLOR);

        title.append("image").classed("button",true).attr("id", "left-hide")
            .attr("width", VIEW_CONFIG.STATUS_ICON_SIZE).attr("height",VIEW_CONFIG.STATUS_ICON_SIZE)
            .attr("x","2px").attr("y","2px")
            .attr("xlink:href", function(d) { return "resources/images/back.svg";})
            .style("cursor","pointer").on('click', function (d) {
                // let rightHide = document.getElementById("right-hide");
                let leftHide = document.getElementById("left-hide");
                if (leftHide.getAttribute("href") == "resources/images/back.svg"){
                    leftView.setAttribute("style", "position: absolute; width: 0%; height: 100%; top: " + VIEW_CONFIG.NAVIGATION + "px;");
                    // if(rightHide.getAttribute("href") == "resources/images/next.svg"){
                        let width = innerWidth - rightView.offsetWidth;
                        central.setAttribute("style", "position: absolute; width: " + width + "px; height: 100%; right: "+rightView.width + "px; top: " + VIEW_CONFIG.NAVIGATION + "px;");
                    // } else {
                    //     central.setAttribute("style", "position: absolute; width: 100%; height: 100%; top: " + VIEW_CONFIG.NAVIGATION + "px;");
                    // }
                    leftHide.setAttribute("xlink:href", function(d) { return "resources/images/next.svg";});
                } else {
                    leftView.setAttribute("style", "position: absolute; width: 15%; height: 100%; top: " + VIEW_CONFIG.NAVIGATION + "px;");
                    // if(rightHide.getAttribute("href") == "resources/images/next.svg"){
                        let width = innerWidth*0.85 - rightView.offsetWidth;
                        central.setAttribute("style", "position: absolute; height: 100%; left: 15%; right: 15%; width: " + width + "px; top: " + VIEW_CONFIG.NAVIGATION + "px;");
                    // } else {
                    //     central.setAttribute("style", "position: absolute; height: 100%; left: 15%; width: 85%; top: " + VIEW_CONFIG.NAVIGATION + "px;");
                    // }
                    leftHide.setAttribute("xlink:href", function(d) { return "resources/images/back.svg";});
                }
                resize();
                document.getElementsByClassName("status")[0].setAttribute("style", "position: absolute; bottom: 24px;");
            });

        // let rightHide = title.append("image").classed("button",true).attr("id", "right-hide")
        //     .attr("width", VIEW_CONFIG.STATUS_ICON_SIZE).attr("height",VIEW_CONFIG.STATUS_ICON_SIZE)
        //     .attr("x", title_rect.width - VIEW_CONFIG.STATUS_ICON_SIZE - 2).attr("y","2px")
        //     .attr("xlink:href", function(d) { return "resources/images/next.svg";})
        //     .style("cursor","pointer").on("click", function (d) {
        //         let rightHide = document.getElementById("right-hide");
        //         let leftHide = document.getElementById("left-hide");
        //         if (rightHide.getAttribute("href") == "resources/images/next.svg"){
        //             rightView.setAttribute("style", "position: absolute; width: 0%; height: 100%; right: 0%");
        //             if(leftHide.getAttribute("href") == "resources/images/back.svg"){
        //                 let width = innerWidth - leftView.offsetWidth;
        //                 central.setAttribute("style", "position: absolute; width: " + width + "px; height: 100%; left: "+leftView.offsetWidth + "px; top: " + VIEW_CONFIG.NAVIGATION + "px;");
        //             } else {
        //                 central.setAttribute("style", "position: absolute; width: 100%; height: 100%; top: " + VIEW_CONFIG.NAVIGATION + "px;");
        //             }
        //             rightHide.setAttribute("xlink:href", function(d) { return "resources/images/back.svg";});
        //         } else {
        //             rightView.setAttribute("style", "position: absolute; width: 15%; height: 100%; right: 0%; top: " + VIEW_CONFIG.NAVIGATION + "px;");
        //             if(leftHide.getAttribute("href") == "resources/images/back.svg"){
        //                 let width = innerWidth*85/100 - leftView.offsetWidth;
        //                 central.setAttribute("style", "position: absolute; height: 100%; left: " + leftView.offsetWidth + "px; right: 15%; width: " + width + "px; top: " + VIEW_CONFIG.NAVIGATION + "px;");
        //             } else {
        //                 central.setAttribute("style", "position: absolute; height: 100%; width: 85%; top: " + VIEW_CONFIG.NAVIGATION + "px;");
        //             }
        //             rightHide.setAttribute("xlink:href", function(d) { return "resources/images/next.svg";});
        //         }
        //         resize();
        //         document.getElementsByClassName("status")[0].setAttribute("style", "position: absolute; bottom: 24px;");
        //     });
    },
    createTab: function(tabDetails,title,view){
        CentralView.tabs = [];
        let title_rect = title.node().getBoundingClientRect();
        let tabWidth = (title_rect.width /*- 2*CLASSVIEW_CONFIG.TAB_SERVICE_ICON_SIZE - CLASSVIEW_CONFIG.ICON_MARGIN*/) / tabDetails.length;
        tabDetails.forEach(function(tab,index){
            let posX =  index*tabWidth;
            let tabTitle = title.append("g").classed("tab-title", true).data([tab])
                .attr("transform", "translate(" + posX + ",0)")
                .on("click", function (d) {
                    if (tab.isContain){
                        CentralView.switchTab(d.id);
                    }
                });
            tabTitle.append("rect")
                .classed("title-background", true)
                .attr("width", tabWidth)
                .attr("height",title_rect.height)
                .attr("fill",VIEW_CONFIG.TITLE_COLOR);

            tabTitle.append("rect").classed("activeBar",true)
                .attr("width","100%")
                .attr("y",0)
                .attr("height",title_rect.height)
                .attr("width",tabWidth)
                .attr("fill",CLASSVIEW_CONFIG.ACTIVEBAR_COLOR);

            if (tab.name != null) {
                tabTitle.append("text").classed("text", true)
                    .attr("x",tabWidth/2).attr("y",18)
                    .attr("text-anchor","middle")
                    .attr("fill","white").attr("font-size",CLASSVIEW_CONFIG.HEADER_FONT_SIZE)
                    .text(tab.name)
                    .attr("cursor", "pointer");
                // tabTitle.append("image").classed("close", true)
                //     .attr("width", CLASSVIEW_CONFIG.TAB_SERVICE_ICON_SIZE).attr("height",CLASSVIEW_CONFIG.TAB_SERVICE_ICON_SIZE)
                //     .attr("x",tabWidth - CLASSVIEW_CONFIG.TAB_SERVICE_ICON_SIZE - CLASSVIEW_CONFIG.ICON_MARGIN).attr("y",(title_rect.height-CLASSVIEW_CONFIG.TAB_SERVICE_ICON_SIZE)/2)
                //     .attr("xlink:href", function(d) { return "resources/images/close_tab.svg";})
                //     .style("cursor","pointer")
                //     // .style("display","none")
                //     .on("click", function () {
                //         d3.event.preventDefault();
                //         d3.event.stopImmediatePropagation();
                //         let id = CentralView.event.closeTab(title, tab);
                //     });
            }
            //add segment
            tabTitle.append("rect").classed("right-segment",true)
                .attr("x", tabWidth - CLASSVIEW_CONFIG.TAB_SEGMENT_WIDTH)
                .attr("width",CLASSVIEW_CONFIG.TAB_SEGMENT_WIDTH).attr("height",title_rect.height)
                .attr("fill", CLASSVIEW_CONFIG.TAB_SEGMENT_COLOR);

            tab.title = tabTitle;
            let svg = view.append("svg").attr("width","100%").attr("height","100%").attr("id" , "svg-"+tab.id);
            // svg.append("rect").attr("width","100%").attr("height","100%").attr("fill", CLASSVIEW_CONFIG.BACKGROUND_COLOR);
            CentralView.view.call(CentralView.event.zoom);
            // svg.attr("id", "svg"+ tab.id);

            // do not append "g" for bubble chart
            if (tab.id == SOURCE_CODE_VIEW_ID) {
                tab.view = svg;
            }
            else if (tab.id != CYCLOMATIC_VIEW_ID && tab.id != LOC_VIEW_ID) {
                tab.view = svg.append("g").attr("class","content").attr("id" , tab.id + "g");
            }
            else {
                tab.view = svg;
            }

            tab.svg = svg;
            tab.active = true;
            tab.scale = 1;
            tab.isContain = true;
            CentralView.tabs.push(tab);
        });

        //contained by hidden tab
        tabContain = [];
        tabFullList.forEach(function (tab) {
            if (CentralView.tabs.indexOf(tab) < 0){
                tabContain.push({title: tab.name,
                    action: function(){
                        d3.select('.d3-context-menu').style('display', 'none');
                        CentralView.event.addTab(tab);
                    }});
            }
        });

        // title.append("image").attr("id", "add-tab")
        //     .attr("width", 1.5*CLASSVIEW_CONFIG.TAB_SERVICE_ICON_SIZE).attr("height",1.5*CLASSVIEW_CONFIG.TAB_SERVICE_ICON_SIZE)
        //     .attr("x",title_rect.width - 1.5*CLASSVIEW_CONFIG.TAB_SERVICE_ICON_SIZE - CLASSVIEW_CONFIG.ICON_MARGIN)
        //     .attr("y",(title_rect.height-1.5*CLASSVIEW_CONFIG.TAB_SERVICE_ICON_SIZE)/2)
        //     .attr("z-index", 1)
        //     .attr("xlink:href", function(d) { return "resources/images/plus.svg";})
        //     .style("cursor","pointer").attr("fill", CLASSVIEW_CONFIG.BACKGROUND_COLOR)
        //     .on("click", d3.contextMenu(tabContain));
    },
    getTab: function(id){
        return CentralView.tabs.find(function(tab){ return tab.id==id})
    },
    getCurrentTab: function(){
        return CentralView.tabs.find(function(tab){
            return tab.active;
        });
    },
    switchTab: function(id){
        if ((id == SOURCE_CODE_VIEW_ID && !layerId) || (id != SOURCE_CODE_VIEW_ID && layerId)){
            CentralView.swapLayers();
        }
        CentralView.tabs.forEach(function(tab){
            if(tab.id!=id) {
                tab.active = false;
                tab.svg.attr("visibility","hidden");
                tab.title.select(".activeBar").attr("fill",VIEW_CONFIG.TITLE_COLOR);
            } else {
                tab.active = true;
                tab.svg.attr("visibility", "visible");
                tab.title.select(".activeBar").attr("fill", CLASSVIEW_CONFIG.ACTIVEBAR_COLOR);

                CentralView.addTabOption(tab);

                if(id == "ui-tier") {
                    if(GraphLayerDiagrama == null){
                        $.get("api/tree/getLayer", function (data,status) {
                            if(status == "success"){
                                console.log(data.data);
                                GraphLayerDiagrama = new GraphLayerDiagram(data.data, null);
                                GraphLayerDiagrama.draw();
                            }
                        });
                    }
                }
                if(id =="erd"){
                    if(D3Erda == null) {
                        //var erd = new D3Erd(d3.select("#erdg"), ERD_FAKE);
                        ERD_DATABASE_API.getJsonErd().done(function (res) {
                            console.log(res);
                            D3Erda = new D3Erd(d3.select("#erdg"), res);
                            D3Erda.draw();
                        });
                    }
                    else return;

                }
                if(id == PACKAGE_DIAGRAM_VIEW_ID){
                    PackageDiagramViewClass.init();
                }
            }
        })
    },
    addZoomButton: function(){
        CentralView.view.selectAll(".zoom-button").remove();
        svgBounding = CentralView.view.node().getBoundingClientRect();
        CentralView.view.append("image").classed("zoom-button",true)
            .attr("width", CLASSVIEW_CONFIG.ZOOM_ICON_SIZE).attr("height",CLASSVIEW_CONFIG.ZOOM_ICON_SIZE)
            .attr("x",svgBounding.width-CLASSVIEW_CONFIG.ZOOM_ICON_SIZE-CLASSVIEW_CONFIG.ZOOM_ICON_RIGHT).attr("y",svgBounding.height-CLASSVIEW_CONFIG.ZOOM_ICON_SIZE-CLASSVIEW_CONFIG.ZOOM_ICON_BOTTOM)
            .attr("xlink:href", function(d) { return "resources/images/zoom-in.svg";})
            .style("cursor","pointer")
            .on("click", CentralView.event.zoomIn);
        CentralView.view.append("image").classed("zoom-button",true)
            .attr("width", CLASSVIEW_CONFIG.ZOOM_ICON_SIZE).attr("height",CLASSVIEW_CONFIG.ZOOM_ICON_SIZE)
            .attr("x",svgBounding.width-2.5*CLASSVIEW_CONFIG.ZOOM_ICON_SIZE-CLASSVIEW_CONFIG.ZOOM_ICON_RIGHT).attr("y",svgBounding.height-CLASSVIEW_CONFIG.ZOOM_ICON_SIZE-CLASSVIEW_CONFIG.ZOOM_ICON_BOTTOM)
            .attr("xlink:href", function(d) { return "resources/images/zoom-out.svg";})
            .style("cursor","pointer")
            .on("click", CentralView.event.zoomOut);
    },
    addTabOption: function(tab) {
        let elements = document.getElementsByClassName('tab-option');
        while (elements.length > 0) {
            elements[0].parentNode.removeChild(elements[0]);
        }

        if (tab.options != undefined) {
            let x = document.getElementsByClassName("right-view")[0].getBoundingClientRect().width + 30;
            var select = d3.select('body')
                .append('select')
                .attr('class', 'tab-option')
                .attr('style', 'position:fixed;bottom:0px; right: ' + x + 'px;z-index:1;')  // hiển thị lên màn hình chính
                .on('change', tab.options.action);

            // select.attr('style', 'position:absolute;bottom:0px; left: ' + x + 'px;z-index:1;')
            var options = select.attr("id", tab.options.id)
                .selectAll('option')
                .data(tab.options.data).enter()
                .append('option')
                .text(function (d) {
                    return d;
                });
            options.property("selected", function(d){return d === "None"});

            let currentTabId = CentralView.getCurrentTab().id;
            let d3SelectObj = d3.select('select');
            let mode;

            switch (currentTabId) {
                case DEPENDENCE_VIEW_ID:
                    mode = DependenceView != null ? DependenceView.dependencyDisplayingMode : null;
                    break;
                // case DATAFLOW_DIAGRAM_VIEW_ID:
                //     mode = DataflowDiagram != null ? DataflowDiagram.mode : null;
                //     break;
            }

            if (mode != null) {
                var value = CentralView.getTab(currentTabId).options.data[mode];
                d3SelectObj.property('value', value);
            }
        }
    },
    /**
     * Tạo mũi tên cho các line
     */
    createMark: function(id,color){
        CentralView.view.append('svg:defs').append('svg:marker')
            .attr('id', id)
            .attr('viewBox', '-10 -10 20 20')
            .attr('refX', 6)
            .attr('markerWidth', 10).attr('markerHeight', 10)
            .attr('orient', 'auto')
            .append('svg:path').attr('d', 'M-8,-5 L8,0 L-8,5 L-5,0').attr('fill', color);
    },
    defMarks: function(){
        // definition arrow mark for link between class
        CentralView.createMark("end-arrow","#000");
        CentralView.createMark("end-arrow-fullgraph",'#777');
        CentralView.createMark("depended-arrow-fullgraph",FULLGRAPH_CONFIG.DEPENDED_STROKE_COLOR);
        CentralView.createMark("depend-arrow-fullgraph",FULLGRAPH_CONFIG.DEPEND_STROKE_COLOR);
        CentralView.createMark("selected-depend-arrow-fullgraph",FULLGRAPH_CONFIG.SELECTED_DEPEND_STROKE_COLOR);

    },
    // swap common views vs source code view
    swapLayers: function() {
        $(".cv-layer").each((i, el) => {
            $(el).insertBefore($(el).prev());
        });
        layerId = !layerId;
    }
};
CentralView.event =  {
    zoomIn: function(){
        tab = CentralView.getCurrentTab();
        // console.log("zoom in", tab.scale);
        if(tab.scale<CLASSVIEW_CONFIG.MAX_ZOOM) tab.scale+=CLASSVIEW_CONFIG.ZOOM_DELTA;
        tab.view.attr("transform", "translate(" + (CentralView.svgBounding.width/2)+","+ CentralView.svgBounding.height/2+ ")scale(" + tab.scale + ")translate(" + (-CentralView.svgBounding.width/2)+","+ (-CentralView.svgBounding.height/2)+ ")");
    },
    zoomOut: function(){
        tab = CentralView.getCurrentTab();
        // console.log("zoom out", tab.scale);
        if(tab.scale>CLASSVIEW_CONFIG.MIN_ZOOM) tab.scale-=CLASSVIEW_CONFIG.ZOOM_DELTA;
        tab.view.attr("transform", "translate(" + (CentralView.svgBounding.width/2)+","+ CentralView.svgBounding.height/2+ ")scale(" + tab.scale + ")translate(" + (-CentralView.svgBounding.width/2)+","+ (-CentralView.svgBounding.height/2)+ ")");
    }
};
CentralView.event.zoom = d3.behavior.zoom().scaleExtent([1/CLASSVIEW_CONFIG.MAX_ZOOM,1/CLASSVIEW_CONFIG.MIN_ZOOM])
    .on("zoom", function(){
        tab = CentralView.getCurrentTab();
        tab.view.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    });
/**
 * Lưu svg
 */
CentralView.event.saveAsSvg = function(){
// var content = d3.select("svg");
    var tab = CentralView.getCurrentTab();
    ImageSave.save(tab.svg, tab.id);
}

CentralView.event.closeTab = function(title, tab){
    if (tab.id == CYCLOMATIC_VIEW_ID || tab.id == LOC_VIEW_ID) {
        tab.view.selectAll('circle').remove();
    }
    if (tab.id == SOURCE_CODE_VIEW_ID && CentralView.tabs.length == 1){
        CentralView.swapLayers();
    }
    let currentTab = CentralView.getCurrentTab();
    let current = CentralView.tabs.indexOf(currentTab);
    let count = CentralView.tabs.length;
    let i = CentralView.tabs.indexOf(tab);
    CentralView.tabs.splice(i, 1);
    tab.isContain = false;
    tab.active = false;
    tab.svg.attr("visibility","hidden");
    CentralView.redrawTab();
    tabContain.push({title: tab.name,
        action: function(){
            d3.select('.d3-context-menu').style('display', 'none');
            CentralView.event.addTab(tab);
        }});
    if(CentralView.tabs.length == 0) {
        tab.active = false;
        tab.svg.attr("visibility","hidden");
    } else if( i == current) {
        if (i != count - 1) {
            CentralView.switchTab(CentralView.tabs[i].id);
        } else {
            CentralView.switchTab(CentralView.tabs[i-1].id);
        }
    }
}

CentralView.redrawTab = function () {
    var div_rect = d3.select("body").select(".class-view").node().getBoundingClientRect();
    numTabs = CentralView.tabs.length;
    if (numTabs == 0){
        tabFullList.forEach(function(tab, index) {
            tab.active = false;
            tab.svg.attr("visibility","hidden");
            let title = tab.title.attr("transform", "translate(0,0)");
            title.select(".title-background").attr("width", div_rect.width + 3 * CLASSVIEW_CONFIG.TAB_SERVICE_ICON_SIZE);
            title.select(".text").attr("visibility", "hidden");
            title.select(".close").attr("visibility", "hidden");
            title.select(".right-segment").attr("x", div_rect.width - CLASSVIEW_CONFIG.TAB_SEGMENT_WIDTH - 3 * CLASSVIEW_CONFIG.TAB_SERVICE_ICON_SIZE);
            title.select(".activeBar").attr("visibility", "hidden");
        })
    } else {
        remove = 0;
        tabWidth = (div_rect.width - 3*CLASSVIEW_CONFIG.TAB_SERVICE_ICON_SIZE) / numTabs;
        tabFullList.forEach(function(tab, index) {
            if (tab.isContain) {
                index = index - remove;
                let title = tab.title.attr("transform", "translate(" + index * tabWidth + ",0)");
                if (index != CentralView.tabs.length - 1) {
                    title.select(".title-background").attr("width", tabWidth);
                } else {
                    title.select(".title-background").attr("width", tabWidth + 3 * CLASSVIEW_CONFIG.TAB_SERVICE_ICON_SIZE);
                }
                title.select(".text").attr("x", tabWidth / 2).attr("visibility", "visible");
                title.select(".close").attr("x", tabWidth - CLASSVIEW_CONFIG.TAB_SERVICE_ICON_SIZE - CLASSVIEW_CONFIG.ICON_MARGIN).attr("visibility", "visible");
                title.select(".right-segment").attr("x", tabWidth - CLASSVIEW_CONFIG.TAB_SEGMENT_WIDTH);
                title.select(".activeBar").attr("width", tabWidth).attr("visibility", "visible");
                // title.text(tab.name);
            } else {
                let title = tab.title.attr("transform", "translate(" + index * tabWidth + ",0)").attr("cursor", "pointer");
                title.select(".text").attr("visibility", "hidden");
                title.select(".title-background").attr("width", "0px");
                remove = remove + 1;
            }
        })
    }
}

CentralView.event.addTab = function(tab){
    if (tab.id == CYCLOMATIC_VIEW_ID) {
        TREE_API.getAllCyclomaticComplexity().done((data, status) => {
            var CyclomaticView = new BubbleChartClass(data.data, CentralView.getTab(CYCLOMATIC_VIEW_ID).view);
            CyclomaticView.draw(true);
        });
    }
    else if (tab.id == LOC_VIEW_ID) {
        TREE_API.getAllLoc().done((data, status) => {
            var LocView = new BubbleChartClass(data.data, CentralView.getTab(LOC_VIEW_ID).view);
            LocView.draw(false);
        });
    }
    else if (tab.id == PACKAGE_DIAGRAM_VIEW_ID) {
        PackageDiagramViewClass.init();
    }

    let position = tabFullList.indexOf(tab);
    tab.isContain = true;
    if(CentralView.tabs.indexOf(tab) < 0) {
        CentralView.tabs.splice(position, 0, tab);
        CentralView.redrawTab();
        tabContain.forEach(function (tabName, i) {
            if (tabName.title == tab.name) {
                tabContain.splice(i, 1);
            }
        })
    }
    CentralView.switchTab(tab.id);
}

function onDisplayDependencyModeChange() {
    var selectValue = d3.select('select').property('value');

    if(selectValue ==  'None') {
        DependenceView.dependencyDisplayingMode = DEPENDENCY_DISPLAYING_MODE.NONE;
        console.log(selectValue);

    } else if(selectValue == 'Partial'){
        DependenceView.dependencyDisplayingMode = DEPENDENCY_DISPLAYING_MODE.PARTIAL;
        console.log(selectValue);

    } else if(selectValue == 'All'){
        DependenceView.dependencyDisplayingMode = DEPENDENCY_DISPLAYING_MODE.ALL;
        console.log(selectValue);
    }

    console.log("Updating links...");
    DependenceView.processLink(DependenceView.lastActiveNode);
    console.log("Done updating links...");
};