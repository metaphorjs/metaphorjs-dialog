module.exports = function (window) {
"use strict";
var Observable = require('metaphorjs-observable');
var Promise = require('metaphorjs-promise');
var ajax = require('metaphorjs-ajax')(window);
var select = require('metaphorjs-select')(window);
var animate = require('metaphorjs-animate')(window);


var slice = Array.prototype.slice;

var toString = Object.prototype.toString;

var undf = undefined;




var varType = function(){

    var types = {
        '[object String]': 0,
        '[object Number]': 1,
        '[object Boolean]': 2,
        '[object Object]': 3,
        '[object Function]': 4,
        '[object Array]': 5,
        '[object RegExp]': 9,
        '[object Date]': 10
    };


    /**
     * 'string': 0,
     * 'number': 1,
     * 'boolean': 2,
     * 'object': 3,
     * 'function': 4,
     * 'array': 5,
     * 'null': 6,
     * 'undefined': 7,
     * 'NaN': 8,
     * 'regexp': 9,
     * 'date': 10,
     * unknown: -1
     * @param {*} value
     * @returns {number}
     */
    return function varType(val) {

        if (!val) {
            if (val === null) {
                return 6;
            }
            if (val === undf) {
                return 7;
            }
        }

        var num = types[toString.call(val)];

        if (num === undf) {
            return -1;
        }

        if (num == 1 && isNaN(val)) {
            return 8;
        }

        return num;
    };

}();



function isPlainObject(value) {
    // IE < 9 returns [object Object] from toString(htmlElement)
    return typeof value == "object" &&
           varType(value) === 3 &&
            !value.nodeType &&
            value.constructor === Object;

};

function isBool(value) {
    return value === true || value === false;
};




var extend = function(){

    /**
     * @param {Object} dst
     * @param {Object} src
     * @param {Object} src2 ... srcN
     * @param {boolean} override = false
     * @param {boolean} deep = false
     * @returns {object}
     */
    var extend = function extend() {


        var override    = false,
            deep        = false,
            args        = slice.call(arguments),
            dst         = args.shift(),
            src,
            k,
            value;

        if (isBool(args[args.length - 1])) {
            override    = args.pop();
        }
        if (isBool(args[args.length - 1])) {
            deep        = override;
            override    = args.pop();
        }

        while (args.length) {
            if (src = args.shift()) {
                for (k in src) {

                    if (src.hasOwnProperty(k) && (value = src[k]) !== undf) {

                        if (deep) {
                            if (dst[k] && isPlainObject(dst[k]) && isPlainObject(value)) {
                                extend(dst[k], value, override, deep);
                            }
                            else {
                                if (override === true || dst[k] == undf) { // == checks for null and undefined
                                    if (isPlainObject(value)) {
                                        dst[k] = {};
                                        extend(dst[k], value, override, true);
                                    }
                                    else {
                                        dst[k] = value;
                                    }
                                }
                            }
                        }
                        else {
                            if (override === true || dst[k] == undf) {
                                dst[k] = value;
                            }
                        }
                    }
                }
            }
        }

        return dst;
    };

    return extend;
}();


var nextUid = function(){
    var uid = ['0', '0', '0'];

    // from AngularJs
    /**
     * @returns {String}
     */
    return function nextUid() {
        var index = uid.length;
        var digit;

        while(index) {
            index--;
            digit = uid[index].charCodeAt(0);
            if (digit == 57 /*'9'*/) {
                uid[index] = 'A';
                return uid.join('');
            }
            if (digit == 90  /*'Z'*/) {
                uid[index] = '0';
            } else {
                uid[index] = String.fromCharCode(digit + 1);
                return uid.join('');
            }
        }
        uid.unshift('0');
        return uid.join('');
    };
}();


/**
 * @param {Function} fn
 * @param {*} context
 */
var bind = Function.prototype.bind ?
              function(fn, context){
                  return fn.bind(context);
              } :
              function(fn, context) {
                  return function() {
                      return fn.apply(context, arguments);
                  };
              };



var getRegExp = function(){

    var cache = {};

    /**
     * @param {String} expr
     * @returns RegExp
     */
    return function getRegExp(expr) {
        return cache[expr] || (cache[expr] = new RegExp(expr));
    };
}();



/**
 * @param {String} cls
 * @returns {RegExp}
 */
function getClsReg(cls) {
    return getRegExp('(?:^|\\s)'+cls+'(?!\\S)');
};



/**
 * @param {Element} el
 * @param {String} cls
 * @returns {boolean}
 */
function hasClass(el, cls) {
    return cls ? getClsReg(cls).test(el.className) : false;
};



/**
 * @param {Element} el
 * @param {String} cls
 */
function addClass(el, cls) {
    if (cls && !hasClass(el, cls)) {
        el.className += " " + cls;
    }
};



/**
 * @param {Element} el
 * @param {String} cls
 */
function removeClass(el, cls) {
    if (cls) {
        el.className = el.className.replace(getClsReg(cls), '');
    }
};



/**
 * @param {*} value
 * @returns {boolean}
 */
function isArray(value) {
    return typeof value == "object" && varType(value) === 5;
};




var data = function(){

    var dataCache   = {},

        getNodeId   = function(el) {
            return el._mjsid || (el._mjsid = nextUid());
        };

    /**
     * @param {Element} el
     * @param {String} key
     * @param {*} value optional
     */
    return function data(el, key, value) {
        var id  = getNodeId(el),
            obj = dataCache[id];

        if (value !== undf) {
            if (!obj) {
                obj = dataCache[id] = {};
            }
            obj[key] = value;
            return value;
        }
        else {
            return obj ? obj[key] : undf;
        }
    };

}();

function getAttr(el, name) {
    return el.getAttribute ? el.getAttribute(name) : null;
};

function setAttr(el, name, value) {
    return el.setAttribute(name, value);
};

function removeAttr(el, name) {
    return el.removeAttribute(name);
};

function returnFalse() {
    return false;
};


function returnTrue() {
    return true;
};

function isNull(value) {
    return value === null;
};



// from jQuery

var DomEvent = function(src) {

    if (src instanceof DomEvent) {
        return src;
    }

    // Allow instantiation without the 'new' keyword
    if (!(this instanceof DomEvent)) {
        return new DomEvent(src);
    }


    var self    = this;

    for (var i in src) {
        if (!self[i]) {
            try {
                self[i] = src[i];
            }
            catch (thrownError){}
        }
    }


    // Event object
    self.originalEvent = src;
    self.type = src.type;

    if (!self.target && src.srcElement) {
        self.target = src.srcElement;
    }


    var eventDoc, doc, body,
        button = src.button;

    // Calculate pageX/Y if missing and clientX/Y available
    if (self.pageX === undf && !isNull(src.clientX)) {
        eventDoc = self.target ? self.target.ownerDocument || window.document : window.document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        self.pageX = src.clientX +
                      ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
                      ( doc && doc.clientLeft || body && body.clientLeft || 0 );
        self.pageY = src.clientY +
                      ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
                      ( doc && doc.clientTop  || body && body.clientTop  || 0 );
    }

    // Add which for click: 1 === left; 2 === middle; 3 === right
    // Note: button is not normalized, so don't use it
    if ( !self.which && button !== undf ) {
        self.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
    }

    // Events bubbling up the document may have been marked as prevented
    // by a handler lower down the tree; reflect the correct value.
    self.isDefaultPrevented = src.defaultPrevented ||
                              src.defaultPrevented === undf &&
                                  // Support: Android<4.0
                              src.returnValue === false ?
                              returnTrue :
                              returnFalse;


    // Create a timestamp if incoming event doesn't have one
    self.timeStamp = src && src.timeStamp || (new Date).getTime();
};

// Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
extend(DomEvent.prototype, {

    isDefaultPrevented: returnFalse,
    isPropagationStopped: returnFalse,
    isImmediatePropagationStopped: returnFalse,

    preventDefault: function() {
        var e = this.originalEvent;

        this.isDefaultPrevented = returnTrue;
        e.returnValue = false;

        if ( e && e.preventDefault ) {
            e.preventDefault();
        }
    },
    stopPropagation: function() {
        var e = this.originalEvent;

        this.isPropagationStopped = returnTrue;

        if ( e && e.stopPropagation ) {
            e.stopPropagation();
        }
    },
    stopImmediatePropagation: function() {
        var e = this.originalEvent;

        this.isImmediatePropagationStopped = returnTrue;

        if ( e && e.stopImmediatePropagation ) {
            e.stopImmediatePropagation();
        }

        this.stopPropagation();
    }
}, true, false);




function normalizeEvent(originalEvent) {
    return new DomEvent(originalEvent);
};


// from jquery.mousewheel plugin



var mousewheelHandler = function(e) {

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    var toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
                 ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        nullLowestDeltaTimeout, lowestDelta;

    var mousewheelHandler = function(fn) {

        return function(e) {

            var event = normalizeEvent(e || window.event),
                args = slice.call(arguments, 1),
                delta = 0,
                deltaX = 0,
                deltaY = 0,
                absDelta = 0,
                offsetX = 0,
                offsetY = 0;


            event.type = 'mousewheel';

            // Old school scrollwheel delta
            if ('detail'      in event) { deltaY = event.detail * -1; }
            if ('wheelDelta'  in event) { deltaY = event.wheelDelta; }
            if ('wheelDeltaY' in event) { deltaY = event.wheelDeltaY; }
            if ('wheelDeltaX' in event) { deltaX = event.wheelDeltaX * -1; }

            // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
            if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
                deltaX = deltaY * -1;
                deltaY = 0;
            }

            // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
            delta = deltaY === 0 ? deltaX : deltaY;

            // New school wheel delta (wheel event)
            if ('deltaY' in event) {
                deltaY = event.deltaY * -1;
                delta = deltaY;
            }
            if ('deltaX' in event) {
                deltaX = event.deltaX;
                if (deltaY === 0) { delta = deltaX * -1; }
            }

            // No change actually happened, no reason to go any further
            if (deltaY === 0 && deltaX === 0) { return; }

            // Store lowest absolute delta to normalize the delta values
            absDelta = Math.max(Math.abs(deltaY), Math.abs(deltaX));

            if (!lowestDelta || absDelta < lowestDelta) {
                lowestDelta = absDelta;

                // Adjust older deltas if necessary
                if (shouldAdjustOldDeltas(event, absDelta)) {
                    lowestDelta /= 40;
                }
            }

            // Adjust older deltas if necessary
            if (shouldAdjustOldDeltas(event, absDelta)) {
                // Divide all the things by 40!
                delta /= 40;
                deltaX /= 40;
                deltaY /= 40;
            }

            // Get a whole, normalized value for the deltas
            delta = Math[delta >= 1 ? 'floor' : 'ceil'](delta / lowestDelta);
            deltaX = Math[deltaX >= 1 ? 'floor' : 'ceil'](deltaX / lowestDelta);
            deltaY = Math[deltaY >= 1 ? 'floor' : 'ceil'](deltaY / lowestDelta);

            // Normalise offsetX and offsetY properties
            if (this.getBoundingClientRect) {
                var boundingRect = this.getBoundingClientRect();
                offsetX = event.clientX - boundingRect.left;
                offsetY = event.clientY - boundingRect.top;
            }

            // Add information to the event object
            event.deltaX = deltaX;
            event.deltaY = deltaY;
            event.deltaFactor = lowestDelta;
            event.offsetX = offsetX;
            event.offsetY = offsetY;
            // Go ahead and set deltaMode to 0 since we converted to pixels
            // Although this is a little odd since we overwrite the deltaX/Y
            // properties with normalized deltas.
            event.deltaMode = 0;

            // Add event and delta to the front of the arguments
            args.unshift(event, delta, deltaX, deltaY);

            // Clearout lowestDelta after sometime to better
            // handle multiple device types that give different
            // a different lowestDelta
            // Ex: trackpad = 3 and mouse wheel = 120
            if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
            nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);



            return fn.apply(this, args);
        }
    };

    mousewheelHandler.events = function() {
        var doc = window.document;
        return ( 'onwheel' in doc || doc.documentMode >= 9 ) ?
               ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
    };

    return mousewheelHandler;

}();



