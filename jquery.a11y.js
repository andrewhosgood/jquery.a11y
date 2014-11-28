$(function() {

    var ignoreTags = "a,button,input,select,textarea";
    var styleTags = "b,br,i,abbr,strong";
    var tabIndexElements = 'a, button, input, select, textarea, [tabindex]';

    //_.defer(_.bind(func), that)) EQUIVALENT
    var defer = function(func, that) {
        var thisHandle = that || this;
        var args = arguments;
        setTimeout(function() {
            func.apply(thisHandle, args);
        },0);
    };

    //ADD STYLE FOR VISUALLY HIDDEN, SCREENREADER VISIBLE TEXT
    var a11yStyle = $('head').find("style[id='a11y']");
    if (a11yStyle.length === 0) {
        $("<style id='a11y'>").html(".aria-label {"+
            "position:relative;"+
            "left:0px;"+
            "width:auto;"+
            "height:auto;"+
            "overflow:auto;"+
            "color: rgba(0,0,0,0) !important;"+
            "background: rgba(0,0,0,0) !important;"+
            "font-size: 1px !important;"+
        "}").appendTo($("head"));
    }

    //PREVENT DEFAULT CLICK ACTION FUNCTION
    var preventDefault = function(event) {
        event.preventDefault();
        event.stopPropagation()
    };

    //CHECK IF ELEMENT HAS FIX POSITION
    var isFixedPosition = function(element) {
        var parents = $(element).parents();
        for (var i = 0; i < parents.length; i++) {
            if ($(parents[i]).css("position") == "fixed") return true;
        }
        return false;
    };

    //SCROLL TO FOCUSED ELEMENT UNLESS FIXED POSITION
    var scrollToFocus = function(event) {
        if (!$.a11y.enabled) return;
        if ($(event.target).is("#a11y-focusguard")) return;
        if (isFixedPosition(event.target)) return;
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

    //FOCUS LAST ELEMENT IF BACK OF CONTENT CLICKED
    var refocusEventTarget = function(event) {
        if ($(event.currentTarget).has("[tabindex='0']")) return;
        defer(function() {
            if ($(document.activeElement).is("body")) {
                $(event.target).focusNoScroll();
            }    
        });
    };

    //MAKES AN ELEMENT TABBABLE
    var makeTabbable = function($element) {
        if ($element.is(".sr-only")) return $element;
        $element.attr({
            "role": "region",
            "tabindex": 0
        }).addClass("prevent-default");
        return $element;
    };

    //TURNS DOM ELEMENT CHILDREN INTO HTML STRING
    var flatten = function($element) {
        var rtn = "";
        for (var i = 0; i < $element[0].children.length; i++) {
            rtn += $element[0].children[i].outerHTML;
        }
        return rtn;
    };

    //REMOVES CHILD ELEMENTS FROM DOM NODE
    var removeChildNodes = function($element) {
        var childNodes = $element[0].childNodes.length;
        for (var i = childNodes - 1; i > -1 ; i--) {
            if ($element[0].childNodes[i].remove) $element[0].childNodes[i].remove();
            else if ($element[0].childNodes[i].removeNode) $element[0].childNodes[i].removeNode(true); //ie 11 fix
        }
        return $element;
    };

    //PERFORMS CALCULATIONS TO TURN DOM NODES + TEXT NODES INTO TABBABLE CONTENT
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
            if ($(children[c]).is(styleTags)) styleChildCount++;
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
                var $child = $(cloneChild);
                if ($child.is(styleTags) || $child.is(ignoreTags)) {
                    newChildren.push( $child );
                } else {
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

    //PERFORMS ABOVE FUNCTION TO EITHER TEXT STRING OR HTML STRING
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


    //TURN ON ACCESSIBILITY FEATURES
    $.a11y = function(enabled, options) {
        enabled = enabled === undefined ? true : enabled;
        if (options !== undefined) {
            $.extend($.a11y.options, options);
        }

        //STOP ELEMENTS WITH .not-accessible CLASS FROM BEING IN TAB INDEX
        $(".not-accessible[tabindex='0'], .not-accessible [tabindex='0']").attr({
            "tabindex": "-1",
            "aria-hidden": true
        });

        if ($.a11y.enabled !== enabled) {
            $.a11y.enabled = enabled;
            if (enabled) {
                //ADDS TAB GUARD, CLICK ON ACCESSIBLE TEXT AND SCROLL TO FOCUS EVENT HANDLERS
                $("body")
                .on("click", ".prevent-default", preventDefault)
                .on("focus", "[tabindex='0']", scrollToFocus)
                .append($('<div id="a11y-focusguard" tabindex="0">'));

                //ADDS CLICK ON BODY EVENT HANDLER
                $('html').on("blur", "*", refocusEventTarget);

            } else {
                //REMOVES TAB GUARD, CLICK ON ACCESSIBLE TEXT AND SCROLL TO FOCUS EVENT HANDLERS
                $("body")
                .off("click", ".prevent-default", preventDefault)
                .off("focus", "[tabindex='0']", scrollToFocus);
                $('#a11y-focusguard').remove();

                //REMOVES CLICK ON BODY EVENT HANDLER
                $('html').off("blur", "*", refocusEventTarget);
            }
        }

        if ($.a11y.enabled) {
            //ADDS TAB GUARG EVENT HANDLER
            $('#a11y-focusguard').remove().appendTo($('body')).on("focus", function() {
               $.a11y_focus();
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


    //FOCUSES ON FIRST TABBABLE ELEMENT
    $.a11y_focus = function() {
        if (!$.a11y.enabled) return false;
        //IF HAS ACCESSIBILITY, FOCUS ON FIRST VISIBLE TAB INDEX
        defer(function(){
            var tags = $("[tabindex]:visible:not([tabindex='-1'])");
            if (tags.length > 0) $(tags[0]).focusNoScroll();
        });
        return true;
    };

    //FOCUSES ON FIRST TABBABLE ELEMENT IN SELECTION
    $.fn.a11y_focus = function() {
        if (!$.a11y.enabled) return this;
        if (this.length === 0) return this;
        //IF HAS ACCESSIBILITY, FOCUS ON FIRST VISIBLE TAB INDEX
        defer(function(){
            var tags = $(this[0]).find("[tabindex]:visible:not([tabindex='-1'])");
            if (tags.length > 0) $(tags[0]).focusNoScroll();
        }, this);
        return this;
    };

    

    //TURNS aria-label ATTRIBUTES INTO SPAN TAGS
    $.fn.a11y_aria_label = function(deep) {
        var ariaLabels = [];

        for (var i = 0; i < this.length; i++) {
            var $item = $(this[i]);
            if ($item.is("div[aria-label], span[aria-label]")) ariaLabels.push(this[i]);
            if (deep === true) {
                var children = $item.find("div[aria-label], span[aria-label]");
                ariaLabels = ariaLabels.concat(children.toArray());
            }
        }

        if (ariaLabels.length === 0) return true;
        for (var i = 0; i < ariaLabels.length; i++) {
            var $item = $(ariaLabels[i]);
            var children = $item.children();
            if (children.length === 0) continue;
            if ($(children[0]).is(".aria-label")) continue;
            if ($item.attr("aria-label") === undefined || $item.attr("aria-label") == "") continue;
            var sudoElement = $("<a class='aria-label prevent-default' role='region' href='#'>");
            sudoElement.on("click", preventDefault);
            sudoElement.html($item.attr("aria-label"));
            $item.prepend(sudoElement);
            $item.removeAttr("aria-label").removeAttr("tabindex");
        }

        return this;
    };

    //MAKES NAVIGATION CONTROLS ACCESSIBLE OR NOT WITH DISABLE CLASS AND ATTRIBUTE
    $.fn.a11y_cntrl_enabled = function(enabled) {
        return this.a11y_cntrl(enabled, true);
    };

    //MAKES NAVIGATION CONTROLS ACCESSIBLE OR NOT WITH OPTIONAL DISABLE CLASS AND ATTRIBUTE
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

    //MAKES CHILDREN ACCESSIBLE OR NOT
    $.fn.a11y_on = function(enabled) {
        enabled = enabled === undefined ? true : enabled;
        this.find(tabIndexElements).a11y_cntrl(enabled);
        return this;
    };

    //CONVERTS HTML OR TEXT STRING TO ACCESSIBLE HTML STRING
    $.a11y_text = function (text) {
        return makeAccessible(text);
    };

    //CONVERTS DOM NODE TEXT TO ACCESSIBLE DOM NODES
    $.fn.a11y_text = function() {
        for (var i = 0; i < this.length; i++) {
            this[i].innerHTML = makeAccessible(this[i].innerHTML);
        }
        return this;
    };

    //ALLOWS FOCUS ON SELECTED ELEMENTS ONLY
    $.fn.a11y_only = function() {
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

        $.a11y_focus();
    };

    //ALLOWS RESTORATIVE FOCUS ON SELECTED ELEMENTS ONLY
    $.fn.a11y_popup = function() {
        var $activeElement = $(document.activeElement);
        $.a11y.focusStack.push($activeElement);

        this.a11y_only();
        
        $.a11y_focus();
    };

    //RESTORES FOCUS TO PREVIOUS STATE AFTER a11y_popup
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
            if($activeElement.is(':visible:not(:disabled)')) {
                $activeElement.focusNoScroll();
            } else {
                $activeElement.next().focusNoScroll();
            }
        }
    };

    //jQuery function to focus with no scroll (accessibility requirement for control focus)
    $.fn.focusNoScroll = function(){
      var y = $(window).scrollTop();
      if (this.length > 0) this[0].focus();
      window.scrollTo(null, y);
      return this; //chainability
    };

});
