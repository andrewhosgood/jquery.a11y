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

######PC + NVDA/JAWS, MAC + VOICEOVER  
* tab = next  
* shift+tab = previous  
* enter/space = select  
* escape = go to first focusable element  

######IPAD + VOICEOVER
* swipt right = next  
* swipt left = previous  
* double tap = select  
* two finger swipe up = go to first focusable element  

######IPAD + VOICEOVER + KEYBOARD  
* right = next  
* left = previous  
* up+down = select  
* shift+home / fn+shift+left = go to first focusable element  
  
  
  
##Function Quick Reference
######TURN ON & UPDATE
```
$.a11y(isOn, options);
$.a11y_update();
```
######OPTIONS
```
$.a11y.options = {
	focusOffsetTop: 0,
	focusOffsetBottom: 0,
	OS: "",
	isTouchDevice: false,
	isOn: false
};
```
######TOGGLE ACCESSIBILITY
```
$.a11y_on(isOn);  
$('').a11y_on(isOn);  
```
######MAKE ACCESSIBLE CONTROLS
```
$('').a11y_cntrl(isOn, withDisabled);
$('').a11y_cntrl_enabled(isOn);
```
######MAKE ACCESSIBLE TEXT
```
$.a11y_normalize(text);
$.a11y_text(text);
$('').a11y_text();
```
######MAKE SELECTED
```
$('').a11y_selected(isOn);
```
######FOCUS RESTRICTION
```
$('').a11y_only(container, );
$('').a11y_popup();
$.a11y_popdown();
```
######SET FOCUS
```
$('').focusNoScroll();
$.a11y_focus();
$('').a11y_focus();
```
######CONVERT ARIA LABELS
```
$('').a11y_aria_label(deep);
```
######UTILITY
```
$('').focusNoScroll();
```
  
  
  
