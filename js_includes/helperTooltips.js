// Building tooltips
function TT(parent, text, delay, position, highlight) {
    if (highlight == undefined) highlight = true;
    var params = {content: text, delay: delay};
    if (typeof position != "string") position = "brsh";
    if (position.match(/t/)) {
        params.valign = "top";
        if (!position.match(/sv/)) params.yoffset = -1;
    }
    if (position.match(/m/)) {
        params.valign = "middle";
        params.yoffset = -0.5;
    }
    if (position.match(/b/)) {
        params.valign = "bottom";
        if (position.match(/sv/)) params.yoffset = -1;
    }
    if (position.match(/l/)) {
        params.halign = "left";
        if (!position.match(/sh/)) params.xoffset = -1;
    }
    if (position.match(/c/)) {
        params.halign = "middle";
        params.xoffset = -0.5;
    }
    if (position.match(/r/)) {
        params.halign = "right";
        if (position.match(/sh/)) params.xoffset = -1;
    }
    return function(t) {
        setTimeout(function() { // timeout because elements take time to appear after pause
            if (highlight) $(parent).addClass("tooltip-selected");
            var tt = $(parent).tooltip(params);
            //tt.find("span.tooltip-validation").bind("click", function() { $(parent).removeClass("tooltip-selected"); tt.remove(); t.unpause(1); });
            t.safeBind($(document),"keydown", function(e) {
               if (tt.parent().length && e.keyCode == 32) {
                $(parent).removeClass("tooltip-selected"); 
                tt.remove();
                t.unpause(1);
               }
            });
        }, 10);
    };
}