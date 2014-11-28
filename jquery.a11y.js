$(function() {

    var ignoreTags = [
        "a",
        "button", 
        "input",
        "select",
        "textarea"
    ];
    var styleTags = [
        "b",
        "br",
        "i",
        "abbr",
        "strong"
    ];

    var tabIndexElements = 'a, button, input, select, textarea, [tabindex]';

    var a11yStyle = $('head').find("style[id='a11y']");
    if (a11yStyle.length === 0) {
        $("<style id='a11y'>").html("a.aria-label {"+
            "position:absolute;"+
            "left:0px;"+
            "width:auto;"+
            "height:auto;"+
            "overflow:auto;"+
            "color: rgba(0,0,0,0) !important;"+
            "background: rgba(0,0,0,0) !important;"+
            "font-size: 1px !important;"+
        "}").appendTo($("head"));
    }

    var preventDefault = function(event) {
        event.preventDefault();
        event.stopPropagation()
    };

    var scrollToFocus = function(event) {
        if (!$.a11y.enabled) return;
        event.preventDefault();
        if ($(event.target).is("#a11y-focusguard")) return;
        var offset = $.a11y.options.offsetTop;
        var to = $(event.target).offset()["top"]
        var st = $(window).scrollTop() + offset;
        var bottomoffset = $.a11y.options.offsetBottom;
        var stbottom = st + ($(window).height() - bottomoffset - offset);
        if (to < st || to > stbottom) {
            var sto = to - offset;
            if (sto < 0) sto = 0;
            $.scrollTo(sto, {duration:$.a11y.options.animateDuration});
        }
    };

    var refocusEventTarget = function(event) {
        _.defer(function() {
            if ($(document.activeElement).is("body")) {
                $(event.target).focus();
            }    
        });
    };

    var makeTabbable = function($element) {
        if ($element.is(".sr-only")) return $element;
        $element.attr({
            "role": "region",
            "tabindex": 0
        }).addClass("prevent-default");
        return $element;
    };

    var flatten = function($element) {
        var rtn = "";
        for (var i = 0; i < $element[0].children.length; i++) {
            rtn += $element[0].children[i].outerHTML;
        }
        return rtn;
    };

    var removeChildNodes = function($element) {
        var childNodes = $element[0].childNodes.length;
        for (var i = childNodes - 1; i > -1 ; i--) {
            if ($element[0].childNodes[i].remove) $element[0].childNodes[i].remove();
            else if ($element[0].childNodes[i].removeNode) $element[0].childNodes[i].removeNode(true); //ie 11 fix
        }
        return $element;
    };


    var makeChildNodesAccessible = function ($element) {

        //CAPTURE DOMNODE CHILDREN
        var children = $element.children();

        //IF NO CHILDREN, ASSUME TEXT ONLY, WRAP IN SPAN TAG
        if (children.length === 0) {
            var textContent = $element.text();
            if (textContent.trim() === "") return $element;
            removeChildNodes($element);
            $element.append( makeTabbable($("<span>"+textContent+"</span>")) );
            return $element;
        }

        var styleChildCount = 0;
        for (var c = 0; c < children.length; c++) {
            var tagName = children[c].nodeName.toLowerCase();
            if (_.indexOf(styleTags, tagName) > -1) styleChildCount++;
        }
        if (styleChildCount === children.length) {
            return $("<span>").append(makeTabbable($element));
        }

        //SEARCH FOR TEXT ONLY NODES AND MAKE TABBABLE
        var newChildren = [];
        for (var i = 0; i < $element[0].childNodes.length; i++) {
            var child = $element[0].childNodes[i];
            var cloneChild = $(child.outerHTML)[0];
            switch(child.nodeType) {
            case 3: //TEXT NODE
                newChildren.push( makeTabbable($("<span>"+child.nodeValue+"</span>")) );
                break;
            case 1: //DOM NODE
                var tagName = child.nodeName.toLowerCase();
                if (_.indexOf(styleTags, tagName) > -1 || _.indexOf(ignoreTags, tagName) > -1) {
                    newChildren.push( $(cloneChild) );
                } else {
                    var $child = $(cloneChild);
                    var childChildren = $child.children();
                    if (childChildren.length === 0) {
                        //DO NOT DESCEND INTO TEXT ONLY NODES
                        var textContent = $child.text();
                        if (textContent.trim() !== "") makeTabbable($child);
                    } else {
                        
                        //DESCEND INTO NODES WITH CHILDREN
                        makeChildNodesAccessible($child);
                    }
                    newChildren.push( $child );
                }
                break;
            }
        }

        removeChildNodes($element);
        $element.append(newChildren);

        return $element;
    };

    var makeAccessible = function(element) {
        var $element;
        // CONVERT ELEMENT TO DOM NODE
        try {
            $element = $("<div>"+element+"</div>");
        } catch (e) {
            throw e;
        }
        return flatten( makeChildNodesAccessible($element) );
    };

    $.a11y_focus_first = function() {
        if (!$.a11y.enabled) return false;
        //IF HAS ACCESSIBILITY, FOCUS ON FIRST VISIBLE TAB INDEX
        _.defer(function(){
            var tags = $("[tabindex]:visible:not([tabindex='-1'])");
            if (tags.length > 0) $(tags[0]).focus();
        });
        return true;
    };


    $.a11y = function(enabled, options) {
        enabled = enabled === undefined ? true : enabled;
        if (options !== undefined) {
            _.extend($.a11y.options, options);
        }

        $(".not-accessible[tabindex='0'], .not-accessible [tabindex='0']").attr({
            "tabindex": "-1",
            "aria-hidden": true
        });

        if ($.a11y.enabled !== enabled) {
            $.a11y.enabled = enabled;
            if (enabled) {
                $("body")
                .on("click", ".prevent-default", preventDefault)
                .on("focus", "[tabindex='0']", scrollToFocus)
                .append($('<div id="a11y-focusguard" tabindex="0">'));

                $('html').on("blur", "*", refocusEventTarget);

            } else {
                $("body")
                .off("click", ".prevent-default", preventDefault)
                .off("focus", "[tabindex='0']", scrollToFocus);
                $('#a11y-focusguard').remove();

                $('html').off("blur", "*", refocusEventTarget);
            }
        }

        if ($.a11y.enabled) {
            $('#a11y-focusguard').remove().appendTo($('body')).on("focus", function() {
               $.a11y_focus_first();
            }).attr("tabindex", 0);
        }
    };
    $.a11y.enabled = false;
    $.a11y.options = {
        offsetTop: 0,
        offsetBottom: 0,
        animateDuration: 250
    };
    $.a11y.focusStack = [];


    $.fn.a11y_aria_label = function(deep) {
        var ariaLabels = [];

        for (var i = 0; i < this.length; i++) {
            var $item = $(this[i]);
            if ($item.is("div[aria-label], span[aria-label]")) ariaLabels.push(this[i]);
            if (deep === true) {
                var children = $item.find("div[aria-label], span[aria-label]");
                ariaLabels = ariaLabels.concat(children);
            }
        }

        if (ariaLabels.length === 0) return true;
        for (var i = 0; i < ariaLabels.length; i++) {
            var $item = $(ariaLabels[i]);
            var children = $item.children();
            if (children.length === 0) return;
            if ($(children[0]).is(".aria-label")) return;
            if ($item.attr("aria-label") === undefined || $item.attr("aria-label") == "") return;
            var sudoElement = $("<a class='aria-label prevent-default' role='region' href='#'>");
            sudoElement.on("click", preventDefault);
            sudoElement.html($item.attr("aria-label"));
            $item.prepend(sudoElement);
        }

        return this;
    };

    $.fn.a11y_cntrl = function(enabled, withDisabled) {
        enabled = enabled === undefined ? true : enabled;
        for (var i = 0; i < this.length; i++) {
            var $item = $(this[i]);
            if (enabled) {
                $item.attr({
                    tabindex: "0",
                }).removeAttr("aria-hidden").parents().removeAttr("aria-hidden");
                if (withDisabled) {
                    $item.removeAttr("disabled").removeClass("disabled");
                }
            } else {
                $item.attr({
                    tabindex: "-1",
                    "aria-hidden": "true"
                });
                if (withDisabled) {
                    $item.attr("disabled","disabled").addClass("disabled");
                }
            }
        }
        return this;
    };

    $.a11y_text = function (text) {
        return makeAccessible(text);
    };

    $.fn.a11y_text = function() {
        for (var i = 0; i < this.length; i++) {
            this[i].innerHTML = makeAccessible(this[i].innerHTML);
        }
        return this;
    };

    $.fn.a11y_popup = function() {
        var $activeElement = $(document.activeElement);
        $.a11y.focusStack.push($activeElement);

        $(tabIndexElements).each(function(index, item) {
            var $item = $(item);
            if (item._a11y === undefined) item._a11y = [];
            item._a11y.push( $item.attr('tabindex') || 0 );
            $item.attr({
                'tabindex': -1,
                'aria-hidden': true
            });
        });
        this.find(tabIndexElements).attr({
            'tabindex': 0
        }).removeAttr('aria-hidden').parents().removeAttr('aria-hidden');

        $.a11y_focus_first();
    };

    $.a11y_popdown = function() {
        $(tabIndexElements).each(function(index, item) {
            var $item = $(item);
            var pti = 0;
            if (item._a11y !== undefined && item._a11y.length !== 0) pti = item._a11y.pop();
            $item.attr({
                'tabindex': pti
            }).removeAttr('aria-hidden');
        });

        var $activeElement = $.a11y.focusStack.pop();

        if ($activeElement) {
            if($activeElement.is(':visible')) {
                $activeElement.focus();
            } else {
                $activeElement.next().focus();
            }
        }
    };

});
