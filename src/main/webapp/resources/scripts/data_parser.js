class Parser {
    constructor() {
    }

    parseObject(object, parent) {
        object.expand = false;
        if (object.kind == "project") return this.parseProject(object, parent);
        else if (object.kind == "class") return this.parseClass(object, parent);
        else if (object.kind == "folder") return this.parseFolder(object, parent);
        else if (object.kind == "package") return this.parsePackage(object, parent);
        else if (object.kind == "method") return this.parseMethod(object, parent);
        else if (object.kind == "file") return this.parseFile(object, parent);
        else if (object.kind == "attribute") return this.parseAttribute(object, parent);
        else if (object.kind == "jar") return this.parseJar(object, parent);
        else {
            return object;
        }
    }

    parseProject (originProject){
        let parsedProject = Utils.cloneObject(originProject);
        parsedProject.children = originProject.children.map(child => this.parseObject(child, originProject));
        return parsedProject;
    }

    parseJar(originPackage, parent) {
        if (originPackage.children.length == 1 && originPackage.children[0].kind == "jar") {
            let parsePackage = this.parseJar(originPackage.children[0], originPackage);
            parsePackage.name = originPackage.name + "." + parsePackage.name;
            return parsePackage;
        }
        let parsePackage = Utils.cloneObject(originPackage);
        parsePackage.children = originPackage.children.map(child => this.parseObject(child, originPackage));
        return parsePackage;
    }

    parseFile(originFile, parent) {
        let parsedFile = Utils.cloneObject(originFile);
        parsedFile.children = originFile.children.map(child => this.parseObject(child, originFile));
        return parsedFile;
    }

    parseFolder(originFolder, parent){
        if(originFolder.children.length==1 && originFolder.children[0].kind=="folder"){
            let parsedFolder = this.parseFolder(originFolder.children[0],originFolder);
            parsedFolder.name = originFolder.name + "/" +parsedFolder.name;
            return parsedFolder;
        }
        let parsedFolder = Utils.cloneObject(originFolder);
        parsedFolder.children = originFolder.children.map(child => this.parseObject(child, originFolder));
        return parsedFolder;
    }

    parsePackage(originPackage, parent) {
        if (originPackage.children.length == 1 && originPackage.children[0].kind == "package") {
            let parsedPackage = this.parsePackage(originPackage.children[0], originPackage);
            parsedPackage.name = originPackage.name + "." + parsedPackage.name;
            return parsedPackage;
        }
        let parsedPackage = Utils.cloneObject(originPackage);
        parsedPackage.children = originPackage.children.map(child => this.parseObject(child, originPackage));
        return parsedPackage;
    }
    parseClass(originClass, parent){
        let parsedClass = Utils.cloneObject(originClass);
        parsedClass.classID = originClass.id;
        parsedClass.children = originClass.children.map(child => this.parseObject(child, originClass));
        parsedClass.attributes = parsedClass.children.filter(child => child.kind=="attribute");
        parsedClass.methods = parsedClass.children.filter(child => child.kind=="method");
        return parsedClass;
    }
    parseAttribute(originAttribute, parent){
        originAttribute.classID = parent.id;
        return originAttribute;
    }
    parseMethod(originMethod, parent){
        originMethod.classID = parent.id;
        return originMethod;
    }
}

