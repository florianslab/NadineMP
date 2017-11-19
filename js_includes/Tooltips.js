//###########################
//
// TOOLTIP LIBRARY
//
// last edit: 03-25-2016 by Jeremy
//
// Offers an easy way to attach tooltips to elements on the page.
// Tested on Mac with Firefox 45.0.1, Safari 8.0.3 and Chrome 49.0.26...
//
//##############

function getPosition(element) {
    var xPosition = 0, yPosition = 0;
  
    var viewportElement = document.body;
    var box = element.getBoundingClientRect();
    var scrollLeft = viewportElement.scrollLeft;
    var scrollTop = viewportElement.scrollTop;

    xPosition = box.left + scrollLeft;
    yPosition = box.top + scrollTop;
    return { x: xPosition, y: yPosition };
}

function popinMessage(x, y, text, delay) {
    if (typeof text === "undefined") return;
    if (typeof delay === "undefined") delay = text.replace(/ /g,'').length*100; // 100 milliseconds per character
    if (typeof delay === "number" && delay < 3000) delay = 2000;
    var pop = $("<div>");
    pop.addClass("tooltip");
    pop.html(text);
    pop.css({position: "absolute", left: x, top: y});
    $("body").append(pop);
    if (typeof delay === "number") {
        pop.bind("click", function() { pop.remove(); });
        setTimeout(function() { pop.remove(); }, delay);
    }
    else if (typeof delay == "string") {
        var ok = $("<span>").html(delay);
        ok.addClass("tooltip-validation");
        ok.css("float", "right");
        ok.bind("click", function() { pop.remove(); });
        pop.append(ok);
    }
    return pop;
}

$.fn.tooltip = function(params) {
    var pop = popinMessage(-1000, -1000, params.content, params.delay);
    var t = this;
    
    var pos = getPosition($(t)[0]);
    switch (params.valign) {
        case "top":
            break;
        case "middle":
            pos.y += $(t)[0].offsetHeight/2;
            break;
        case "bottom":
            pos.y += $(t)[0].offsetHeight;
            break;
    }
    switch (params.halign) {
        case "left":
            break;
        case "middle":
            pos.x += $(t)[0].offsetWidth/2;
            break;
        case "right":
            pos.x += $(t)[0].offsetWidth;
            break;
    }
    if (typeof params.xoffset != "undefined") {
      var xoffset = (params.xoffset+"").match(/^(-?\d+)\s*%$|^(-?\d+(\.\d+)?)$/);
      if (xoffset.length > 1) {
        if (typeof xoffset[1] != "undefined") pos.x += pop[0].offsetWidth * xoffset[1]/100;
        else if (typeof xoffset[2] != "undefined") pos.x += pop[0].offsetWidth * xoffset[2];
      }
    }
    if (typeof params.yoffset != "undefined") {
      var yoffset = (params.yoffset+"").match(/^(-?\d+)\s*%$|^(-?\d+(\.\d+)?)$/);
      if (yoffset.length > 1) {
        if (typeof yoffset[1] != "undefined") pos.y += pop[0].offsetHeight * yoffset[1]/100;
        else if (typeof yoffset[2] != "undefined") pos.y += pop[0].offsetHeight * yoffset[2];
      }
    }
    pop.css({left: pos.x, top: pos.y});
    
    return pop;
}