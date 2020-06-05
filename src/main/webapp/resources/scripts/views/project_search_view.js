class ProjectSearchViewClass extends TreeViewClass {
    constructor(data) {
        super(data, "Search", ".project-search-view", true);
        this.addSearchBox();
    }

    createResponseMessage(mes) {
        this.view.append("p").attr("class","message").html(mes);
    }

    removeTreeViewer() {
        this.view.selectAll("svg").remove();
    }

    addValueToSearchInput(lastSearchValue) {
        this.searchForm.selectAll("input").attr("value", lastSearchValue);
    }
}