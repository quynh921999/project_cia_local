/**
 * Object quản lí Class View
 */

var ClassView = {
  linkData : [],
  links : [],
  graph : [],
  main : {},
  dependencyList : [],
  view : {},
  tab : {},
  init : function() {
    ClassView.tab = CentralView.getTab("class");
    ClassView.view = ClassView.tab.view;
  },
  /**
   * Cập nhật mới dữ liệu của ClassView bao gồm các class phụ thuộc, các phụ
   * thuộc
   *
   * @param {int}
   *          id id của class trung tâm
   */
  update : function(id) {
    var classIDlist = [ id ];
    ClassView.dependencyList = [];
    ClassView.linkData = [];
    var mainFile = Data.getNodeById(id);
    var depends = Data.dependences.find(function(s) {
      return s.id == id;
    });
    if (depends) {
      // console.log(depends);
      depends.dependency.forEach(function(depend) {
        ClassView.dependencyList.push({
          type : depend.type,
          ID_source : depends.id,
          ID_targets : depend.id
        });
        depend.id.forEach(function(destID) {
          // console.log(destID);
          var classID = Data.getClassIDfromPropertyID(destID);
          if (classIDlist.indexOf(classID) < 0) {
            classIDlist.push(classID);
          }
        });
      });
    }
    if (!Utils.isExpanded(mainFile))
      ClassDrawer.event.expandClass(mainFile);
    mainFile.attributes.concat(mainFile.methods).forEach(function(attr) {
      // console.log(attr.id);
      var depends = Data.dependences.find(function(s) {
        return s.id == attr.id;
      });
      if (depends) {
        // console.log(depends);
        depends.dependency.forEach(function(depend) {
          ClassView.dependencyList.push({
            type : depend.type,
            ID_source : depends.id,
            ID_targets : depend.id
          });
          depend.id.forEach(function(destID) {

            var classID = Data.getClassIDfromPropertyID(destID);
            if (classID == undefined)
              return;
            // console.log(depends.id,destID, classID);
            if (classIDlist.indexOf(classID) < 0) {
              classIDlist.push(classID);
            }
          })
        })
      }
    })
    this.makeNodes(classIDlist);
    this.draw();
  },
  /**
   * Tạo các node mới dựa trên danh sách các ids
   */
  makeNodes : function(classIDlist) {
    this.graph = [];
    ClassView.linkData = [];
    ClassView.main = Data.getNodeById(classIDlist[0]);
    var numClass = classIDlist.length;
    // console.log(classIDlist);
    var positionList = [];
    if (numClass == 1) {
      positionList = GRAPH_CONFIG.ONE_NODE;
    } else if (numClass == 2)
      positionList = GRAPH_CONFIG.TWO_NODE;
    else if (numClass == 3)
      positionList = GRAPH_CONFIG.THREE_NODE;
    else if (numClass == 4)
      positionList = GRAPH_CONFIG.FOUR_NODE;
    else {
      var delta = 2 * 3.14 / numClass;
      positionList.push(GRAPH_CONFIG.CENTER_POSITION);
      for (var i = 0; i < numClass; i++) {
        positionList.push({
          x : GRAPH_CONFIG.CENTER_POSITION.x + 400,
          y : GRAPH_CONFIG.CENTER_POSITION.y + 1.5
              * CLASSDRAWER_CONFIG.TITLE_HEIGHT * parseInt(i / 2)
              * ((i % 2 == 0) ? -1 : 1) + 200
        });
      }
    }
    classIDlist.forEach(function(ID, i) {
      var file = Data.getNodeById(ID);
      // console.log(file, ID);
      file.x = positionList[i].x;
      file.y = positionList[i].y;
      if (Utils.isExpanded(file))
        ClassDrawer.event.collapseClass(file);
      // console.log("class is ",file);
      ClassView.graph.push(file);
      if (i > 0)
        ClassView.linkData.push({
          source : ClassView.main,
          target : file
        });
    });
    ClassDrawer.event.expandClass(ClassView.main);
  },
  draw : function() {
    // console.log(this.graph);
    ClassView.view.selectAll("g").remove();
    ClassView.view.append("g").attr("class", "classes");
    ClassDrawer.drawClass(ClassView.graph[0], true);
    for (var i = 1; i < ClassView.graph.length; i++) {
      ClassDrawer.drawClass(ClassView.graph[i], false);
    }
    // console.log(ClassView.graph);
    ClassView.drawLink();
  },
  drawLink : function() {
    ClassView.view.selectAll('g').select(".link").remove();
    ClassView.linkData.forEach(function(d) {
      var line = Utils.findPath(d);
      // console.log("line", line);
      d.begin = line.begin;
      d.end = line.end;
    });
    // console.log(ClassView.linkData);
    ClassView.links = ClassView.view.append('g').attr("class", "link")
        .selectAll("line").data(ClassView.linkData).enter().append("line")
        .attr("x1", function(d) {
          return d.begin.x;
        }).attr("y1", function(d) {
          return d.begin.y;
        }).attr("x2", function(d) {
          return d.end.x;
        }).attr("y2", function(d) {
          return d.end.y;
        }).attr("marker-end", "url(#end-arrow)");
  },
  updateLinkOfNode : function(d) {
    ClassView.links.filter(function(link) {
      if (link.source === d || link.target === d) {
        var line = Utils.findPath(link);
        link.begin = line.begin;
        link.end = line.end;
        return true;
      } else
        return false;
    }).attr("x1", function(link) {
      return link.begin.x;
    }).attr("y1", function(link) {
      return link.begin.y;
    }).attr("x2", function(link) {
      return link.end.x;
    }).attr("y2", function(link) {
      return link.end.y;
    });
  },
  updateNode : function(id) {
    /*
    var data = Data.getNodeById(id);
    if (!ClassView.view.select("#id" + id).node())
      return;
    ClassDrawer.drawClass(data);
    ClassView.links.filter(function(link) {
      if (link.source.id == id) {
        link.source = data;
      } else if (link.target.id == id) {
        link.target = data;
      }
      return true;
    });
    */
  }
}
ClassView.event = {
  dragged : function(d) {
    d.x += d3.event.dx;
    d.y += d3.event.dy;
    ClassView.updateLinkOfNode(d);
    d3.select(this).attr("transform", "translate(" + d.x + "," + d.y + ")");
    // drawClassView();*/
  },
  dragstarted : function(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
    d3.select("body").selectAll(".change-element").remove();
  },
  dragended : function(d) {
    d3.select(this).classed("dragging", false);

  }
}
ClassView.event.drag = d3.behavior.drag().origin(function(d) {
  return d;
}).on("dragstart", ClassView.event.dragstarted).on("drag",
    ClassView.event.dragged).on("dragend", ClassView.event.dragended);