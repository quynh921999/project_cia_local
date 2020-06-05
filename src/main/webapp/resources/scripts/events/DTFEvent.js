var DTFEvent = {
    Vertex: {
        changeColorMouseOver: function (elem, v) {
            d3.select(elem).attr('fill', "#4242CD");

            if (v.outgoing.length > 0) {
                v.outgoing.forEach((outgoing, i) => {
                    d3.select("#line" + v.className + outgoing.className).attr('stroke', "red");
                    d3.select("#arrowhead-associate-" + i).attr('stroke', "green");
                })
            }

            if (v.incoming.length > 0) {
                v.incoming.forEach((incoming, i) => {
                    d3.select("#line" + incoming.className + v.className).attr("stroke", "green");
                    d3.select("#arrowhead-associate-" + i).attr('stroke', "green");
                })
            }
        },
        changeColorMouseOut: function (elm, v) {

            if (v.outgoing.length > 0) {
                v.outgoing.forEach((outgoing, i) => {
                    d3.select("#line" + v.className + outgoing.className).attr('stroke', "black");
                    d3.select("#arrowhead-associate-" + i).attr('stroke', "black");
                })
            }

            if (v.incoming.length > 0) {
                v.incoming.forEach((incoming, i) => {
                    d3.select("#line" + incoming.className + v.className).attr("stroke", "black");
                    d3.select("#arrowhead-associate-" + i).attr('stroke', "black");
                })
            }
        },
        dtfTimeoutId: 0,
        displayDetailMouseOver: function (elem, v) {
            let bounding = elem.getBoundingClientRect();
            // console.log(bounding);
            // console.log(d);
            if (!this.dtfTimeoutId) {
                this.dtfTimeoutId = window.setTimeout(function() {
                    let text = d3.select("body").selectAll(".hover_text").data([v]).enter().append(
                        "div").attr("class", "hover_text").attr("style" , "max-height:300px;max-width:500px;overflow:auto")
                        .on("mouseout" ,function (d) {
                            d3.select(".hover_text").remove();
                        });
                    // console.log(this.getBoundingClientRect());

                    // console.log(mouse);
                    text.style("left", bounding.left + "px").style("top",
                        bounding.top + bounding.height + "px");
                    text.append("span").html(DTFUtils.getVertexDetail(v));
                }, 500);
            }
        },
        displayDetailMouseOut: function () {
            window.clearTimeout(this.dtfTimeoutId);
            this.dtfTimeoutId = null;
            // var x = event.clientX, y = event.clientY,
            //     elementMouseIsOver = document.elementFromPoint(x, y);
            // //console.log("moveto"+elementMouseIsOver.className);
            // if(elementMouseIsOver.className == "hover_text" || elementMouseIsOver.className == "title"
            //     || elementMouseIsOver.className == "icon"){
            // }
            d3.selectAll(".hover_text").remove();
        },
    },
    Edge: {
        mouse_over_line: function (d) {
            d3.select(this).attr('stroke', "red")
            d3.select("#" + d.source.className).attr("fill", "red");
            d3.select("#" + d.destination.className).attr("fill", "red");
        },

        /* function : mouse_out_line
         * details: to handle event mouse out on the line in ERD
         * */
        mouse_out_line: function (d) {
            d3.select(this).attr("stroke", "black");
            d3.select("#" + d.source.className).attr("fill", "#000");
            d3.select("#" + d.destination.className).attr("fill", "#000");
        },
    }
}