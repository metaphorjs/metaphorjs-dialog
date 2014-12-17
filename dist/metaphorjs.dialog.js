(function(){
"use strict";


var MetaphorJs = {


};



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

    var toBind = ( 'onwheel' in window.document || window.document.documentMode >= 9 ) ?
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
    return el && !(el.offsetWidth <= 0 || el.offsetHeight <= 0);
};



/**
 * @param {*} list
 * @returns {[]}
 */
function toArray(list) {
    if (list && !list.length != undf && list !== ""+list) {
        for(var a = [], i =- 1, l = list.length>>>0; ++i !== l; a[i] = list[i]){}
        return a;
    }
    else if (list) {
        return [list];
    }
    else {
        return [];
    }
};



/**
 * Modified version of YASS (http://yass.webo.in)
 */

/**
 * Returns array of nodes or an empty array
 * @function select
 * @param {String} selector
 * @param {Element} root to look into
 */
var select = function() {

    var rGeneric    = /^[\w[:#.][\w\]*^|=!]*$/,
        rQuote      = /=([^\]]+)/,
        rGrpSplit   = / *, */,
        rRepPlus    = /(\([^)]*)\+/,
        rRepTild    = /(\[[^\]]+)~/,
        rRepAll     = /(~|>|\+)/,
        rSplitPlus  = / +/,
        rSingleMatch= /([^[:.#]+)?(?:#([^[:.#]+))?(?:\.([^[:.]+))?(?:\[([^!&^*|$[:=]+)([!$^*|&]?=)?([^:\]]+)?\])?(?::([^(]+)(?:\(([^)]+)\))?)?/,
        rNthNum     = /(?:(-?\d*)n)?(?:(%|-)(\d*))?/,
        rNonDig     = /\D/,
        rRepPrnth   = /[^(]*\(([^)]*)\)/,
        rRepAftPrn  = /\(.*/,
        rGetSquare  = /\[([^!~^*|$ [:=]+)([$^*|]?=)?([^ :\]]+)?\]/,

        doc         = window.document,
        bcn         = !!doc.getElementsByClassName,
        qsa         = !!doc.querySelectorAll,

        /*
         function calls for CSS2/3 modificatos. Specification taken from
         http://www.w3.org/TR/2005/WD-css3-selectors-20051215/
         on success return negative result.
         */
        mods        = {
            /* W3C: "an E element, first child of its parent" */
            'first-child': function (child) {
                /* implementation was taken from jQuery.1.2.6, line 1394 */
                return child.parentNode.getElementsByTagName('*')[0] !== child;
            },
            /* W3C: "an E element, last child of its parent" */
            'last-child': function (child) {
                var brother = child;
                /* loop in lastChilds while nodeType isn't element */
                while ((brother = brother.nextSibling) && brother.nodeType != 1) {}
                /* Check for node's existence */
                return !!brother;
            },
            /* W3C: "an E element, root of the document" */
            root: function (child) {
                return child.nodeName.toLowerCase() !== 'html';
            },
            /* W3C: "an E element, the n-th child of its parent" */
            'nth-child': function (child, ind) {
                var i = child.nodeIndex || 0,
                    a = ind[3] = ind[3] ? (ind[2] === '%' ? -1 : 1) * ind[3] : 0,
                    b = ind[1];
                /* check if we have already looked into siblings, using exando - very bad */
                if (i) {
                    return !( (i + a) % b);
                } else {
                    /* in the other case just reverse logic for n and loop siblings */
                    var brother = child.parentNode.firstChild;
                    i++;
                    /* looping in child to find if nth expression is correct */
                    do {
                        /* nodeIndex expando used from Peppy / Sizzle/ jQuery */
                        if (brother.nodeType == 1 && (brother.nodeIndex = ++i) && child === brother && ((i + a) % b)) {
                            return 0;
                        }
                    } while (brother = brother.nextSibling);
                    return 1;
                }
            },
            /*
             W3C: "an E element, the n-th child of its parent,
             counting from the last one"
             */
            'nth-last-child': function (child, ind) {
                /* almost the same as the previous one */
                var i = child.nodeIndexLast || 0,
                    a = ind[3] ? (ind[2] === '%' ? -1 : 1) * ind[3] : 0,
                    b = ind[1];
                if (i) {
                    return !( (i + a) % b);
                } else {
                    var brother = child.parentNode.lastChild;
                    i++;
                    do {
                        if (brother.nodeType == 1 && (brother.nodeLastIndex = i++) && child === brother && ((i + a) % b)) {
                            return 0;
                        }
                    } while (brother = brother.previousSibling);
                    return 1;
                }
            },
            /*
             Rrom w3.org: "an E element that has no children (including text nodes)".
             Thx to John, from Sizzle, 2008-12-05, line 416
             */
            empty: function (child) {
                return !!child.firstChild;
            },
            /* thx to John, stolen from Sizzle, 2008-12-05, line 413 */
            parent: function (child) {
                return !child.firstChild;
            },
            /* W3C: "an E element, only child of its parent" */
            'only-child': function (child) {
                return child.parentNode.getElementsByTagName('*').length != 1;
            },
            /*
             W3C: "a user interface element E which is checked
             (for instance a radio-button or checkbox)"
             */
            checked: function (child) {
                return !child.checked;
            },
            /*
             W3C: "an element of type E in language "fr"
             (the document language specifies how language is determined)"
             */
            lang: function (child, ind) {
                return child.lang !== ind && doc.documentElement.lang !== ind;
            },
            /* thx to John, from Sizzle, 2008-12-05, line 398 */
            enabled: function (child) {
                return child.disabled || child.type === 'hidden';
            },
            /* thx to John, from Sizzle, 2008-12-05, line 401 */
            disabled: function (child) {
                return !child.disabled;
            },
            /* thx to John, from Sizzle, 2008-12-05, line 407 */
            selected: function(elem){
                /*
                 Accessing this property makes selected-by-default
                 options in Safari work properly.
                 */
                var tmp = elem.parentNode.selectedIndex;
                return !elem.selected;
            }
        },

        attrRegCache = {},

        getAttrReg  = function(value) {
            return attrRegCache[value] || (attrRegCache[value] = new RegExp('(^| +)' + value + '($| +)'));
        },

        attrMods    = {
            /* W3C "an E element with a "attr" attribute" */
            '': function (child, name) {
                return getAttr(child, name) !== null;
            },
            /*
             W3C "an E element whose "attr" attribute value is
             exactly equal to "value"
             */
            '=': function (child, name, value) {
                var attrValue;
                return (attrValue = getAttr(child, name)) && attrValue === value;
            },
            /*
             from w3.prg "an E element whose "attr" attribute value is
             a list of space-separated values, one of which is exactly
             equal to "value"
             */
            '&=': function (child, name, value) {
                var attrValue;
                return (attrValue = getAttr(child, name)) && getAttrReg(value).test(attrValue);
            },
            /*
             from w3.prg "an E element whose "attr" attribute value
             begins exactly with the string "value"
             */
            '^=': function (child, name, value) {
                var attrValue;
                return (attrValue = getAttr(child, name) + '') && !attrValue.indexOf(value);
            },
            /*
             W3C "an E element whose "attr" attribute value
             ends exactly with the string "value"
             */
            '$=': function (child, name, value) {
                var attrValue;
                return (attrValue = getAttr(child, name) + '') &&
                       attrValue.indexOf(value) == attrValue.length - value.length;
            },
            /*
             W3C "an E element whose "attr" attribute value
             contains the substring "value"
             */
            '*=': function (child, name, value) {
                var attrValue;
                return (attrValue = getAttr(child, name) + '') && attrValue.indexOf(value) != -1;
            },
            /*
             W3C "an E element whose "attr" attribute has
             a hyphen-separated list of values beginning (from the
             left) with "value"
             */
            '|=': function (child, name, value) {
                var attrValue;
                return (attrValue = getAttr(child, name) + '') &&
                       (attrValue === value || !!attrValue.indexOf(value + '-'));
            },
            /* attr doesn't contain given value */
            '!=': function (child, name, value) {
                var attrValue;
                return !(attrValue = getAttr(child, name)) || !getAttrReg(value).test(attrValue);
            }
        };


    var select = function (selector, root) {

        /* clean root with document */
        root = root || doc;

        /* sets of nodes, to handle comma-separated selectors */
        var sets    = [],
            qsaErr  = null,
            idx, cls, nodes,
            i, node, ind, mod,
            attrs, attrName, eql, value;

        if (qsa) {
            /* replace not quoted args with quoted one -- Safari doesn't understand either */
            try {
                sets = toArray(root.querySelectorAll(selector.replace(rQuote, '="$1"')));
            }
            catch (thrownError) {
                qsaErr = true;
            }
        }

        if (!qsa || qsaErr) {

            /* quick return or generic call, missed ~ in attributes selector */
            if (rGeneric.test(selector)) {

                /*
                 some simple cases - only ID or only CLASS for the very first occurence
                 - don't need additional checks. Switch works as a hash.
                 */
                idx = 0;

                /* the only call -- no cache, thx to GreLI */
                switch (selector.charAt(0)) {

                    case '#':
                        idx = selector.slice(1);
                        sets = doc.getElementById(idx);

                        /*
                         workaround with IE bug about returning element by name not by ID.
                         Solution completely changed, thx to deerua.
                         Get all matching elements with this id
                         */
                        if (sets.id !== idx) {
                            sets = doc.all[idx];
                        }

                        sets = sets ? [sets] : [];
                        break;

                    case '.':

                        cls = selector.slice(1);

                        if (bcn) {

                            sets = toArray((idx = (sets = root.getElementsByClassName(cls)).length) ? sets : []);

                        } else {

                            /* no RegExp, thx to DenVdmj */
                            cls = ' ' + cls + ' ';

                            nodes = root.getElementsByTagName('*');
                            i = 0;

                            while (node = nodes[i++]) {
                                if ((' ' + node.className + ' ').indexOf(cls) != -1) {
                                    sets[idx++] = node;
                                }

                            }
                            sets = idx ? sets : [];
                        }
                        break;

                    case ':':

                        nodes   = root.getElementsByTagName('*');
                        i       = 0;
                        ind     = selector.replace(rRepPrnth,"$1");
                        mod     = selector.replace(rRepAftPrn,'');

                        while (node = nodes[i++]) {
                            if (mods[mod] && !mods[mod](node, ind)) {
                                sets[idx++] = node;
                            }
                        }
                        sets = idx ? sets : [];
                        break;

                    case '[':

                        nodes   = root.getElementsByTagName('*');
                        i       = 0;
                        attrs   = rGetSquare.exec(selector);
                        attrName    = attrs[1];
                        eql     = attrs[2] || '';
                        value   = attrs[3];

                        while (node = nodes[i++]) {
                            /* check either attr is defined for given node or it's equal to given value */
                            if (attrMods[eql] && (attrMods[eql](node, attrName, value) ||
                                                  (attrName === 'class' && attrMods[eql](node, 'className', value)))) {
                                sets[idx++] = node;
                            }
                        }
                        sets = idx ? sets : [];
                        break;

                    default:
                        sets = toArray((idx = (sets = root.getElementsByTagName(selector)).length) ? sets : []);
                        break;
                }

            } else {

                /* number of groups to merge or not result arrays */
                /*
                 groups of selectors separated by commas.
                 Split by RegExp, thx to tenshi.
                 */
                var groups  = selector.split(rGrpSplit),
                    gl      = groups.length - 1, /* group counter */
                    concat  = !!gl, /* if we need to concat several groups */
                    group,
                    singles,
                    singles_length,
                    single, /* to handle RegExp for single selector */
                    ancestor, /* to remember ancestor call for next childs, default is " " */
                /* for inner looping */
                    tag, id, klass, newNodes, J, child, last, childs, item, h;

                /* loop in groups, maybe the fastest way */
                while (group = groups[gl--]) {

                    /*
                     Split selectors by space - to form single group tag-id-class,
                     or to get heredity operator. Replace + in child modificators
                     to % to avoid collisions. Additional replace is required for IE.
                     Replace ~ in attributes to & to avoid collisions.
                     */
                    singles_length = (singles = group
                        .replace(rRepPlus,"$1%")
                        .replace(rRepTild,"$1&")
                        .replace(rRepAll," $1 ").split(rSplitPlus)).length;

                    i = 0;
                    ancestor = ' ';
                    /* is cleanded up with DOM root */
                    nodes = [root];

                    /*
                     John's Resig fast replace works a bit slower than
                     simple exec. Thx to GreLI for 'greed' RegExp
                     */
                    while (single = singles[i++]) {

                        /* simple comparison is faster than hash */
                        if (single !== ' ' && single !== '>' && single !== '~' && single !== '+' && nodes) {

                            single = single.match(rSingleMatch);

                            /*
                             Get all required matches from exec:
                             tag, id, class, attribute, value, modificator, index.
                             */
                            tag     = single[1] || '*';
                            id      = single[2];
                            klass   = single[3] ? ' ' + single[3] + ' ' : '';
                            attrName    = single[4];
                            eql     = single[5] || '';
                            mod     = single[7];

                            /*
                             for nth-childs modificator already transformed into array.
                             Example used from Sizzle, rev. 2008-12-05, line 362.
                             */
                            ind = mod === 'nth-child' || mod === 'nth-last-child' ?
                                  rNthNum.exec(
                                      single[8] === 'even' && '2n' ||
                                      single[8] === 'odd' && '2n%1' ||
                                      !rNonDig.test(single[8]) && '0n%' + single[8] ||
                                      single[8]
                                  ) :
                                  single[8];

                            /* new nodes array */
                            newNodes = [];

                            /*
                             cached length of new nodes array
                             and length of root nodes
                             */
                            idx = J = 0;

                            /* if we need to mark node with expando yeasss */
                            last = i == singles_length;

                            /* loop in all root nodes */
                            while (child = nodes[J++]) {
                                /*
                                 find all TAGs or just return all possible neibours.
                                 Find correct 'children' for given node. They can be
                                 direct childs, neighbours or something else.
                                 */
                                switch (ancestor) {
                                    case ' ':
                                        childs = child.getElementsByTagName(tag);
                                        h = 0;
                                        while (item = childs[h++]) {
                                            /*
                                             check them for ID or Class. Also check for expando 'yeasss'
                                             to filter non-selected elements. Typeof 'string' not added -
                                             if we get element with name="id" it won't be equal to given ID string.
                                             Also check for given attributes selector.
                                             Modificator is either not set in the selector, or just has been nulled
                                             by modificator functions hash.
                                             */
                                            if ((!id || item.id === id) &&
                                                (!klass || (' ' + item.className + ' ').indexOf(klass) != -1) &&
                                                (!attrName || (attrMods[eql] &&
                                                           (attrMods[eql](item, attrName, single[6]) ||
                                                            (attrName === 'class' &&
                                                             attrMods[eql](item, 'className', single[6]))))) &&
                                                !item.yeasss && !(mods[mod] ? mods[mod](item, ind) : mod)) {

                                                /*
                                                 Need to define expando property to true for the last step.
                                                 Then mark selected element with expando
                                                 */
                                                if (last) {
                                                    item.yeasss = 1;
                                                }
                                                newNodes[idx++] = item;
                                            }
                                        }
                                        break;
                                    /* W3C: "an F element preceded by an E element" */
                                    case '~':

                                        tag = tag.toLowerCase();

                                        /* don't touch already selected elements */
                                        while ((child = child.nextSibling) && !child.yeasss) {
                                            if (child.nodeType == 1 &&
                                                (tag === '*' || child.nodeName.toLowerCase() === tag) &&
                                                (!id || child.id === id) &&
                                                (!klass || (' ' + child.className + ' ').indexOf(klass) != -1) &&
                                                (!attrName || (attrMods[eql] &&
                                                           (attrMods[eql](item, attrName, single[6]) ||
                                                            (attrName === 'class' &&
                                                             attrMods[eql](item, 'className', single[6]))))) &&
                                                !child.yeasss &&
                                                !(mods[mod] ? mods[mod](child, ind) : mod)) {

                                                if (last) {
                                                    child.yeasss = 1;
                                                }
                                                newNodes[idx++] = child;
                                            }
                                        }
                                        break;

                                    /* W3C: "an F element immediately preceded by an E element" */
                                    case '+':
                                        while ((child = child.nextSibling) && child.nodeType != 1) {}
                                        if (child &&
                                            (child.nodeName.toLowerCase() === tag.toLowerCase() || tag === '*') &&
                                            (!id || child.id === id) &&
                                            (!klass || (' ' + item.className + ' ').indexOf(klass) != -1) &&
                                            (!attrName ||
                                             (attrMods[eql] && (attrMods[eql](item, attrName, single[6]) ||
                                                                (attrName === 'class' &&
                                                                 attrMods[eql](item, 'className', single[6]))))) &&
                                            !child.yeasss && !(mods[mod] ? mods[mod](child, ind) : mod)) {

                                            if (last) {
                                                child.yeasss = 1;
                                            }
                                            newNodes[idx++] = child;
                                        }
                                        break;

                                    /* W3C: "an F element child of an E element" */
                                    case '>':
                                        childs = child.getElementsByTagName(tag);
                                        i = 0;
                                        while (item = childs[i++]) {
                                            if (item.parentNode === child &&
                                                (!id || item.id === id) &&
                                                (!klass || (' ' + item.className + ' ').indexOf(klass) != -1) &&
                                                (!attrName || (attrMods[eql] &&
                                                           (attrMods[eql](item, attrName, single[6]) ||
                                                            (attrName === 'class' &&
                                                             attrMods[eql](item, 'className', single[6]))))) &&
                                                !item.yeasss &&
                                                !(mods[mod] ? mods[mod](item, ind) : mod)) {

                                                if (last) {
                                                    item.yeasss = 1;
                                                }
                                                newNodes[idx++] = item;
                                            }
                                        }
                                        break;
                                }
                            }

                            /* put selected nodes in local nodes' set */
                            nodes = newNodes;

                        } else {

                            /* switch ancestor ( , > , ~ , +) */
                            ancestor = single;
                        }
                    }

                    if (concat) {
                        /* if sets isn't an array - create new one */
                        if (!nodes.concat) {
                            newNodes = [];
                            h = 0;
                            while (item = nodes[h]) {
                                newNodes[h++] = item;
                            }
                            nodes = newNodes;
                            /* concat is faster than simple looping */
                        }
                        sets = nodes.concat(sets.length == 1 ? sets[0] : sets);

                    } else {

                        /* inialize sets with nodes */
                        sets = nodes;
                    }
                }

                /* define sets length to clean up expando */
                idx = sets.length;

                /*
                 Need this looping as far as we also have expando 'yeasss'
                 that must be nulled. Need this only to generic case
                 */
                while (idx--) {
                    sets[idx].yeasss = sets[idx].nodeIndex = sets[idx].nodeIndexLast = null;
                }
            }
        }

        /* return and cache results */
        return sets;
    };

    select.is = function(el, selector) {

        var els = select(selector, el.parentNode),
            i, l;

        for (i = -1, l = els.length; ++i < l;) {
            if (els[i] === el) {
                return true;
            }
        }
        return false;
    };

    return select;
}();



/**
 * @param {Element} el
 * @param {String} selector
 * @returns {boolean}
 */
var is = select.is;



var getAnimationPrefixes = function(){

    var domPrefixes         = ['Moz', 'Webkit', 'ms', 'O', 'Khtml'],
        animationDelay      = "animationDelay",
        animationDuration   = "animationDuration",
        transitionDelay     = "transitionDelay",
        transitionDuration  = "transitionDuration",
        transform           = "transform",
        transitionend       = null,
        prefixes            = null,

        probed              = false,

        detectCssPrefixes   = function() {

            var el = window.document.createElement("div"),
                animation = false,
                pfx,
                i, len;

            if (el.style['animationName'] !== undf) {
                animation = true;
            }
            else {
                for(i = 0, len = domPrefixes.length; i < len; i++) {
                    pfx = domPrefixes[i];
                    if (el.style[ pfx + 'AnimationName' ] !== undf) {
                        animation           = true;
                        animationDelay      = pfx + "AnimationDelay";
                        animationDuration   = pfx + "AnimationDuration";
                        transitionDelay     = pfx + "TransitionDelay";
                        transitionDuration  = pfx + "TransitionDuration";
                        transform           = pfx + "Transform";
                        break;
                    }
                }
            }

            if (animation) {
                if('ontransitionend' in window) {
                    // Chrome/Saf (+ Mobile Saf)/Android
                    transitionend = 'transitionend';
                }
                else if('onwebkittransitionend' in window) {
                    // Chrome/Saf (+ Mobile Saf)/Android
                    transitionend = 'webkitTransitionEnd';
                }
            }

            return animation;
        };


    /**
     * @function animate.getPrefixes
     * @returns {object}
     */
    return function() {

        if (!probed) {
            if (detectCssPrefixes()) {
                prefixes = {
                    animationDelay: animationDelay,
                    animationDuration: animationDuration,
                    transitionDelay: transitionDelay,
                    transitionDuration: transitionDuration,
                    transform: transform,
                    transitionend: transitionend
                };
            }
            else {
                prefixes = {};
            }

            probed = true;
        }


        return prefixes;
    };
}();



var getAnimationDuration = function(){

    var parseTime       = function(str) {
            if (!str) {
                return 0;
            }
            var time = parseFloat(str);
            if (str.indexOf("ms") == -1) {
                time *= 1000;
            }
            return time;
        },

        getMaxTimeFromPair = function(max, dur, delay) {

            var i, sum, len = dur.length;

            for (i = 0; i < len; i++) {
                sum = parseTime(dur[i]) + parseTime(delay[i]);
                max = Math.max(sum, max);
            }

            return max;
        },

        pfx                 = false,
        animationDuration   = null,
        animationDelay      = null,
        transitionDuration  = null,
        transitionDelay     = null;


    /**
     * @function animate.getDuration
     * @param {Element} el
     * @returns {number}
     */
    return function(el) {

        if (pfx === false) {
            pfx = getAnimationPrefixes();
            animationDuration = pfx ? pfx.animationDuration : null;
            animationDelay = pfx ? pfx.animationDelay : null;
            transitionDuration = pfx ? pfx.transitionDuration : null;
            transitionDelay = pfx ? pfx.transitionDelay : null;
        }

        if (!pfx) {
            return 0;
        }

        var style       = window.getComputedStyle ? window.getComputedStyle(el, null) : el.style,
            duration    = 0,
            animDur     = (style[animationDuration] || '').split(','),
            animDelay   = (style[animationDelay] || '').split(','),
            transDur    = (style[transitionDuration] || '').split(','),
            transDelay  = (style[transitionDelay] || '').split(',');

        duration    = Math.max(duration, getMaxTimeFromPair(duration, animDur, animDelay));
        duration    = Math.max(duration, getMaxTimeFromPair(duration, transDur, transDelay));

        return duration;
    };

}();



function isFunction(value) {
    return typeof value == 'function';
};



/**
 * @function animate.stop
 * @param {Element} el
 */
var stopAnimation = function(el) {

    var queue = data(el, "mjsAnimationQueue"),
        current,
        position,
        stages;

    if (isArray(queue) && queue.length) {
        current = queue[0];

        if (current) {
            if (current.stages) {
                position = current.position;
                stages = current.stages;
                removeClass(el, stages[position]);
                removeClass(el, stages[position] + "-active");
            }
            if (current.deferred) {
                current.deferred.reject(current.el);
            }
        }
    }
    else if (isFunction(queue)) {
        queue(el);
    }
    else if (queue == "stop") {
        $(el).stop(true, true);
    }

    data(el, "mjsAnimationQueue", null);
};




/**
 * Returns 'then' function or false
 * @param {*} any
 * @returns {Function|boolean}
 */
function isThenable(any) {

    // any.then must only be accessed once
    // this is a promise/a+ requirement

    if (!any) { //  || !any.then
        return false;
    }
    var then, t;

    //if (!any || (!isObject(any) && !isFunction(any))) {
    if (((t = typeof any) != "object" && t != "function")) {
        return false;
    }
    return isFunction((then = any.then)) ?
           then : false;
};

var strUndef = "undefined";
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



function error(e) {

    var stack = e.stack || (new Error).stack;

    if (typeof console != strUndef && console.log) {
        async(function(){
            console.log(e);
            if (stack) {
                console.log(stack);
            }
        });
    }
    else {
        throw e;
    }
};




var Promise = function(){

    var PENDING     = 0,
        FULFILLED   = 1,
        REJECTED    = 2,

        queue       = [],
        qRunning    = false,


        nextTick    = typeof process != strUndef ?
                        process.nextTick :
                        function(fn) {
                            setTimeout(fn, 0);
                        },

        // synchronous queue of asynchronous functions:
        // callbacks must be called in "platform stack"
        // which means setTimeout/nextTick;
        // also, they must be called in a strict order.
        nextInQueue = function() {
            qRunning    = true;
            var next    = queue.shift();
            nextTick(function(){
                next[0].apply(next[1], next[2]);
                if (queue.length) {
                    nextInQueue();
                }
                else {
                    qRunning = false;
                }
            }, 0);
        },

        /**
         * add to execution queue
         * @param {Function} fn
         * @param {Object} scope
         * @param {[]} args
         * @ignore
         */
        next        = function(fn, scope, args) {
            args = args || [];
            queue.push([fn, scope, args]);
            if (!qRunning) {
                nextInQueue();
            }
        },

        /**
         * returns function which receives value from previous promise
         * and tries to resolve next promise with new value returned from given function(prev value)
         * or reject on error.
         * promise1.then(success, failure) -> promise2
         * wrapper(success, promise2) -> fn
         * fn(promise1 resolve value) -> new value
         * promise2.resolve(new value)
         *
         * @param {Function} fn
         * @param {Promise} promise
         * @returns {Function}
         * @ignore
         */
        wrapper     = function(fn, promise) {
            return function(value) {
                try {
                    promise.resolve(fn(value));
                }
                catch (thrownError) {
                    promise.reject(thrownError);
                }
            };
        };


    /**
     * @class Promise
     */


    /**
     * @method Promise
     * @param {Function} fn {
     *  @description Function that accepts two parameters: resolve and reject functions.
     *  @param {function} resolve {
     *      @param {*} value
     *  }
     *  @param {function} reject {
     *      @param {*} reason
     *  }
     * }
     * @param {Object} context
     * @returns {Promise}
     * @constructor
     */

    /**
     * @method Promise
     * @param {Thenable} thenable
     * @returns {Promise}
     * @constructor
     */

    /**
     * @method Promise
     * @param {*} value Value to resolve promise with
     * @returns {Promise}
     * @constructor
     */


    /**
     * @method Promise
     * @returns {Promise}
     * @constructor
     */
    var Promise = function(fn, context) {

        if (fn instanceof Promise) {
            return fn;
        }

        if (!(this instanceof Promise)) {
            return new Promise(fn, context);
        }

        var self = this,
            then;

        self._fulfills   = [];
        self._rejects    = [];
        self._dones      = [];
        self._fails      = [];

        if (arguments.length > 0) {

            if (then = isThenable(fn)) {
                if (fn instanceof Promise) {
                    fn.then(
                        bind(self.resolve, self),
                        bind(self.reject, self));
                }
                else {
                    (new Promise(then, fn)).then(
                        bind(self.resolve, self),
                        bind(self.reject, self));
                }
            }
            else if (isFunction(fn)) {
                try {
                    fn.call(context,
                            bind(self.resolve, self),
                            bind(self.reject, self));
                }
                catch (thrownError) {
                    self.reject(thrownError);
                }
            }
            else {
                self.resolve(fn);
            }
        }
    };

    extend(Promise.prototype, {

        _state: PENDING,

        _fulfills: null,
        _rejects: null,
        _dones: null,
        _fails: null,

        _wait: 0,

        _value: null,
        _reason: null,

        _triggered: false,

        isPending: function() {
            return this._state == PENDING;
        },

        isFulfilled: function() {
            return this._state == FULFILLED;
        },

        isRejected: function() {
            return this._state == REJECTED;
        },

        _cleanup: function() {
            var self    = this;

            self._fulfills = null;
            self._rejects = null;
            self._dones = null;
            self._fails = null;
        },

        _processValue: function(value, cb) {

            var self    = this,
                then;

            if (self._state != PENDING) {
                return;
            }

            if (value === self) {
                self._doReject(new TypeError("cannot resolve promise with itself"));
                return;
            }

            try {
                if (then = isThenable(value)) {
                    if (value instanceof Promise) {
                        value.then(
                            bind(self._processResolveValue, self),
                            bind(self._processRejectReason, self));
                    }
                    else {
                        (new Promise(then, value)).then(
                            bind(self._processResolveValue, self),
                            bind(self._processRejectReason, self));
                    }
                    return;
                }
            }
            catch (thrownError) {
                if (self._state == PENDING) {
                    self._doReject(thrownError);
                }
                return;
            }

            cb.call(self, value);
        },


        _callResolveHandlers: function() {

            var self    = this;

            self._done();

            var cbs  = self._fulfills,
                cb;

            while (cb = cbs.shift()) {
                next(cb[0], cb[1], [self._value]);
            }

            self._cleanup();
        },


        _doResolve: function(value) {
            var self    = this;

            self._value = value;
            self._state = FULFILLED;

            if (self._wait == 0) {
                self._callResolveHandlers();
            }
        },

        _processResolveValue: function(value) {
            this._processValue(value, this._doResolve);
        },

        /**
         * @param {*} value
         */
        resolve: function(value) {

            var self    = this;

            if (self._triggered) {
                return self;
            }

            self._triggered = true;
            self._processResolveValue(value);

            return self;
        },


        _callRejectHandlers: function() {

            var self    = this;

            self._fail();

            var cbs  = self._rejects,
                cb;

            while (cb = cbs.shift()) {
                next(cb[0], cb[1], [self._reason]);
            }

            self._cleanup();
        },

        _doReject: function(reason) {

            var self        = this;

            self._state     = REJECTED;
            self._reason    = reason;

            if (self._wait == 0) {
                self._callRejectHandlers();
            }
        },


        _processRejectReason: function(reason) {
            this._processValue(reason, this._doReject);
        },

        /**
         * @param {*} reason
         */
        reject: function(reason) {

            var self    = this;

            if (self._triggered) {
                return self;
            }

            self._triggered = true;

            self._processRejectReason(reason);

            return self;
        },

        /**
         * @param {Function} resolve -- called when this promise is resolved; returns new resolve value
         * @param {Function} reject -- called when this promise is rejects; returns new reject reason
         * @returns {Promise} new promise
         */
        then: function(resolve, reject) {

            var self            = this,
                promise         = new Promise,
                state           = self._state;

            if (state == PENDING || self._wait != 0) {

                if (resolve && isFunction(resolve)) {
                    self._fulfills.push([wrapper(resolve, promise), null]);
                }
                else {
                    self._fulfills.push([promise.resolve, promise])
                }

                if (reject && isFunction(reject)) {
                    self._rejects.push([wrapper(reject, promise), null]);
                }
                else {
                    self._rejects.push([promise.reject, promise]);
                }
            }
            else if (state == FULFILLED) {

                if (resolve && isFunction(resolve)) {
                    next(wrapper(resolve, promise), null, [self._value]);
                }
                else {
                    promise.resolve(self._value);
                }
            }
            else if (state == REJECTED) {
                if (reject && isFunction(reject)) {
                    next(wrapper(reject, promise), null, [self._reason]);
                }
                else {
                    promise.reject(self._reason);
                }
            }

            return promise;
        },

        /**
         * @param {Function} reject -- same as then(null, reject)
         * @returns {Promise} new promise
         */
        "catch": function(reject) {
            return this.then(null, reject);
        },

        _done: function() {

            var self    = this,
                cbs     = self._dones,
                cb;

            while (cb = cbs.shift()) {
                try {
                    cb[0].call(cb[1] || null, self._value);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
        },

        /**
         * @param {Function} fn -- function to call when promise is resolved
         * @param {Object} context -- function's "this" object
         * @returns {Promise} same promise
         */
        done: function(fn, context) {
            var self    = this,
                state   = self._state;

            if (state == FULFILLED && self._wait == 0) {
                try {
                    fn.call(context || null, self._value);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
            else if (state == PENDING) {
                self._dones.push([fn, context]);
            }

            return self;
        },

        _fail: function() {

            var self    = this,
                cbs     = self._fails,
                cb;

            while (cb = cbs.shift()) {
                try {
                    cb[0].call(cb[1] || null, self._reason);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
        },

        /**
         * @param {Function} fn -- function to call when promise is rejected.
         * @param {Object} context -- function's "this" object
         * @returns {Promise} same promise
         */
        fail: function(fn, context) {

            var self    = this,
                state   = self._state;

            if (state == REJECTED && self._wait == 0) {
                try {
                    fn.call(context || null, self._reason);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
            else if (state == PENDING) {
                self._fails.push([fn, context]);
            }

            return self;
        },

        /**
         * @param {Function} fn -- function to call when promise resolved or rejected
         * @param {Object} context -- function's "this" object
         * @return {Promise} same promise
         */
        always: function(fn, context) {
            this.done(fn, context);
            this.fail(fn, context);
            return this;
        },

        /**
         * @returns {object} then: function, done: function, fail: function, always: function
         */
        promise: function() {
            var self = this;
            return {
                then: bind(self.then, self),
                done: bind(self.done, self),
                fail: bind(self.fail, self),
                always: bind(self.always, self)
            };
        },

        after: function(value) {

            var self = this;

            if (isThenable(value)) {

                self._wait++;

                var done = function() {
                    self._wait--;
                    if (self._wait == 0 && self._state != PENDING) {
                        self._state == FULFILLED ?
                            self._callResolveHandlers() :
                            self._callRejectHandlers();
                    }
                };

                if (isFunction(value.done)) {
                    value.done(done);
                }
                else {
                    value.then(done);
                }
            }

            return self;
        }
    }, true, false);


    /**
     * @param {function} fn
     * @param {object} context
     * @param {[]} args
     * @returns {Promise}
     * @static
     */
    Promise.fcall = function(fn, context, args) {
        return Promise.resolve(fn.apply(context, args || []));
    };

    /**
     * @param {*} value
     * @returns {Promise}
     * @static
     */
    Promise.resolve = function(value) {
        var p = new Promise;
        p.resolve(value);
        return p;
    };


    /**
     * @param {*} reason
     * @returns {Promise}
     * @static
     */
    Promise.reject = function(reason) {
        var p = new Promise;
        p.reject(reason);
        return p;
    };


    /**
     * @param {[]} promises -- array of promises or resolve values
     * @returns {Promise}
     * @static
     */
    Promise.all = function(promises) {

        if (!promises.length) {
            return Promise.resolve(null);
        }

        var p       = new Promise,
            len     = promises.length,
            values  = new Array(len),
            cnt     = len,
            i,
            item,
            done    = function(value, inx) {
                values[inx] = value;
                cnt--;

                if (cnt == 0) {
                    p.resolve(values);
                }
            };

        for (i = 0; i < len; i++) {

            (function(inx){
                item = promises[i];

                if (item instanceof Promise) {
                    item.done(function(value){
                        done(value, inx);
                    })
                        .fail(p.reject, p);
                }
                else if (isThenable(item) || isFunction(item)) {
                    (new Promise(item))
                        .done(function(value){
                            done(value, inx);
                        })
                        .fail(p.reject, p);
                }
                else {
                    done(item, inx);
                }
            })(i);
        }

        return p;
    };

    /**
     * @param {Promise|*} promise1
     * @param {Promise|*} promise2
     * @param {Promise|*} promiseN
     * @returns {Promise}
     * @static
     */
    Promise.when = function() {
        return Promise.all(arguments);
    };

    /**
     * @param {[]} promises -- array of promises or resolve values
     * @returns {Promise}
     * @static
     */
    Promise.allResolved = function(promises) {

        if (!promises.length) {
            return Promise.resolve(null);
        }

        var p       = new Promise,
            len     = promises.length,
            values  = [],
            cnt     = len,
            i,
            item,
            settle  = function(value) {
                values.push(value);
                proceed();
            },
            proceed = function() {
                cnt--;
                if (cnt == 0) {
                    p.resolve(values);
                }
            };

        for (i = 0; i < len; i++) {
            item = promises[i];

            if (item instanceof Promise) {
                item.done(settle).fail(proceed);
            }
            else if (isThenable(item) || isFunction(item)) {
                (new Promise(item)).done(settle).fail(proceed);
            }
            else {
                settle(item);
            }
        }

        return p;
    };

    /**
     * @param {[]} promises -- array of promises or resolve values
     * @returns {Promise}
     * @static
     */
    Promise.race = function(promises) {

        if (!promises.length) {
            return Promise.resolve(null);
        }

        var p   = new Promise,
            len = promises.length,
            i,
            item;

        for (i = 0; i < len; i++) {
            item = promises[i];

            if (item instanceof Promise) {
                item.done(p.resolve, p).fail(p.reject, p);
            }
            else if (isThenable(item) || isFunction(item)) {
                (new Promise(item)).done(p.resolve, p).fail(p.reject, p);
            }
            else {
                p.resolve(item);
            }

            if (!p.isPending()) {
                break;
            }
        }

        return p;
    };

    /**
     * @param {[]} functions -- array of promises or resolve values or functions
     * @returns {Promise}
     * @static
     */
    Promise.waterfall = function(functions) {

        if (!functions.length) {
            return Promise.resolve(null);
        }

        var first   = functions.shift(),
            promise = isFunction(first) ? Promise.fcall(first) : Promise.resolve(fn),
            fn;

        while (fn = functions.shift()) {
            if (isThenable(fn)) {
                promise = promise.then(function(fn){
                    return function(){
                        return fn;
                    };
                }(fn));
            }
            else if (isFunction(fn)) {
                promise = promise.then(fn);
            }
            else {
                promise.resolve(fn);
            }
        }

        return promise;
    };

    Promise.counter = function(cnt) {

        var promise     = new Promise;

        promise.countdown = function() {
            cnt--;
            if (cnt == 0) {
                promise.resolve();
            }
        };

        return promise;
    };

    return Promise;
}();





function isString(value) {
    return typeof value == "string" || value === ""+value;
    //return typeof value == "string" || varType(value) === 0;
};



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




var animate = function(){


    var types           = {
            "show":     ["mjs-show"],
            "hide":     ["mjs-hide"],
            "enter":    ["mjs-enter"],
            "leave":    ["mjs-leave"],
            "move":     ["mjs-move"]
        },

        animId          = 0,

        prefixes        = false,
        cssAnimations   = false,

        dataParam       = "mjsAnimationQueue",

        callTimeout     = function(fn, startTime, duration) {
            var tick = function(){
                var time = (new Date).getTime();
                if (time - startTime >= duration) {
                    fn();
                }
                else {
                    raf(tick);
                }
            };
            raf(tick);
        },


        cssAnimSupported= function(){
            if (prefixes === false) {
                prefixes        = getAnimationPrefixes();
                cssAnimations   = !!prefixes;
            }
            return cssAnimations;
        },



        nextInQueue     = function(el) {
            var queue = data(el, dataParam),
                next;
            if (queue.length) {
                next = queue[0];
                animationStage(next.el, next.stages, 0, next.start, next.deferred, false, next.id, next.step);
            }
            else {
                data(el, dataParam, null);
            }
        },

        animationStage  = function animationStage(el, stages, position, startCallback,
                                                  deferred, first, id, stepCallback) {

            var stopped   = function() {
                var q = data(el, dataParam);
                if (!q || !q.length || q[0].id != id) {
                    deferred.reject(el);
                    return true;
                }
                return false;
            };

            var finishStage = function() {

                if (stopped()) {
                    return;
                }

                var thisPosition = position;

                position++;

                if (position == stages.length) {
                    deferred.resolve(el);
                    data(el, dataParam).shift();
                    nextInQueue(el);
                }
                else {
                    data(el, dataParam)[0].position = position;
                    animationStage(el, stages, position, null, deferred, false, id, stepCallback);
                }

                removeClass(el, stages[thisPosition]);
                removeClass(el, stages[thisPosition] + "-active");
            };

            var setStage = function() {

                if (!stopped()) {

                    addClass(el, stages[position] + "-active");

                    Promise.resolve(stepCallback && stepCallback(el, position, "active"))
                        .done(function(){
                            if (!stopped()) {

                                var duration = getAnimationDuration(el);

                                if (duration) {
                                    callTimeout(finishStage, (new Date).getTime(), duration);
                                }
                                else {
                                    raf(finishStage);
                                }
                            }
                        });
                }

            };

            var start = function(){

                if (!stopped()) {
                    addClass(el, stages[position]);

                    Promise.waterfall([
                            stepCallback && stepCallback(el, position, "start"),
                            function(){
                                return startCallback ? startCallback(el) : null;
                            }
                        ])
                        .done(function(){
                            !stopped() && raf(setStage);
                        });
                }
            };



            first ? raf(start) : start();
        };


    /**
     * @function animate
     * @param {Element} el Element being animated
     * @param {string|function|[]|object} animation {
     *  'string' - registered animation name,<br>
     *  'function' - fn(el, callback) - your own animation<br>
     *  'array' - array or stages (class names)<br>
     *  'array' - [{before}, {after}] - jquery animation<br>
     *  'object' - {stages, fn, before, after, options, context, duration, start}
     * }
     * @param {function} startCallback call this function before animation begins
     * @param {bool} checkIfEnabled check if mjs-animate attribute is present
     * @param {MetaphorJs.Namespace} namespace registered animations storage
     * @param {function} stepCallback call this function between stages
     * @returns {MetaphorJs.Promise}
     */
    var animate = function animate(el, animation, startCallback, checkIfEnabled, namespace, stepCallback) {

        var deferred    = new Promise,
            queue       = data(el, dataParam) || [],
            id          = ++animId,
            attrValue   = getAttr(el, "mjs-animate"),
            stages,
            jsFn,
            before, after,
            options, context,
            duration;

        animation       = animation || attrValue;

        if (checkIfEnabled && isNull(attrValue)) {
            animation   = null;
        }

        if (animation) {

            if (isString(animation)) {
                if (animation.substr(0,1) == '[') {
                    stages  = (new Function('', 'return ' + animation))();
                }
                else {
                    stages      = types[animation];
                    animation   = namespace && namespace.get("animate." + animation, true);
                }
            }
            else if (isFunction(animation)) {
                jsFn = animation;
            }
            else if (isArray(animation)) {
                if (isString(animation[0])) {
                    stages = animation;
                }
                else {
                    before = animation[0];
                    after = animation[1];
                }
            }

            if (isPlainObject(animation)) {
                stages      = animation.stages;
                jsFn        = animation.fn;
                before      = animation.before;
                after       = animation.after;
                options     = animation.options ? extend({}, animation.options) : {};
                context     = animation.context || null;
                duration    = animation.duration || null;
                startCallback   = startCallback || options.start;
            }


            if (cssAnimSupported() && stages) {

                queue.push({
                    el: el,
                    stages: stages,
                    start: startCallback,
                    step: stepCallback,
                    deferred: deferred,
                    position: 0,
                    id: id
                });
                data(el, dataParam, queue);

                if (queue.length == 1) {
                    animationStage(el, stages, 0, startCallback, deferred, true, id, stepCallback);
                }

                return deferred;
            }
            else {

                options = options || {};

                startCallback && (options.start = function(){
                    startCallback(el);
                });

                options.complete = function() {
                    deferred.resolve(el);
                };

                duration && (options.duration = duration);

                if (jsFn && isFunction(jsFn)) {
                    if (before) {
                        extend(el.style, before, true, false);
                    }
                    startCallback && startCallback(el);
                    data(el, dataParam, jsFn.call(context, el, function(){
                        deferred.resolve(el);
                    }));
                    return deferred;
                }
                else if (window.jQuery) {

                    var j = $(el);
                    before && j.css(before);
                    data(el, dataParam, "stop");

                    if (jsFn && isString(jsFn)) {
                        j[jsFn](options);
                        return deferred;
                    }
                    else if (after) {
                        j.animate(after, options);
                        return deferred;
                    }
                }
            }
        }

        // no animation happened

        if (startCallback) {
            var promise = startCallback(el);
            if (isThenable(promise)) {
                promise.done(function(){
                    deferred.resolve(el);
                });
            }
            else {
                deferred.resolve(el);
            }
        }
        else {
            deferred.resolve(el);
        }

        return deferred;
    };

    animate.addAnimationType     = function(name, stages) {
        types[name] = stages;
    };

    animate.stop = stopAnimation;
    animate.getPrefixes = getAnimationPrefixes;
    animate.getDuration = getAnimationDuration;

    /**
     * @function animate.cssAnimationSupported
     * @returns {bool}
     */
    animate.cssAnimationSupported = cssAnimSupported;

    return animate;
}();



/**
 * @function trim
 * @param {String} value
 * @returns {string}
 */
var trim = function() {
    // native trim is way faster: http://jsperf.com/angular-trim-test
    // but IE doesn't have it... :-(
    if (!String.prototype.trim) {
        return function(value) {
            return isString(value) ? value.replace(/^\s\s*/, '').replace(/\s\s*$/, '') : value;
        };
    }
    return function(value) {
        return isString(value) ? value.trim() : value;
    };
}();


function emptyFn(){};



var parseJSON = function() {

    return typeof JSON != strUndef ?
           function(data) {
               return JSON.parse(data);
           } :
           function(data) {
               return (new Function("return " + data))();
           };
}();





function parseXML(data, type) {

    var xml, tmp;

    if (!data || !isString(data)) {
        return null;
    }

    // Support: IE9
    try {
        tmp = new DOMParser();
        xml = tmp.parseFromString(data, type || "text/xml");
    } catch (thrownError) {
        xml = undf;
    }

    if (!xml || xml.getElementsByTagName("parsererror").length) {
        throw "Invalid XML: " + data;
    }

    return xml;
};





/**
 * @description A javascript event system implementing two patterns - observable and collector.
 * @description Observable:
 * @code examples/observable.js
 *
 * @description Collector:
 * @code examples/collector.js
 *
 * @class Observable
 * @version 1.1
 * @author johann kuindji
 * @link https://github.com/kuindji/metaphorjs-observable
 */
var Observable = function() {

    this.events = {};

};


extend(Observable.prototype, {



    /**
    * You don't have to call this function unless you want to pass params other than event name.
    * Normally, events are created automatically.
    *
    * @method createEvent
    * @access public
    * @param {string} name {
    *       Event name
    *       @required
    * }
    * @param {bool|string} returnResult {
    *   false -- return first 'false' result and stop calling listeners after that<br>
    *   "all" -- return all results as array<br>
    *   "merge" -- merge all results into one array (each result must be array)<br>
    *   "first" -- return result of the first handler (next listener will not be called)<br>
    *   "last" -- return result of the last handler (all listeners will be called)<br>
    * }
    * @param {bool} autoTrigger {
    *   once triggered, all future subscribers will be automatically called
    *   with last trigger params
    *   @code examples/autoTrigger.js
    * }
    * @param {function} triggerFilter {
    *   This function will be called each time event is triggered. Return false to skip listener.
    *   @code examples/triggerFilter.js
    *   @param {object} listener This object contains all information about the listener, including
    *       all data you provided in options while subscribing to the event.
    *   @param {[]} arguments
    *   @return {bool}
    * }
    * @return {ObservableEvent}
    */

    /**
     * @method createEvent
     * @param {string} name
     * @param {object} options {
     *  @type {string} returnResult
     *  @param {bool} autoTrigger
     *  @param {function} triggerFilter
     * }
     * @param {object} filterContext
     * @returns {ObservableEvent}
     */
    createEvent: function(name, returnResult, autoTrigger, triggerFilter, filterContext) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            events[name] = new Event(name, returnResult, autoTrigger, triggerFilter, filterContext);
        }
        return events[name];
    },

    /**
    * @method
    * @access public
    * @param {string} name Event name
    * @return {ObservableEvent|undefined}
    */
    getEvent: function(name) {
        name = name.toLowerCase();
        return this.events[name];
    },

    /**
    * Subscribe to an event or register collector function.
    * @method
    * @access public
    * @param {string} name {
    *       Event name
    *       @required
    * }
    * @param {function} fn {
    *       Callback function
    *       @required
    * }
    * @param {object} context "this" object for the callback function
    * @param {object} options {
    *       You can pass any key-value pairs in this object. All of them will be passed to triggerFilter (if
    *       you're using one).
    *       @type {bool} first {
    *           True to prepend to the list of handlers
    *           @default false
    *       }
    *       @type {number} limit {
    *           Call handler this number of times; 0 for unlimited
    *           @default 0
    *       }
    *       @type {number} start {
    *           Start calling handler after this number of calls. Starts from 1
    *           @default 1
    *       }
     *      @type {[]} append Append parameters
     *      @type {[]} prepend Prepend parameters
     *      @type {bool} allowDupes allow the same handler twice
    * }
    */
    on: function(name, fn, context, options) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            events[name] = new Event(name);
        }
        return events[name].on(fn, context, options);
    },

    /**
    * Same as {@link Observable.on}, but options.limit is forcefully set to 1.
    * @method
    * @access public
    */
    once: function(name, fn, context, options) {
        options     = options || {};
        options.limit = 1;
        return this.on(name, fn, context, options);
    },


    /**
    * Unsubscribe from an event
    * @method
    * @access public
    * @param {string} name Event name
    * @param {function} fn Event handler
    * @param {object} context If you called on() with context you must call un() with the same context
    */
    un: function(name, fn, context) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].un(fn, context);
    },

    /**
     * @method hasListener
     * @access public
     * @return bool
     */

    /**
    * @method hasListener
    * @access public
    * @param {string} name Event name { @required }
    * @return bool
    */

    /**
    * @method
    * @access public
    * @param {string} name Event name { @required }
    * @param {function} fn Callback function { @required }
    * @param {object} context Function's "this" object
    * @return bool
    */
    hasListener: function(name, fn, context) {
        var events = this.events;

        if (name) {
            name = name.toLowerCase();
            if (!events[name]) {
                return false;
            }
            return events[name].hasListener(fn, context);
        }
        else {
            for (name in events) {
                if (events[name].hasListener()) {
                    return true;
                }
            }
            return false;
        }
    },


    /**
    * Remove all listeners from all events
    * @method removeAllListeners
    * @access public
    */

    /**
    * Remove all listeners from specific event
    * @method
    * @access public
    * @param {string} name Event name { @required }
    */
    removeAllListeners: function(name) {
        var events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].removeAllListeners();
    },

    /**
    * Trigger an event -- call all listeners.
    * @method
    * @access public
    * @param {string} name Event name { @required }
    * @param {*} ... As many other params as needed
    * @return mixed
    */
    trigger: function() {

        var name = arguments[0],
            events  = this.events;

        name = name.toLowerCase();

        if (!events[name]) {
            return null;
        }

        var e = events[name];
        return e.trigger.apply(e, slice.call(arguments, 1));
    },

    /**
    * Suspend an event. Suspended event will not call any listeners on trigger().
    * @method
    * @access public
    * @param {string} name Event name
    */
    suspendEvent: function(name) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].suspend();
    },

    /**
    * @method
    * @access public
    */
    suspendAllEvents: function() {
        var events  = this.events;
        for (var name in events) {
            events[name].suspend();
        }
    },

    /**
    * Resume suspended event.
    * @method
    * @access public
    * @param {string} name Event name
    */
    resumeEvent: function(name) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].resume();
    },

    /**
    * @method
    * @access public
    */
    resumeAllEvents: function() {
        var events  = this.events;
        for (var name in events) {
            events[name].resume();
        }
    },

    /**
     * @method
     * @access public
     * @param {string} name Event name
     */
    destroyEvent: function(name) {
        var events  = this.events;
        if (events[name]) {
            events[name].removeAllListeners();
            events[name].destroy();
            delete events[name];
        }
    },


    /**
    * Destroy observable
    * @method
    * @md-not-inheritable
    * @access public
    */
    destroy: function() {
        var self    = this,
            events  = self.events;

        for (var i in events) {
            self.destroyEvent(i);
        }

        for (i in self) {
            self[i] = null;
        }
    },

    /**
    * Although all methods are public there is getApi() method that allows you
    * extending your own objects without overriding "destroy" (which you probably have)
    * @code examples/api.js
    * @method
    * @md-not-inheritable
    * @returns object
    */
    getApi: function() {

        var self    = this;

        if (!self.api) {

            var methods = [
                    "createEvent", "getEvent", "on", "un", "once", "hasListener", "removeAllListeners",
                    "trigger", "suspendEvent", "suspendAllEvents", "resumeEvent",
                    "resumeAllEvents", "destroyEvent"
                ],
                api = {},
                name;

            for(var i =- 1, l = methods.length;
                    ++i < l;
                    name = methods[i],
                    api[name] = bind(self[name], self)){}

            self.api = api;
        }

        return self.api;

    }
}, true, false);


/**
 * This class is private - you can't create an event other than via Observable.
 * See Observable reference.
 * @class ObservableEvent
 * @private
 */
var Event = function(name, returnResult, autoTrigger, triggerFilter, filterContext) {

    var self    = this;

    self.name           = name;
    self.listeners      = [];
    self.map            = {};
    self.hash           = nextUid();
    self.uni            = '$$' + name + '_' + self.hash;
    self.suspended      = false;
    self.lid            = 0;

    if (typeof returnResult == "object" && returnResult !== null) {
        extend(self, returnResult, true, false);
    }
    else {
        self.returnResult = returnResult === undf ? null : returnResult; // first|last|all
        self.autoTrigger = autoTrigger;
        self.triggerFilter = triggerFilter;
        self.filterContext = filterContext;
    }
};


extend(Event.prototype, {

    name: null,
    listeners: null,
    map: null,
    hash: null,
    uni: null,
    suspended: false,
    lid: null,
    returnResult: null,
    autoTrigger: null,
    lastTrigger: null,
    triggerFilter: null,
    filterContext: null,

    /**
     * Get event name
     * @method
     * @returns {string}
     */
    getName: function() {
        return this.name;
    },

    /**
     * @method
     */
    destroy: function() {
        var self        = this,
            k;

        for (k in self) {
            self[k] = null;
        }
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Function's "this" object
     * @param {object} options See Observable's on()
     */
    on: function(fn, context, options) {

        if (!fn) {
            return null;
        }

        context     = context || null;
        options     = options || {};

        var self        = this,
            uni         = self.uni,
            uniContext  = context || fn;

        if (uniContext[uni] && !options.allowDupes) {
            return null;
        }

        var id      = ++self.lid,
            first   = options.first || false;

        uniContext[uni]  = id;


        var e = {
            fn:         fn,
            context:    context,
            uniContext: uniContext,
            id:         id,
            called:     0, // how many times the function was triggered
            limit:      0, // how many times the function is allowed to trigger
            start:      1, // from which attempt it is allowed to trigger the function
            count:      0, // how many attempts to trigger the function was made
            append:     null, // append parameters
            prepend:    null // prepend parameters
        };

        extend(e, options, true, false);

        if (first) {
            self.listeners.unshift(e);
        }
        else {
            self.listeners.push(e);
        }

        self.map[id] = e;

        if (self.autoTrigger && self.lastTrigger && !self.suspended) {
            var prevFilter = self.triggerFilter;
            self.triggerFilter = function(l){
                if (l.id == id) {
                    return prevFilter ? prevFilter(l) !== false : true;
                }
                return false;
            };
            self.trigger.apply(self, self.lastTrigger);
            self.triggerFilter = prevFilter;
        }

        return id;
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Function's "this" object
     * @param {object} options See Observable's on()
     */
    once: function(fn, context, options) {

        options = options || {};
        options.once = true;

        return this.on(fn, context, options);
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Function's "this" object
     */
    un: function(fn, context) {

        var self        = this,
            inx         = -1,
            uni         = self.uni,
            listeners   = self.listeners,
            id;

        if (fn == parseInt(fn)) {
            id      = fn;
        }
        else {
            context = context || fn;
            id      = context[uni];
        }

        if (!id) {
            return false;
        }

        for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i].id == id) {
                inx = i;
                delete listeners[i].uniContext[uni];
                break;
            }
        }

        if (inx == -1) {
            return false;
        }

        listeners.splice(inx, 1);
        delete self.map[id];
        return true;
    },

    /**
     * @method hasListener
     * @return bool
     */

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Function's "this" object
     * @return bool
     */
    hasListener: function(fn, context) {

        var self    = this,
            listeners   = self.listeners,
            id;

        if (fn) {

            context = context || fn;

            if (!isFunction(fn)) {
                id  = fn;
            }
            else {
                id  = context[self.uni];
            }

            if (!id) {
                return false;
            }

            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i].id == id) {
                    return true;
                }
            }

            return false;
        }
        else {
            return listeners.length > 0;
        }
    },


    /**
     * @method
     */
    removeAllListeners: function() {
        var self    = this,
            listeners = self.listeners,
            uni     = self.uni,
            i, len;

        for (i = 0, len = listeners.length; i < len; i++) {
            delete listeners[i].uniContext[uni];
        }
        self.listeners   = [];
        self.map         = {};
    },

    /**
     * @method
     */
    suspend: function() {
        this.suspended = true;
    },

    /**
     * @method
     */
    resume: function() {
        this.suspended = false;
    },


    _prepareArgs: function(l, triggerArgs) {
        var args;

        if (l.append || l.prepend) {
            args    = slice.call(triggerArgs);
            if (l.prepend) {
                args    = l.prepend.concat(args);
            }
            if (l.append) {
                args    = args.concat(l.append);
            }
        }
        else {
            args = triggerArgs;
        }

        return args;
    },

    /**
     * @method
     * @return {*}
     */
    trigger: function() {

        var self            = this,
            listeners       = self.listeners,
            returnResult    = self.returnResult,
            filter          = self.triggerFilter,
            filterContext   = self.filterContext,
            args;

        if (self.suspended) {
            return null;
        }

        if (self.autoTrigger) {
            self.lastTrigger = slice.call(arguments);
        }

        if (listeners.length == 0) {
            return null;
        }

        var ret     = returnResult == "all" || returnResult == "merge" ?
                        [] : null,
            q, l,
            res;

        if (returnResult == "first") {
            q = [listeners[0]];
        }
        else {
            // create a snapshot of listeners list
            q = slice.call(listeners);
        }

        // now if during triggering someone unsubscribes
        // we won't skip any listener due to shifted
        // index
        while (l = q.shift()) {

            // listener may already have unsubscribed
            if (!l || !self.map[l.id]) {
                continue;
            }

            args = self._prepareArgs(l, arguments);

            if (filter && filter.call(filterContext, l, args, self) === false) {
                continue;
            }

            l.count++;

            if (l.count < l.start) {
                continue;
            }

            res = l.fn.apply(l.context, args);

            l.called++;

            if (l.called == l.limit) {
                self.un(l.id);
            }

            if (returnResult == "all") {
                ret.push(res);
            }
            else if (returnResult == "merge" && res) {
                ret = ret.concat(res);
            }
            else if (returnResult == "first") {
                return res;
            }
            else if (returnResult == "nonempty" && res) {
                return res;
            }
            else if (returnResult == "last") {
                ret = res;
            }
            else if (returnResult == false && res === false) {
                return false;
            }
        }

        if (returnResult) {
            return ret;
        }
    }
}, true, false);






