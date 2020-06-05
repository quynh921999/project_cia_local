$(document).ready(function () {
    $('.right-box').addClass('appear');
    $('.button')
        .css('background-color', 'rgb(55, 71, 79)')
        .css('color', 'white')
        .click(function () {
            $('.right-box').toggle('abc')
                .toggleClass('appear');
            let isOpen1 = $('.appear');
            if (isOpen1.length === 1) {
                $('.button')
                    .css('background-color', 'rgb(55, 71, 79)')
                    .css('color', 'white');
            } else {
                $('.button')
                    .css('background-color', 'white')
                    .css('color', 'black');
            }
        });

    loadData();

    $('.class').parent().addClass('yellow-before');
    $('.attribute').parent().addClass('green-before');
});

/**
 * Load data to  List and export to csv file
 */
function loadData() {
    let rows = [['Type', 'Name', 'Weight']];

    $('.class-wrapper').hover();
    $('.right-box').empty();
    $.ajax({
        url: 'api/tree/getChangedNodes',
        method: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        async: false,
        success: function (res) {
            let rightBox = $('.right-box');
            $.each(res.data, function (index, item) {
                rows.push([item.kind, item.name, item.weight]);
                rightBox.append('<div class="class-wrapper" data-weight="' + item.weight + '">'
                    + '<div class="icon ' + item.kind + '"></div>'
                    + '<div class="text-content">' + item.weight.toFixed(2) + ': ' + item.name + '</div>'
                    + '</div>');
            });
        }
    });

    let pp = $('.download');
    let downloadURI = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.map(e => e.join(',')).join('\n'));
    pp.attr('href', downloadURI);
    pp.text('download');
    pp.attr('download', 'data.csv');
}
