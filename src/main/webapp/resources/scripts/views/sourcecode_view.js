'use strict';

class SourceCodeViewClass {
    static draw(node) {
        Notifier.displayProcessingTask("Getting data...");
        if (!node || !node.data || !node.data.id) {
            Notifier.displayError("This node has no data!");
            return;
        }

        TREE_API.getSourceCode2(node.data.id).done(res => {
            Notifier.removeNotification();
            if (res.error) {
                Notifier.displayError(res.message);
                return;
            }

            let editor = ace.edit("code-editor");

            // common setting
            editor.setReadOnly(true);
            editor.session.setFoldStyle('manual');
            editor.setTheme("ace/theme/eclipse");
            document.getElementById("code-editor").setAttribute("style", "height: " +
                (innerHeight + 2 - 1.75*VIEW_CONFIG.HEADER_FULLHEIGHT - VIEW_CONFIG.NAVIGATION +"px !important"));
            document.getElementById("cv-layer-2").setAttribute("style", "margin-left: 2px !important");

            let fileName = res.data.file_name;
            if ((/\.(java)$/i).test(fileName)) {
                editor.session.setMode("ace/mode/java");

            } else if ((/\.(xml|jsp|html)$/i).test(fileName)) {
                editor.session.setMode("ace/mode/xml");
            }

            // set value
            editor.setValue(res.data.source_code);

            // add markers
            let Range = ace.require('ace/range').Range;
            editor.session.selection.clearSelection();

            let nodeStartPos = node.data.start_position;
            let nodeEndPos = node.data.end_position;
            if (nodeStartPos && nodeEndPos) {
                // selection mode
                editor.session.selection.addRange(new Range(nodeStartPos.line_number - 1, nodeStartPos.column_number,
                        nodeEndPos.line_number - 1, nodeEndPos.column_number));
            }

            // highlight mode
            // editor.getSession().addMarker(new Range(2, 0, 17, 1), "code-highlight", "background", false);

            // DISPLAY SOURCE CODE LAYER
            tabFullList.forEach(function (tab) {
                if (tab.id === SOURCE_CODE_VIEW_ID){
                    CentralView.event.addTab(tab);
                }
            });
            CentralView.switchTab(SOURCE_CODE_VIEW_ID);
        }).fail(function( jqXHR, textStatus, errorThrown ) {
            alert("Failed to get source code!");
        });
    }
}