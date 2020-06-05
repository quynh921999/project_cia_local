/**
 * Object phục vụ vẽ node trong Class View
 */

var ClassDrawer = {
    tab: {},
    view: {},
    init: function () {},
    drawClass: function () {}
};
ClassDrawer.event = {
    onMouseOverProperty: function () {},
    onMouseOutProperty: function () {},
    onClickExpandClass: function () {},
    expandClass: function () {},
    collapseClass: function () {}
};

ClassDrawer.init = function () {
    ClassDrawer.tab = CentralView.getTab("class");
    ClassDrawer.view = ClassDrawer.tab.view;
};
ClassDrawer.drawClass = function (file, isMain) {
    ClassDrawer.view.select(".classes").selectAll("#classid" + file.id).remove();
    // console.log(file);
    var container = ClassDrawer.view.select(".classes").data([file]).append('g')
            .attr("class", "class-detail").attr("id", "classid" + file.id)
            .attr("transform", "translate(" + file.x + "," + file.y + ")")
            .attr("fill", CLASSDRAWER_CONFIG.FILL_COLOR)
            .attr("stroke", CLASSDRAWER_CONFIG.STROKE_COLOR)
            .call(ClassView.event.drag);
    if (file.name == "")
        file.name = "No title";
    var title = container.append('g')
            .attr("class", "title")
            .style("cursor", "pointer")
            .attr("id", "id" + file.id)
            .on("mouseover", ClassDrawer.event.onMouseOverProperty)
            .on("mouseout", ClassDrawer.event.onMouseOutProperty)
            // .on("click", PropertyView.updateNewNode)
            .on("dblclick", ClassDrawer.event.onClickExpandClass);
    title.append('rect')
            .attr("width", CLASSDRAWER_CONFIG.WIDTH)
            .attr("height", CLASSDRAWER_CONFIG.TITLE_HEIGHT);
    title.append('text')
            .attr("x", CLASSDRAWER_CONFIG.WIDTH / 2)
            .attr("y", CLASSDRAWER_CONFIG.TITLE_HEIGHT / 2 + CLASSDRAWER_CONFIG.TITLE_FONT_SIZE / 2)
            .text(function () {
                if (file.name.length > CLASSDRAWER_CONFIG.MAX_CLASSNAME_LENGTH)
                    return file.name.slice(0, CLASSDRAWER_CONFIG.MAX_CLASSNAME_LENGTH - 2) + "...";
                else
                    return file.name;
            })
            .on("mouseover", Event.showDetailWhenMouseOver)
            .on("mouseout", Event.clearWhenMouseOut);
    var attrPanel_height = CLASSDRAWER_CONFIG.ATTR_PANEL_MINHEIGHT + CLASSDRAWER_CONFIG.PROPERTY_HEIGHT * file.attributes.length;
    var attributes = container.append('g')
            .attr("transform", "translate(0," + CLASSDRAWER_CONFIG.TITLE_HEIGHT + ")");
    attributes.append('rect')
            .attr("width", CLASSDRAWER_CONFIG.WIDTH)
            .attr("height", attrPanel_height);
    var attributeEnter = attributes.selectAll('g').data(file.attributes).enter().append('g')
            .attr("class", "attr").attr("id", function (d) {
        return "id" + d.id
    })
            .attr("transform", function (d, i) {
                return "translate(0," + CLASSDRAWER_CONFIG.PROPERTY_HEIGHT * i + ")";
            })
            .style("cursor", "pointer")
            .on("mouseover", ClassDrawer.event.onMouseOverProperty)
            .on("mouseout", ClassDrawer.event.onMouseOutProperty)
            // .on("click", PropertyView.updateNewNode);
    attributeEnter.append('rect').attr("x", 1).attr("y", 1)
            .attr("width", CLASSDRAWER_CONFIG.PROPERTY_WIDTH - 2).attr("height", CLASSDRAWER_CONFIG.PROPERTY_HEIGHT - 2);
    var text = attributeEnter.append('text')
            .attr("y", 20)
            .attr('x', 25)
            .text(function (d) {
                if ((d.name.length + d.type.length) < CLASSDRAWER_CONFIG.MAX_TEXT_LENGTH)
                    return d.name + " :" + d.type;
                var name;
                if (d.name.length > CLASSDRAWER_CONFIG.MAX_NAME_LENGTH)
                    name = d.name.slice(0, CLASSDRAWER_CONFIG.MAX_NAME_LENGTH - 1) + "... :";
                else
                    name = d.name + ": ";
                var remainSpace = CLASSDRAWER_CONFIG.MAX_TEXT_LENGTH - name.length;
                var type;
                if (d.type.length > remainSpace)
                    type = d.type.slice(0, remainSpace - 2) + "...";
                else
                    type = d.type;
                return name + type;
            })
            .on("mouseover", Event.showDetailWhenMouseOver)
            .on("mouseout", Event.clearWhenMouseOut);
    attributeEnter.append('image')
            .attr("width", 10)
            .attr("height", 10)
            .attr("x", 10).attr("y", 10)
            .attr("xlink:href", function (d) {
                return "resources/images/" + d.visibility + ".svg"
            });
    var methods = container.append('g')
            .attr("transform", "translate(0," + (attrPanel_height + CLASSDRAWER_CONFIG.TITLE_HEIGHT) + ")");
    var methodsPanel_height = CLASSDRAWER_CONFIG.METHOD_PANEL_MINHEIGHT + CLASSDRAWER_CONFIG.PROPERTY_HEIGHT * file.methods.length;
    file.height = CLASSDRAWER_CONFIG.TITLE_HEIGHT + attrPanel_height + methodsPanel_height;
    methods.append('rect')
            .attr("width", CLASSDRAWER_CONFIG.WIDTH)
            .attr("height", methodsPanel_height);
    var methodEnter = methods.selectAll('g').data(file.methods).enter().append('g').attr("id", function (d) {
        return "id" + d.id
    })
            .attr("class", "attr")
            .style("cursor", "pointer")
            .attr("transform", function (d, i) {
                return "translate(0," + 30 * i + ")";
            })
            // .on("click", PropertyView.updateNewNode)
            .on("mouseover", ClassDrawer.event.onMouseOverProperty)
            .on("mouseout", ClassDrawer.event.onMouseOutProperty);
    methodEnter.append('rect').attr("x", 1).attr("y", 1)
            .attr("width", CLASSDRAWER_CONFIG.PROPERTY_WIDTH - 2)
            .attr("height", CLASSDRAWER_CONFIG.PROPERTY_HEIGHT - 2);
    var text = methodEnter.append('text')
            .attr("y", 20)
            .attr('x', 25)
            .text(function (d) {
                if ((d.name.length + d.return.length) < CLASSDRAWER_CONFIG.MAX_TEXT_LENGTH)
                    return d.name + "(): " + d.return;
                var name;
                if (d.name.length > CLASSDRAWER_CONFIG.MAX_NAME_LENGTH)
                    name = d.name.slice(0, CLASSDRAWER_CONFIG.MAX_NAME_LENGTH - 1) + "... :";
                else
                    name = d.name + "(): ";
                var remainSpace = CLASSDRAWER_CONFIG.MAX_TEXT_LENGTH - name.length;
                var re;
                if (d.return.length > remainSpace)
                    re = d.return.slice(0, remainSpace - 2) + "...";
                else
                    re = d.return;
                return name + re;
            })
            .on("mouseover", Event.showDetailWhenMouseOver)
            .on("mouseout", Event.clearWhenMouseOut);
    methodEnter.append('image')
            .attr("width", 10)
            .attr("height", 10)
            .attr("x", 10)
            .attr("y", 10)
            .attr("xlink:href", function (d) {
                return "resources/images/" + d.visibility + ".svg"
            });

};