var addListener = function(){

    var fn = null,
        prefix = null;

    return function addListener(el, event, func) {

        if (fn === null) {
            fn = el.attachEvent ? "attachEvent" : "addEventListener";
            prefix = el.attachEvent ? "on" : "";
        }


        if (event == "mousewheel") {
            func = mousewheelHandler(func);
            var events = mousewheelHandler.events(),
                i, l;
            for (i = 0, l = events.length; i < l; i++) {
                el[fn](prefix + events[i], func, false);
            }
        }
        else {
            el[fn](prefix + event, func, false);
        }

        return func;
    }

}();


var removeListener = function(){

    var fn = null,
        prefix = null;

    return function removeListener(el, event, func) {

        if (fn === null) {
            fn = el.detachEvent ? "detachEvent" : "removeEventListener";
            prefix = el.detachEvent ? "on" : "";
        }

        el[fn](prefix + event, func);
    }
}();
/**
 * @param {Element} el
 * @returns {boolean}
 */
function isVisible(el) {
    return !(el.offsetWidth <= 0 || el.offsetHeight <= 0);
};



/**
 * @param {Element} el
 * @param {String} selector
 * @returns {boolean}
 */
var is = select.is;



function isString(value) {
    return typeof value == "string" || value === ""+value;
    //return typeof value == "string" || varType(value) === 0;
};

function isFunction(value) {
    return typeof value == 'function';
};



function isNumber(value) {
    return varType(value) === 1;
};

function ucfirst(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
};



var getScrollTopOrLeft = function(vertical) {

    var defaultST,
        wProp = vertical ? "pageYOffset" : "pageXOffset",
        sProp = vertical ? "scrollTop" : "scrollLeft",
        doc = window.document,
        body = doc.body,
        html = doc.documentElement;

    if(window[wProp] !== undf) {
        //most browsers except IE before #9
        defaultST = function(){
            return window[wProp];
        };
    }
    else{
        if (html.clientHeight) {
            defaultST = function() {
                return html[sProp];
            };
        }
        else {
            defaultST = function() {
                return body[sProp];
            };
        }
    }

    return function(node) {
        if (!node || node === window) {
            return defaultST();
        }
        else if (node && node.nodeType == 1 &&
            node !== body && node !== html) {
            return node[sProp];
        }
        else {
            return defaultST();
        }
    }

};



var getScrollTop = getScrollTopOrLeft(true);



var getScrollLeft = getScrollTopOrLeft(false);

var isAttached = function(){
    var isAttached = function isAttached(node) {

        if (node === window) {
            return true;
        }
        if (node.nodeType == 3) {
            if (node.parentElement) {
                return isAttached(node.parentElement);
            }
            else {
                return true;
            }
        }

        var html = window.document.documentElement;

        return node === html ? true : html.contains(node);
    };
    return isAttached;
}();



function getOffset(node) {

    var box = {top: 0, left: 0},
        html = window.document.documentElement;

    // Make sure it's not a disconnected DOM node
    if (!isAttached(node) || node === window) {
        return box;
    }

    // Support: BlackBerry 5, iOS 3 (original iPhone)
    // If we don't have gBCR, just use 0,0 rather than error
    if (node.getBoundingClientRect ) {
        box = node.getBoundingClientRect();
    }

    return {
        top: box.top + getScrollTop() - html.clientTop,
        left: box.left + getScrollLeft() - html.clientLeft
    };
};

/*!window!*/

var getStyle = function(node, prop, numeric) {

    var style, val;

    if (window.getComputedStyle) {

        if (node === window) {
            return prop? (numeric ? 0 : null) : {};
        }
        style = getComputedStyle(node, null);
        val = prop ? style[prop] : style;
    }
    else {
        style = node.currentStyle || node.style || {};
        val = prop ? style[prop] : style;
    }

    return numeric ? parseFloat(val) || 0 : val;

};



var boxSizingReliable = function() {

    var boxSizingReliableVal;

    var computePixelPositionAndBoxSizingReliable = function() {

        var doc = window.document,
            container = doc.createElement("div"),
            div = doc.createElement("div"),
            body = doc.body;

        if (!div.style || !window.getComputedStyle) {
            return false;
        }

        container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;" +
                                  "position:absolute";
        container.appendChild(div);

        div.style.cssText =
            // Support: Firefox<29, Android 2.3
            // Vendor-prefix box-sizing
        "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
        "box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
        "border:1px;padding:1px;width:4px;position:absolute";
        div.innerHTML = "";
        body.appendChild(container);

        var divStyle = window.getComputedStyle(div, null),
            ret = divStyle.width === "4px";

        body.removeChild(container);

        return ret;
    };

    return function boxSizingReliable() {
        if (boxSizingReliableVal === undf) {
            boxSizingReliableVal = computePixelPositionAndBoxSizingReliable();
        }

        return boxSizingReliableVal;
    };
}();

// from jQuery



var getDimensions = function(type, name) {

    var rnumnonpx = new RegExp( "^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(?!px)[a-z%]+$", "i"),
        cssExpand = [ "Top", "Right", "Bottom", "Left" ],
        defaultExtra = !type ? "content" : (type == "inner" ? "padding" : "");

    var augmentWidthOrHeight = function(elem, name, extra, isBorderBox, styles) {
        var i = extra === (isBorderBox ? "border" : "content") ?
                // If we already have the right measurement, avoid augmentation
                4 :
                // Otherwise initialize for horizontal or vertical properties
                name === "width" ? 1 : 0,

            val = 0;

        for (; i < 4; i += 2) {
            // Both box models exclude margin, so add it if we want it
            if (extra === "margin") {
                val += parseFloat(styles[extra + cssExpand[i]]);
            }

            if (isBorderBox) {
                // border-box includes padding, so remove it if we want content
                if (extra === "content") {
                    val -= parseFloat(styles["padding" + cssExpand[i]]);
                }

                // At this point, extra isn't border nor margin, so remove border
                if (extra !== "margin") {
                    val -= parseFloat(styles["border" + cssExpand[i] + "Width"]);
                }
            } else {
                // At this point, extra isn't content, so add padding
                val += parseFloat(styles["padding" + cssExpand[i]]);

                // At this point, extra isn't content nor padding, so add border
                if (extra !== "padding") {
                    val += parseFloat(styles["border" + cssExpand[i] + "Width"]);
                }
            }
        }

        return val;
    };

    var getWidthOrHeight = function(elem, name, extra, styles) {

        // Start with offset property, which is equivalent to the border-box value
        var valueIsBorderBox = true,
            val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
            isBorderBox = styles["boxSizing"] === "border-box";

        // Some non-html elements return undefined for offsetWidth, so check for null/undefined
        // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
        // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
        if ( val <= 0 || val == null ) {
            val = elem.style[name];

            // Computed unit is not pixels. Stop here and return.
            if (rnumnonpx.test(val)) {
                return val;
            }

            // Check for style in case a browser which returns unreliable values
            // for getComputedStyle silently falls back to the reliable elem.style
            valueIsBorderBox = isBorderBox &&
                               (boxSizingReliable() || val === elem.style[name]);

            // Normalize "", auto, and prepare for extra
            val = parseFloat(val) || 0;
        }

        // Use the active box-sizing model to add/subtract irrelevant styles
        return val +
                 augmentWidthOrHeight(
                     elem,
                     name,
                     extra || (isBorderBox ? "border" : "content"),
                     valueIsBorderBox,
                     styles
                 );
    };


    return function getDimensions(elem, margin) {

        if (elem === window) {
            return elem.document.documentElement["client" + name];
        }

        // Get document width or height
        if (elem.nodeType === 9) {
            var doc = elem.documentElement;

            // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
            // whichever is greatest
            return Math.max(
                elem.body["scroll" + name], doc["scroll" + name],
                elem.body["offset" + name], doc["offset" + name],
                doc["client" + name]
            );
        }

        return getWidthOrHeight(
            elem,
            name.toLowerCase(),
            defaultExtra || (margin === true ? "margin" : "border"),
            getStyle(elem)
        );
    };

};



var getOuterWidth = getDimensions("outer", "Width");



var getOuterHeight = getDimensions("outer", "Height");

var delegates = {};




function delegate(el, selector, event, fn) {

    var key = selector + "-" + event,
        listener    = function(e) {
            e = normalizeEvent(e);
            if (is(e.target, selector)) {
                return fn(e);
            }
            return null;
        };

    if (!delegates[key]) {
        delegates[key] = [];
    }

    delegates[key].push({el: el, ls: listener, fn: fn});

    addListener(el, event, listener);
};



function undelegate(el, selector, event, fn) {

    var key = selector + "-" + event,
        i, l,
        ds;

    if (ds = delegates[key]) {
        for (i = -1, l = ds.length; ++i < l;) {
            if (ds[i].el === el && ds[i].fn === fn) {
                removeListener(el, event, ds[i].ls);
            }
        }
    }
};

var strUndef = "undefined";



var raf = function() {

    var raf,
        cancel;

    if (typeof window != strUndef) {
        var w   = window;
        raf     = w.requestAnimationFrame ||
                    w.webkitRequestAnimationFrame ||
                    w.mozRequestAnimationFrame;
        cancel  = w.cancelAnimationFrame ||
                    w.webkitCancelAnimationFrame ||
                    w.mozCancelAnimationFrame ||
                    w.webkitCancelRequestAnimationFrame;

        if (raf) {
            return function(fn) {
                var id = raf(fn);
                return function() {
                    cancel(id);
                };
            };
        }
    }

    return function(fn) {
        var id = setTimeout(fn, 0);
        return function() {
            clearTimeout(id);
        }
    };
}();
/**
 * @param {Function} fn
 * @param {Object} context
 * @param {[]} args
 * @param {number} timeout
 */
function async(fn, context, args, timeout) {
    return setTimeout(function(){
        fn.apply(context, args || []);
    }, timeout || 0);
};





/**
 * @class MetaphorJs.lib.Dialog
 * @extends MetaphorJs.lib.Observable
 * @version 1.0
 * @author johann kuindji
 * @link https://github.com/kuindji/jquery-dialog
 * @link http://kuindji.com/js/dialog/demo/index.html
 */
