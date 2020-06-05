var Utils = {
    getDetailInfoAsHTML: function (d) {
        if (d === undefined)
            return "<b>" + "none"+ "</b>";

        if (d.kind === "class") {
            return "<b>" + d.name + "</b></br>"
                + " - " + d.visibility + ((d.isStatic === "true") ? " - static" : " ") + ((d.isFinal === "true") ? " - final" : " ") + ((d.isAbstract === "true") ? " - abstract" : " ") + "</br>"
                + " - " + d.numOfvariable + " attributes " + "</br>"
                + " - " + d.numOfmethod + " methods" + "<br/>"
                + " - weight: " + d.weight + "<br/>";
            /*  + " - " + d.numAttributes + " attributes " + "</br>"
            + " - " + d.numMethods + " methods" + "</br>";*/
        } else if (d.kind === "file") {
            if (d.hasOwnProperty('loc')) {
                if (d.children || d._children)
                    return "<b>" + d.name + "</b></br>"
                        + " - LOC: " + d.loc + "</br>"
                        + " - " + (d.children ? d.children.length : d.children.length) + " child" + Utils.generateTextDependency(d) + "<br/>"
                        + " - weight: " + d.weight + "<br/>";
                else
                    return "<b>" + d.name + "</b>" + Utils.generateTextDependency(d)
                    + " - LOC: " + d.loc + "<br/>"
                        + " - weight: " + d.weight + "<br/>";
            }
            else {
                if (d.children || d._children)
                    return "<b>" + d.name + "</b></br>"
                        + " - " + (d.children ? d.children.length : d.children.length) + " child" + Utils.generateTextDependency(d) + "<br/>"
                        + " - weight: " + d.weight + "<br/>";
                else return "<b>" + d.name + "</b>" + Utils.generateTextDependency(d) + "<br/>"
                    + " - weight: " + d.weight + "<br/>";
            }

        } else if (d.kind === "package") {
            return "<b>" + d.name + "</b></br>"
                + " - " + d.kind + "</br>"
                + " - " + (d.children ? d.children.length : d._children.length) + " files" + Utils.generateTextDependency(d) + "<br/>"
                + " - weight: " + d.weight + "<br/>";
        } else if (d.kind === "attribute") {
            return "<b>" + d.name + "</b></br>"
                + " - " + d.visibility + ((d.isStatic === "true") ? " - static" : " ") + ((d.isAbstract === "true") ? " - abstract" : " ") + ((d.isFinal === "true") ? " - final" : " ") + "</br>"
                + " - type: <b>" + d.type + "</b>" + "<br/>"
                + " - weight: " + d.weight + "<br/>";
        } else if (d.kind === "method") {
            return "<b>" + d.name + "()</b></br>"
                + " - " + d.visibility + ((d.isStatic === "true") ? " - static" : " ") + ((d.isAbstract === "true") ? " - abstract" : " ") + ((d.isFinal === "true") ? " - final" : " ") + "</br>"
                + " - return: <b>" + d.return + "</b></br>"
                + " - weight: " + d.weight + "<br/>";
                /*+ " - " + d.parameter.length + " parameters"*/;
        } else if (d.kind === "xmlElement") {
            return "<b>" + d.name + "</b></br>"
                + " - lineNumber: " + d.lineNumber + "</br>"
                + " - columnNumber: " + d.columnNumber + "</br>"
                + Utils.generateTextTagAttr(d) + "<br/>"
                + " - weight: " + d.weight + "<br/>";

        }
        else {
            return "<b>" + d.name + "</b></br>"
                + " - " + d.kind + Utils.generateTextDependency(d) + "<br/>"
                + " - weight: " + d.weight + "<br/>";
        }
    }
    ,
    expand: function (d) {
        /*
         * if(d.type==="file") var children =
         * (d.children)?d.children:d._children;
         */
        if (d.children) {
            d._children = d.children;
            //._children = null;
        }
        /*
         * if(children) children.forEach(Utils.expand);
         */
    }
    ,
    collapse: function (d) {
        if (d._children) {
            d._children = null;
            d.children.forEach(Utils.collapse);
        }
    }
    ,
    expandAll: function (d) {
        if (d.kind === "class")
            return;

        if (!Utils.isValidObject(d._children) || d._children.length === 0) {
            d._children = d.children;
        }

        d._children.forEach(child => Utils.expandAll(child));
    }
    ,
    collapseAll: function (data) {
        if (data._children === null)
            return;

        data._children.forEach(Utils.collapse);
        Utils.collapse(data);
    }
    ,
    expandByDepth: function (data, depth) {
        if (depth <= 0)
            Utils.collapse(data);
        else
            Utils.expand(data);
        if (data.children) {
            data.children.forEach(function (d) {
                Utils.expandByDepth(d, depth + 1);
            })
        }
    }
    ,
    isExpanded: function (d) {
        return !d._attributes;
    }
    ,
    getAllExpandingNodeWithDepth: function (root, depth) {
        root.depth = depth;
        var nodes = [root];
        if (root._children) {
            root._children.forEach(function (child) {
                child.parent = root;
                nodes = nodes.concat(Utils.getAllExpandingNodeWithDepth(child, depth + 1));
            });
        }
        return nodes;
    }
    ,
    findPath: function (link) {
        var src = link.source;
        var des = link.target;
        var bounding_src = {x: src.x, y: src.y, width: CLASSDRAWER_CONFIG.WIDTH, height: src.height};
        var bounding_des = {x: des.x, y: des.y, width: CLASSDRAWER_CONFIG.WIDTH, height: des.height};
        // return Utils.middlePointLink(bounding_src,bounding_des);
        return Path_Util.findLinkOfTwoRect(bounding_src, bounding_des);
    }
    ,
    findPathForView: function (link, padding) {
        var src = link.source;
        var des = link.destination;
        var bounding_src = {
            x: src.x + padding,
            y: src.y + padding,
            width: src.width - padding,
            height: src.height - padding
        };
        var bounding_des = {
            x: des.x + padding,
            y: des.y + padding,
            width: des.width - padding,
            height: des.height - padding
        };
        // return Utils.middlePointLink(bounding_src,bounding_des);
        return Path_Util.findLinkOfTwoRect(bounding_src, bounding_des);
    },

    middlePointLink: function (rect1, rect2) {
        verRelation = Utils.getVerticalRelation(rect1, rect2);
        horRelation = Utils.getHorizontalRelation(rect1, rect2);
        if (verRelation === 0) {
            if (horRelation === 0)
                return {
                    begin: {x: rect1.x + rect1.width / 2, y: rect1.y + rect1.height / 2},
                    end: {x: rect2.x + rect2.width / 2, y: rect2.y + rect2.height / 2}
                };
            if (horRelation === 1)
                return {
                    begin: {x: rect1.x, y: rect1.y + rect1.height / 2},
                    end: {x: rect2.x + rect2.width, y: rect2.y + rect2.height / 2}
                };
            return {
                begin: {x: rect1.x + rect1.width, y: rect1.y + rect1.height / 2},
                end: {x: rect2.x, y: rect2.y + rect2.height / 2}
            };
        }
        if (verRelation === 1) {
            if (horRelation === 0)
                return {
                    begin: {x: rect1.x + rect1.width / 2, y: rect1.y},
                    end: {x: rect2.x + rect2.width / 2, y: rect2.y + rect2.height}
                };
            if (horRelation === 1)
                return {
                    begin: {x: rect1.x, y: rect1.y},
                    end: {x: rect2.x + rect2.width, y: rect2.y + rect2.height}
                };
            return {begin: {x: rect1.x + rect1.width, y: rect1.y}, end: {x: rect2.x, y: rect2.y + rect2.height}};
        }
        if (verRelation === -1) {
            if (horRelation === 0)
                return {
                    begin: {x: rect1.x + rect1.width / 2, y: rect1.y + rect1.height},
                    end: {x: rect2.x + rect2.width / 2, y: rect2.y}
                };
            if (horRelation === -1)
                return {
                    begin: {x: rect1.x + rect1.width, y: rect1.y + rect1.height},
                    end: {x: rect2.x, y: rect2.y}
                };
            return {begin: {x: rect1.x, y: rect1.y + rect1.height}, end: {x: rect2.x + rect2.width, y: rect2.y}};
        }
    }
    ,
    getHorizontalRelation: function (rect1, rect2) {
        if ((rect1.x + rect1.width) < rect2.x)
            return -1;
        else if ((rect2.x + rect2.width) < rect1.x)
            return 1;
        else
            return 0;
    }
    ,
    getVerticalRelation: function (rect1, rect2) {
        if ((rect1.y + rect1.height) < rect2.y)
            return -1;
        else if ((rect2.y + rect2.height) < rect1.y)
            return 1;
        else
            return 0;
    }
    ,
    // return collision corresponding obj1 position
    checkCollision: function (obj1, obj2) {
        var deltaX = 0, deltaY = 0;
        BotRight1 = {x: obj1.x + obj1.width, y: obj1.y + obj1.height};
        BotRight2 = {x: obj2.x + obj2.width, y: obj2.y + obj2.height};
        if (obj1.x <= obj2.x) {
            if (BotRight1.x <= obj2.x)
                return [0, 0];
            else {
                deltaX = BotRight1.x - obj2.x;
            }
        } else {
            if (BotRight2.x <= obj1.x)
                return [0, 0];

            else {
                deltaX = -Math.max(BotRight2.x - obj1.x, 0);
            }
        }
        if (obj1.y <= obj2.y) {
            if (BotRight1.y <= obj2.y)
                return [0, 0];
            else {
                deltaY = BotRight1.y - obj2.y;
            }
        } else {
            if (BotRight2.y <= obj1.y)
                return [0, 0];
            else {
                deltaY = -(BotRight2.y - obj1.y);
            }
        };
        return [deltaX, deltaY];
    }
    ,
    manhattanDistance: function (p1, p2) {
        return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
    }
    ,
    getRandomColor: function () {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[15 - Math.floor(Math.random() * 3)];
        }
        return color;
    }
    ,
    parseBoolean: function (value) {
        return value === "true";
    }
    ,
    cloneObject: function (object) {
        var temp = jQuery.extend(true, {}, object);
        return jQuery.extend(true, {}, object);
    }
    ,
    findContainerBoxContain2Rect: function (rect1, rect2) {
        var result = {};
        result.x = (rect1.left < rect2.left) ? rect1.left : rect2.left;
        result.y = (rect1.top < rect2.top) ? rect1.top : rect2.top;
        result.right = ((rect1.left + rect1.width) > (rect2.left + rect2.width)) ? (rect1.left + rect1.width) : (rect2.left + rect2.width);
        result.bot = ((rect1.top + rect1.height) > (rect2.top + rect2.height)) ? (rect1.top + rect1.height) : (rect2.top + rect2.height);
        result.width = result.right - result.x;
        result.height = result.bot - result.y;
        return result;
    }
    ,
    getDisplayName: function (d) {
        if (d.kind === "attribute")
            return " - " + Data.getNodeById(d.classID).name + "." + d.name;
        else if (d.kind === "method")
            return " - " + Data.getNodeById(d.classID).name + "." + d.name + "()";
        else
            return " - " + d.name;
    }
    ,
    convertNameToShorterForDependenceView: function (d) {
        if (d.kind === "package") {
            var parts = d.name.split(".").reverse();
            if (parts.length > 2) return "..." + parts.splice(0, 2).reverse().join(".");
            return d.name;
        } else {
            var name;
            if (d.kind === "method") name = d.name + "()";
            else name = d.name;
            if (name.length > FULLGRAPH_CONFIG.MAX_NAME_LENGTH) return name.substring(0, FULLGRAPH_CONFIG.MAX_NAME_LENGTH - 3) + "...";
            else return name;
        }
    }
    ,
    findDependency: function (id) {
        var result;
        Data.dependences.forEach(function (dependency) {
            if (dependency.id === id) {
                result = dependency;
                return;
            }
        })
        return result;
    }
    ,
    generateTextTagAttr: function (d) {

        var a = "&nbsp";
        var b = d.listAttr.toString();
        if (b.length > 0)
        {
            var arrAttr = b.split(",");
            if (arrAttr.length > 0) {
                a += "<b>" + "Attributes (" + arrAttr.length + ")" + "</b></br>";
                arrAttr.forEach(function (oneCall) {
                    a += "&nbsp -"+ oneCall + "<br>";
                });
            }
        }
        else{
            a += "<b>" + "Attributes ("+b.length+")"+ "</b></br>";
        }
        return a;
    },
    generateTextDependency: function (d) {
        var call = [];
        var called = [];
        DependenceView.linkData.forEach(function (oneLink) {
            if (oneLink.source.data.id === d.id) {
                var temp = {};
                temp.name = oneLink.destination.data.name;
                temp.typeDependency = oneLink.typeDependency;
                call.push(temp);
            }
            if (oneLink.destination.data.id === d.id) {
                var temp = {};
                temp.name = oneLink.source.data.name;
                temp.typeDependency = oneLink.typeDependency;
                called.push(temp);
            }
        });
        var a = "";
        if (call.length > 0) {
            a = "</br><b>" + "Calls (" + call.length + ")" + "</b></br>";
            call.forEach(function (oneCall,i) {
                if (i < call.length - 1)  a += "&nbsp -" + oneCall.name + " : " + oneCall.typeDependency + "<br>";
                else a += "&nbsp -" + oneCall.name + " : " + oneCall.typeDependency;
            });
        }
        if (called.length > 0) {
            a += "</br><b>" + "Called by (" + called.length + ")" + "</b></br>";
            called.forEach(function (oneCall) {
                a += "&nbsp -" + oneCall.name + " : " + oneCall.typeDependency + "<br>";
            });

        }
        return a;
    }
    ,
    onPartitionDataResponse: function (callback) {
        let data = $("#load-data-form_ld-data").text();

        if (data !== "") {
            callback(data);
        }

        setTimeout(this.onPartitionDataResponse(callback), 100);
    }
    ,

    loadChildrenData: function (node, type) {
        return new Promise((resolve, reject) => {
            let currentNode = Data.getNodeById(node.id);
            if (!Utils.isValidObject(currentNode) || currentNode.hasChildren === false)
                resolve(null);

            env.load_data_type = type;
            TREE_API.loadData(node.id).done(res => resolve(res));
        });
    }
    ,

    isValidObject(object) {
        return object !== null && object !== undefined;
    }
    ,

    isEmptyArray(object) {
        return this.isValidObject(object) && object.length === 0;
    },

    getMaxValueInArray(array) {
        var max = array[0];
        for (var i = 1; i < array.length; i++) {
            if (array[i] > max)
                max = array[i];
        }
        return max;
    },

    getPositionOfMaxValueInArray(array) {
        var max = 0;
        for (var i = 1; i < array.length; i++) {
            if (array[i] > array[max])
                max = i;
        }
        return max;
    }
}

var Notifier = {
    displayProcessingTask(message) {
        Notifier.removeNotification();
        $html = '<div id="wait_msg" class="alert alert-info" style="z-index: 1000; position:fixed;bottom:10px;right:10px;"><a href="#" class="close" data-dismiss="alert" aria-label="close"></a><i class="fa fa-refresh fa-spin"></i>&nbsp;<strong>' + message + '</strong></div>';
        $('body').append($html);
    },

    displayError(message) {
        Notifier.removeNotification();
        $html = '<div id="error_msg" class="alert alert-danger animated fadeInDown " style="z-index: 1000; position:fixed;bottom:10px;right:10px;"><a href="#" class="close" data-dismiss="alert" aria-label="close"></a><i class="fa fa-exclamation-triangle"></i>&nbsp;<strong>' + message + '</strong></div>';
        $('body').append($html);

        setTimeout(() => {
            $("#error_msg").remove();
        }, 3000);
    },

    removeNotification() {
       $("#wait_msg").remove();
    }
};

var Prompter = {
    prompt(message, defaultValue) {
        return prompt(message, defaultValue);
    }
};