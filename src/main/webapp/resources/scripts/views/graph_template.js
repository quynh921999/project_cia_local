class GraphTemplate {
    constructor(dataAsTree, view) {
        // init view
        this.view = view;
        this.view.style("font-size", FULLGRAPH_CONFIG.FONT_SIZE);
        this.view.selectAll("g").remove();

        // init root
        this.root = new Node(dataAsTree, this);
        this.root.setPosition(FULLGRAPH_CONFIG.ROOT_POSITION.x, FULLGRAPH_CONFIG.ROOT_POSITION.y);
    }

    updateNode(node) {
        let nodeView = this.view.select(".id" + node.data.id);
        nodeView.attr("x", node.x).attr("y", node.y).attr("width", node.width).attr("height", node.height);
        nodeView.select(".title").attr("x", node.x).attr("y", node.y);
        nodeView.select(".icon").attr("x", node.x + FULLGRAPH_CONFIG.ICON_POSITION.x).attr("y", node.y + FULLGRAPH_CONFIG.ICON_POSITION.y);
        nodeView.select(".title-text").attr("x", node.x + FULLGRAPH_CONFIG.TEXT_POSITION.x).attr("y", node.y + FULLGRAPH_CONFIG.TEXT_POSITION.y);
    }

    addChild(parent, child) {
        let childNode = new Node(child, this);
        childNode.parent = parent;
        parent.children.push(childNode);
    }

    newNode(node) {
        let parentView = (node.parent && this.getNodeView(node.parent)) || this.view;
        let nodeView = parentView.append("g").data([node]).call(NodeEvent.drag);
        nodeView.attr("class", "id" + node.data.id);
        nodeView.attr("x", node.x).attr("y", node.y);

        let title = nodeView.append("rect").attr("class", "title")
            .attr("x", node.x).attr("y", node.y)
            .attr("rx", FULLGRAPH_CONFIG.PADDING_NODE).attr("ry", FULLGRAPH_CONFIG.PADDING_NODE)
            .attr("width", node.width).attr("height", FULLGRAPH_CONFIG.TITLE_HEIGHT_NODE)
            .attr("fill", FULLGRAPH_CONFIG.TITLE_COLOR)
            .on("mouseover", NodeEvent.highlightDependences)
            .on('mouseout', NodeEvent.unhighlightDependences);

        let icon = nodeView.append("image").attr("class", "icon")
            .attr("x", node.x + FULLGRAPH_CONFIG.ICON_POSITION.x).attr("y", node.y + FULLGRAPH_CONFIG.ICON_POSITION.y)
            .attr("width", FULLGRAPH_CONFIG.ICON_SIZE).attr("height", FULLGRAPH_CONFIG.ICON_SIZE)
            .attr("xlink:href", this.getIconLink(node.data))
            .on("mouseover", NodeEvent.onMouseOverTitleText)
            .on('mouseout', NodeEvent.onMouseOutTitleText);

        let text = nodeView.append("text").attr("class", "title-text")
            .attr("x", node.x + FULLGRAPH_CONFIG.TEXT_POSITION.x).attr("y", node.y + FULLGRAPH_CONFIG.TEXT_POSITION.y)
            .attr("fill", "white").attr("font-size", CLASSDRAWER_CONFIG.NORMAL_FONT_SIZE)
            .text(Utils.convertNameToShorterForDependenceView(node.data))
            .on("mouseover", NodeEvent.onMouseOverTitleText)
            .on("mouseout", NodeEvent.onMouseOutTitleText);

        this.updateNode(node);
    }

    expandNode(node) {
        let childrenData = node.data.children;
        if (childrenData == null)
            return;

        node.children = [];

        this.createChildrenGraphNode(node, childrenData);

        this.view.select(".id" + node.data.id).attr("class", "id" + node.data.id);
        this.resizeNodeByChildren(node);
        this.collisionSolve(node);
    }

    createChildrenGraphNode(parent, children) {
        let numRow = Math.floor(Math.sqrt(children.length));

        children.forEach((child, i) => {
            let childNode = new Node(child, this);
            childNode.parent = parent;
            childNode.setPosition(parent.x + (i % numRow) * (FULLGRAPH_CONFIG.MIN_WIDTH_NODE + 40), parent.y + 50 + Math.floor(i / numRow) * 60);
            parent.children.push(childNode);
            this.newNode(childNode);
        });
    }

    collapseNode(node) {
        this.getNodeView(node).remove();
        node.collapse();
        this.newNode(node);
    }

    moveNode(node, dx, dy) {
        node.x += dx;
        node.y += dy;
        if (node.children) {
            node.children.forEach(d => {
                this.moveNode(d, dx, dy);
            });
        }

        this.updateNode(node);
    }

    collisionSolve(changedNode) {
        let changes = [changedNode];
        let parent = changedNode.parent;
        // Nếu là node gốc return
        if (!parent) return;
        if (this.getNodeView(parent).node() == null) return;
        let graph = this;
        let sibling = parent.children.slice(0, parent.children.length);
        while (changes.length > 0) {
            let change = changes.pop();
            sibling.splice(sibling.indexOf(change), 1);
            sibling.forEach(function (d, i) {
                let collision = Utils.checkCollision(change, d);
                if (collision[0] !== 0 && collision[1] !== 0) {
                    if (Math.abs(collision[0]) <= Math.abs(collision[1])) {
                        graph.moveNode(d, collision[0], 0);
                    } else {
                        graph.moveNode(d, 0, collision[1]);
                    }
                    changes.push(d);
                }
            });
            graph.updateNode(change);
        }
        this.resizeNodeByChildren(parent);
        this.collisionSolve(parent);
    }

    resizeNodeByChildren(parent) {
        if (!parent) return;
        if (!parent.children || parent.children.length === 0) return;
        if (this.getNodeView(parent).node() == null) return;

        let padding = 2 * FULLGRAPH_CONFIG.PADDING_NODE;
        let minTopLeft = {x: 999999, y: 999999};
        let maxBotRight = {x: -999999, y: -999999};

        parent.children.forEach(function (d, i) {
            if (d.x < minTopLeft.x) {
                minTopLeft.x = d.x;
            }
            if (d.x + d.width > maxBotRight.x) {
                maxBotRight.x = d.x + d.width;
            }
            if (d.y < minTopLeft.y) {
                minTopLeft.y = d.y;
            }
            if (d.y + d.height > maxBotRight.y) {
                maxBotRight.y = d.y + d.height;
            }
        });

        parent.x = minTopLeft.x - padding;
        parent.y = minTopLeft.y - padding - FULLGRAPH_CONFIG.TITLE_HEIGHT_NODE;
        parent.width = maxBotRight.x - minTopLeft.x + 2 * padding;
        parent.height = maxBotRight.y - minTopLeft.y + 2 * padding + FULLGRAPH_CONFIG.TITLE_HEIGHT_NODE;
        this.updateNode(parent);
        this.resizeNodeByChildren(parent.parent);
    }

    getNodeView(node) {
        return this.view.select(".id" + node.data.id)
    }

    getIconLink(data) {
        return "resources/images/" + data.kind + ".svg";
    }

    searchNode(id) {
        return this.recursiveSearch(id, this.root);
    }

    recursiveSearch(id, node) {
        if (node.data.id === id) {
            return node;
        }

        let childrenList = node.children;
        let res = null;
        if (Utils.isValidObject(childrenList)) {
            childrenList.forEach(node => {
                let temp = this.recursiveSearch(id, node);
                if (temp != null) res = temp;
            });
        }
        return res;
    }

    // onDoubleClickNode(node) {
    //     NodeEvent.onDoubleClickNode(node, LOAD_DATA.DEPENDENCY_VIEW);
    // }
}