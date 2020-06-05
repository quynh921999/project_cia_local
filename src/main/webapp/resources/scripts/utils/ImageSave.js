/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
ImageSave = {};
ImageSave.getStyle = function(type) {
  if (type == DEPENDENCE_VIEW_ID) {
    return getFullGraphStyle();
  } else
    return getClassViewStyle();
};
getFullGraphStyle = function() {
  var marker = "<defs><marker id = 'end-arrow-fullgraph' viewBox='-10 -10 20 20' refX='6' markerWidth='10' markerHeight='10' orient=\"auto\"><path d = 'M-8,-5 L8,0 L-8,5 L-5,0' fill='#777'/></marker></defs>"
      + "<defs><marker id = 'depended-arrow-fullgraph' viewBox='-10 -10 20 20' refX='6' markerWidth='10' markerHeight='10' orient=\"auto\"><path d = 'M-8,-5 L8,0 L-8,5 L-5,0' fill='#777'/></marker></defs>"
      + "<defs><marker id = 'depend-arrow-fullgraph' viewBox='-10 -10 20 20' refX='6' markerWidth='10' markerHeight='10' orient=\"auto\"><path d = 'M-8,-5 L8,0 L-8,5 L-5,0' fill='#777'/></marker></defs>"
  var style = "<style>"
      + "svg{font-family: Arial, Helvetica, sans-serif;text{ fill: black; stroke: black;}\n"
      + "text{font: 14px Arial,Helvetica, sans-serif;   fill: white; stroke: 1px; stroke: none;text-decoration: none;}\n"
      + "line {stroke: #777; stroke-width: 2px;}\n" + "</style>";

  return style + marker;
}
getClassViewStyle = function() {
  var marker = "<defs><marker id = 'end-arrow' viewBox='-10 -10 20 20' refX='6' markerWidth='10' markerHeight='10' orient=\"auto\"><path d = 'M-8,-5 L8,0 L-8,5 L-5,0' fill='#000'/></marker></defs>";
  var style = "<style>"
      + "text{font: 14px Arial,Helvetica, sans-serif;   fill: black; stroke: 1px; stroke: none;text-decoration: none;}\n"
      + ".title text {text-anchor: middle; font: 16px Arial,Helvetica, sans-serif;font-weight: bold;}"
      + "rect{fill: white; stroke: black;stroke-width: 2px;}\n"
      + "line {stroke: black; stroke-width: 2px}" + "</style>";
  return style + marker;
}
ImageSave.save = function(svg, type) {
  var innerHtml = svg.attr("version", 1.1).attr("xmlns",
      "http://www.w3.org/2000/svg").html();

  var style = ImageSave.getStyle(type);
  // var html = "<svg version=\"1.1\"
  // xmlns=\"http://www.w3.org/2000/svg\">"+innerHtml.replace("class=\"link_fullgraph\"","class=\"link_fullgraph\"
  // style = \"fill: none; stroke: #aaa; stroke-width: 2px;\"")+"</svg>";
  var html = "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">"
      + style + innerHtml + "</svg>";
  // console.log(html);
  var imgsrc = 'data:image/svg+xml;base64,' + btoa(html);
  var img = '<img src="' + imgsrc + '">';
  var rect = Utils.findContainerBoxContain2Rect(svg.node()
      .getBoundingClientRect(), svg.select('.content').node()
      .getBoundingClientRect());
  d3.select("body").selectAll("canvas").remove();
  d3.select("body").append("canvas").attr("width", rect.width).attr("height",
      rect.height).attr("z-index", 100);
  var canvas = document.querySelector("canvas"), context = canvas
      .getContext("2d");
  var image = new Image;
  image.src = imgsrc;
  image.onload = function() {
    // console.log("done");
    context.drawImage(image, 0, 0);
    var canvasdata = canvas.toDataURL("image/png");
    var a = document.createElement("a");
    a.download = "sample.png";
    a.href = canvasdata;
    document.body.appendChild(a);
    a.click();
  };

}
