var TREE_API = {
    analyze: function (data) {
        return $.ajax({
            type: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            url: "api/analyze/",
            data: JSON.stringify(data),
            dataType: 'json'
        });
    },
    loadData: function (nodeId) {
        return $.get({
            dataType: "json",
            url: "api/tree/load/" + nodeId
        });
    },
    getIncludeIds: function (nodeId) {
        return $.get({
            dataType: "json",
            url: "api/tree/getIncludeIds/" + nodeId
        });
    },
    getAllIncludeIds: function () {
        return $.get({
            dataType: "json",
            url: "api/tree/getAllIncludeIds"
        });
    },
    searchNodeByName: function (name) {
        return $.get({
            dataType: "json",
            url: "api/tree/searchNodeByName?keyword=" + name
        })
    },
    getAllDependencies: function () {
        return $.get({
            dataType: "json",
            url: "api/tree/getAllDependencies"
        })
    },
    getRootNodeData: function () {
        return $.get({
            dataType: "json",
            url: "api/tree/getRootNodeData"
        })
    },
    getAllNodes: function(){
        return $.get({
            dataType: "json",
            url: "api/tree/getAllNodes"
        })
    },
    getNodeData: function (nodeId) {
        return $.get({
            dataType: "json",
            url: "api/tree/getNodeData/" + nodeId
        });
    },
    analyzeDataFlow: function (nodeId, mode) {
        return $.get({
            dataType: "json",
            url: "api/tree/getDataFlow?id=" + nodeId + "&mode=" + mode
        });
    },

    getAllLoc: function () {
        return $.get({
            dataType: "json",
            url: "api/tree/getAllLoc"
        });
    },
    getAllCyclomaticComplexity: function () {
        return $.get({
            dataType: "json",
            url: "api/tree/getAllCyclomaticComplexity"
        });
    },
    getSourceCode: function (fileNodeId) {
        let req_body = {
            file_node_id: fileNodeId,
            change_set: null,
            impact_set: null
        };
        return $.ajax({
            type: "POST",
            url: 'api/tree/getSourceCode',
            data: JSON.stringify(req_body),
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Accept", "application/json; charset=utf-8");
                xhr.setRequestHeader("Content-Type", "application/json");
            }
        });
    },
    getSourceCode2: function(nodeId) {
        return $.get({
            dataType: "json",
            url: "api/tree/getSourceCode2/" + nodeId
        });
    },


    calculateImpact: function(nodeIds) {
        let req_body = {
            changeSet: nodeIds
        };
        return $.ajax({
            type: "POST",
            url: 'api/tree/calculateImpact',
            contentType: 'application/json',
            data: JSON.stringify(req_body)
        });
    },

    // calculateImpact2: function(nodeIds) {
    //     let req_body = {
    //         changeSet: nodeIds
    //     };
    //     return $.ajax({
    //         type: "POST",
    //         url: 'api/tree/calculateImpact2',
    //         contentType: 'application/json',
    //         data: JSON.stringify(req_body)
    //     });
    // }
};

var ANALYZED_TREE_API = {
    getIncludeIds: function (nodeId) {
        return $.get({
            dataType: "json",
            url: "api/analyzed-tree/getIncludeIds/" + nodeId
        });
    },
    getAllIncludeIds: function () {
        return $.get({
            dataType: "json",
            url: "api/analyzed-tree/getAllIncludeIds"
        });
    },
    getAllDependencies: function () {
        return $.get({
            dataType: "json",
            url: "api/analyzed-tree/getAllDependencies"
        })
    },
    getRootNodeData: function () {
        return $.get({
            dataType: "json",
            url: "api/analyzed-tree/getRootNodeData"
        })
    },
    getNodeData: function (nodeId) {
        return $.get({
            dataType: "json",
            url: "api/analyzed-tree/getNodeData/" + nodeId
        });
    }
};

var PACKAGE_DIAGRAM_API = {
    getRootNodeData: function () {
        return $.get({
            dataType: "json",
            url: "api/package-diagram/getRootNodeData"
        })
    },
    getNodeData: function (nodeId) {
        return $.get({
            dataType: "json",
            url: "api/package-diagram/getNodeData/" + nodeId
        });
    },
    getAllDependencies: function () {
        return $.get({
            dataType: "json",
            url: "api/package-diagram/getAllDependencies"
        })
    },
    getIncludeIds: function (nodeId) {
        return $.get({
            dataType: "json",
            url: "api/package-diagram/getIncludeIds/" + nodeId
        });
    }
};

var EXTENSION_API = {
    analyzeUploadData: function (data) {
        console.log(data);
        var formData = new FormData();
        formData.append("file", data);

        return $.ajax({
            dataType: "json",
            url: "api/ext/uploadcs",
            data: formData,
            type: "POST",
            enctype: 'multipart/form-data',
            contentType: false,
            processData: false
        });

    },
    exportImpactSet: function (wrapper) {
        return $.ajax({
            type: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            url: "api/ext/export",
            data: JSON.stringify(wrapper),
            dataType: 'json',
            success: function (res) {
                EXTENSION_API.makeDownload();
            }
        });
    },

    exportVersionImpactSet: function (wrapper) {
        return $.ajax({
            type: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            url: "api/ext/exportversionimpact",
            data: JSON.stringify(wrapper),
            dataType: 'json',
            success: function (res) {
                EXTENSION_API.makeDownloadVersionImpact();
            }
        });
    },


    makeDownload: function () {
        console.log("download");
        $("<form action='api/ext/download' method='POST'/>").appendTo($("body")).submit();
    },
    makeDownloadVersionImpact: function () {
        console.log("download");
        $("<form action='api/ext/downloadversionimpact' method='POST'/>").appendTo($("body")).submit();
    }
}

var ERD_DATABASE_API = {
    getRootNodeData: function () {
        return $.get({
            dataType: "json",
            url: "api/package-diagram/getRootNodeData"
        })
    },
    getJsonErd: function () {
        return $.get({
            dataType: "json",
            url: "api/database/erd/getjson"
        })
    }
};