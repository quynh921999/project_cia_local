$(document).ready(function () {
    $("#javax_faces_developmentstage_messages").hide();

    if ($("#error-mes").text().trim().length != 0)
        $("#error-mes").show();

    $(document).on("submit", "#analyze-form", function() {
        if ($("#analyze-form_analyze-input-file").val() == "") {
            $("#error-mes").show();
            $("#error-mes").text("Please choose a file to upload!");
            return false;
        }
    });

    updateAnalyzeAllCb();

    $("#analyze-all").on("change", function () {
        if ($(this).is(':checked')) {
            $(".table-style").find("input:checkbox").each(function () {
                $(this).prop('checked', true);
            });
        } else {
            $(".table-style").find("input:checkbox").each(function () {
                $(this).prop('checked', false);
            });
        }
    });

    $(".table-style").find("input:checkbox").on("change", function () {
        updateAnalyzeAllCb();
    });
});

function updateAnalyzeAllCb() {
    $("#analyze-all").prop('checked', true);

    $(".table-style").find("input:checkbox").each(function () {
        if (!$(this).is(':checked')) {
            $("#analyze-all").prop('checked', false);
            return;
        }
    });
}
