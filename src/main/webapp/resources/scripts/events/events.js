var Event = {};
Event.timeoutId = 0;
Event.zoom = d3.behavior.zoom().scaleExtent([ 0.2, 5 ])
    .on("zoom", Event.zoomed);
Event.zoomed = function() {
  ClassView.view.attr("transform", "translate(" + d3.event.translate
      + ")scale(" + d3.event.scale + ")");
};

Event.showDetailWhenMouseOver = function(elm, d) {
    bounding = elm.getBoundingClientRect();
    // console.log(bounding);
    // console.log(d);
    if (!Event.timeoutId) {
        Event.timeoutId = window.setTimeout(function() {
            text = d3.select("body").selectAll(".hover_text").data([ d ]).enter().append(
                "div").attr("class", "hover_text").attr("style" , "max-height:300px;max-width:500px;overflow:auto")
                .on("mouseout" ,function (d) {
                    d3.select(".hover_text").remove();
                });
            // console.log(this.getBoundingClientRect());

            // console.log(mouse);
            text.style("left", bounding.left + "px").style("top",
                bounding.top + bounding.height + "px");
            text.append("span").html(Utils.getDetailInfoAsHTML(d));
        }, 500);
    }
};

Event.showDetailWhenMouseOverLine = function(d) {
    var me=this;
    var x1 = $(this).attr("x1");
    var x2 = $(this).attr("x2");
    var y1 = $(this).attr("y1");
    var y2 = $(this).attr("y2");

    NodeEvent.highlightDependence(d);
    var x = event.clientX+1;
    var y =  event.clientY+1;
    if (!Event.timeoutId) {
        Event.timeoutId = window.setTimeout(function() {
            var listLine= $("line");
            var listSameDirection=[];
            $.each(listLine,function (index,item) {
                if($(this).attr("x1")==x1&$(this).attr("x2")==x2&$(this).attr("y1")==y1&$(this).attr("y2")==y2){
                    listSameDirection.push(this);
                }
            });
            var ll = listSameDirection;

            text1 = d3.select("body").selectAll(".hover_text_line").data([ d ]).enter().append(
                "div").attr("class", "hover_text_line").attr("style" , "max-height:300px;max-width:500px;overflow:auto")
                .on("mouseout" ,function (d) {
                    d3.select(".hover_text_line").remove();
                });
            // console.log(this.getBoundingClientRect());
            text1.style("left", x + "px").style("top",
                y + "px");
            console.log(d);
            var listText="<br>";
            $.each(ll,function (index,item) {
                listText+=item.__data__.typeDependency+" weight: "+item.__data__.weight+"<br>";

            });
            text1.append("span").html(d.source.data.name + " -> " + d.destination.data.name + " : " +listText);
            console.log(text1);
        }, 500);
    }
};

Event.showNameWhenMouseOver = function(d) {
  text = d3.select("body").selectAll(".hover_text").data([ d ]).enter().append(
      "div").attr("class", "hover_text");
  // console.log(this.getBoundingClientRect());
  bounding = this.getBoundingClientRect();
  // console.log(mouse);
  text.style("left", bounding.left + "px").style("top",
      bounding.top + bounding.height + 4 + "px");
  text.append("span").html(d.name);
};

Event.showNameWhenMouseOverOnRight = function(d) {
  text = d3.select("body").selectAll(".hover_text").data([ d ]).enter().append(
      "div").attr("class", "hover_text");
  // console.log(this.getBoundingClientRect());
  bounding = this.getBoundingClientRect();
  // console.log(mouse);
  text.style("left", bounding.right - 100 + "px").style("top",
      bounding.top + bounding.height + 4 + "px");
  text.append("span").html(d.name);
};
Event.clearWhenMouseOut = function mouseOutText() {
    window.clearTimeout(Event.timeoutId);
    Event.timeoutId = null;
    d3.selectAll(".hover_text").remove();
    // var x = event.clientX, y = event.clientY,
    //     elementMouseIsOver = document.elementFromPoint(x, y);
    // //console.log("moveto"+elementMouseIsOver.className);
    // if(elementMouseIsOver.className == "hover_text" || elementMouseIsOver.className == "title"
    //       || elementMouseIsOver.className == "icon"){
    // }
    //  else d3.selectAll(".hover_text").remove();

};

Event.clearWhenMouseOutLine = function mouseOutText(d) {
    NodeEvent.unhighlightDependence(d);
    window.clearTimeout(Event.timeoutId);
    Event.timeoutId = null;
    var x = event.clientX, y = event.clientY,
        elementMouseIsOver = document.elementFromPoint(x, y);
    //console.log("moveto"+elementMouseIsOver.className);
    if(elementMouseIsOver.className == "hover_text_line"){
    }
     else  d3.selectAll(".hover_text_line").remove();
};

Event.dragged = function(d) {
  d3.event.sourceEvent.stopPropagation();
  d.x += d3.event.dx;
  d.y += d3.event.dy;
};
Event.dragstarted = function(d) {
  d3.event.sourceEvent.stopPropagation();
  Event.clearWhenMouseOut(d);
};
Event.dragended = function(d) {
  d3.event.sourceEvent.stopPropagation();
};
Event.drag = d3.behavior.drag().origin(function(d) {
  return d;
}).on("dragstart", Event.dragstarted).on("drag", Event.dragged).on("dragend",
    Event.dragended);

Event.showWhenHoverChange = function() {

};