var Dialog = function(){

    

    var css             = function(el, props) {
            var style = el.style,
                i;
            for (i in props) {
                style[i] = props[i];
            }
        },

        opposite    = {t: "b", r: "l", b: "t", l: "r"},
        names       = {t: 'top', r: 'right', b: 'bottom', l: 'left'},
        sides       = {t: ['l','r'], r: ['t','b'], b: ['r','l'], l: ['b','t']},

        ie6         = null;

    /*
     * Manager
     */
    var manager     = function() {

        var all     = {},
            groups  = {};

        return {

            register: function(dialog) {

                var id      = dialog.getInstanceId(),
                    grps    = dialog.getGroup(),
                    i, len,
                    g;

                all[id]     = dialog;

                for (i = 0, len = grps.length; i < len; i++) {
                    g   = grps[i];
                    if (!groups[g]) {
                        groups[g]   = {};
                    }
                    groups[g][id] = true;
                }

                dialog.on("destroy", this.unregister, this);
            },

            unregister: function(dialog) {

                var id  = dialog.getInstanceId();
                delete all[id];
            },

            hideAll: function(dialog) {

                var id      = dialog.getInstanceId(),
                    grps    = dialog.getGroup(),
                    i, len, gid,
                    ds, did;

                for (i = 0, len = grps.length; i < len; i++) {
                    gid     = grps[i];
                    ds      = groups[gid];
                    for (did in ds) {
                        if (!all[did]) {
                            delete ds[did];
                        }
                        else if (did != id && !all[did].isHideAllIgnored()) {
                            all[did].hide(null, true, true);
                        }
                    }
                }
            }
        };
    }();




    /*
     * Pointer
     */
    var Pointer     = function(dlg, cfg, inner) {

        if (ie6 === null) {
            ie6 = window.document.all && !window.XMLHttpRequest
        }

        var el,
            self    = this,
            sub,
            defaultProps = {
                backgroundColor: 'transparent',
                width: 			'0px',
                height: 		'0px',
                position: 		'absolute',
                fontSize: 	    '0px', // ie6
                lineHeight:     '0px' // ie6
            },
            size    = cfg.size,
            width   = cfg.width || size * 2;

        extend(self, {

            init: function() {
                if (cfg.border) {
                    self.createInner();
                }
            },

            getEl: function() {
                return el;
            },

            getDialogPositionOffset: function() {
                var pp  = (self.detectPointerPosition() || "").substr(0,1),
                    dp  = (dlg.getCfg().position.type || "").replace(/(w|m|c)/, "").substr(0,1),
                    ofs = {x: 0, y: 0};

                if (pp == opposite[dp]) {
                    ofs[pp == "t" || pp == "b" ? "y" : "x"] =
                        pp == "b" || pp == "r" ? -size : size;
                }

                return ofs;
            },

            createInner: function() {
                var newcfg 		= extend({}, cfg);
                newcfg.size 	= size - (cfg.border*2);
                newcfg.width	= width - (cfg.border*4);

                newcfg.border = null;
                newcfg.borderColor = null;
                newcfg.borderCls = null;
                newcfg.offset = null;

                sub = new Pointer(dlg, newcfg, cfg.border);
            },

            detectPointerPosition: function() {
                if (cfg.position) {
                    return cfg.position;
                }
                var pri = (dlg.getCfg().position.type || "").replace(/(w|m|c)/, "").substr(0,1);

                if (!pri) {
                    return null;
                }

                return opposite[pri];
            },

            detectPointerDirection: function(position) {
                if (cfg.direction) {
                    return cfg.direction;
                }
                return position;
            },

            getBorders: function(position, direction, color) {

                var borders 	= {},
                    pri 		= position.substr(0,1),
                    dpri        = direction.substr(0,1),
                    dsec        = direction.substr(1),
                    style       = ie6 ? "dotted" : "solid";

                // in ie6 "solid" wouldn't make transparency :(

                // this is always height : border which is opposite to direction
                borders['border'+ucfirst(names[opposite[pri]])] = size + "px solid "+color;
                // border which is similar to direction is always 0
                borders['border'+ucfirst(names[pri])] = "0 "+style+" transparent";

                if (!dsec) {
                    // if pointer's direction matches pointer primary position (p: l|lt|lb, d: l)
                    // then we set both side borders to a half of the width;
                    var side = Math.floor(width/2);
                    borders['border' + ucfirst(names[sides[dpri][0]])] = side + "px "+style+" transparent";
                    borders['border' + ucfirst(names[sides[dpri][1]])] = side + "px "+style+" transparent";
                }
                else {
                    // if pointer's direction doesn't match with primary position (p: l|lt|lb, d: t|b)
                    // we set the border opposite to direction to the full width;
                    borders['border'+ucfirst(names[dsec])] = "0 solid transparent";
                    borders['border'+ucfirst(names[opposite[dsec]])] = width + "px "+style+" transparent";
                }

                return borders;
            },

            getOffsets: function(position, direction) {

                var offsets = {},
                    pri		= position.substr(0,1),
                    auto 	= (pri == 't' || pri == 'b') ? "r" : "b";

                // custom element
                if (!size) {
                    window.document.body.appendChild(el);
                    switch (pri) {
                        case "t":
                        case "b": {
                            size = getOuterHeight(el);
                            width = getOuterWidth(el);
                            break;
                        }
                        case "l":
                        case "r": {
                            width = getOuterHeight(el);
                            size = getOuterWidth(el);
                            break;
                        }
                    }
                }

                offsets[names[pri]] = inner ? 'auto' : -size+"px";
                offsets[names[auto]] = "auto";

                if (!inner) {

                    var margin;

                    switch (position) {
                        case 't': case 'r': case 'b': case 'l': {
                            if (direction != position) {
                                if (direction == 'l' || direction == 't') {
                                    margin = cfg.offset;
                                }
                                else {
                                    margin = -width + cfg.offset;
                                }
                            }
                            else {
                                margin = -width/2 + cfg.offset;
                            }
                            break;
                        }
                        case 'bl': case 'tl': case 'lt': case 'rt': {
                            margin = cfg.offset;
                            break;
                        }
                        default: {
                            margin = -width - cfg.offset;
                            break;
                        }
                    }

                    offsets['margin' + ucfirst(names[opposite[auto]])] = margin + "px";

                    var positionOffset;

                    switch (position) {
                        case 't': case 'r': case 'b': case 'l': {
                            positionOffset = '50%';
                            break;
                        }
                        case 'tr': case 'rb': case 'br': case 'lb': {
                            positionOffset = '100%';
                            break;
                        }
                        default: {
                            positionOffset = 0;
                            break;
                        }
                    }

                    offsets[names[opposite[auto]]]  = positionOffset;
                }
                else {

                    var innerOffset,
                        dpri    = direction.substr(0, 1),
                        dsec    = direction.substr(1);

                    if (dsec) {
                        if (dsec == 'l' || dsec == 't') {
                            innerOffset = inner + 'px';
                        }
                        else {
                            innerOffset = -width - inner + 'px';
                        }
                    }
                    else {
                        innerOffset = Math.floor(-width / 2) + 'px';
                    }

                    offsets[names[opposite[auto]]]  = innerOffset;
                    offsets[names[opposite[dpri]]] = -(size + (inner * 2)) + 'px';
                }


                return offsets;
            },

            render: function() {

                if (el) {
                    return;
                }

                var position    = self.detectPointerPosition();
                if (!position) {
                    return;
                }

                if (!cfg.el) {

                    var direction   = self.detectPointerDirection(position);

                    el          = window.document.createElement('div');
                    var cmt     = window.document.createComment(" ");

                    el.appendChild(cmt);

                    css(el, defaultProps);
                    css(el, self.getBorders(position, direction, cfg.borderColor || cfg.color));
                    css(el, self.getOffsets(position, direction));

                    addClass(el, cfg.borderCls || cfg.cls);

                    if (sub) {
                        sub.render();
                        el.appendChild(sub.getEl());
                    }
                    if (!inner) {
                        dlg.getElem().appendChild(el);
                    }
                }
                else {
                    if (isString(cfg.el)) {
                        var tmp = window.document.createElement("div");
                        tmp.innerHTML = cfg.el;
                        el = tmp.firstChild;
                    }
                    else {
                        el  = cfg.el;
                    }

                    css(el, {position: "absolute"});
                    css(el, self.getOffsets(position));
                    addClass(el, cfg.cls);

                    dlg.getElem().appendChild(el);
                }
            },

            destroy: function() {

                self.remove();
                self    = null;
                sub     = null;
                dlg     = null;
                cfg     = null;
                inner   = null;
            },

            remove: function() {
                if (sub) {
                    sub.remove();
                }
                if (el) {
                    el.parentNode.removeChild(el);
                    el = null;
                }
            }

        }, true, false);

        self.init();

        return self;
    };




    /*
     * Shorthands
     */
    var fixShorthands   = function(options) {

        if (!options) {
            return {};
        }

        var fix = function(level1, level2, type) {
            var value   = options[level1],
                yes     = false;

            if (value === undf) {
                return;
            }

            switch (type) {
                case "string": {
                    yes     = isString(value);
                    break;
                }
                case "function": {
                    yes     = isFunction(value);
                    break;
                }
                case "number": {
                    yes     = isNumber(value) || value == parseInt(value);
                    break;
                }
                case "dom": {
                    yes     = value && (value.tagName || value.nodeName) ? true : false;
                    break;
                }
                case "jquery": {
                    yes     = value && value.jquery ? true : false;
                    if (yes) {
                        value = value.get(0);
                    }
                    break;
                }
                case "boolean": {
                    if (value === true || value === false) {
                        yes = true;
                    }
                    break;
                }
                default: {
                    if (type === true && value === true) {
                        yes = true;
                    }
                    if (type === false && value === false) {
                        yes = true;
                    }
                }
            }
            if (yes) {
                options[level1] = {};
                options[level1][level2] = value;
            }
        };

        fix("content", "value", "string");
        fix("content", "value", "boolean");
        fix("content", "fn", "function");
        fix("ajax", "url", "string");
        fix("cls", "dialog", "string");
        fix("render", "tpl", "string");
        fix("render", "fn", "function");
        fix("render", "el", "dom");
        fix("render", "el", "jquery");
        fix("show", "events", false);
        fix("show", "events", "string");
        fix("hide", "events", false);
        fix("hide", "events", "string");
        fix("toggle", "events", false);
        fix("toggle", "events", "string");
        fix("position", "type", "string");
        fix("position", "type", false);
        fix("position", "get", "function");
        fix("overlay", "enabled", "boolean");
        fix("pointer", "position", "string");
        fix("pointer", "size", "number");

        return options;
    };





    /**
     * @type {object}
     * @md-tmp defaults
     * @md-stack add
     */
    var defaults    = /*options-start*/{

        /**
         * Target element(s) which trigger dialog's show and hide.<br>
         * If {Element}: will be used as a single target,<br>
         * if selector: will be used as dynamic target.<br>
         * Dynamic targets work like this:<br>
         * you provide delegates: {someElem: {click: someClass}} -- see "show" function<br>
         * when show() is called, target will be determined from the event using
         * the selector.
         * @type {string|Element}
         */
        target:         null,

        /*debug-start*/
        /**
         * Log all critical exits; stripped out in minified version
         * @type {bool}
         */
        debug:          false,
        /*debug-end*/

        /**
         * One or more group names.
         * @type {string|array}
         */
        group:          null,

        /**
         * If dialog is modal, overlay will be forcefully enabled.
         * @type {bool}
         */
        modal:			false,

        /**
         * Use link's href attribute as ajax.url or as render.el
         * @type {bool}
         */
        useHref:        false,


        /**
         * If neither content value nor ajax url are provided,
         * plugin will try to read target's attribute values: 'tooltip', 'title' and 'alt'.
         * (unless attr is specified).<br>
         * <em>shorthand</em>: string -> content.value<br>
         * <em>shorthand</em>: false -> content.value<br>
         * <em>shorthand</em>: function -> content.fn<br>
         * @type {object|string|function}
         * @md-stack add
         */
        content: {

            /**
             * Dialog's text content. Has priority before readContent/loadContent.
             * If set to false, no content will be automatically set whether via fn() or attributes.
             * @type {string|boolean}
             */
            value: 			'',

            /**
             * Must return content value
             * @function
             * @param {Element} target
             * @param {MetaphorJs.lib.Dialog} dialog
             * @returns string
             */
            fn:				null,

            /**
             * This function receives new content and returns string value (processed content).
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {string} mode
             *      empty string - content has come from content.value or setContent()<br>
             *      'attribute' - content has been read from target attributes<br>
             *      'ajax' - data returned by ajax request
             *      @default '' | 'attribute' | 'ajax'
             *
             * @param {string} content
             * @returns string
             */
            prepare:		null,

            /**
             * Get content from this attribute (belongs to target)
             * @type {string}
             * @md-stack remove
             */
            attr:           null
        },


        /**
         * All these options are passed to $.ajax().
         * You can provide more options in this section
         * but 'success' will be overriden (use content.prepare for data processing).<br>
         * <em>shorthand</em>: string -> ajax.url
         * @type {string|object}
         * @md-stack add
         */
        ajax: {

            /**
             * Url to load content from.
             * @type {string}
             */
            url: 			null,

            /**
             * Pass this data along with xhr.
             * @type {object}
             */
            data: 			null,

            /**
             * @type {string}
             */
            dataType: 		'text',

            /**
             * @type {string}
             * @md-stack remove
             */
            method: 		'GET'
        },

        /**
         * Classes to apply to the dialog.
         * <em>shorthand</em>: string -> cls.dialog
         * @type {string|object}
         * @md-stack add
         */
        cls: {
            /**
             * Base class.
             * @type {string}
             */
            dialog:         null,
            /**
             * Only applied when dialog is visible.
             * @type {string}
             */
            visible:        null,
            /**
             * Only applied when dialog is hidden.
             * @type {string}
             */
            hidden:         null,
            /**
             * Only applied when dialog is performing ajax request.
             * @type {string}
             * @md-stack remove
             */
            loading:        null
        },

        /**
         * <p>Selector is used when dialog has inner structure and you
         * want to change its content.</p>
         * <pre><code class="language-javascript">
         * {
         *      render: {
         *          tpl: '&lt;div&gt;&lt;div class=&quot;content&quot;&gt;&lt;/div&gt;&lt;/div&gt;'
         *      },
         *      selector: {
         *          content: '.content'
         *      }
         * }
         * </code></pre>
         * <p>If no selector provided, setContent will replace all inner html.
         * Another thing relates to structurally complex content:</p>
         *
         * <pre><code class="language-javascript">
         * setContent({title: "...", body: "..."});
         * selector: {
         *      title:  ".title",
         *      body:   ".body"
         * }
         * </code></pre>
         * @type {object}
         * @md-stack add
         */
        selector:           {
            /**
             * Dialog's content selector.
             * @type {string}
             * @md-stack remove
             */
            content:        null
        },

        /**
         * Object {buttonId: selector}
         * @type {object|null}
         */
        buttons: null,


        /**
         * <p><em>shorthand</em>: string -> render.tpl<br>
         * <em>shorthand</em>: function -> render.fn<br>
         * <em>shorthand</em>: dom element -> render.el<br>
         * @type {object|string|function|Element}
         * @md-stack add
         */
        render: {
            /**
             * Dialog's template
             * @type {string}
             */
            tpl: 			'<div></div>',

            /**
             * Call this function to get dialog's template.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @returns {string|Element}
             */
            fn: 			null,

            /**
             * Selector or existing element instead of template.
             * @type {string|Element}
             */
            el: 			null,

            /**
             * Apply this zIndex.
             * @type {number}
             */
            zIndex:			null,

            /**
             * false - render immediately, true - wait for the first event.
             * @type {bool}
             */
            lazy: 			true,

            /**
             * Object to pass to elem.css()
             * @type {object}
             */
            style:          null,

            /**
             * If set, the element will be appended to specified container.<br>
             * If set to false, element will not be appended anywhere (works with "el").
             * @type {string|Element|bool}
             */
            appendTo:		null,

            /**
             * Dialog's id attribute.
             * @type {string}
             */
            id:				null,

            /**
             * If set to true, element's show() and hide() will never be called. Use
             * "visible" and "hidden" classes instead.
             * @type {boolean}
             */
            keepVisible:    false,

            /**
             * When destroying dialog's elem, keep it in DOM.
             * Useful when you return it in fn() on every show()
             * and have lifetime = 0.
             * @type {boolean}
             */
            keepInDOM:      false,

            /**
             * Number of ms for the rendered object to live
             * after its been hidden. 0 to destroy elem immediately.
             * @type {number}
             * @md-stack remove
             */
            lifetime:       null
        },

        /**
         * Event actions.
         * @type {object}
         * @md-stack add
         */
        events: {

            /**
             * You can also add "hide".
             * @type {object}
             * @md-stack add
             */
            show: {

                /**
                 * You can also add any event you use to show/hide dialog.
                 * @type {object}
                 * @md-stack add
                 */
                click: {

                    /**
                     * @type {bool}
                     */
                    preventDefault: 	true,

                    /**
                     * @type {bool}
                     */
                    stopPropagation: 	true,

                    /**
                     * @type {bool}
                     */
                    returnValue: 		false,

                    /**
                     * Must return "returnValue" which will be in its turn
                     * returned from event handler. If you provide this function
                     * preventDefault and stopPropagation options are ignored.
                     * @function
                     * @param {MetaphorJs.lib.Dialog} dialog
                     * @param {Event} event
                     * @md-stack remove 3
                     */
                    process:            null
                }
            }
        },

        /**
         * <p><em>shorthand</em>: false -> show.events<br>
         * <em>shorthand</em>: string -> show.events._target</p>
         * @type {string|bool|object}
         * @md-stack add
         */
        show: {
            /**
             * Delay dialog's appearance. Milliseconds.
             * @type {number}
             */
            delay: 			null,

            /**
             * True to hide all other tooltips.
             * If "group" specified, will hide only
             * those dialogs that belong to that group.
             * @type {bool}
             */
            single:			false,

            /**
             * Works for show, hide and toggle
             * <pre><code class="language-javascript">
             * events: false // disable all
             *
             * events: eventName || [eventName, eventName, ...]
             * // same as events: {"_target": ...}
             *
             * events: {
             *  "body":         eventName || [eventName, eventName, ...],
             *  "_self":        same, // dialog itself
             *  "_target":      same, // target element
             *  "_document":    same,
             *  "_window":      same,
             *  "_html":        same,
             *  "_overlay":     same, // overlay element (works with hiding)
             *  ">.selector":   same // selector inside dialog
             * }
             *
             * events: {
             *  "(body|_self|_target|...)": {
             *      eventName: ".selector"
             *  }
             *  // $("body|_self|_target|...").delegate(".selector", eventName)
             *  // this one is for dynamic targets
             * }
             * </code></pre>
             * @type {string|bool|object}
             */
            events:			null,

            /**
             * <p>true -- ["mjs-show"] or ["mjs-hide"]<br>
             * string -- class name -> [class]<br>
             * array -- [{properties before}, {properties after}]<br>
             * array -- [class, class]<br>
             * object --
             * .fn -- string: "fadeIn", "fadeOut", etc. (optional) requires jQuery<br>
             * .fn -- function(Element, completeCallback)
             * .stages -- [class, class] (optional)
             * .before -- {} apply css properties before animation (optional)
             * .after -- {} animate these properties (optional) requires jQuery
             * .options - {} jQuery's .animate() options
             * .context -- fn's this object
             * .duration -- used when .fn is string
             * .skipDisplayChange -- do not set style.display = "" on start
             * function(){}<br>
             * function must return any of the above:</p>
             * <pre><code class="language-javascript">
             * animate: function(dlg, e) {
             *      return {
             *          before: {
             *             width: '200px'
             *          },
             *          after: {
             *              width: '400px'
             *          },
             *          options: {
             *             step: function() {
             *               dlg.reposition();
             *             }
             *          }
             *      };
             * }
             * </code></pre>
             * @type {bool|string|array|function}
             */
            animate:		false,

            /**
             * Ignore {show: {single: true}} on other dialogs.
             * @type {bool}
             */
            ignoreHideAll:	false,

            /**
             * true - automatically set focus on input fields on buttons;
             * string - selector
             * @type {bool|string}
             */
            focus:          false,

            /**
             * Prevent scrolling
             * true = "body"
             * @type {bool|string|Element}
             */
            preventScroll:  false,

            /**
             * When showing, set css display to this value
             * @type {string}
             * @md-stack remove
             */
            display: "block"
        },


        /**
         * <p><em>shorthand</em>: false -> hide.events<br>
         * <em>shorthand</em>: string -> hide.events._target</p>
         * @type {bool|string|object}
         * @md-stack add
         */
        hide: {
            /**
             * Milliseconds. Delay hiding for this amount of time.
             * @type {number}
             */
            delay:			null,

            /**
             * Milliseconds. Dialog will be shown no longer than for that time.
             * @type {number}
             */
            timeout: 		null,

            /**
             * See show.events
             * @type {string|bool|object}
             */
            events: 		null,

            /**
             * Destroy dialog after hide.
             * @type {bool}
             */
            destroy:        false,

            /**
             * Remove element from DOM after hide
             * @type {bool}
             */
            remove:         false,

            /**
             * See show.animate
             * @type {bool|string|array|function}
             */
            animate:		false,

            /**
             * true: hide anyway even if showing is delayed,<br>
             * false: ignore hide events until tooltip is shown.
             * @type {bool}
             * @md-stack remove
             */
            cancelShowDelay:true
        },

        /**
         * This option is required when you want to show and hide on the same event.<br>
         * <em>shorthand</em>: false -> toggle.events<br>
         * <em>shorthand</em>: string -> toggle.events._target
         * @type {bool|string|object}
         * @md-stack add
         */
        toggle: {
            /**
             * See show.events
             * @type {string|bool|object}
             * @md-stack remove
             */
            events: 		null
        },

        /**
         * <p><em>shorthand</em>: false -> position.type<br>
         * <em>shorthand</em>: string -> position.type<br>
         * <em>shorthand</em>: function -> position.get
         * @type {bool|string|function|object}
         * @md-stack add
         */
        position: {

            /**
             * false -- do not apply position<br>
             *
             * <b>relative to target:</b><br>
             * t | r | b | l -- simple positions aligned by center<br>
             * tr | rt | rb | br | bl | lb | lt | tl -- aligned by side<br>
             * trc | brc | blc | tlc -- corner positions<br>
             *
             * <b>relative to mouse:</b><br>
             * m -- works only with get(). get() function will be called on mousemove<br>
             * mt | mr | mb | ml -- following the mouse, aligned by center<br>
             * mrt | mrb | mlb | mlt -- following the mouse, corner positions<br>
             *
             * <b>window positions:</b><br>
             * wc | wt | wr | wb | wl<br>
             * wrt | wrb | wlt | wlb
             * @type {bool|string}
             */
            type:			't',

            /**
             * Add this offset to dialog's x position
             * @type {number}
             */
            offsetX: 		0,

            /**
             * Add this offset to dialog's y position
             * @type {number}
             */
            offsetY:		0,

            /**
             * Follow the mouse only by this axis;
             * second coordinate will be relative to target
             * @type {string}
             */
            axis: 			null,

            /**
             * Overrides position.type<br>
             * If this function is provided, offsets are not applied.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {Event} event
             * @returns {object} {
             *      @type {number} x If object contains only one coordinate - x or y -
             *                       the other one will not be updated.
             *      @type {number} y
             *      @type {number} top If object does not contain x and y, it will be applied
             *                          as is.
             *      @type {number} right
             *      @type {number} bottom
             *      @type {number} left
             * }
             */
            get:			null,

            /**
             * Prevent from rendering off the screen.<br>
             * Set to maximum distance between tooltip and window edge.
             * @type {number|bool}
             */
            screenX:		false,

            /**
             * Prevent from rendering off the screen.<br>
             * Set to maximum distance between tooltip and window edge.
             * @type {number|bool}
             */
            screenY:		false,

            /**
             * Monitor window resize.
             * @type {bool}
             * @md-stack remove
             */
            resize:         true
        },

        /**
         * Pointer will only work if size > 0 or el is not null<br>
         * <em>shorthand</em>: string -> pointer.position<br>
         * <em>shorthand</em>: number -> pointer.size
         * @type {object|string|number}
         * @md-stack add
         */
        pointer: {

            /**
             * t / r / b / l<br>
             * tr / lt / lb / br / bl / lb / lt<br>
             * null - opposite to dialog's position
             * @type {string}
             */
            position: 		null,

            /**
             * t / r / b / l<br>
             * null - opposite to primary position
             * @type {string}
             */
            direction: 		null,

            /**
             * Number of pixels (triangle's height)
             * @type {number}
             */
            size: 			0,

            /**
             * Number of pixels (triangle's width), by default equals to size.
             * @type {number}
             */
            width:			null,

            /**
             * '#xxxxxx'
             * @type {string}
             */
            color: 			null,

            /**
             * Shift pointer's position by this number of pixels.
             * Shift direction will depend on position:<br>
             * t / tl / b / bl - right shift<br>
             * tr / br - left shift<br>
             * r / l / rt / lt - top shift<br>
             * rb / lb - bottom shift
             * @type {number}
             */
            offset: 		0,

            /**
             * Number of pixels.
             * @type {number}
             */
            border:			0,

            /**
             * '#xxxxxx'
             * @type {string}
             */
            borderColor:	null,

            /**
             * Custom pointer.<br>
             * If you provide custom pointer el,
             * border, direction and color will not be applied.<br>
             * pointer.cls will be applied.
             * @type {string|Element}
             */
            el:             null,

            /**
             * Apply this class to pointer.
             * @type {string}
             */
            cls:            null,

            /**
             * Apply this class to pointerBorder element.
             * @type {string}
             * @md-stack remove
             */
            borderCls:      null
        },

        /**
         * <p><em>shorthand</em>: boolean -> overlay.enabled<br></p>
         * @type {bool|object}
         * @md-stack add
         */
        overlay:			{

            /**
             * Enable overlay.
             * @type {bool}
             */
            enabled:		false,

            /**
             * @type {string}
             */
            color:			'#000',

            /**
             * @type {number}
             */
            opacity:		.5,

            /**
             * @type {string}
             */
            cls:			null,

            /**
             * Same animation rules as in show.animate.
             * @type {bool}
             */
            animateShow:	false,

            /**
             * Same animation rules as in show.animate.
             * @type {bool}
             */
            animateHide:	false,

            /**
             * Prevent document scrolling
             * @type {bool}
             * @md-stack remove
             */
            preventScroll:  false
        },

        /**
         * Callbacks are case insensitive.<br>
         * You can use camel case if you like.
         * @type {object}
         * @md-stack add
         */
        callback: {

            /**
             * 'this' object for all callbacks, including render.fn, position.get, etc.
             * @type {object}
             */
            scope:				null,

            /**
             * When content has changed.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {string} content
             */
            contentchange:	 	null,

            /**
             * Before dialog appeared.<br>
             * Return false to cancel showing.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {Event} event
             */
            beforeshow: 		null,

            /**
             * Immediately after dialog appeared.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {Event} event
             */
            show: 				null,

            /**
             * Before dialog disappears.<br>
             * Return false to cancel hiding.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {Event} event
             */
            beforehide: 		null,

            /**
             * Immediately after dialog has been hidden.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {Event} event
             */
            hide: 				null,

            /**
             * After dialog has been rendered.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             */
            render: 			null,

            /**
             * After dialog's html element has been removed.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             */
            lifetime:           null,

            /**
             * Called when dynamic target changes (on hide it always changes to null).
             * Also called from setTarget().
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {Element} newTarget
             * @param {Element|null} prevTarget
             */
            targetchange:       null,

            /**
             * One handler for all configured buttons. Called on click, enter and space.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {string} buttonId
             * @param {Event} event
             * @md-stack finish
             */
            button:             null
        }

    }/*options-end*/;



    /*
     * Dialog
     */

    /**
     * @constructor
     * @name MetaphorJs.lib.Dialog
     * @param {string} preset
     * @param {object} options {
     *  @md-use defaults
     * }
     */
    var dialog  = function(preset, options) {

        if (preset && !isString(preset)) {
            options         = preset;
            preset          = null;
        }

        options             = options || {};

        var self            = this,
            api             = {},
            id              = nextUid(),
            events          = new Observable,
            cfg             = extend({}, defaults,
                                fixShorthands(dialog.defaults),
                                fixShorthands(dialog[preset]),
                                fixShorthands(options),
                                true, true),
            defaultScope    = cfg.callback.scope || api,
            elem,
            pnt,
            overlay,
            state           = {
                bindSelfOnRender:   false,
                target:             null,
                visible:            false,
                enabled:            true,
                frozen:             false,
                rendered:           false,
                hideTimeout:        null,
                hideDelay:          null,
                showDelay:          null,
                dynamicTarget:      false,
                dynamicTargetEl:    null,
                images:             0,
                position:           null,
                destroyDelay:       null
            };

        options = null;

        extend(api, events.getApi(), /*api-start*/{

            /**
             * @access public
             * @return {Element}
             */
            getElem: function() {
                return elem;
            },

            getInstanceId: function() {
                return id;
            },

            /**
             * Get copy of dialog's config.
             * @access public
             * @return {object}
             */
            getCfg: function() {
                return extend({}, cfg);
            },

            /**
             * Get groups.
             * @access public
             * @return {[]}
             */
            getGroup: function() {
                if (!cfg.group) {
                    return [""];
                }
                else {
                    return isString(cfg.group) ?
                        [cfg.group] : cfg.group;
                }
            },

            /**
             * Set new dialog's target.
             * @access public
             * @param newTarget Element {
             *     @required
             * }
             */
            setTarget: function(newTarget) {

                if (!newTarget) {
                    return api;
                }

                var change  = false,
                    prev    = state.target;

                if (state.target) {
                    self.setHandlers('unbind', '_target');
                    change = true;
                }
                else if (state.dynamicTarget) {
                    change = true;
                }

                var isStr = isString(newTarget);

                if (isStr && newTarget.substr(0,1) != "#") {
                    state.dynamicTarget = true;
                    state.target        = null;
                }
                else {
                    if (isStr) {
                        newTarget       = select(newTarget).shift();
                    }
                    state.dynamicTarget = false;
                    state.target        = newTarget;
                }

                if (change) {
                    self.setHandlers('bind', '_target');
                    self.trigger("targetchange", api, newTarget, prev);
                }

                return api;
            },

            /**
             * Get dialog's target.
             * @access public
             * @return {Element}
             */
            getTarget: function() {
                return state.dynamicTarget ? state.dynamicTargetEl : state.target;
            },

            /**
             * @access public
             * @return {boolean}
             */
            isEnabled: function() {
                return state.enabled;
            },

            /**
             * @access public
             * @return {boolean}
             */
            isVisible: function() {
                return state.visible;
            },

            /**
             * @access public
             * @returns {boolean}
             */
            isHideAllIgnored: function() {
                return cfg.show.ignoreHideAll;
            },

            /**
             * @access public
             * @return {boolean}
             */
            isFrozen: function() {
                return state.frozen;
            },

            /**
             * Enable dialog
             * @access public
             * @method
             */
            enable: function() {
                state.enabled = true;
                return api;
            },

            /**
             * Disable dialog
             * @access public
             * @method
             */
            disable: function() {
                self.hide();
                state.enabled = false;
                return api;
            },

            /**
             * The difference between freeze and disable is that
             * disable always hides dialog and freeze makes current
             * state permanent (if it was shown, it will stay shown
             * until unfreeze() is called).
             * @access public
             * @method
             */
            freeze: function() {
                state.frozen   = true;
                return api;
            },

            /**
             * Unfreeze dialog
             * @access public
             * @method
             */
            unfreeze: function() {
                state.frozen   = false;
                return api;
            },

            /**
             * Show/hide
             * @access public
             * @param {Event} e Optional
             * @param {bool} immediately Optional
             */
            toggle: function(e, immediately) {

                // if switching between dynamic targets
                // we need not to hide tooltip
                if (e && e.stopPropagation && state.dynamicTarget) {

                    if (state.visible && self.isDynamicTargetChanged(e)) {
                        return self.show(e);
                    }
                }

                return self[state.visible ? 'hide' : 'show'](e, immediately);
            },


            /**
             * Show dialog
             * @access public
             * @param {Event} e Optional. True to skip delay.
             * @param {bool} immediately Optional
             */
            show: function(e, immediately) {

                // if called as an event handler, we do not return api
                var returnValue	= e && e.stopPropagation ? null : api,
                    scfg        = cfg.show;

                // if tooltip is disabled, we do not stop propagation and do not return false.s
                if (!api.isEnabled()) {

                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("show: not enabled", api.getTarget());
                    }
                    /*debug-end*/

                    return returnValue;
                }

                if (e && e.stopPropagation && cfg.events.show && cfg.events.show[e.type]) {
                    var et = cfg.events.show[e.type];

                    if (et.process) {
                        returnValue	= et.process(api, e);
                    }
                    else {
                        et.stopPropagation && e.stopPropagation();
                        et.preventDefault && e.preventDefault();
                        returnValue = et.returnValue;
                    }
                }

                // if tooltip is already shown
                // and hide timeout was set.
                // we need to restart timer
                if (state.visible && state.hideTimeout) {

                    window.clearTimeout(state.hideTimeout);
                    state.hideTimeout = async(self.hide, self, null, cfg.hide.timeout);

                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("show: hide timeout was set", api.getTarget());
                    }
                    /*debug-end*/

                    return returnValue;
                }

                // if tooltip was delayed to hide
                // we cancel it.
                if (state.hideDelay) {

                    window.clearTimeout(state.hideDelay);
                    state.hideDelay     = null;
                    state.visible       = true;

                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("show: hide delay was set; already shown", api.getTarget());
                    }
                    /*debug-end*/

                    return returnValue;
                }


                // various checks: tooltip should be enabled,
                // should not be already shown, it should
                // have some content, or empty content is allowed.
                // also if beforeShow() returns false, we can't proceed
                // if tooltip was frozen, we do not show or hide
                if (state.frozen) {

                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("show: frozen", api.getTarget());
                    }
                    /*debug-end*/

                    return returnValue;
                }

                // cancel delayed destroy
                // so that we don't have to re-render dialog
                if (state.destroyDelay) {
                    window.clearTimeout(state.destroyDelay);
                    state.destroyDelay = null;
                }

                var dtChanged   = false;

                // if we have a dynamicTarget
                if (e && e.stopPropagation && state.dynamicTarget) {
                    dtChanged = self.changeDynamicTarget(e);
                }

                if (state.visible) {
                    if (!dtChanged) {
                        /*debug-start*/
                        if (cfg.debug) {
                            console.log("show: already shown", elem);
                        }
                        /*debug-end*/
                        return returnValue;
                    }
                    else {
                        if (!cfg.render.fn) {
                            self.reposition(e);
                            return returnValue;
                        }
                        else {
                            self.hide(null, true);
                        }
                    }
                }

                // if tooltip is not rendered yet we render it
                if (!elem) {
                    self.render();
                }
                else if (dtChanged) {
                    self.changeDynamicContent();
                }

                // if beforeShow callback returns false we stop.
                if (self.trigger('beforeshow', api, e) === false) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("show: beforeshow return false", api.getTarget());
                    }
                    /*debug-end*/
                    return returnValue;
                }

                // first, we stop all current animations
                stopAnimation(elem);

                // as of this moment we mark dialog as visible so that hide() were able
                // to work. also, all next steps should check for this state
                // in case if tooltip case hidden back during the process
                state.visible = true;

                if (scfg.single) {
                    manager.hideAll(self);
                }

                self.toggleTitleAttribute(false);

                if (scfg.delay && !immediately) {
                    state.showDelay = async(self.showAfterDelay, self, [e], scfg.delay);
                }
                else {
                    self.showAfterDelay(e, immediately);
                }

                return returnValue;
            },

            /**
             * Hide dialog
             * @access public
             * @param {Event} e Optional.
             * @param {bool} immediately Optional. True to skip delay.
             * @param {bool} cancelShowDelay Optional. If showing already started but was delayed -
             * cancel that delay.
             */
            hide: function(e, immediately, cancelShowDelay) {

                state.hideTimeout = null;

                // if called as an event handler, we do not return api
                var returnValue	 = e && e.stopPropagation ? null : api;

                if (e && e.stopPropagation && cfg.events.hide && cfg.events.hide[e.type]) {
                    var et = cfg.events.hide[e.type];

                    if (et.process) {
                        returnValue = et.process(api, e);
                    }
                    else {
                        if (et.stopPropagation) e.stopPropagation();
                        if (et.preventDefault) e.preventDefault();
                        returnValue = et.returnValue;
                    }
                }

                // if the timer was set to hide the tooltip
                // but then we needed to close tooltip immediately
                if (!state.visible && state.hideDelay && immediately) {
                    window.clearTimeout(state.hideDelay);
                    state.hideDelay     = null;
                    state.visible       = true;
                }

                // various checks
                if (!elem || !state.visible || !self.isEnabled()) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("hide: elem/visible/enabled: ",
                            elem, state.visible, self.isEnabled());
                    }
                    /*debug-end*/
                    return returnValue;
                }

                // if tooltip is still waiting to be shown after delay timeout,
                // we cancel this timeout and return.
                if (state.showDelay) {

                    if (cfg.hide.cancelShowDelay || cancelShowDelay) {
                        window.clearTimeout(state.showDelay);
                        state.showDelay     = null;
                        state.visible       = false;

                        /*debug-start*/
                        if (cfg.debug) {
                            console.log("hide: cancelShowDelay: ", self.getTarget());
                        }
                        /*debug-end*/

                        return returnValue;
                    }
                    else {

                        /*debug-start*/
                        if (cfg.debug) {
                            console.log("hide: show delay was set", self.getTarget());
                        }
                        /*debug-end*/

                        return returnValue;
                    }
                }

                // if tooltip was frozen, we do not show or hide
                if (state.frozen) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("hide: frozen", self.getTarget());
                    }
                    /*debug-end*/
                    return returnValue;
                }

                // lets see what the callback will tell us
                if (self.trigger('beforehide', api, e) === false) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("hide: beforehide returned false", self.getTarget());
                    }
                    /*debug-end*/
                    return returnValue;
                }

                // now we can stop all current animations
                stopAnimation(elem);

                // and change the state
                state.visible = false;

                self.toggleTitleAttribute(true);

                if (state.dynamicTarget) {
                    self.resetDynamicTarget();
                }

                if (cfg.hide.delay && !immediately) {
                    state.hideDelay = async(self.hideAfterDelay, self, [e], cfg.hide.delay);
                }
                else {
                    self.hideAfterDelay(e, immediately);
                }

                return returnValue;
            },



            /**
             * Set new position. See position.type
             * @access public
             * @param {string} type {
             *    @required
             * }
             */
            setPositionType: function(type) {

                if (type) {
                    if (isString(type)) {
                        cfg.position.get     = type;
                        cfg.position.type   = false;
                    }
                    else {
                        cfg.position.get    = null;
                        cfg.position.type   = type;
                    }
                }

                var pt  = cfg.position.type;

                if (pt === false) {
                    state.position  = false;
                }
                else if (cfg.position.get && pt != "m") {
                    state.position  = "fn";
                }
                else {
                    pt  = pt.substr(0, 1);
                    if (pt == "w") {
                        state.position  = "window";
                    }
                    else if (pt == "m") {
                        state.position  = "mouse";
                    }
                    else {
                        state.position  = "target";
                    }
                }

                if (pnt) {
                    pnt.remove();

                    if (elem) {
                        pnt.render();
                    }
                }
            },

            /**
             * Get dialog's position.
             * @access public
             * @param {Event} e Optional.
             * @return {object} {
             *         @type {number} x
             *         @type {number} y
             * }
             */
            getPosition: function(e) {

                if (!elem) {
                    return null;
                }

                var pos,
                    cfgPos  = cfg.position;

                switch (state.position) {
                    case false: {
                        return null;
                    }
                    case "target": {
                        pos = self.getTargetPosition(e);
                        break;
                    }
                    case "mouse": {
                        pos = self.getMousePosition(e);
                        break;
                    }
                    case "window": {
                        pos = self.getWindowPosition(e);
                        break;
                    }
                    case "fn": {
                        pos = cfgPos.get.call(defaultScope, api, e);
                        break;
                    }
                }

                if (cfgPos.screenX !== false || cfgPos.screenY !== false) {
                    pos     = self.correctScreenPosition(pos, cfgPos.screenX, cfgPos.screenY);
                }

                return pos;
            },

            /**
             * Usually called internally from show().
             * @access public
             * @param {Event} e Optional.
             */
            reposition: function(e) {

                e && (e = normalizeEvent(e));

                var pos = self.getPosition(e);

                if (pos) {

                    if (pos.x != undf) {
                        css(elem, {left: pos.x+"px"});
                    }
                    if (pos.y != undf) {
                        css(elem, {top: pos.y+"px"});
                    }
                    if (pos.x == undf && pos.y == undf) {
                        css(elem, pos);
                    }
                }
            },

            /**
             * @access public
             * @return {Element}
             */
            getContentElem: function() {
                if (!elem) {
                    return null;
                }

                if (cfg.selector.content) {
                    var el = select(cfg.selector.content, elem).shift();
                    return el || elem;
                }
                else {
                    return elem;
                }
            },

            /**
             * Set new content.
             * @access public
             * @param {string|object} content {
             *      See "selector" option
             *      @required
             * }
             * @param {string} mode "", "attribute", "ajax" -- optional (used internally). See
             * content.prepare option.
             */
            setContent: function(content, mode) {

                mode = mode || '';

                if (!elem) {
                    cfg.content.value = content;
                    return api;
                }

                if (cfg.content.prepare) {
                    content = cfg.content.prepare(api, mode, content);
                }

                var contentElem = api.getContentElem(),
                    fixPointer  = state.rendered && !cfg.selector.content && pnt,
                    pntEl       = fixPointer && pnt.getEl();

                if (fixPointer && pntEl) {
                    try {
                        elem.removeChild(pntEl);
                    }
                    catch (thrownError) {}
                }

                if (!isString(content)) {
                    for (var i in content) {
                        var sel     = cfg.selector[i];
                        if (sel) {
                            var cel = select(sel, contentElem).shift();
                            if (cel) {
                                cel.innerHTML = content[i];
                            }
                        }
                    }
                }
                else {
                    contentElem.innerHTML = content;
                }

                // if there a pointer, and this is not initial content set,
                // and there is no selector for content
                // we must restore pointer after dialog's inner html
                // has been replaced with new content
                if (fixPointer && pntEl) {
                    try {
                        elem.appendChild(pntEl);
                    }
                    catch (thrownError){}
                }

                var imgs = select("img", contentElem),
                    l;

                state.images = imgs.length;

                for (i = -1, l = imgs.length; ++i < l; addListener(imgs[i], "load", self.onImageLoad)){}

                self.trigger('contentchange', api, content, mode);
                self.onContentChange();

                return api;
            },

            /**
             * Force dialog to re-read content from attributes.
             * @access public
             * @method
             */
            readContent: function() {

                var el 			= 	api.getTarget(),
                    content;

                if (el) {
                    if (cfg.content.attr) {
                        content = getAttr(el, cfg.content.attr);
                    }
                    else {
                        content = getAttr(el, 'tooltip') ||
                                  getAttr(el, 'title') ||
                                  getAttr(el, 'alt');
                    }
                }

                if (content) {
                    self.setContent(content, 'attribute');
                }
                return api;
            },

            /**
             * Load content via ajax.
             * @access public
             * @param {object} options Merged with cfg.ajax
             */
            loadContent: function(options) {

                addClass(elem, cfg.cls.loading);
                var opt = extend({}, cfg.ajax, options, true, true);
                self.trigger('beforeajax', api, opt);
                return ajax(opt).done(self.onAjaxLoad);
            },


            /**
             * Destroy dialog.
             * @access public
             * @method
             */
            destroy: function() {

                self.trigger("destroy", api);

                removeListener(window, "resize", self.onWindowResize);
                removeListener(window, "scroll", self.onWindowScroll);

                self.destroyElem();

                if (pnt) {
                    pnt.destroy();
                    pnt = null;
                }

                self.setHandlers("unbind");
                events.destroy();
                events  = null;
                self    = null;
                api     = null;
                state   = null;
                overlay = null;
            },

            /**
             * Set focus based on focus setting.
             * @access public
             * @method
             */
            setFocus: function() {

                var af      = cfg.show.focus,
                    i,
                    input;

                if (af === true) {
                    input   = select("input", elem).concat(select("textarea", elem));
                    if (input.length > 0) {
                        input[0].focus();
                    }
                    else if (cfg.buttons) {
                        for (i in cfg.buttons) {
                            var btn = select(cfg.buttons[i], elem).shift();
                            btn && btn.focus();
                            break;
                        }
                    }
                }
                else {
                    var el = select(af, elem).shift();
                    el && el.focus();
                }
            }

        }/*api-end*/, true, false);


        extend(self, api, {

            init: function() {

                manager.register(self);

                if (cfg.modal) {
                    cfg.overlay.enabled = true;
                }

                self.setPositionType();
                self.setTarget(cfg.target);

                if (cfg.target && cfg.useHref) {
                    var href = getAttr(self.getTarget(), "href");
                    if (href.substr(0, 1) == "#") {
                        cfg.render.el = href;
                    }
                    else {
                        cfg.ajax.url = href;
                    }
                }

                if (cfg.pointer.size || cfg.pointer.el) {
                    pnt = new Pointer(self, cfg.pointer);
                }

                if (!cfg.render.lazy) {
                    self.render();
                }

                self.setHandlers("bind");
            },

            setHandlers: function(mode, only) {

                var fns     = ["show", "hide", "toggle"],
                    lfn     = mode == "bind" ? addListener : removeListener,
                    dfn     = mode == "bind" ? delegate : undelegate,
                    fn,
                    fnCfg,
                    selector,
                    e, i, len,
                    evs, el,
                    j, jl;

                while (fn = fns.shift()) {

                    fnCfg   = cfg[fn].events;

                    if (fnCfg === false) {
                        continue;
                    }

                    if (isString(fnCfg) || isArray(fnCfg)) {
                        if (state.dynamicTarget) {
                            var tmp     = {};
                            tmp[fnCfg]  = cfg.target;
                            fnCfg       = {
                                "_html": tmp
                            }
                        }
                        else {
                            fnCfg   = {"_target": fnCfg};
                        }
                    }

                    for (selector in fnCfg) {

                        if (only) {
                            if (only == '_self') {
                                if (selector != '_self' && selector != "_overlay" && selector.substr(0,1) != '>') {
                                    continue;
                                }
                            }
                            else if (selector != only) {
                                continue;
                            }
                        }

                        if ((selector == '_self' || selector == '_overlay' || selector.substr(0,1) == '>')
                            && !elem) {

                            state.bindSelfOnRender = true;
                            continue;
                        }

                        evs         = fnCfg[selector];

                        if (!evs) {
                            continue;
                        }

                        switch (selector) {
                            case "_target":
                                el  = [self.getTarget()];
                                break;

                            case "_self":
                                el  = [elem];
                                break;

                            case "_window":
                                el  = [window];
                                break;

                            case "_document":
                                el  = [window.document];
                                break;

                            case "_html":
                                el  = [window.document.documentElement];
                                break;

                            case "_overlay":
                                el  = [overlay];
                                break;

                            default:
                                el  = selector.substr(0,1) == '>' ?
                                        select(selector.substr(1), elem) :
                                        select(selector);

                        }

                        if (!el || !el.length) {
                            continue;
                        }

                        if (isString(evs)) {
                            evs     = [evs];
                        }

                        if (isArray(evs)) {
                            for (i = 0, len = evs.length; i < len; i++) {
                                for (j = -1, jl = el.length; ++j < jl; lfn(el[j], evs[i], api[fn])){}
                            }
                        }
                        else {
                            for (e in evs) {
                                for (j = -1, jl = el.length; ++j < jl; dfn(el[j], evs[e], e, api[fn])){}
                                //dfn(el, evs[e], e, api[fn]);
                                //$(el)[dfn](evs[e], e, api[fn]);
                            }
                        }
                    }
                }
            },

            resetDynamicTarget: function() {
                var curr = state.dynamicTargetEl;
                if (curr) {
                    self.setHandlers("unbind", "_target");
                    self.trigger("targetchange", api, null, curr);
                }
            },

            isDynamicTargetChanged: function(e) {

                var dt	    = cfg.target,
                    t	    = e.target,
                    curr    = state.dynamicTargetEl;

                while (t && !is(t, dt)) {
                    t   = t.parentNode;
                }

                if (!t) {
                    return false;
                }

                return !curr || curr !== t;
            },

            changeDynamicTarget: function(e) {

                var dt	    = cfg.target,
                    t	    = e.target,
                    curr    = state.dynamicTargetEl;

                while (t && !is(t, dt)) {
                    t   = t.parentNode;
                }

                if (!t) {
                    return false;
                }

                if (!curr || curr !== t) {

                    if (curr) {
                        self.setHandlers("unbind", "_target");
                    }

                    state.dynamicTargetEl = t;

                    self.setHandlers("bind", "_target");
                    self.trigger("targetchange", api, t, curr);
                    return true;
                }
                else {
                    return false;
                }
            },



            showAfterDelay: function(e, immediately) {

                state.showDelay = null;

                // if tooltip was already hidden, we can't proceed
                if (!state.visible) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("showAfterDelay: already hidden", self.getTarget());
                    }
                    /*debug-end*/
                    return;
                }

                // tooltip is following the mouse
                if (state.position == "mouse") {
                    // now we can adjust tooltip's position according
                    // to mouse's position and set mousemove event listener
                    addListener(window.document.documentElement, "mousemove", self.onMouseMove);
                }

                var cfgPos = cfg.position;

                if (cfgPos.resize || cfgPos.screenX || cfgPos.screenY) {
                    addListener(window, "resize", self.onWindowResize);
                }

                if (cfgPos.scroll || cfgPos.screenX || cfgPos.screenY) {
                    addListener(window, "scroll", self.onWindowScroll);
                }


                if (!immediately && self.trigger('afterdelay', api, e) === false) {
                    state.visible	= false;
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("showAfterDelay: afterdelay returned false", api.getTarget());
                    }
                    /*debug-end*/
                    return;
                }

                if (cfg.hide.remove) {
                    self.appendElem();
                }

                if (!cfg.position.manual) {
                    self.reposition(e);
                }

                if (overlay) {
                    if (cfg.overlay.animateShow) {
                        self.animate("show", null, true);
                    }
                    else {
                        overlay.style.display = "";
                    }
                }

                if (cfg.show.preventScroll) {
                    var ps = cfg.show.preventScroll,
                        i, l;
                    if (ps === true) {
                        ps = "body";
                    }
                    ps = select(ps);
                    for (i = -1, l = ps.length; ++i < l;
                         addListener(ps[i], "mousewheel", self.onPreventScroll) &&
                         addListener(ps[i], "touchmove", self.onPreventScroll)
                        ){}
                }

                if (cfg.show.animate && !immediately) {
                    self.animate("show").done(function() {
                        self.showAfterAnimation(e);
                    });
                }
                else {
                    self.showAfterAnimation(e);
                }
            },

            showAfterAnimation: function(e) {

                // if tooltip was already hidden, we can't proceed
                if (!state.visible) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("showAfterAnimation: already hidden", self.getTarget());
                    }
                    /*debug-end*/
                    return;
                }

                // now we can finally show the dialog (if it wasn't shown already
                // during the animation
                removeClass(elem, cfg.cls.hidden);
                addClass(elem, cfg.cls.visible);

                if (!cfg.render.keepVisible) {
                    elem.style.display = cfg.show.display || "block";
                }


                // if it has to be shown only for a limited amount of time,
                // we set timeout.
                if (cfg.hide.timeout) {
                    state.hideTimeout = async(self.hide, self, null, cfg.hide.timeout);
                }

                if (cfg.show.focus) {
                    async(self.setFocus, self, null, 20);
                }

                self.trigger('show', api, e);
            },



            hideAfterDelay: function(e, immediately) {

                state.hideDelay = null;

                if (state.visible) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("hideAfterDelay: already shown again", self.getTarget());
                    }
                    /*debug-end*/
                    return;
                }

                // if this tooltip is following the mouse, we reset event listeners
                if (state.position == "mouse") {
                    removeListener(window.document.documentElement, "mousemove", self.onMouseMove);
                }

                var cfgPos = cfg.position;

                if (cfgPos.resize || cfgPos.screenX || cfgPos.screenY) {
                    removeListener(window, "resize", self.onWindowResize);
                }

                if (cfgPos.scroll || cfgPos.screenX || cfgPos.screenY) {
                    removeListener(window, "scroll", self.onWindowScroll);
                }

                // if afterdelay callback returns false we stop.
                if (!immediately && self.trigger('afterhidedelay', api, e) === false) {

                    state.visible	= cfg.cls.hidden ? !hasClass(elem, cfg.cls.hidden) : isVisible(elem);

                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("hideAfterDelay: afterhdelay returned false", self.getTarget());
                    }
                    /*debug-end*/
                    return;
                }

                if (cfg.show.preventScroll) {
                    var ps = cfg.show.preventScroll,
                        i, l;
                    if (ps === true) {
                        ps = "body";
                    }
                    ps = select(ps);
                    for (i = -1, l = ps.length; ++i < l;
                         removeListener(ps[i], "mousewheel", self.onPreventScroll) &&
                         removeListener(ps[i], "touchmove", self.onPreventScroll)
                        ){}
                }

                if (overlay) {
                    if (cfg.overlay.animateShow) {
                        self.animate("hide", null, true).done(function(){
                            overlay.style.display = "none";
                        });
                    }
                    else {
                        overlay.style.display = "none";
                    }
                }

                if (cfg.hide.animate && !immediately) {
                    self.animate("hide").done(function() {
                        self.hideAfterAnimation(e);
                    });
                }
                else {
                    self.hideAfterAnimation(e);
                }
            },

            hideAfterAnimation: function(e) {

                // we need to check if the tooltip was returned to visible state
                // while hiding animation
                if (state.visible) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("hideAfterAnimation: already shown again", self.getTarget());
                    }
                    /*debug-end*/
                    return;
                }

                removeClass(elem, cfg.cls.visible);
                addClass(elem, cfg.cls.hidden);

                if (!cfg.render.keepVisible) {
                    elem.style.display = "none";
                }

                self.trigger('hide', api, e);

                var lt = cfg.render.lifetime;

                if (lt !== null) {
                    if (lt === 0) {
                        self.destroyElem();
                    }
                    else {
                        state.destroyDelay = async(self.destroyElem, self, null, lt);
                    }
                }

                if (elem && cfg.hide.destroy) {
                    raf(function(){
                        data(elem, cfg.instanceName, null);
                        self.destroy();
                    });
                }

                if (elem && cfg.hide.remove) {
                    raf(function(){
                        self.removeElem();
                    });
                }
            },


            render: function() {

                // if already rendered, we return
                if (elem) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("element already rendered", elem);
                    }
                    /*debug-end*/
                    return;
                }

                var rnd	    = cfg.render,
                    cls     = cfg.cls;

                // custom rendering function
                if (rnd.fn) {
                    var res = rnd.fn.call(defaultScope, api);
                    rnd[isString(res) ? 'tpl' : 'el'] = res;
                }

                if (rnd.el) {
                    if (isString(rnd.el)) {
                        elem = select(rnd.el).shift();
                        rnd.keepInDOM = true;
                    }
                    else {
                        elem = rnd.el;
                    }
                }
                else {
                    var tmp = window.document.createElement("div");
                    tmp.innerHTML = rnd.tpl;
                    elem = tmp.firstChild;
                }

                if (!elem) {
                    elem = window.document.createElement("div");
                }

                if (rnd.id) {
                    setAttr(elem, 'id', rnd.id);
                }

                if (!cfg.render.keepVisible) {
                    elem.style.display = "none";
                }

                addClass(elem, cls.dialog);
                addClass(elem, cls.hidden);

                if (rnd.style) {
                    css(elem, rnd.style);
                }


                if (cfg.overlay.enabled) {

                    overlay     = window.document.createElement("div");
                    css(overlay, {
                        display:            "none",
                        position: 			"fixed",
                        left:				0,
                        top:				0,
                        right:              0,
                        bottom:             0,
                        opacity:			cfg.overlay.opacity,
                        backgroundColor: 	cfg.overlay.color
                    });

                    //window.document.body.appendChild(overlay);

                    addListener(overlay, "click", self.onOverlayClick);

                    if (rnd.zIndex) {
                        css(overlay, {zIndex: rnd.zIndex});
                    }
                    if (cfg.overlay.cls) {
                        addClass(overlay, cfg.overlay.cls);
                    }
                }

                /*if (rnd.appendTo) {
                    rnd.appendTo.appendChild(elem);
                }
                else if (rnd.appendTo !== false) {
                    window.document.body.appendChild(elem);
                }*/

                if (!cfg.hide.remove) {
                    self.appendElem();
                }

                if (rnd.zIndex) {
                    css(elem, {zIndex: rnd.zIndex});
                }

                var cnt = cfg.content;

                if (cnt.value !== false) {
                    if (cnt.value) {
                        self.setContent(cnt.value);
                    }
                    else {
                        if (cnt.fn) {
                            self.setContent(cnt.fn.call(defaultScope, api));
                        }
                        else {
                            self[cfg.ajax.url ? 'loadContent' : 'readContent']();
                        }
                    }
                }

                if (pnt) {
                    pnt.render();
                }

                if (cfg.buttons) {
                    var btnId, btn;
                    for (btnId in cfg.buttons) {
                        btn = select(cfg.buttons[btnId], elem).shift();
                        if (btn) {
                            data(btn, "metaphorjsTooltip-button-id", btnId);
                            addListener(btn, "click", self.onButtonClick);
                            addListener(btn, "keyup", self.onButtonKeyup);
                        }
                    }
                }

                if (state.bindSelfOnRender) {
                    self.setHandlers('bind', '_self');
                    state.bindSelfOnRender = false;
                }

                state.rendered = true;

                self.trigger('render', api);
            },



            animate: function(section, e, isOverlay) {

                var a,
                    skipDisplay;

                if (isOverlay) {
                    a   = section == "show" ? cfg.overlay.animateShow : cfg.overlay.animateHide;
                }
                else {
                    a 	= cfg[section].animate;
                }

                if (isFunction(a)) {
                    a   = a(self, e);
                }

                skipDisplay = a.skipDisplayChange || false;

                if (isBool(a)) {
                    a = section;
                }
                else if (isString(a)) {
                    a = [a];
                }

                return animate(elem, a, function(){
                    if (section == "show" && !skipDisplay) {

                        var p = new Promise;

                        raf(function(){
                            if (isOverlay) {
                                overlay.style.display = "";
                            }
                            else {
                                elem.style.display = cfg.show.display || "block";
                            }
                            p.resolve();
                        });

                        return p;
                    }
                }, false);
            },

            toggleTitleAttribute: function(state) {

                var trg = api.getTarget(),
                    title;

                if (trg) {
                    if (state === false) {
                        data(trg, "tmp-title", getAttr(trg, "title"));
                        removeAttr(trg, 'title');
                    }
                    else if (title = data(trg, "tmp-title")) {
                        setAttr(trg, "title", title);
                    }
                }
            },

            changeDynamicContent: function() {
                if (cfg.content.fn) {
                    self.setContent(cfg.content.fn.call(defaultScope, api));
                }
                else if (cfg.content.attr) {
                    self.readContent();
                }
            },

            getDialogSize: function() {

                var hidden  = cfg.cls.hidden ? hasClass(elem, cfg.cls.hidden) : !isVisible(elem),
                    size,
                    left    = elem.style.left;

                if (hidden) {
                    css(elem, {left: "-1000px"});
                    elem.style.display = cfg.show.display;
                }

                size    = {
                    width:      getOuterWidth(elem),
                    height:     getOuterHeight(elem)
                };

                if (hidden) {
                    css(elem, {left: left});
                    elem.style.display = "none";
                }

                return size;
            },

            getTargetSize: function() {

                var target  = self.getTarget();

                if (!target) {
                    return null;
                }

                return {
                    width:      getOuterWidth(target),
                    height:     getOuterHeight(target)
                };
            },


            getTargetPosition: function(e, type) {

                var target  = self.getTarget();

                if (!target) {
                    return null;
                }

                var size    = self.getDialogSize(),
                    offset  = getOffset(target),
                    tsize   = self.getTargetSize(),
                    pos     = {},
                    type    = type || cfg.position.type,
                    pri     = type.substr(0, 1),
                    sec     = type.substr(1),
                    offsetX = cfg.position.offsetX,
                    offsetY = cfg.position.offsetY,
                    pntOfs  = pnt ? pnt.getDialogPositionOffset() : null;

                switch (pri) {
                    case "t": {
                        pos.y   = offset.top - size.height - offsetY;
                        break;
                    }
                    case "r": {
                        pos.x   = offset.left + tsize.width + offsetX;
                        break;
                    }
                    case "b": {
                        pos.y   = offset.top + tsize.height + offsetY;
                        break;
                    }
                    case "l": {
                        pos.x   = offset.left - size.width - offsetX;
                        break;
                    }
                }

                switch (sec) {
                    case "t": {
                        pos.y   = offset.top + offsetY;
                        break;
                    }
                    case "r": {
                        pos.x   = offset.left + tsize.width - size.width - offsetX;
                        break;
                    }
                    case "b": {
                        pos.y   = offset.top + tsize.height - size.height - offsetY;
                        break;
                    }
                    case "l": {
                        pos.x   = offset.left + offsetX;
                        break;
                    }
                    case "rc": {
                        pos.x   = offset.left + tsize.width + offsetX;
                        break;
                    }
                    case "lc": {
                        pos.x   = offset.left - size.width - offsetX;
                        break;
                    }
                    case "": {
                        switch (pri) {
                            case "t":
                            case "b": {
                                pos.x   = offset.left + (tsize.width / 2) - (size.width / 2);
                                break;
                            }
                            case "r":
                            case "l": {
                                pos.y   = offset.top + (tsize.height / 2) - (size.height / 2);
                                break;
                            }
                        }
                        break;
                    }
                }

                if (pntOfs) {
                    pos.x += pntOfs.x;
                    pos.y += pntOfs.y;
                }

                return pos;
            },

            getMousePosition: function(e) {

                if (!e) {
                    return null;
                }

                var size    = self.getDialogSize(),
                    pos     = {},
                    type    = cfg.position.type.substr(1),
                    offsetX = cfg.position.offsetX,
                    offsetY = cfg.position.offsetY,
                    axis    = cfg.position.axis,
                    pntOfs  = pnt ? pnt.getDialogPositionOffset() : null;

                switch (type) {
                    case "": {
                        pos     = cfg.position.get.call(defaultScope, api, e);
                        break;
                    }
                    case "t": {
                        pos.y   = e.pageY - size.height - offsetY;
                        pos.x   = e.pageX - (size.width / 2);
                        break;
                    }
                    case "r": {
                        pos.y   = e.pageY - (size.height / 2);
                        pos.x   = e.pageX + offsetX;
                        break;
                    }
                    case "b": {
                        pos.y   = e.pageY + offsetY;
                        pos.x   = e.pageX - (size.width / 2);
                        break;
                    }
                    case "l": {
                        pos.y   = e.pageY - (size.height / 2);
                        pos.x   = e.pageX - size.width - offsetX;
                        break;
                    }
                    case "rt": {
                        pos.y   = e.pageY - size.height - offsetY;
                        pos.x   = e.pageX + offsetX;
                        break;
                    }
                    case "rb": {
                        pos.y   = e.pageY + offsetY;
                        pos.x   = e.pageX + offsetX;
                        break;
                    }
                    case "lt": {
                        pos.y   = e.pageY - size.height - offsetY;
                        pos.x   = e.pageX - size.width - offsetX;
                        break;
                    }
                    case "lb": {
                        pos.y   = e.pageY + offsetY;
                        pos.x   = e.pageX - size.width - offsetX;
                        break;
                    }
                }

                if (pntOfs) {
                    pos.x += pntOfs.x;
                    pos.y += pntOfs.y;
                }

                if (axis) {
                    var tp = self.getTargetPosition(e, type);
                    if (tp) {
                        if (axis == "x") {
                            pos.y = tp.y;
                        }
                        else {
                            pos.x = tp.x;
                        }
                    }
                }

                return pos;
            },

            getWindowPosition: function() {

                var size    = self.getDialogSize(),
                    pos     = {},
                    type    = cfg.position.type.substr(1),
                    offsetX = cfg.position.offsetX,
                    offsetY = cfg.position.offsetY,
                    st      = getScrollTop(),
                    sl      = getScrollLeft(),
                    ww      = getOuterWidth(window),
                    wh      = getOuterHeight(window);

                switch (type) {
                    case "c": {
                        pos.y   = (wh / 2) - (size.height / 2) + st;
                        pos.x   = (ww / 2) - (size.width / 2) + sl;
                        break;
                    }
                    case "t": {
                        pos.y   = st + offsetY;
                        pos.x   = (ww / 2) - (size.width / 2) + sl;
                        break;
                    }
                    case "r": {
                        pos.y   = (wh / 2) - (size.height / 2) + st;
                        pos.x   = ww - size.width + sl - offsetX;
                        break;
                    }
                    case "b": {
                        pos.y   = wh - size.height + st - offsetY;
                        pos.x   = (ww / 2) - (size.width / 2) + sl;
                        break;
                    }
                    case "l": {
                        pos.y   = (wh / 2) - (size.height / 2) + st;
                        pos.x   = sl + offsetX;
                        break;
                    }
                    case "rt": {
                        pos.y   = st + offsetY;
                        pos.x   = ww - size.width + sl - offsetX;
                        break;
                    }
                    case "rb": {
                        pos.y   = wh - size.height + st - offsetY;
                        pos.x   = ww - size.width + sl - offsetX;
                        break;
                    }
                    case "lt": {
                        pos.y   = st + offsetY;
                        pos.x   = sl + offsetX;
                        break;
                    }
                    case "lb": {
                        pos.y   = wh - size.height + st - offsetY;
                        pos.x   = sl + offsetX;
                        break;
                    }
                }

                return pos;
            },

            correctScreenPosition: function(pos, offsetX, offsetY) {

                var size    = self.getDialogSize(),
                    st      = getScrollTop(),
                    sl      = getScrollLeft(),
                    ww      = getOuterWidth(window),
                    wh      = getOuterHeight(window);

                if (offsetY && pos.y + size.height > wh + st - offsetY) {
                    pos.y   = wh + st - offsetY - size.height;
                }
                if (offsetX && pos.x + size.width > ww + sl - offsetX) {
                    pos.x   = ww + sl - offsetX - size.width;
                }
                if (offsetY && pos.y < st + offsetY) {
                    pos.y = st + offsetY;
                }
                if (offsetX && pos.x < sl + offsetX) {
                    pos.x = sl + offsetX;
                }

                return pos;
            },


            onMouseMove: function(e) {
                self.reposition(normalizeEvent(e));
            },

            onWindowResize: function(e) {
                self.reposition(normalizeEvent(e));
            },

            onWindowScroll: function(e) {
                self.reposition(normalizeEvent(e));
            },

            onPreventScroll: function(e) {
                normalizeEvent(e).preventDefault();
                //e.stopPropagation();
                //return false;
            },

            onOverlayClick: function(e) {
                if (cfg.modal) {
                    e = normalizeEvent(e);
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                return null;
            },

            onButtonClick: function(e) {

                var target  = normalizeEvent(e).target,
                    btnId   = data(target, "metaphorjsTooltip-button-id");

                if (btnId) {
                    self.trigger("button", api, btnId, e);
                }
            },

            onButtonKeyup: function(e) {
                if (e.keyCode == 13 || e.keyCode == 32) {
                    var target  = e.target,
                        btnId   = data(target, "metaphorjsTooltip-button-id");

                    if (btnId) {
                        self.trigger("button", api, btnId, normalizeEvent(e));
                    }
                }
            },



            onAjaxLoad: function(data) {
                removeClass(elem, cfg.cls.loading);
                self.setContent(data, 'ajax');
            },

            onImageLoad: function() {
                state.images--;
                self.onContentChange();
            },

            onContentChange: function() {

                if (state.visible) {
                    self.reposition();
                }
            },


            removeElem: function() {
                if (overlay) {
                    overlay.parentNode.removeChild(overlay);
                }

                if (elem) {
                    elem.parentNode.removeChild(elem);
                }
            },

            appendElem: function() {

                var body    = window.document.body,
                    rnd	    = cfg.render;

                if (overlay) {
                    body.appendChild(overlay);
                }

                if (elem) {
                    if (rnd.appendTo) {
                        rnd.appendTo.appendChild(elem);
                    }
                    else if (rnd.appendTo !== false) {
                        body.appendChild(elem);
                    }
                }
            },

            destroyElem: function() {

                self.setHandlers("unbind", "_self");
                state.bindSelfOnRender = true;

                if (pnt) {
                    pnt.remove();
                }

                if (overlay) {
                    overlay.parentNode.removeChild(overlay);
                    overlay = null;
                }

                if (elem) {
                    if (!cfg.render.keepInDOM) {
                        elem.parentNode.removeChild(elem);
                    }
                    elem = null;
                }

                self.trigger("lifetime", api);
            }


        }, true, false);

        delete cfg.callback.scope;

        for (var c in cfg.callback) {
            api.on(c, cfg.callback[c], defaultScope);
        }

        self.init();

        return api;
    };

    /**
     * @md-end-class
     */


    extend(dialog, {

        /**
         * Use this object to set default options for
         * all dialogs.
         * You can create any number of presets -- objects with options -- and pass its name to the constructor.
         * @type {object}
         * @name MetaphorJs.lib.Dialog.defaults
         */
        defaults:   {}
    });

    return dialog;

}();

return Dialog;

};