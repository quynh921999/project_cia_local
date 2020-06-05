/**
 * Object tạo mới view, các line border cho việc resize view bằng chuột
 * 
 */
let ProjectView = null,
    ProjectSearchView = null,
    ClassDiagram = null,
    DataflowDiagram = null;
    GraphLayerDiagrama =  null;
    D3Erda = null;

let DivManager = {
  border : [],
  init : function() {
    // d3.select("body").selectAll('div').remove();
    DivManager.createDiv(d3.select("body"), DIV_DATA);
  },
  resizeDiv : function() {
    d3.selectAll(".main-view")[0].forEach(function(mainView, index) {
      var divBounding = mainView.parentNode.getBoundingClientRect();
      d3.select(mainView).style("height",
          divBounding.height - VIEW_CONFIG.SCROLLBAR_HEIGHT + "px");
    });
  },

  createDiv : function(parentDiv, parent) {
      if (!parent.children)
        return;
        let preDiv;
      for (let i = 0; i < parent.children.length; i++) {
        let child = parent.children[i];

        let div = parentDiv.append("div").classed("view", true).classed(
              child.name, true).style("position", "absolute").style("width",
              child.width).style("height", child.height).style("top", child.top)
              .style("left", child.left);

      if (i > 0) {
        parentDiv.append("div").data([ {
          orientation : parent.orientation,
          div1 : preDiv,
          div2 : div
        } ]).classed("border", true).style("position", "absolute").style(
            "width", function() {
              if (parent.orientation == "vertical")
                return "100%";
              else
                return "3px";
            }).style("height", function() {
          if (parent.orientation == "vertical")
            return "3px";
          else
            return "100%";
        }).style("top", child.top).style("left", child.left).style("cursor",
            function() {
              if (parent.orientation == "vertical")
                return "n-resize";
              else
                return "e-resize";
            }).call(DivManager.event.dragBorder);
      }
      preDiv = div;
      DivManager.createDiv(div, child);
    }
  },
    regenerateLeftView: function(searchValue, searchedData, viewData) {
        d3.selectAll(".project-view").remove();
        d3.selectAll(".project-search-view").remove();
        DivManager.createDiv(d3.select("body").select(".left-view"), viewData);

        ProjectView = new ProjectViewClass(ProjectView.getData());
        ProjectView.update();

        if (viewData == SEARCHED_LEFT_VIEW_DATA) {
          ProjectView.removeSearchBox();
          ProjectSearchView = new ProjectSearchViewClass(searchedData);
          ProjectSearchView.addValueToSearchInput(searchValue ? null : "", searchValue);
          ProjectSearchView.update();
        }
    }
}

DivManager.event = {
  dragged : function(d) {
    d3.event.sourceEvent.stopPropagation();
    var border = this.getBoundingClientRect();
    var bounding1 = d.div1.node().getBoundingClientRect();
    var bounding2 = d.div2.node().getBoundingClientRect();
    var mouse = d3.mouse(d3.select("body").node());
    if (d.orientation == "vertical") {
      // console.log(this);
      bounding1.bot = bounding1.top + bounding1.height;
      if (mouse[1] < bounding1.top + VIEW_CONFIG.HEADER_HEIGHT)
        mouse[1] = bounding1.top + VIEW_CONFIG.HEADER_HEIGHT;
      else if (mouse[1] > bounding2.top + bounding2.height
          - VIEW_CONFIG.HEADER_HEIGHT)
        mouse[1] = bounding2.top + bounding2.height - VIEW_CONFIG.HEADER_HEIGHT;
      var exchangeHeight = mouse[1] - bounding1.bot;
      var newHeight1 = bounding1.height + exchangeHeight;
      var newHeight2 = bounding2.height - exchangeHeight;
      d.div1.style("height", newHeight1 + "px").style("width", "100%");
      d.div2.style("height", newHeight2 + "px").style("width", "100%");
      d.div2.style("top", mouse[1] + "px");
      d3.select(this).style("top", mouse[1] + "px");
    } else {
      // console.log(this);
      // console.log(mouse[0], bounding1, bounding2);
      if (mouse[0] < bounding1.left)
        mouse[0] = bounding1.left;
      else if (mouse[0] > bounding1.left + bounding1.width + bounding2.width
          - 2)
        mouse[0] = bounding1.left + bounding1.width + bounding2.width - 2;
      var exchangeWidth = mouse[0] - bounding2.left;
      var newWidth1 = bounding1.width + exchangeWidth;
      var newWidth2 = bounding2.width - exchangeWidth;
      // console.log(exchangeWidth, ": ", newWidth1, "- ", newWidth2);
      d.div1.style("width", newWidth1 + "px").style("height", "100%");
      d.div2.style("width", newWidth2 + "px").style("height", "100%");
      d.div2.style("left", mouse[0] + "px");
      d3.select(this).style("left", mouse[0] + "px");
    }
    resize();
    DivManager.resizeDiv();
  },
  dragstarted : function(d) {
    d3.event.sourceEvent.stopPropagation();
    Event.clearWhenMouseOut();

    // createAllView();
  },
  dragended : function(d) {
    d3.event.sourceEvent.stopPropagation();
    // createAllView();
  },
  search: function(d) {
        DivManager.regenerateLeftView(d.value, [], SEARCHED_LEFT_VIEW_DATA);
        Data.searchFile(d.value).then(res => {
          if (Utils.isValidObject(res.data)) {
            ProjectSearchView.setData(res.data);
            ProjectSearchView.expandAll();
            ProjectSearchView.update();
          }
          else {
            ProjectSearchView.hideLoader();
            ProjectSearchView.removeTreeViewer();
            ProjectSearchView.createResponseMessage(res.message);
          }
        })
    }
}

DivManager.event.dragBorder = d3.behavior.drag().origin(function(d) {
  return d;
}).on("dragstart", DivManager.event.dragstarted).on("drag",
    DivManager.event.dragged).on("dragend", DivManager.event.dragended)

function initViews() {
  createAllView();
}

function createAllView() {
  console.log("start creating view");
  ProjectView = new ProjectViewClass(Data.dataAsTree);
  CentralView.createView();
  ChangeSetView.createView();
  ImpactSetView.createView();
  // PropertyView.createView();
  //ClassDrawer.init();
  //ClassView.init();
}
function resize() {
  CentralView.resize();
  ProjectView.resize();
  ImpactSetView.resize();
  if (ProjectSearchView) {
      ProjectSearchView.resize();
  }
  ChangeSetView.resize();
}
// reload all View on resize
d3.select(window).on("resize", resize);