function isObject(value) {
    if (value === null || typeof value != "object") {
        return false;
    }
    var vt = varType(value);
    return vt > 2 || vt == -1;
};



function isPrimitive(value) {
    var vt = varType(value);
    return vt < 3 && vt > -1;
};





/*
* Contents of this file are partially taken from jQuery
*/

var ajax = function(){

    

    var rhash       = /#.*$/,

        rts         = /([?&])_=[^&]*/,

        rquery      = /\?/,

        rurl        = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

        rgethead    = /^(?:GET|HEAD)$/i,

        buildParams     = function(data, params, name) {

            var i, len;

            if (isPrimitive(data) && name) {
                params.push(encodeURIComponent(name) + "=" + encodeURIComponent(""+data));
            }
            else if (isArray(data) && name) {
                for (i = 0, len = data.length; i < len; i++) {
                    buildParams(data[i], params, name + "["+i+"]");
                }
            }
            else if (isObject(data)) {
                for (i in data) {
                    if (data.hasOwnProperty(i)) {
                        buildParams(data[i], params, name ? name + "["+i+"]" : i);
                    }
                }
            }
        },

        prepareParams   = function(data) {
            var params = [];
            buildParams(data, params, null);
            return params.join("&").replace(/%20/g, "+");
        },

        prepareUrl  = function(url, opt) {

            url.replace(rhash, "");

            if (opt.cache === false) {

                var stamp   = (new Date).getTime();

                url = rts.test(url) ?
                    // If there is already a '_' parameter, set its value
                       url.replace(rts, "$1_=" + stamp) :
                    // Otherwise add one to the end
                       url + (rquery.test(url) ? "&" : "?" ) + "_=" + stamp;
            }

            if (opt.data && (!window.FormData || !(opt.data instanceof window.FormData))) {

                opt.data = !isString(opt.data) ? prepareParams(opt.data) : opt.data;

                if (rgethead.test(opt.method)) {
                    url += (rquery.test(url) ? "&" : "?") + opt.data;
                    opt.data = null;
                }
            }

            return url;
        },

        accepts     = {
            xml:        "application/xml, text/xml",
            html:       "text/html",
            script:     "text/javascript, application/javascript",
            json:       "application/json, text/javascript",
            text:       "text/plain",
            _default:   "*/*"
        },

        defaults    = {
            url:            null,
            data:           null,
            method:         "GET",
            headers:        null,
            username:       null,
            password:       null,
            cache:          null,
            dataType:       null,
            timeout:        0,
            contentType:    "application/x-www-form-urlencoded",
            xhrFields:      null,
            jsonp:          false,
            jsonpParam:     null,
            jsonpCallback:  null,
            transport:      null,
            replace:        false,
            selector:       null,
            form:           null,
            beforeSend:     null,
            progress:       null,
            uploadProgress: null,
            processResponse:null,
            callbackScope:  null
        },

        defaultSetup    = {},

        globalEvents    = new Observable,

        createXHR       = function() {

            var xhr;

            if (!window.XMLHttpRequest || !(xhr = new XMLHttpRequest())) {
                if (!(xhr = new ActiveXObject("Msxml2.XMLHTTP"))) {
                    if (!(xhr = new ActiveXObject("Microsoft.XMLHTTP"))) {
                        throw "Unable to create XHR object";
                    }
                }
            }

            return xhr;
        },

        globalEval      = function(code){
            var script, indirect = eval;
            if (code) {
                if (/^[^\S]*use strict/.test(code)) {
                    script = document.createElement("script");
                    script.text = code;
                    document.head.appendChild(script)
                        .parentNode.removeChild(script);
                } else {
                    indirect(code);
                }
            }
        },

        data2form       = function(data, form, name) {

            var i, input, len;

            if (!isObject(data) && !isFunction(data) && name) {
                input   = document.createElement("input");
                setAttr(input, "type", "hidden");
                setAttr(input, "name", name);
                setAttr(input, "value", data);
                form.appendChild(input);
            }
            else if (isArray(data) && name) {
                for (i = 0, len = data.length; i < len; i++) {
                    data2form(data[i], form, name + "["+i+"]");
                }
            }
            else if (isObject(data)) {
                for (i in data) {
                    if (data.hasOwnProperty(i)) {
                        data2form(data[i], form, name ? name + "["+i+"]" : i);
                    }
                }
            }
        },

        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
        serializeForm   = function(form) {

            var oField, sFieldType, nFile, sSearch = "";

            for (var nItem = 0; nItem < form.elements.length; nItem++) {

                oField = form.elements[nItem];

                if (getAttr(oField, "name") === null) {
                    continue;
                }

                sFieldType = oField.nodeName.toUpperCase() === "INPUT" ?
                             getAttr(oField, "type").toUpperCase() : "TEXT";

                if (sFieldType === "FILE") {
                    for (nFile = 0;
                         nFile < oField.files.length;
                         sSearch += "&" + encodeURIComponent(oField.name) + "=" +
                                    encodeURIComponent(oField.files[nFile++].name)){}

                } else if ((sFieldType !== "RADIO" && sFieldType !== "CHECKBOX") || oField.checked) {
                    sSearch += "&" + encodeURIComponent(oField.name) + "=" + encodeURIComponent(oField.value);
                }
            }

            return sSearch;
        },

        httpSuccess     = function(r) {
            try {
                return (!r.status && location && location.protocol == "file:")
                           || (r.status >= 200 && r.status < 300)
                           || r.status === 304 || r.status === 1223; // || r.status === 0;
            } catch(thrownError){}
            return false;
        },

        processData     = function(data, opt, ct) {

            var type        = opt ? opt.dataType : null,
                selector    = opt ? opt.selector : null,
                doc;

            if (!isString(data)) {
                return data;
            }

            ct = ct || "";

            if (type === "xml" || !type && ct.indexOf("xml") >= 0) {
                doc = parseXML(trim(data));
                return selector ? select(selector, doc) : doc;
            }
            else if (type === "html") {
                doc = parseXML(data, "text/html");
                return selector ? select(selector, doc) : doc;
            }
            else if (type == "fragment") {
                var fragment    = document.createDocumentFragment(),
                    div         = document.createElement("div");

                div.innerHTML   = data;

                while (div.firstChild) {
                    fragment.appendChild(div.firstChild);
                }

                return fragment;
            }
            else if (type === "json" || !type && ct.indexOf("json") >= 0) {
                return parseJSON(trim(data));
            }
            else if (type === "script" || !type && ct.indexOf("javascript") >= 0) {
                globalEval(data);
            }

            return data + "";
        };




    var AJAX    = function(opt) {

        var self        = this,
            href        = window ? window.location.href : "",
            local       = rurl.exec(href.toLowerCase()) || [],
            parts       = rurl.exec(opt.url.toLowerCase());

        self._opt       = opt;

        if (opt.crossDomain !== true) {
            opt.crossDomain = !!(parts &&
                                 (parts[1] !== local[1] || parts[2] !== local[2] ||
                                  (parts[3] || (parts[1] === "http:" ? "80" : "443")) !==
                                  (local[3] || (local[1] === "http:" ? "80" : "443"))));
        }

        var deferred    = new Promise,
            transport;

        if (opt.transport == "iframe" && !opt.form) {
            self.createForm();
            opt.form = self._form;
        }
        else if (opt.form) {
            self._form = opt.form;
            if (opt.method == "POST" && (!window || !window.FormData)) {
                opt.transport = "iframe";
            }
        }

        if (opt.form && opt.transport != "iframe") {
            if (opt.method == "POST") {
                opt.data = new FormData(opt.form);
            }
            else {
                opt.data = serializeForm(opt.form);
            }
        }

        opt.url = prepareUrl(opt.url, opt);

        if ((opt.crossDomain || opt.transport == "script") && !opt.form) {
            transport   = new ScriptTransport(opt, deferred, self);
        }
        else if (opt.transport == "iframe") {
            transport   = new IframeTransport(opt, deferred, self);
        }
        else {
            transport   = new XHRTransport(opt, deferred, self);
        }

        self._deferred      = deferred;
        self._transport     = transport;

        deferred.done(function(value) {
            globalEvents.trigger("success", value);
        });
        deferred.fail(function(reason) {
            globalEvents.trigger("error", reason);
        });
        deferred.always(function(){
            globalEvents.trigger("end");
        });

        globalEvents.trigger("start");


        if (opt.timeout) {
            self._timeout = setTimeout(bind(self.onTimeout, self), opt.timeout);
        }

        if (opt.jsonp) {
            self.createJsonp();
        }

        if (globalEvents.trigger("beforeSend", opt, transport) === false) {
            self._promise = Promise.reject();
        }
        if (opt.beforeSend && opt.beforeSend.call(opt.callbackScope, opt, transport) === false) {
            self._promise = Promise.reject();
        }

        if (!self._promise) {
            async(transport.send, transport);

            deferred.abort = bind(self.abort, self);
            deferred.always(self.destroy, self);

            self._promise = deferred;
        }
    };

    extend(AJAX.prototype, {

        _jsonpName: null,
        _transport: null,
        _opt: null,
        _deferred: null,
        _promise: null,
        _timeout: null,
        _form: null,
        _removeForm: false,

        promise: function() {
            return this._promise;
        },

        abort: function(reason) {
            this._transport.abort();
            this._deferred.reject(reason || "abort");
        },

        onTimeout: function() {
            this.abort("timeout");
        },

        createForm: function() {

            var self    = this,
                form    = document.createElement("form");

            form.style.display = "none";
            setAttr(form, "method", self._opt.method);

            data2form(self._opt.data, form, null);

            document.body.appendChild(form);

            self._form = form;
            self._removeForm = true;
        },

        createJsonp: function() {

            var self        = this,
                opt         = self._opt,
                paramName   = opt.jsonpParam || "callback",
                cbName      = opt.jsonpCallback || "jsonp_" + nextUid();

            opt.url += (rquery.test(opt.url) ? "&" : "?") + paramName + "=" + cbName;

            self._jsonpName = cbName;

            if (typeof window != strUndef) {
                window[cbName] = bind(self.jsonpCallback, self);
            }
            if (typeof global != strUndef) {
                global[cbName] = bind(self.jsonpCallback, self);
            }

            return cbName;
        },

        jsonpCallback: function(data) {

            var self    = this,
                res;

            try {
                res = self.processResponseData(data);
            }
            catch (thrownError) {
                if (self._deferred) {
                    self._deferred.reject(thrownError);
                }
                else {
                    error(thrownError);
                }
            }

            if (self._deferred) {
                self._deferred.resolve(res);
            }
        },

        processResponseData: function(data, contentType) {

            var self    = this,
                opt     = self._opt;

            data    = processData(data, opt, contentType);

            if (globalEvents.hasListener("processResponse")) {
                data    = globalEvents.trigger("processResponse", data, self._deferred);
            }

            if (opt.processResponse) {
                data    = opt.processResponse.call(opt.callbackScope, data, self._deferred);
            }

            return data;
        },

        processResponse: function(data, contentType) {

            var self        = this,
                deferred    = self._deferred,
                result;

            if (!self._opt.jsonp) {
                try {
                    result = self.processResponseData(data, contentType)
                }
                catch (thrownError) {
                    deferred.reject(thrownError);
                }

                deferred.resolve(result);
            }
            else {
                if (!data) {
                    deferred.reject("jsonp script is empty");
                    return;
                }

                try {
                    globalEval(data);
                }
                catch (thrownError) {
                    deferred.reject(thrownError);
                }

                if (deferred.isPending()) {
                    deferred.reject("jsonp script didn't invoke callback");
                }
            }
        },

        destroy: function() {

            var self    = this;

            if (self._timeout) {
                clearTimeout(self._timeout);
            }

            if (self._form && self._form.parentNode && self._removeForm) {
                self._form.parentNode.removeChild(self._form);
            }

            self._transport.destroy();

            self._transport = null;
            self._opt = null;
            self._deferred = null;
            self._promise = null;
            self._timeout = null;
            self._form = null;

            if (self._jsonpName) {
                if (typeof window != strUndef) {
                    delete window[self._jsonpName];
                }
                if (typeof global != strUndef) {
                    delete global[self._jsonpName];
                }
            }
        }
    }, true, false);



    var ajax    = function(url, opt) {

        opt = opt || {};

        if (url && !isString(url)) {
            opt = url;
        }
        else {
            opt.url = url;
        }

        if (!opt.url) {
            if (opt.form) {
                opt.url = getAttr(opt.form, "action");
            }
            if (!opt.url) {
                throw "Must provide url";
            }
        }

        extend(opt, defaultSetup, false, true);
        extend(opt, defaults, false, true);

        if (!opt.method) {
            if (opt.form) {
                opt.method = getAttr(opt.form, "method").toUpperCase() || "GET";
            }
            else {
                opt.method = "GET";
            }
        }
        else {
            opt.method = opt.method.toUpperCase();
        }

        return (new AJAX(opt)).promise();
    };

    ajax.setup  = function(opt) {
        extend(defaultSetup, opt, true, true);
    };

    ajax.on     = function() {
        globalEvents.on.apply(globalEvents, arguments);
    };

    ajax.un     = function() {
        globalEvents.un.apply(globalEvents, arguments);
    };

    ajax.get    = function(url, opt) {
        opt = opt || {};
        opt.method = "GET";
        return ajax(url, opt);
    };

    ajax.post   = function(url, opt) {
        opt = opt || {};
        opt.method = "POST";
        return ajax(url, opt);
    };

    ajax.load   = function(el, url, opt) {

        opt = opt || {};

        if (!isString(url)) {
            opt = url;
        }

        opt.dataType = "fragment";

        return ajax(url, opt).done(function(fragment){
            if (opt.replace) {
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
            }
            el.appendChild(fragment);
        });
    };

    ajax.loadScript = function(url) {
        return ajax(url, {transport: "script"});
    };

    ajax.submit = function(form, opt) {

        opt = opt || {};
        opt.form = form;

        return ajax(null, opt);
    };









    var XHRTransport     = function(opt, deferred, ajax) {

        var self    = this,
            xhr;

        self._xhr = xhr     = createXHR();
        self._deferred      = deferred;
        self._opt           = opt;
        self._ajax          = ajax;

        if (opt.progress) {
            addListener(xhr, "progress", bind(opt.progress, opt.callbackScope));
        }
        if (opt.uploadProgress && xhr.upload) {
            addListener(xhr.upload, "progress", bind(opt.uploadProgress, opt.callbackScope));
        }

        xhr.onreadystatechange = bind(self.onReadyStateChange, self);
    };

    extend(XHRTransport.prototype, {

        _xhr: null,
        _deferred: null,
        _ajax: null,

        setHeaders: function() {

            var self = this,
                opt = self._opt,
                xhr = self._xhr,
                i;

            if (opt.xhrFields) {
                for (i in opt.xhrFields) {
                    xhr[i] = opt.xhrFields[i];
                }
            }
            if (opt.data && opt.contentType) {
                xhr.setRequestHeader("Content-Type", opt.contentType);
            }
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.setRequestHeader("Accept",
                opt.dataType && accepts[opt.dataType] ?
                accepts[opt.dataType] + ", */*; q=0.01" :
                accepts._default
            );
            for (i in opt.headers) {
                xhr.setRequestHeader(i, opt.headers[i]);
            }

        },

        onReadyStateChange: function() {

            var self        = this,
                xhr         = self._xhr,
                deferred    = self._deferred;

            if (xhr.readyState === 0) {
                xhr.onreadystatechange = emptyFn;
                deferred.resolve(xhr);
                return;
            }

            if (xhr.readyState === 4) {
                xhr.onreadystatechange = emptyFn;

                if (httpSuccess(xhr)) {

                    self._ajax.processResponse(
                        isString(xhr.responseText) ? xhr.responseText : undf,
                        xhr.getResponseHeader("content-type") || ''
                    );
                }
                else {
                    deferred.reject(xhr);
                }
            }
        },

        abort: function() {
            var self    = this;
            self._xhr.onreadystatechange = emptyFn;
            self._xhr.abort();
        },

        send: function() {

            var self    = this,
                opt     = self._opt;

            try {
                self._xhr.open(opt.method, opt.url, true, opt.username, opt.password);
                self.setHeaders();
                self._xhr.send(opt.data);
            }
            catch (thrownError) {
                if (self._deferred) {
                    self._deferred.reject(thrownError);
                }
            }
        },

        destroy: function() {
            var self    = this;

            self._xhr = null;
            self._deferred = null;
            self._opt = null;
            self._ajax = null;

        }

    }, true, false);



    var ScriptTransport  = function(opt, deferred, ajax) {


        var self        = this;

        self._opt       = opt;
        self._ajax      = ajax;
        self._deferred  = deferred;

    };

    extend(ScriptTransport.prototype, {

        _opt: null,
        _deferred: null,
        _ajax: null,
        _el: null,

        send: function() {

            var self    = this,
                script  = document.createElement("script");

            setAttr(script, "async", "async");
            setAttr(script, "charset", "utf-8");
            setAttr(script, "src", self._opt.url);

            addListener(script, "load", bind(self.onLoad, self));
            addListener(script, "error", bind(self.onError, self));

            document.head.appendChild(script);

            self._el = script;
        },

        onLoad: function(evt) {
            if (this._deferred) { // haven't been destroyed yet
                this._deferred.resolve(evt);
            }
        },

        onError: function(evt) {
            this._deferred.reject(evt);
        },

        abort: function() {
            var self    = this;

            if (self._el.parentNode) {
                self._el.parentNode.removeChild(self._el);
            }
        },

        destroy: function() {

            var self    = this;

            if (self._el.parentNode) {
                self._el.parentNode.removeChild(self._el);
            }

            self._el = null;
            self._opt = null;
            self._ajax = null;
            self._deferred = null;

        }

    }, true, false);



    var IframeTransport = function(opt, deferred, ajax) {
        var self        = this;

        self._opt       = opt;
        self._ajax      = ajax;
        self._deferred  = deferred;
    };

    extend(IframeTransport.prototype, {

        _opt: null,
        _deferred: null,
        _ajax: null,
        _el: null,

        send: function() {

            var self    = this,
                frame   = document.createElement("iframe"),
                id      = "frame-" + nextUid(),
                form    = self._opt.form;

            setAttr(frame, "id", id);
            setAttr(frame, "name", id);
            frame.style.display = "none";
            document.body.appendChild(frame);

            setAttr(form, "action", self._opt.url);
            setAttr(form, "target", id);

            addListener(frame, "load", bind(self.onLoad, self));
            addListener(frame, "error", bind(self.onError, self));

            self._el = frame;

            try {
                form.submit();
            }
            catch (thrownError) {
                self._deferred.reject(thrownError);
            }
        },

        onLoad: function() {

            var self    = this,
                frame   = self._el,
                doc,
                data;

            if (self._opt && !self._opt.jsonp) {
                doc		= frame.contentDocument || frame.contentWindow.document;
                data    = doc.body.innerHTML;
                self._ajax.processResponse(data);
            }
        },

        onError: function(evt) {
            this._deferred.reject(evt);
        },

        abort: function() {
            var self    = this;

            if (self._el.parentNode) {
                self._el.parentNode.removeChild(self._el);
            }
        },

        destroy: function() {
            var self    = this;

            if (self._el.parentNode) {
                self._el.parentNode.removeChild(self._el);
            }

            self._el = null;
            self._opt = null;
            self._ajax = null;
            self._deferred = null;

        }

    }, true, false);

    return ajax;
}();






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




