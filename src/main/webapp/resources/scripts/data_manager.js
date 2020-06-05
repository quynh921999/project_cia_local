/**
 * Object quản lí và xử lí Dữ liệu Bao gồm: Thông tin của các node, các phụ
 * thuộc và changeSet Dữ liệu project Có 2 phiên bản dữ liệu: OriginData và Data +
 * Origin data dùng cho DependenceView và để đối chiếu khi thực hiện một thay
 * đổi + Data hiện dùng cho ProjectView
 *
 * Dữ liệu tồn tại ở 2 dạng Tree và List
 *
 * Sử dụng 2 loại map tối ưu cho việc tìm kiếm + ID_to_index_map: Từ id của đối
 * tượng -> index trong mảng + property_to_class_map: Từ id của thuộc tính
 * (attr, method) -> id class (như thuộc tính classID của node, dùng cho việc
 * lọc dependence
 */
var Data = {};
/**
 * Parse dữ liệu lấy từ server
 */
Data.parseData = function (source) {
    return new Promise((resolve, reject) => {
        Data.dataAsTree = source;

        let getAllDependencies = new Promise((resolve, reject) => {
            TREE_API.getAllDependencies().done((res) => {
                if(!res.error){
                    let data = res.data;
                    Data.dependences = data;
                    console.log(Data.dependences.length);
                    console.log(Data.dependences);
                    resolve("done");
                }
                else reject(data);
            });
        });
        getAllDependencies.then((res)=>{
            var parser = new Parser();
            Data.dataAsTree = parser.parseObject(Data.dataAsTree);

            Data.dataAsList = Tree.nodes(Data.dataAsTree, 0);
            Data.changeSet = [];
            Data.mapData(Data.dataAsList);

            initViews();
            Utils.expandByDepth(Data.dataAsTree, 0);
            //Utils.expandByDepth(Data.OriginDataAsTree, 0);
            ProjectView.update();
            // console.log(Data.dependences);
            //DependenceView = new DependenceViewClass(Data.dataAsTree, Data.dependences, CentralView.getTab(DEPENDENCE_VIEW_ID).view);
            DependenceView = new DependenceViewClass(Data.dataAsTree, Data.dependences, CentralView.getTab("dependence").view);
            var ips = $("#analyze-form_fis").text();
            if (ips) {
                ImpactSetView.load(ips);
            }
            resolve(res);
        });
    });
};

Data.processPartitionData = function (data) {
    var parser = new Parser();

    var parentNode = Data.getNodeById(data.id);
    parentNode.children = [];

    let part = parser.parseObject(data);

    let childrenList = [];
    part.children.forEach(node => {
        node.parent = parentNode;
        node.depth = parentNode.depth + 1;
        childrenList.push(node);

        Data.dataAsList.push(node);
        Data.ID_to_index_map.set(node.id, Data.ID_to_index_map.size++);
    });
    parentNode.children = parentNode.children.concat(childrenList);
    parentNode._children = null;
    return parentNode;
};

Data.mapData = function (dataList) {
    var ID_to_index_map = new Map();
    var property_to_class_map = new Map();
    dataList.forEach(function(d, i){
        if(d.parent) property_to_class_map.set(d.id, d.parent.id);
        ID_to_index_map.set(d.id, i);
    })
    Data.ID_to_index_map = ID_to_index_map;
    Data.property_to_class_map = property_to_class_map;
}



/*******************************************************************************
 * Xử lí dữ liệu
 *
 * @param {array}
 *          dataList data
 * @param {bool}
 *          isMapping có lưu vào map hay không
 */

// TODO: fix all of these


Data.processData = function (dataList, isMapping) {
    var ID_to_index_map = new Map();
    var property_to_class_map = new Map();
    dataList.forEach(function (node, i) {
        node.classIndex = i;
        node.id = parseInt(node.id);
        if(isMapping) ID_to_index_map.set(node.id, i);
        if (node.name == "")
            node.name = "No name";
        if (node.kind == "class") {
            if(isMapping) property_to_class_map.set(node.id, node.id);
            node.isStatic = Utils.parseBoolean(node.isStatic);
            node.isAbstract = Utils.parseBoolean(node.isAbstract);
            node.isFinal = Utils.parseBoolean(node.isFinal);
            node.isInterface = Utils.parseBoolean(node.isInterface);
            node.numAttributes = 0;
            node.classID = node.id;
            node.numMethods = 0;

            // initialize attribute and method list
            node.attributes = [];
            node.methods = [];

            Data.specifyChildren(node);
        }
    });

    // Data.getIncludedIDs(Data.OriginDataAsTree);
    if(isMapping){
        Data.ID_to_index_map = ID_to_index_map;
        Data.property_to_class_map = property_to_class_map;
    }
};

Data.specifyChildren = function(node) {
    node.children.forEach(function(d, index) {
        if (d.kind == "attribute") {
            node.numAttributes++;
            d.isFinal = Utils.parseBoolean(d.isFinal);
            d.isStatic = Utils.parseBoolean(d.isStatic);
            d.index = index;
            d.id = parseInt(d.id);
            d.classID = node.id;
            d.parent = node;
            var newIndex = dataList.push(d) - 1;
            if(isMapping){
                property_to_class_map.set(d.id, node.id);
                ID_to_index_map.set(d.id, newIndex);
            }
            node.attributes.push(d);
        } else if (d.kind == "method") {
            d.isFinal = Utils.parseBoolean(d.isFinal);
            d.isStatic = Utils.parseBoolean(d.isStatic);
            node.numMethods++;
            d.index = index;
            d.classID = node.id;
            d.id = parseInt(d.id);
            d.parent = node;
            if(!d.parameter) d.parameter = [];

            var newIndex = dataList.push(d) - 1;
            if(isMapping){
                property_to_class_map.set(d.id, node.id);
                ID_to_index_map.set(d.id, newIndex);
            }
            node.methods.push(d);
        }
    });

    node.children = node.attributes.concat(node.methods);
}