ClassDrawer.event.onMouseOverProperty = function (property) {
    // d3.select(this).attr("fill","gray");
    if (property.classID == ClassView.main.id || property.id == ClassView.main.id)
        d3.select(this).select("rect").style("fill", GRAPH_CONFIG.PROPERTY_HOVER_MAIN_COLOR);
    else
        d3.select(this).select("rect").style("fill", GRAPH_CONFIG.PROPERTY_HOVER_COLOR);
    d3.select(this).selectAll("text").style("fill", "white");
    var dependence = ClassView.dependencyList.find(function (depend) {
        return depend.ID_source == property.id
    });
    if (dependence) {
        var fill_property_color;
        if (dependence.type == "call")
            fill_property_color = GRAPH_CONFIG.CALL_DEPENDENCE_COLOR;
        else if(dependence.type == "use")
            fill_property_color = GRAPH_CONFIG.USE_DEPENDENCE_COLOR;
        else 
            fill_property_color = GRAPH_CONFIG.INHERIT_DEPENDENCE_COLOR;
        dependence.ID_targets.forEach(function (id) {
            var e = d3.select("#id" + id);
            if (e) {
                e.select("rect").style("fill", fill_property_color);
                e.selectAll("text").style("fill", "white");
            }
        })
    }
};
ClassDrawer.event.onMouseOutProperty = function (property) {
    d3.select(this).select("rect").style("fill", "white");
    d3.select(this).selectAll("text").style("fill", "black");
    var dependence = ClassView.dependencyList.find(function (depend) {
        return depend.ID_source == property.id
    });
    if (dependence) {
        dependence.ID_targets.forEach(function (id) {
            var e = d3.select("#id" + id);
            if (e) {
                e.select("rect").style("fill", "white");
                e.selectAll("text").style("fill", "black");
            }
        })
    }
};
ClassDrawer.event.onClickExpandClass = function (d) {
    d3.event.stopPropagation();
    if (Utils.isExpanded(d)) {
        ClassDrawer.event.collapseClass(d);
    } else {
        ClassDrawer.event.expandClass(d);
    }
    ClassDrawer.drawClass(d);
    ClassView.updateLinkOfNode(d);
};
ClassDrawer.event.expandClass = function (d) {
    d.attributes = d._attributes;
    d._attributes = null;
    d.methods = d._methods;
    d._methods = null;
};
ClassDrawer.event.collapseClass = function (d) {
    d._attributes = d.attributes;
    d.attributes = [];
    d._methods = d.methods;
    d.methods = [];
};
