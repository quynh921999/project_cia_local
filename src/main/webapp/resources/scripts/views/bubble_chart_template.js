class BubbleChartClass {

    constructor(data, view) {
        this.data = data;
        this.view = view;
    }

    draw(isCyclomaticView) {
        var graph = this;

        var radius = d3.scale.sqrt().range([0, 10]);
        var padding = 3, // separation between same-color nodes
            maxRadius = 10;

        var height = 500, //max size of the bubbles
            width = 800,
            format = d3.format(",d"),
            colorMap = {},
            color = function (key, totalColors) {
                var colorIndex = Object.keys(colorMap).length + 10 || 1;
                if (!colorMap[key]) {
                    colorMap[key] = d3.hsl((colorIndex * (360 / totalColors)) % 360, 0.7, 0.7);
                }
                return colorMap[key];
            }, //generate the evenly spaced hue color with fixed saturation and lightness

            //fixed color for catagory data
            colorForCat = d3.scale.ordinal()
                .domain(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"])
                .range(['#0a67a3', '#4f90ba', '#ffd663', '#ffcb39', '#ffbc00', '#ff4100', '#074f7e',
                    '#ff8b63', '#c53200', '#ff6c39', '#9b7200', '#c59100', '#9b2800', '#043e63']);

        var colorLowRisk = d3.scale.linear().domain([-10,0]) //0->10
                .interpolate(d3.interpolateHcl)
                .range([d3.rgb('#008000'), d3.rgb('#66ff33')]),
            colorModerateRisk = d3.scale.linear().domain([-10,0])//11->20
                .interpolate(d3.interpolateHcl)
                .range([d3.rgb('#99ff66'), d3.rgb('#ffff66')]),
            colorHighRisk = d3.scale.linear().domain([-30,0])//21->50
                .interpolate(d3.interpolateHcl)
                .range([d3.rgb('#ffff66'), d3.rgb('#ff9933')]),
            colorMostComplex = d3.scale.linear().domain([-100,0])//>50
                .interpolate(d3.interpolateHcl)
                .range([d3.rgb('#ff9933'), d3.rgb('#ff0000')]);//d3.rgb("#007AFF"), d3.rgb('#FFF500')]);*/

        var center = {
            x: width / 2,
            y: height / 2
        };

        var target;
        var damper = 0.1;

        var bubble = d3.layout.pack()
            .sort(null)
            .size([width, height])
            .padding(1.5);

        var tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .style("color", "white")
            .style("padding", "8px")
            .style("background-color", "rgba(0, 0, 0, 0.75)")
            .style("border-radius", "6px")
            .style("font", "12px sans-serif")
            .text("tooltip");

        var bubbleData = this.data;

        bubbleData = bubbleData.map(function (d) {
            if (d.data && d.data.most_complex_method)
                d.name = d.name + ' - ' + d.data.most_complex_method + '()';
            d.centerX = width / 2;
            d.centerY = height / 2;
            return d;
        });

        var svg = this.view
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("class", "bubble")
            .attr("viewBox", "0 100 800 400")
            .attr("preserveAspectRatio", "xMidYMid meet");

        var aspect = width / height;

        //creating svg3 for legend for category data
        var svg3 = d3.select("#category-legend")
            .append("svg")
            .attr("width", 300)
            .attr("height", 12 * (bubbleData.length + 1));

        d3.select(window)
            .on("resize", function () {
                var targetWidth = svg.node().getBoundingClientRect().width;
                var targetHeight = targetWidth / aspect;
                svg.attr("width", targetWidth);
                svg.attr("height", targetHeight);
            });

        function updateData(newData) {

            //remove old elements
            graph.view.selectAll("circle")
                .remove();

            var force = d3.layout.force()
                .nodes(newData) //newData is not year
                .size([width, height])
                .gravity(-0.01)
                .charge(function (d) {
                    return -Math.pow(d.radius, 2.0) / 8;
                })
                .friction(0.6)
                .on("tick", tick)
                .start();

            //setup the chart
            var nodes = svg.selectAll(".node")//"circle"
                .data(newData);

            nodes.enter()
                .append("g")
                .attr("class", "nodes")
                .call(force.drag);

            var circles = nodes.append("circle")
                .attr("r", function (d) {
                    return d.r / 2;
                })
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                })
                .on("mouseover", function (d) {
                    var bubble = d3.select(this);
                    bubble.attr("stroke", "#000")
                        .attr("stroke-width", 2.5);
                    tooltip.text(d.name + ": " + format(d.value));
                    tooltip.style("visibility", "visible");
                })
                .on("mousemove", function () {
                    return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
                })
                .on("mouseout", function () {
                    var bubble = d3.select(this);
                    tooltip.style("visibility", "hidden");
                    bubble.attr("stroke", "none");
                })
                .on("dblclick", function(circle) {
                    let nodeId = circle.data.node_id;
                    SourceCodeViewClass.draw({data: {id: nodeId}});
                })
                .call(d3.zoom().on("zoom", function () {
                        svg.attr("transform", d3.event.transform)
                }))

            circles.style("fill", function (d) {
                if (!isCyclomaticView) {
                    return colorForCat(d.value);
                }

                if (d.value >= 0 && d.value <= 10){
                    return colorLowRisk(d.value-10);
                } else{
                    if (d.value >= 11 && d.value <= 20){
                        return colorModerateRisk(d.value-20)
                   } else {
                        if (d.value >= 21 && d.value <= 50){
                            return colorHighRisk(d.value-50)
                        } else
                            return colorMostComplex(d.value-100)
                        }
                    }

                return colorForCat(d.value);
            });

            //when it's category data, show category legend
            $("g.legend").remove();
            circles.attr("data-legend", function (d) {
                return d.name;
            });
            var legend = svg3.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(-15, 20)")
                .style("font-size", "10px")
                .attr("data-style-padding", 8);
            // .call(d3.legend);

            legend.selectAll('rect')
                .data(newData)
                .enter()
                .append("circle")
                .attr("cx", 30)
                .attr("cy", function (d, i) {
                    return (i - 1) * 12
                })
                .attr("r", 4)
                // .attr("height", 5)
                // .style("stroke", "#7b98aa")
                .style("fill", function (d) {
                    return colorForCat(d.name);
                });
            // .attr("stroke-width", 1)
            // .style("fill", "#7b98aa");

            legend.selectAll('text')
                .data(newData)
                .enter()
                .append("text")
                .attr("x", 40)
                .attr("width", 5)
                .attr("height", 5)
                .attr("y", function (d, i) {
                    return (i - 1) * 12 + 5;
                })
                .style("cursor", "pointer")
                .text(function (d) {
                    return d.name + ' (' + d.count + ')';
                })
            /*.on("click", renderProfile)*/;

            circles.transition()
                .duration(2000)//750
                .delay(function (d, i) {
                    return i * 5;
                })
                .attrTween("r", function (d) {
                    var i = d3.interpolate(0, d.r * 1.1);
                    return function (t) {
                        return d.r = i(t);
                    };
                });

            function tick(e) {
                circles
                // .each(gravity(.1 * e.alpha))
                    .each(collide(0.03))
                    .each(move_towards_center(e.alpha))
                    .attr("cx", function (d) {
                        return d.x;
                    })
                    .attr("cy", function (d) {
                        return d.y;
                    });
                // number
                // .each(gravity(.1 * e.alpha))
                // .each(collide(0.03))
                // .each(move_towards_center(e.alpha))
                // .attr("x", function (d) { return d.x; })
                // .attr("y", function (d) { return d.y; });
                //show the name in the bubble
                // name
                //   .each(gravity(.1 * e.alpha))
                //   .each(collide(0.5))
                //   .attr("x", function (d) { return d.x; })
                //   .attr("y", function (d) { return d.y + d.r/3; });
            }

            function move_towards_center(alpha) {
                return function (d) {
                    d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
                    d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
                };
            };

            function gravity(alpha) {
                return function (d) {
                    // console.log(d);
                    // alphaY = alpha / 8;
                    d.y += (d.centerY - d.y) * alpha;
                    d.x += (d.centerX - d.x) * alpha;
                };
            }

            function collide(alpha) {
                var quadtree = d3.geom.quadtree(newData);//Category --> newData
                return function (d) {
                    var r = d.r + maxRadius + padding,
                        nx1 = d.x - r,
                        nx2 = d.x + r,
                        ny1 = d.y - r,
                        ny2 = d.y + r;
                    quadtree.visit(function (quad, x1, y1, x2, y2) {
                        if (quad.point && (quad.point !== d)) {
                            var x = d.x - quad.point.x,
                                y = d.y - quad.point.y,
                                l = Math.sqrt(x * x + y * y),
                                r = d.r + quad.point.r + padding;
                            if (l < r) {
                                l = (l - r) / l * alpha;
                                d.x -= x *= l;
                                d.y -= y *= l;
                                quad.point.x += x;
                                quad.point.y += y;
                            }
                        }
                        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                    });
                };
            }
        }

        //bubbles needs specific format, convert data to this
        var Category = bubble.nodes({children: bubbleData}).filter(function (d) {
            return !d.children;
        });
        updateData(Category);

        d3.select('#text-select')
            .on('change', function () {
                var newData = eval(d3.select(this).property('value'));
                console.log(newData);
                updateData(newData);
            });

    }
}