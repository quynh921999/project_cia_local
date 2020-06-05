var DIV_DATA = {
    width : "100%",
    height : "100%",
    top : "0",
    left : "0",
    orientation : "horizontal",
    children : [ {
        name : "left-view",
        width : "15%",  // todo: 15%
        height : "100%",
        top : VIEW_CONFIG.NAVIGATION + "px",
        left : "0%",
        orientation : "vertical",
        children : [{
            name : "project-view",
            width : "100%",
            height : "100%", //50
            top : "0",
            left : "0%"
        }]
    }, {
        name : "class-view",
        width : "100%",  // todo: 85%
        height : "100%",
        top : VIEW_CONFIG.NAVIGATION + "px",
        left : "15%" // todo: 15%
    }, {
        name : "right-view",
        width : "0%",   // todo: 15%
        height : "100%",
        top : VIEW_CONFIG.NAVIGATION + "px",
        left : "85%",
        orientation : "vertical",
        children : [ {
            name : "change-set",
            width : "100%",
            height : "50%",
            top : "0",
            left : "0"
        }, {
            name : "impact-set",
            width : "100%",
            height : "50%",
            top : "50%",
            left : "0"
        } ]
    } ]
};

var SEARCHED_LEFT_VIEW_DATA = {
    name : "left-view",
    width : "15%",
    height : "100%",
    top : "0%",
    left : "0%",
    orientation : "vertical",
    children : [ {
        name : "project-search-view",
        width : "100%",
        height : "50%", //50
        top : "0",
        left : "0"
    }, {
        name: "project-view",
        width: "100%",
        height: "50%", //50
        top: "50%", //50
        left: "0%"
    }]
};

var NON_SEARCHED_LEFT_VIEW_DATA = {
    name : "left-view",
    width : "15%",
    height : "100%",
    top : "0",
    left : "0%",
    orientation : "vertical",
    children : [{
        name: "project-view",
        width: "100%",
        height : "100%", //50
        top : "0%", //50
        left: "0%"
    }]
};