Data.getNodesFromTree = function () {
    return Tree.nodes(Data.dataAsTree, 0);
};
Data.getNodeById = function (id) {
    return Data.dataAsList[Data.ID_to_index_map.get(id)];
};
/*
Data.getOriginNodeById = function (id) {
    return Data.OriginDataAsList[Data.ID_to_index_map.get(id)];
};
*/
Data.getClassIDfromPropertyID = function (id) {
    return Data.property_to_class_map.get(id);
};
Data.getNodeByIndex = function (index) {
    return Data.dataAsList[index];
};
/*
Data.getOriginNodeByIndex = function (index) {
    return Data.OriginDataAsList[index];
};
*/
Data.addToChangeSet = function (obj) {
    Data.changeSet.push(obj);
};
Data.getIndexFromId = function (id) {
    return Data.ID_to_index_map.get(id);
};

/**
 * IncludedID: list bao gồm id của 1 node và tất cả id của các con cháu... của
 * nó
 */
// Data.getIncludedIDs = function (data) {
//     data.includeIDs = [data.id];
//     if (data.children)
//         data.children.forEach(function (child, i) {
//             data.includeIDs = data.includeIDs.concat(Data.getIncludedIDs(child));
//         });
//     return data.includeIDs;
// };

// Xử lí change set
/**
 * Loại bỏ một node ra khỏi changeSet
 *
 * @param {int}
 *          id id của node
 */
Data.removeChange = function (id) {
    var index = Data.changeSet.findIndex(function (d) {
        return d.id == id;
    });
    if(index>=0) Data.changeSet.splice(index, 1);
};
/**
 * Loại bỏ tất cả các thay đổi
 */
Data.clearAllChanges = function(){
    Data.changeSet = [];
};

/**
 * Set giá trị node trở về ban đầu
 */
// Data.resetToOrigin = function (id) {
//     var origin = Data.getOriginNodeById(id);
//     node = Data.getNodeById(id);
//     node.name = origin.name;
//     node.visibility = origin.visibility;
//     node.isStatic = origin.isStatic;
//     node.isFinal = origin.isFinal;
//     if(node.kind=="method"){
//         node.parameter = origin.parameter;
//         node.return = origin.return;
//     }else if(node.kind=="attribute"){
//         node.type = origin.type;
//     }
//     return node;
// };

/**
 * Xử lí dữ liệu để post lên server
 */
Data.processChangeSet = function(){
    if(Data.changeSet.length==0) return null;
    var data = Data.changeSet[0].id + "-" + Data.changeSet[0].changes.join("-");
    for(var i = 1;i<Data.changeSet.length;i++){
        data += "," + Data.changeSet[i].id + "-" + Data.changeSet[i].changes.join("-");
    }
    return data;
};
/**
 * Cập nhật dữ liệu (Hàm dùng trong property view bởi dữ liệu đang thay đổi ở đó
 * là bản clone)
 */
Data.updateData = function(newData){
    Data.dataAsList[Data.getIndexFromId(newData.id)] = newData;
    if(newData.kind!="class"){
        var father = Data.getNodeById(newData.classID);
        if(newData.kind=="method"){
            if(!father._methods){
                father.methods[newData.index] = newData;
            }else {
                father._methods[newData.index] = newData;
            }
        }else if(newData.kind=="attribute"){
            if(!father._attributes){
                father.attributes[newData.index] = newData;
            }else {
                father._attributes[newData.index] = newData;
            }
        }
    }
};

/**
 * Tìm kiếm toàn bộ Tree
 */
Data.searchFile = function(key) {
    return new Promise((resolve, reject) => {
        if (key == "")
            reject("keyword must not be empty");

        TREE_API.searchNodeByName(key).done(res => {
            if (!res.error) {
                res.data = Data.matchNode(res.data, key);
            }
            resolve(res);
        })
    });
};


    // var searchPattern = new RegExp(key.toLowerCase());
    // Utils.expandByDepth(Data.dataAsTree, 0);
    // Data.dataAsList.forEach(function(data){
    //     if(data.kind=="method"||data.kind=="attribute") return;
    //     if(data.name.toLowerCase().includes(key.toLowerCase())){
    //         data.isInSearchResultSet = true;
    //         Data.expandToNode(data);
    //     }else data.isInSearchResultSet = false;
    // })


Data.matchNode = function(data, key) {
    if (Utils.isValidObject(data)) {
        if (data.kind == "method" || data.kind == "attribute")
            return;

        if (data.kind != "folder" && data.name.toLowerCase().includes(key.toLowerCase())) {
            data.matched = true;
        }

        if (data.children)
            data.children.forEach(child => this.matchNode(child, key));
    }
    return data;
}
/**
 * Phục vụ cho việc hiển thị kết quả Mở rộng tất cả các node cha, ông,... của 1
 * node
 */
Data.expandToNode = function(data){
    var parent = data.parent;
    while(parent){
        Utils.expand(parent);
        parent = parent.parent;
    }
}

var Tree = {};
Tree.nodes = function (root, depth) {
    root.depth = depth;
    var nodes = [root];
    if (root.children) {
        root.children.forEach(function (child) {
            // console.log("child", child);
            // console.log(root);
            // console.log(root.children);
            child.parent = root;
            nodes = nodes.concat(Tree.nodes(child, depth + 1));
        });
    }
    return nodes;
};

