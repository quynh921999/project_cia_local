var View = {
    newView : function(title_name, div_name, closable) {
        d3.select("body").select(div_name).selectAll("div").remove();
        var div = d3.select("body").select(div_name);
        var bounding = div.node().getBoundingClientRect();
        var titleView = View.addTitle(div, title_name, closable);

        var mainView = div.append("div").attr("class", "main-view").style("width",
            "100%").style("height",
            bounding.height - VIEW_CONFIG.HEADER_HEIGHT + "px");
        return mainView;
    },
    addTitle : function(div, title_name, closable) {
        var div_rect = div.node().getBoundingClientRect();

        var title = div.append("div").classed("div_title", true).append("svg")
            .classed("title", true).attr("width", "100%").attr("height",
                VIEW_CONFIG.HEADER_FULLHEIGHT);

    title.append("rect").attr("width", "100%").attr("height",
        VIEW_CONFIG.HEADER_HEIGHT).attr("fill", VIEW_CONFIG.TITLE_COLOR);

    title.append("rect").attr("y", VIEW_CONFIG.HEADER_HEIGHT).attr("width", "100%").attr("height",
        VIEW_CONFIG.HEADER_FULLHEIGHT - VIEW_CONFIG.HEADER_HEIGHT).attr("fill", CHANGESETVIEW_CONFIG.BACKGROUND_COLOR);

    if (!closable)
        title.append("circle")
            .attr('cx', VIEW_CONFIG.HEADER_HEIGHT / 2)
            .attr('cy', VIEW_CONFIG.HEADER_HEIGHT / 2)
            .attr('r', VIEW_CONFIG.HEADER_HEIGHT / 6)
            .attr('fill', "white");
    else {
        title.append("path")
            .attr('d', d3.svg.symbol().type('cross'))
            .attr("transform",
                "translate(" + VIEW_CONFIG.HEADER_HEIGHT/2 + "," + VIEW_CONFIG.HEADER_HEIGHT/2 + ")rotate(-45)")
            .attr('fill', "white")
            .on("click", (a) => {
                DivManager.regenerateLeftView(null, null, NON_SEARCHED_LEFT_VIEW_DATA);
            })
    }

    title.append("text").attr("x", VIEW_CONFIG.HEADER_HEIGHT).attr("y", 18)
        .attr("fill", "white").attr("font-size", CLASSVIEW_CONFIG.HEADER_FONT_SIZE)
        .attr("id","nameproject")
        .text(title_name);

    return title;
  },
  draw_background : function(view, color) {
    return view.append('rect').attr("width", view.attr("width")).attr("height",
        view.attr("height")).attr("fill", color);
  },
  createAction : function(divName, buttonList) {
    View.createTitleButtons(divName, buttonList);
  },
  createTitleButtons : function(divName, buttonList) {
      var svg = d3.select("." + divName).select(".title");
      svg.selectAll("image").remove();
      var svgBounding = svg.node().getBoundingClientRect();
      buttonList.forEach(function (button, i) {
          svg.append("image").data([{
              name: button.title
          }]).attr("x",
              svgBounding.width - 1.25 * (i + 1) * VIEW_CONFIG.ICON_SIZE - 5).attr(
              "y", (VIEW_CONFIG.HEADER_HEIGHT - VIEW_CONFIG.ICON_SIZE) / 2).attr(
              "width", VIEW_CONFIG.ICON_SIZE).attr("height", VIEW_CONFIG.ICON_SIZE)
              .attr("xlink:href", function () {
                  return "resources/images/" + button.icon;
              }).attr("id", button.id)
              .on("mouseover", Event.showNameWhenMouseOverOnRight).on("mouseout",
              Event.clearWhenMouseOut).on("click", button.action);
      });
      if (divName == "change-set") {
          // create analyze box
          var form = svg.append("foreignObject")
              .attr("x", svgBounding.width - (ChangeSetView.buttons.length + 1) * VIEW_CONFIG.ICON_SIZE - CHANGESETVIEW_CONFIG.LEVEL_BOX_WIDTH - 5)
              .attr("y", 0)
              .attr("width", CHANGESETVIEW_CONFIG.LEVEL_BOX_WIDTH * 2)
              .attr("height", CHANGESETVIEW_CONFIG.LEVEL_BOX_HEIGHT);
          form.append("xhtml:input")
              .attr("type", "number")
              .attr("id", "analyze-level")
              .attr("class", "")
              .attr("style", "width:" + CHANGESETVIEW_CONFIG.LEVEL_BOX_WIDTH + "px; height:" + CHANGESETVIEW_CONFIG.LEVEL_BOX_HEIGHT + "px")
              .attr("value", "1")
              .attr("min", 0);
      }
  },

    resize : function (divName, buttons) {
        var svg = d3.select("." + divName).select(".title");
        svg.selectAll("image").remove();
        var svgBounding = svg.node().getBoundingClientRect();
        buttons.forEach(function (button, i) {
            svg.append("image").data([{
                name: button.title
            }]).attr("x",
                svgBounding.width - 1.25 * (i + 1) * VIEW_CONFIG.ICON_SIZE - 5).attr(
                "y", (VIEW_CONFIG.HEADER_HEIGHT - VIEW_CONFIG.ICON_SIZE) / 2).attr(
                "width", VIEW_CONFIG.ICON_SIZE).attr("height", VIEW_CONFIG.ICON_SIZE)
                .attr("xlink:href", function (d) {
                    return "resources/images/" + button.icon;
                }).attr("id", button.id)
                .on("mouseover", Event.showNameWhenMouseOverOnRight).on("mouseout",
                Event.clearWhenMouseOut).on("click", button.action);
        });

        svg.selectAll("foreignObject").remove();

        if (divName == "change-set") {
            var form = svg.append("foreignObject")
                .attr("x", svgBounding.width - (ChangeSetView.buttons.length + 1) * VIEW_CONFIG.ICON_SIZE - CHANGESETVIEW_CONFIG.LEVEL_BOX_WIDTH - 5)
                .attr("y", 0)
                .attr("width", CHANGESETVIEW_CONFIG.LEVEL_BOX_WIDTH * 2)
                .attr("height", CHANGESETVIEW_CONFIG.LEVEL_BOX_HEIGHT);
            form.append("xhtml:input")
                .attr("type", "number")
                .attr("id", "analyze-level")
                .attr("class", "")
                .attr("style", "width:" + CHANGESETVIEW_CONFIG.LEVEL_BOX_WIDTH + "px; height:" + CHANGESETVIEW_CONFIG.LEVEL_BOX_HEIGHT + "px")
                .attr("value", "1")
                .attr("min", 0);
        }
    }
};
