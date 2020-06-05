/**
 * Event tạo 1 context menu (ví dụ khi người dùng click chuột phải) theo 1 list
 * các action và tên action
 *
 * @param {array}
 *          menu list gồm các đối tượng dạng {title: "tên của action", action:
 *          function()}
 */
d3.contextMenu = function(menu) {
    // create the div element that will hold the context menu
    d3.selectAll('.d3-context-menu').data([ 1 ]).enter().append('div').attr(
        'class', 'd3-context-menu');

    // close menu
    d3.select('body').on('click.d3-context-menu', function() {
        d3.select('.d3-context-menu').style('display', 'none');
    });
    // this gets executed when a contextmenu event occurs
    return function(data, index) {
        d3.event.preventDefault();
        d3.event.stopPropagation();
        if (menu.length == 0)
            return function() {
            };
        var elm = this;
        d3.selectAll('.d3-context-menu').html('');
        var list = d3.selectAll('.d3-context-menu').append('ul');
        list.selectAll('li').data(menu).enter().append('li').html(function(d,i) {
            if(typeof d.title === 'function') return d.title(elm, data,i);
            return d.title;
        }).on('click', function(d, i) {
            d.action(elm, data, i);
        });

        // display context menu
        d3.select('.d3-context-menu').style('left', (d3.event.pageX - 2) + 'px')
            .style('top', (d3.event.pageY - 2) + 'px').style('display', 'block');
        /*let position = d3.mouse(this);
        d3.select('.d3-context-menu')
            .style('position', 'absolute')
            .style('left', position[0] + "px")
            .style('top', position[1] + "px")
            .style('display', 'block');*/
    };
};