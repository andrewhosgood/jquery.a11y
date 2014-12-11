jquery.a11y - jQuery General Accessibility Plugin  
=================================================

The extension was created to enable a universal experience on various screen readers and devices, specifically between iPad+safari+voiceover and windows+ie+JAWS and NVDA. It was made to facilitate a better user experience with regards to web navigation, interaction and content.  
  
This plugin can be considered an accessibility boiler-plate for a web application. I will help provide the right focus to a screen reader's cursor for controls, content and enable you to create interaction description blocks.


##Installation
1. Add jquery.a11y.js to your html scripts.  
2. Add jquery.a11y.css to your html stylesheets.  
    
  
  
##Recommended companions
* [bowserjs](http://www.bowserjs.org/) for browser detection (required for mac osx selection alerts)
* [modernizr](http://modernizr.com/) for touch detection (required for returning focus to top of page)
  
  
  
##Usage Example
```
$.a11y(true); // turn on a11y
$('text blocks to make accessible').a11y_text(); // make text blocks tabbable
$('controls to enable').a11y_cntrl_enable(true); // enable certain controls
$('controls to disable').a11y_cntrl_enable(false); // disable certain controls  
$('element to popup').popup(); // create a popup and restrict tabbing to it
$.popdown(); // close popup and relax tabbing
$.a11y_focus(); // focus on the first tabbable element
```
  
  
##Intended user controls

####PC + NVDA/JAWS, MAC + VOICEOVER  
* tab = next  
* shift+tab = previous  
* enter/space = select  
* escape = go to first focusable element  
  
####IPAD + VOICEOVER
* swipt right = next  
* swipt left = previous  
* double tap = select  
* two finger swipe up = go to first focusable element  

####IPAD + VOICEOVER + KEYBOARD  
* right = next  
* left = previous  
* up+down = select  
* shift+home / fn+shift+left = go to first focusable element  
  
  
  
##Function Quick Reference
####TURN ON & UPDATE
```
$.a11y(isOn, options);
$.a11y_update();
```
  
####OPTIONS
```
$.a11y.options = {
	focusOffsetTop: 0,
	focusOffsetBottom: 0,
	OS: "",
	isTouchDevice: false,
	isOn: false
};
```
  
####TOGGLE ACCESSIBILITY
```
$.a11y_on(isOn);  
$('').a11y_on(isOn);  
```
  
####MAKE ACCESSIBLE CONTROLS
```
$('').a11y_cntrl(isOn, withDisabled);
$('').a11y_cntrl_enabled(isOn);
```
  
####MAKE ACCESSIBLE TEXT
```
$.a11y_normalize(text);
$.a11y_text(text);
$('').a11y_text();
```
  
####MAKE SELECTED
```
$('').a11y_selected(isOn);
```
  
####FOCUS RESTRICTION
```
$('').a11y_only(container, );
$('').a11y_popup();
$.a11y_popdown();
```
   
####SET FOCUS
```
$('').focusNoScroll();
$.a11y_focus();
$('').a11y_focus();
```
  
####CONVERT ARIA LABELS
```
$('').a11y_aria_label(deep);
```
  
  
  
##Style Quick Reference
####HIDDEN BUT READABLE(FOCUSABLE) TEXT
```
.aria-label
```

####EXCLUDED
```
.a11y-ignore
.a11y-ignore-focus
````

####INTERNALLY APPLIED
```
.aria-hidden
.a11y-selected
.accessible-text-block
.prevent-default
#a11y-focusguard
#a11y-focusguard.touch
#a11y-focusguard.notouch
#a11y-selected
```
  
  
  
## Function descriptions  
###TURN ON & UPDATE
#### $.a11y()
```
$.a11y(enabled, options);
$.a11y.options = {
	focusOffsetTop: 0,
	focusOffsetBottom: 0,
	OS: "",
	isTouchDevice: false,
	isOn: false
};
```
Use the above code to turn on accessibilty.  
* Catures space and enter key to force them both as selection keys  
* Redirects '.prevent-default' clicks to event.preventDefault();  
* Controls scrolls for '[tabindex="0"]' focuses (focusOffsetTop and focusOffsetBottom ensure visibility)   
* Appends focusguard element to body to capture end of page focus  
* Appends selected element to body to enable alerts for selections
* Performs $.a11y_update();
  
#### $.a11y_update();
Use this function when substantial page changes occur
* Hides everything with '.not-accessible' by adding tabindex="-1", aria-hidden="true"  and .aria-hidden  
* Focuses upon the #a11y-selected element
* Converts div and span aria-labels to prepended span tags  
* Reattaches the focusguard element so that is the last in the document body
  

###TOGGLE ACCESSIBILITY
#### $.a11y_on()
```
$.a11y_on(isOn);
```
Use this function to toggle a screen reader's ablility to read anything in the body tag
* Applies aria-hidden to the body tag
  
#### $('').a11y_on()
```
$('').a11y_on(isOn);
```
Use the above to toggle selection of tab indexes and aria-hidden on children  
* Performs a11y_cntrl(enabled, false) on all focusable elements in selector
* Ignores .a11y-ignore elements
  
  
###MAKE ACCESSIBLE CONTROLS
####$('').a11y_cntrl()
```
$('').a11y_cntrl(isOn, withDisabled);
$('').a11y_cntrl_enabled(isOn);
```
Use the above to toggle accessibility of controls  
* Adds/removes tabindex="0"  
* Adds/removes aria-hidden from parent tree   
* If withDisabled will also add/remove 'disabled' attribute and class
* $('selector').a11y_cntrl_enabled(isOn) is a shortcut for $('selector').a11y_cntrl(isOn, true) 
   
  
###MAKE ACCESSIBLE TEXT
####$.a11y_normalize()
```
$.a11y_normalize(text);
```
This function returns the text attribute having removed "& ... ;" style html characters
* Especially useful in coverting html text to screen reader aria-labels
  
####$.a11y_text()
```
$.a11y_text(text);
```
Use the above to make html/text string into tabbable html string  
1. Converts string to <div>text</div> dom node
2. Counts children, if no child dom nodes assume text and wrap in a tabbable span tag and return
3. Count children style elements (b,i,strong,abbr), if only style elements wrap in a tabbable span tag and return
4. Go through each child element
5. If text only node wrap in tabbable span tag and move to next child element
6. If node is a style element or a natively tabbable element, ignore and move to next child element
7. If has no children, make tabbable and move to next child element
8. If have children, perform same procedure from 2. on child (recursively) and move to next child element
9. Replace all original children with amended versions
10. Return element and continue to 9. (for recursion) or procede to 11.
11. Flatten children into an html string
  
####$('').a11y_text();
```
$('').a11y_text();
```
Use the above to make selection .innerHTML strings into tabbable html strings using $.a11y_text(.innerHTML) 

####MAKE SELECTED
```
$('').a11y_selected(isOn);
```
  
####FOCUS RESTRICTION
```
$('').a11y_only(container, );
$('').a11y_popup();
$.a11y_popdown();
```
   
####SET FOCUS
```
$('').focusNoScroll();
$.a11y_focus();
$('').a11y_focus();
```
  
####CONVERT ARIA LABELS
```
$('').a11y_aria_label(deep);
```
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

```
$.a11y_focus();
$('selector').a11y_focus();
```
Use the above code to focus on the first tabbable element   
* Focuses on first occurance of '[tabindex]:visible:not([tabindex="-1"])'  
  
  

```
$('selector').a11y_aria_label(deep);
```
Use the above code to make aria-labels readable on a touchscreen  
* Applies to 'div[aria-label], span[aria-label]'  
* Creates '&lt;a class="aria-label prevent-default" role="region" href="#"&gt;' as first child of selected  
  

  
   
```
$.fn.a11y_selected(isOn)
```
Make screen reader read item as "selected [item text]"  
* Will only work with innerHTML text on 'a' tags  
* Use isOn = false to remove 'selected' text from element
  

```
$('selector').a11y_text()
```
Use the above to make selected elements html/text into tabbable html  
* Ignores 'a, button, input, select, textarea'  
* Ignores 'b, br, i, abbr, strong'  
* Wraps text nodes in '&lt;span tabindex="0" role="region"&gt;&lt;/span&gt;' or adds [tabindex="0"][role="region"] to parent    
  
  
```
$('selector').a11y_only()
```
Use above to restrict tabbable / readable focus to selected elements  
  
  
```
$('selector').a11y_popup()
```
Use above to restrict tabbable / readable focus to selected elements, undo with function below  
  
  
```
$.a11y_popdown()
```
Use above to relax a11y_popup restriction  
  
  
  
##Style Descriptions
  
  
  
##Examples