##Style Quick Reference
######HIDDEN BUT READABLE(FOCUSABLE) TEXT
```
.aria-label
```
######EXCLUDED
```
.a11y-ignore
.a11y-ignore-focus
````
######SPECIAL CLASSES
######INTERNALLY APPLIED
```
.aria-hidden
.a11y-selected
#a11y-focusguard
#a11y-focusguard.touch
#a11y-focusguard.notouch
#a11y-selected
```
  
  
  
## Long Function descriptions  
######TURN ON & UPDATE
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
  

######TOGGLE ACCESSIBILITY
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
  
  
######MAKE ACCESSIBLE CONTROLS
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
   
  
######MAKE ACCESSIBLE TEXT
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
* Ignores 'a, button, input, select, textarea'  
* Ignores 'b, br, i, abbr, strong'  
* Wraps text nodes in '&lt;span tabindex="0" role="region"&gt;&lt;/span&gt;' or adds [tabindex="0"][role="region"] to parent 
   
Method:  
1.  Converts string to ```<div>text</div>``` dom node  
2.  Counts children, if no child dom nodes assume text and wrap in a tabbable span tag and return  
3.  Count children style elements (b,i,strong,abbr), if only style elements wrap in a tabbable span tag and return  
4.  Go through each child element  
5.  If text only node wrap in tabbable span tag and move to next child element  
6.  If node is a style element or a natively tabbable element, ignore and move to next child element  
7.  If has no children, make tabbable and move to next child element  
8.  If have children, perform same procedure from 2. on child (recursively) and move to next child element  
9.  Replace all original children with amended versions  
10.  Return element and continue to 9. (for recursion) or procede to 11.  
11.  Flatten children into an html string  
  
####$('').a11y_text();
```
$('').a11y_text();
```
Use the above to make selection .innerHTML strings into tabbable html strings using $.a11y_text(.innerHTML) 

######MAKE SELECTED
####$('').a11y_selected()
```
$('').a11y_selected(isOn);
```
Make screen reader read item as "selected [item text]"  
* Will only work with innerHTML text on 'a' tags  
* Use isOn = false to remove 'selected' text from element  

Use the above code to toggle element selection  
* For mac (if $.a11y.options.OS == "mac"), this will create a visibly hidden span tag for the screen reader and move focus to it.
* Otherwise (if $.a11y.options.OS !== "mac"), this will create an 'aria-alert' in the #a11y-selected div to be read automatically by a screen reader (this does not work on mac voiceover for some reason).
  
######FOCUS RESTRICTION
####$('').a11y_only()
```
$('').a11y_only(container, storeLastTabIndex);
```
Use above to restrict tabbable / readable focus to selected elements (optionally using a container)  
* Will store element tabindexes if asked to for use with a11y_popdown
* Will store the previous active element if asked to for use with a11y_popdown


####$('').a11y_popup()
```
$('').a11y_popup(container);
```
Use above to restrict tabbable / readable focus to selected elements (optionally using a container), undo with function below  
* Will store element tabindexes for use with a11y_popdown
* Will store the previous active element for use with a11y_popdown
* Multi-layer compatible (popups within popups is ok)

####$.a11y_popdown()
```
$.a11y_popdown();
```
Use above to relax a11y_popup restriction  
* Restores previous active element
* Restores all tab indexes
  
   
######SET FOCUS
####$.a11y_focus() & $('').a11y_focus()
```
$.a11y_focus();
$('').a11y_focus();
```
Use the above code to focus on the first tabbable element   
* Focuses on first occurance of [tabindex='0']:visible:not(.disabled):not([tabindex='-1']):not(:disabled):not(.a11y-ignore-focus)  
  
######CONVERT ARIA LABELS
####$('').a11y_aria_label()
```
$('').a11y_aria_label(deep);
```
Use the above code to make aria-labels readable on a touchscreen  
* Applies to 'div[aria-label], span[aria-label]'  
* Creates '&lt;a class="aria-label prevent-default" role="region" href="#"&gt;' as first child of selected  

######UTILITY
####$('').focusNoScroll()
```
$('').focusNoScroll();
```
[Does exactly what it says on the tin](http://www.ronseal.co.uk/), focuses on an element but retains the current scroll position.


##Long Style Descriptions
######HIDDEN BUT READABLE(FOCUSABLE) TEXT
####.aria-label
Put this class on any tag to make the text inside incredibly small and transparent. This will allow it to be read by a screen reader but be virtually invisible to the eye. Add [tabindex="0"] to the tag to allow a desktop to focus on it.  
Likewise, if a div or span tag has the attribute aria-label="text", this will automatically be removed into a floating tag with this class and .prevent-default. '&lt;a class="aria-label prevent-default" role="region" href="#"&gt;'text&lt;/a&gt;
  
######EXCLUDED
####.a11y-ignore
Put this class on a tag so that a11y will ignore it for tabindex changes in a11y_only, a11y_popup and a11y_popdown.  
  
####.a11y-ignore-focus
Put this class on a tag so that a11y will ignore it if it is the first item in focus when using a11y_focus.  
  
  
######SPECIAL CLASSES
####.prevent-default  
Put this class on any tag which should have no click behaviour. This class is applied to all accessible text blocks created by a11y_text and a11y_aria_label. This will prevent the default behaviour on click.    
  
####.accessible-text-block  
Put this class on any tag which may (in the future) require differing contrasts. This class is currently applied to all
accessible text blocks created by a11y_text.


######INTERNALLY APPLIED
####.aria-hidden
Class applied to elements which have been specifically hidden to screen readers  
  
####.a11y-selected  
Class applied to elements which have been selected with a11y_selected  
  
#### \#a11y-focusguard  
Style applied to the focusguard element which returns the user to the top of the document  
  
#### \#a11y-focusguard.touch  
Style applied to the focusguard element which forces it to remain at the bottom of the document on touch screen devices. This is as any readable text is focusable when inview on a tablet using the screen reader's cursor.  

#### \#a11y-focusguard.notouch
Style applied to the focusguard element which forces it to be fixed to the bottom of the window on desktops. This is desktops tend to scroll to the bottom of the screen when the focus wraps around. This is sometimes not expected behaviour. 

#### \#a11y-selected
Style applied to the non-focusable element at the bottom of each page which facilitates selection alerts.