function getOffsetParent(node) {

    var html = window.document.documentElement,
        offsetParent = node.offsetParent || html;

    while (offsetParent && (offsetParent != html &&
                              getStyle(offsetParent, "position") == "static")) {
        offsetParent = offsetParent.offsetParent;
    }

    return offsetParent || html;

};



function getPosition(node, to) {

    var offsetParent, offset,
        parentOffset = {top: 0, left: 0},
        html = window.document.documentElement;

    if (node === window || node === html) {
        return parentOffset;
    }

    // Fixed elements are offset from window (parentOffset = {top:0, left: 0},
    // because it is its only offset parent
    if (getStyle(node, "position" ) == "fixed") {
        // Assume getBoundingClientRect is there when computed position is fixed
        offset = node.getBoundingClientRect();
    }
    else if (to) {
        var thisOffset = getOffset(node),
            toOffset = getOffset(to),
            position = {
                left: thisOffset.left - toOffset.left,
                top: thisOffset.top - toOffset.top
            };

        if (position.left < 0) {
            position.left = 0;
        }
        if (position.top < 0) {
            position.top = 0;
        }
        return position;
    }
    else {
        // Get *real* offsetParent
        offsetParent = getOffsetParent(node);

        // Get correct offsets
        offset = getOffset(node);

        if (offsetParent !== html) {
            parentOffset = getOffset(offsetParent);
        }

        // Add offsetParent borders
        parentOffset.top += getStyle(offsetParent, "borderTopWidth", true);
        parentOffset.left += getStyle(offsetParent, "borderLeftWidth", true);
    }

    // Subtract parent offsets and element margins
    return {
        top: offset.top - parentOffset.top - getStyle(node, "marginTop", true),
        left: offset.left - parentOffset.left - getStyle(node, "marginLeft", true)
    };
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
                    dp  = (dlg.getState().positionType || "").replace(/(w|m|c)/, "").substr(0,1),
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
                    if (!el.parentNode) {
                        dlg.getElem().appendChild(el);
                    }
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


    var defaultEventProcessor = function(dlg, e, type, returnMode){
        if (type == "show" || !returnMode) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
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
             * @type {object}
             * @md-stack add
             */
            show: {

                /**
                 * You can also add any event you use to show/hide dialog.
                 * @type {object}
                 * @md-stack add
                 */
                "*": {

                    /**
                     * @type {function}
                     * @md-stack remove 2
                     */
                    process: defaultEventProcessor
                }
            },

            /**
             * @type {object}
             * @md-stack add
             */
            hide: {

                /**
                 * You can also add any event you use to show/hide dialog.
                 * @type {object}
                 * @md-stack add
                 */
                "*": {

                    /**
                     * Must return "returnValue" which will be in its turn
                     * returned from event handler. If you provide this function
                     * preventDefault and stopPropagation options are ignored.
                     * @function
                     * @param {Dialog} dialog
                     * @param {Event} event
                     * @md-stack remove 3
                     */
                    process: defaultEventProcessor
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
             * function(api) - must return one of the following:<br>
             * "auto" - detect position automatically<br>
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
             *
             * Defaults to 't'
             * @type {bool|string}
             */
            type:			't',

            /**
             * Works when type = 'auto'
             * @type {string}
             */
            preferredType:  't',

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
             * Calculate position relative to this element (defaults to window)
             * @type {string|Element}
             */
            base:           null,

            /**
             * Monitor window/selector/element scroll.
             * @type {bool|string|Element}
             */
            scroll:         false,

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
                positionBase:       null,
                positionType:       null,
                positionFn:         null,
                positionGetType:    null,
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
             * Get dialog's pointer object
             * @returns {Pointer}
             */
            getPointer: function() {
                return pnt;
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
             * @returns {boolean}
             */
            isRendered: function() {
                return state.rendered;
            },

            getState: function() {
                return state;
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
                    scfg        = cfg.show,
                    returnMode  = null;

                // if tooltip is disabled, we do not stop propagation and do not return false.s
                if (!api.isEnabled()) {

                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("show: not enabled", api.getTarget());
                    }
                    /*debug-end*/

                    returnMode = "disabled";
                    //return returnValue;
                }


                // if tooltip is already shown
                // and hide timeout was set.
                // we need to restart timer
                if (!returnMode && state.visible && state.hideTimeout) {

                    window.clearTimeout(state.hideTimeout);
                    state.hideTimeout = async(self.hide, self, null, cfg.hide.timeout);

                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("show: hide timeout was set", api.getTarget());
                    }
                    /*debug-end*/

                    returnMode = "hidetimeout";
                    //return returnValue;
                }

                // if tooltip was delayed to hide
                // we cancel it.
                if (!returnMode && state.hideDelay) {

                    window.clearTimeout(state.hideDelay);
                    state.hideDelay     = null;
                    state.visible       = true;

                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("show: hide delay was set; already shown", api.getTarget());
                    }
                    /*debug-end*/

                    returnMode = "hidedelay";
                    //return returnValue;
                }


                // various checks: tooltip should be enabled,
                // should not be already shown, it should
                // have some content, or empty content is allowed.
                // also if beforeShow() returns false, we can't proceed
                // if tooltip was frozen, we do not show or hide
                if (!returnMode && state.frozen) {

                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("show: frozen", api.getTarget());
                    }
                    /*debug-end*/

                    returnMode = "frozen";
                    //return returnValue;
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

                        returnMode = returnMode || "visible";
                        //return returnValue;
                    }
                    else {
                        if (!cfg.render.fn) {
                            self.reposition(e);
                            returnMode = "reposition";
                            //return returnValue;
                        }
                        else {
                            self.hide(null, true);
                        }
                    }
                }

                if (!returnMode || dtChanged) {
                    // if tooltip is not rendered yet we render it
                    if (!elem) {
                        self.render();
                    }
                    else if (dtChanged) {
                        self.changeDynamicContent();
                    }
                }

                // if beforeShow callback returns false we stop.
                if (!returnMode && self.trigger('beforeshow', api, e) === false) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("show: beforeshow return false", api.getTarget());
                    }
                    /*debug-end*/

                    returnMode = "beforeshow";
                    //return returnValue;
                }

                if (e && e.stopPropagation && cfg.events.show && (cfg.events.show[e.type] || cfg.events.show['*'])) {
                    var et = cfg.events.show[e.type] || cfg.events.show["*"];

                    if (et.process) {
                        returnValue	= et.process(api, e, "show", returnMode);
                    }
                    else {
                        et.stopPropagation && e.stopPropagation();
                        et.preventDefault && e.preventDefault();
                        returnValue = et.returnValue;
                    }
                }

                if (returnMode) {
                    return returnMode;
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
                var returnValue	    = e && e.stopPropagation ? null : api,
                    returnMode      = null;


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
                    returnMode = !elem ? "noelem" : (!state.visible ? "hidden" : "disabled");
                    //return returnValue;
                }

                // if tooltip is still waiting to be shown after delay timeout,
                // we cancel this timeout and return.
                if (state.showDelay && !returnMode) {

                    if (cfg.hide.cancelShowDelay || cancelShowDelay) {
                        window.clearTimeout(state.showDelay);
                        state.showDelay     = null;
                        state.visible       = false;

                        /*debug-start*/
                        if (cfg.debug) {
                            console.log("hide: cancelShowDelay: ", self.getTarget());
                        }
                        /*debug-end*/

                        returnMode = "cancel";
                        //return returnValue;
                    }
                    else {

                        /*debug-start*/
                        if (cfg.debug) {
                            console.log("hide: show delay was set", self.getTarget());
                        }
                        /*debug-end*/

                        returnMode = "delay";
                        //return returnValue;
                    }
                }

                // if tooltip was frozen, we do not show or hide
                if (state.frozen && !returnMode) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("hide: frozen", self.getTarget());
                    }
                    /*debug-end*/
                    returnMode = "frozen";
                    //return returnValue;
                }

                // lets see what the callback will tell us
                if (!returnMode && self.trigger('beforehide', api, e) === false) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("hide: beforehide returned false", self.getTarget());
                    }
                    /*debug-end*/
                    returnMode = "beforehide";
                    //return returnValue;
                }


                if (e && e.stopPropagation && cfg.events.hide && (cfg.events.hide[e.type] || cfg.events.hide["*"])) {
                    var et = cfg.events.hide[e.type] || cfg.events.hide["*"];

                    if (et.process) {
                        returnValue = et.process(api, e, "hide", returnMode);
                    }
                    else {
                        if (et.stopPropagation) e.stopPropagation();
                        if (et.preventDefault) e.preventDefault();
                        returnValue = et.returnValue;
                    }
                }

                if (returnMode) {
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

                type = type != undf ?
                        type :
                        (cfg.position.get || cfg.position.type);

                if (type != undf) {
                    if (isFunction(type)) {
                        state.positionFn = type;
                        state.positionType = null;
                        //cfg.position.get    = type;
                        //cfg.position.type   = false;
                    }
                    else {
                        state.positionFn = null;
                        state.positionType = type;
                        //cfg.position.get    = null;
                        //cfg.position.type   = type;
                    }
                }

                var pt  = state.positionType;

                if (pt === false) {
                    state.position  = false;
                }
                else if (state.positionFn && pt != "m") {
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
                    case false:
                        return null;
                    case "target":
                        pos = self.getTargetPosition(e);
                        break;
                    case "mouse":
                        pos = self.getMousePosition(e);
                        break;
                    case "window":
                        pos = self.getWindowPosition(e);
                        break;
                    case "fn":
                        pos = state.positionFn.call(defaultScope, api, e);
                        break;
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

                if (state.positionGetType) {
                    api.setPositionType(state.positionGetType.call(defaultScope, self, e));
                }

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

                if (isFunction(cfg.position.type)) {
                    state.positionGetType = cfg.position.type;
                }
                else {
                    self.setPositionType();
                }


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

            getScrollEl: function(cfgScroll) {
                if (cfgScroll === true || cfgScroll === false) {
                    return window;
                }
                else if (typeof cfgScroll == "string") {
                    return select(cfgScroll).shift();
                }
                else {
                    return cfgScroll;
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
                    addListener(self.getScrollEl(cfgPos.scroll), "scroll", self.onWindowScroll);
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

                if (state.positionType !== false) {
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
                    raf(function(){
                        self.showAfterAnimation(e);
                    });
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
                    removeListener(self.getScrollEl(cfgPos.scroll), "scroll", self.onWindowScroll);
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
                    raf(function(){
                        self.hideAfterAnimation(e);
                    });
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
                else {
                    if (elem.parentNode) {
                        elem.parentNode.removeChild(elem);
                    }
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

            getPositionBase: function() {
                if (state.positionBase) {
                    return state.positionBase;
                }
                var b;
                if (b = cfg.position.base) {
                    if (typeof b == "string") {
                        state.positionBase = select(b).shift();
                    }
                    else {
                        state.positionBase = b;
                    }
                    return state.positionBase;
                }
                return null;
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

                var pBase   = self.getPositionBase(),
                    size    = self.getDialogSize(),
                    offset  = pBase ? getPosition(target, pBase) : getOffset(target),
                    tsize   = self.getTargetSize(),
                    pos     = {},
                    type    = type || state.positionType,
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
                    type    = state.positionType.substr(1),
                    offsetX = cfg.position.offsetX,
                    offsetY = cfg.position.offsetY,
                    axis    = cfg.position.axis,
                    pntOfs  = pnt ? pnt.getDialogPositionOffset() : null;

                switch (type) {
                    case "": {
                        pos     = state.positionFn.call(defaultScope, api, e);
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

                var pBase   = self.getPositionBase() || window,
                    size    = self.getDialogSize(),
                    pos     = {},
                    type    = state.positionType.substr(1),
                    offsetX = cfg.position.offsetX,
                    offsetY = cfg.position.offsetY,
                    st      = getScrollTop(pBase),
                    sl      = getScrollLeft(pBase),
                    ww      = getOuterWidth(pBase),
                    wh      = getOuterHeight(pBase);

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

                var pBase   = self.getPositionBase(),
                    size    = self.getDialogSize(),
                    st      = getScrollTop(pBase),
                    sl      = getScrollLeft(pBase),
                    ww      = getOuterWidth(pBase),
                    wh      = getOuterHeight(pBase);

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
                if (overlay && overlay.parentNode) {
                    raf(function(){
                        if (!state.visible) {
                            overlay.parentNode.removeChild(overlay);
                        }
                    });
                }

                if (elem && elem.parentNode) {
                    raf(function(){
                        if (!state.visible) {
                            elem.parentNode.removeChild(elem);
                        }
                    });
                }
            },

            appendElem: function() {

                var body    = window.document.body,
                    rnd	    = cfg.render,
                    to      = rnd.appendTo || body;

                if (overlay && to) {
                    to.appendChild(overlay);
                }

                if (elem && to) {
                    to.appendChild(elem);
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




/**
 * @param {Function} fn
 * @param {Window} w optional window object
 */
function onReady(fn, w) {

    var done    = false,
        top     = true,
        win     = w || window,
        root, doc,

        init    = function(e) {
            if (e.type == 'readystatechange' && doc.readyState != 'complete') {
                return;
            }

            removeListener(e.type == 'load' ? win : doc, e.type, init);

            if (!done && (done = true)) {
                fn.call(win, e.type || e);
            }
        },

        poll = function() {
            try {
                root.doScroll('left');
            } catch(thrownError) {
                setTimeout(poll, 50);
                return;
            }

            init('poll');
        };

    doc     = win.document;
    root    = doc.documentElement;

    if (doc.readyState == 'complete') {
        fn.call(win, 'lazy');
    }
    else {
        if (doc.createEventObject && root.doScroll) {
            try {
                top = !win.frameElement;
            } catch(thrownError) {}

            top && poll();
        }
        addListener(doc, 'DOMContentLoaded', init);
        addListener(doc, 'readystatechange', init);
        addListener(win, 'load', init);
    }
};

if (window.jQuery) {

    /**
     * jQuery plugin. Basically the same as new MetaphorJs.lib.Dialog({target: $("...")});
     * @function
     * @param {string|object} options See constructor.
     * @param {string} instanceName {
     *   You can access dialog's api later by $(...).data("dialog-"+instanceName)
     *   @default "default"
     * }
     * @return jQuery
     */
    jQuery.fn.metaphorjsTooltip = function(options, instanceName) {

        var dataName    = "dialog",
            preset;

        if (typeof options == "string" && options != "destroy") {
            preset          = options;
            options         = arguments[1];
            instanceName    = arguments[2];
        }

        instanceName    = instanceName || "default";
        options         = options || {};

        dataName        += "-" + instanceName;

        this.each(function() {

            var el  = this,
                t   = data(el, dataName);

            if (!t) {
                options.target          = el;
                options.instanceName    = dataName;
                data(el, dataName, new Dialog(preset, options));
            }
            else if (options == "destroy") {
                t.destroy();
                data(el, dataName, null);
            }
            else {
                throw new Error("MetaphorJs tooltip already instantiated for this html element");
            }
        });
    };

}

MetaphorJs['Dialog'] = Dialog;
MetaphorJs['onReady'] = onReady;
typeof global != "undefined" ? (global['MetaphorJs'] = MetaphorJs) : (window['MetaphorJs'] = MetaphorJs);

}());