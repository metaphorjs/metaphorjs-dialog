
const cls             = require("metaphorjs-class/src/cls.js"),
    extend          = require("metaphorjs-shared/src/func/extend.js"),
    nextUid         = require("metaphorjs-shared/src/func/nextUid.js"),
    bind            = require("metaphorjs-shared/src/func/bind.js"),
    isArray         = require("metaphorjs-shared/src/func/isArray.js"),
    ajax            = require("metaphorjs-ajax/src/func/ajax.js"),
    isString        = require("metaphorjs-shared/src/func/isString.js"),
    isFunction      = require("metaphorjs-shared/src/func/isFunction.js"),
    isNumber        = require("metaphorjs-shared/src/func/isNumber.js"),
    isBool          = require("metaphorjs-shared/src/func/isBool.js"),
    ucfirst         = require("metaphorjs-shared/src/func/ucfirst.js"),
    raf             = require("metaphorjs-animate/src/func/raf.js"),
    async           = require("metaphorjs-shared/src/func/async.js"),
    error           = require("metaphorjs-shared/src/func/error.js"),
    MetaphorJs      = require("metaphorjs-shared/src/MetaphorJs.js");

require("../__init.js");
require("metaphorjs/src/lib/Expression.js");
require("metaphorjs/src/func/dom/addClass.js");
require("metaphorjs/src/func/dom/hasClass.js");
require("metaphorjs/src/func/dom/removeClass.js");
require("metaphorjs/src/func/dom/setStyle.js");
require("metaphorjs/src/func/dom/getAttr.js");
require("metaphorjs/src/func/dom/setAttr.js");
require("metaphorjs/src/func/dom/removeAttr.js");
require("metaphorjs/src/func/dom/addListener.js");
require("metaphorjs/src/func/dom/removeListener.js");
require("metaphorjs/src/func/dom/normalizeEvent.js");
require("metaphorjs/src/func/dom/isVisible.js");
require("metaphorjs/src/func/dom/isAttached.js");
require("metaphorjs/src/func/dom/whenAttached.js");
require("metaphorjs/src/func/dom/select.js");
require("metaphorjs/src/func/dom/is.js");
require("metaphorjs/src/func/dom/getOuterWidth.js");
require("metaphorjs/src/func/dom/getOuterHeight.js");
require("metaphorjs/src/func/dom/delegate.js");
require("metaphorjs/src/func/dom/undelegate.js");
require("metaphorjs/src/func/dom/data.js");

require("metaphorjs-animate/src/animate/animate.js");
require("metaphorjs-animate/src/animate/stop.js");

require("metaphorjs-promise/src/lib/Promise.js");
require("metaphorjs-observable/src/mixin/Observable.js");

require("./position/Abstract.js");
require("./position/Target.js");
require("./position/Mouse.js");
require("./position/Window.js");
require("./position/Custom.js");
require("./position/None.js");
require("./position/Draggable.js");
require("./pointer/Abstract.js");
require("./pointer/Html.js");
require("./Overlay.js");
require("./Manager.js");


module.exports = MetaphorJs.dialog.Dialog = (function(){

    var manager = new MetaphorJs.dialog.Manager;

    var defaultEventProcessor = function(dlg, e, type, returnMode){
        if (type === "show" || !returnMode) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };

    var getEventConfig = function(e, action, dlgEl) {

        var type    = e.type,
            trg     = e.target,
            cfg     = null,
            data;

        while (trg && trg !== dlgEl) {

            data    = MetaphorJs.dom.getAttr(trg, "data-" + action + "-" + type);

            if (data) {
                cfg = MetaphorJs.lib.Expression.parse(data)({});
                break;
            }

            trg     = trg.parentNode;
        }

        return cfg;
    };

    /*
     * Shorthands
     */

    var fixShorthand = function(options, level1, level2, type) {
        var value   = options[level1],
            yes     = false;

        if (value === undefined) {
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

    var fixShorthands   = function(options) {

        if (!options) {
            return {};
        }

        fixShorthand(options, "content", "value", "string");
        fixShorthand(options, "content", "value", "boolean");
        fixShorthand(options, "content", "fn", "function");
        fixShorthand(options, "ajax", "url", "string");
        fixShorthand(options, "cls", "dialog", "string");
        fixShorthand(options, "render", "tpl", "string");
        fixShorthand(options, "render", "fn", "function");
        fixShorthand(options, "render", "el", "dom");
        fixShorthand(options, "render", "el", "jquery");
        fixShorthand(options, "show", "events", false);
        fixShorthand(options, "show", "events", "string");
        fixShorthand(options, "hide", "events", false);
        fixShorthand(options, "hide", "events", "string");
        fixShorthand(options, "toggle", "events", false);
        fixShorthand(options, "toggle", "events", "string");
        fixShorthand(options, "position", "type", "string");
        fixShorthand(options, "position", "type", false);
        fixShorthand(options, "position", "get", "function");
        fixShorthand(options, "overlay", "enabled", "boolean");
        fixShorthand(options, "pointer", "position", "string");
        fixShorthand(options, "pointer", "size", "number");

        return options;
    };


    /**
     * @object MetaphorJs.dialog.Dialog.defaults
     */
    var defaults    = {

        /**
         * Target element(s) which trigger dialog's show and hide.<br>
         * If {HTMLElement}: will be used as a single target,<br>
         * if selector: will be used as dynamic target.<br>
         * Dynamic targets work like this:<br>
         * you provide delegates: {someElem: {click: someClass}} -- see "show" function<br>
         * when show() is called, target will be determined from the event using
         * the selector.
         * @property {string|Element} target
         */
        target:         null,

        /**
         * One or more group names.
         * @property {string|array} group
         */
        group:          null,

        /**
         * If dialog is modal, overlay will be forcefully enabled.
         * @property {bool} modal
         */
        modal:			false,

        /**
         * Use link's href attribute as ajax.url or as render.el
         * @property {bool} useHref
         */
        useHref:        false,


        /**
         * If neither content value nor ajax url are provided,
         * plugin will try to read target's attribute values: 'tooltip', 'title' and 'alt'.
         * (unless attr is specified).<br>
         * <em>shorthand</em>: string -> content.value<br>
         * <em>shorthand</em>: false -> content.value<br>
         * <em>shorthand</em>: function -> content.fn<br>
         * @object content
         */
        content: {

            /**
             * Dialog's text content. Has priority before readContent/loadContent.
             * If set to false, no content will be automatically set whether via fn() or attributes.
             * @property {string|boolean} value
             */
            value: 			'',

            /**
             * Must return content value
             * @property {function} fn
             * @param {HTMLElement} target
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @returns {string}
             */
            fn:				null,

            /**
             * This function receives new content and returns string value (processed content).
             * @property {function} prepare
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @param {string} mode
             *      empty string - content has come from content.value or setContent()<br>
             *      'attribute' - content has been read from target attributes<br>
             *      'ajax' - data returned by ajax request
             *      @default '' | 'attribute' | 'ajax'
             *
             * @param {string} content
             * @returns {string}
             */
            prepare:		null,

            /**
             * Get content from this attribute (belongs to target)
             * @property {string} attr
             */
            attr:           null

            /**
             * @end-object
             */
        },


        /**
         * All these options are passed to $.ajax().
         * You can provide more options in this section
         * but 'success' will be overriden (use content.prepare for data processing).<br>
         * <em>shorthand</em>: string -> ajax.url
         * @object ajax
         */
        ajax: {

            /**
             * Url to load content from.
             * @property {string} url
             */
            url: 			null,

            /**
             * Pass this data along with xhr.
             * @property {object} data
             */
            data: 			null,

            /**
             * @property {string} dataType
             */
            dataType: 		'text',

            /**
             * @property {string} method
             */
            method: 		'GET'

            /**
             * @end-object
             */
        },

        /**
         * Classes to apply to the dialog.
         * <em>shorthand</em>: string -> cls.dialog
         * @object cls
         */
        cls: {
            /**
             * Base class.
             * @property {string} dialog
             */
            dialog:         null,
            /**
             * Only applied when dialog is visible.
             * @property {string} visible
             */
            visible:        null,
            /**
             * Only applied when dialog is hidden.
             * @property {string} hidden
             */
            hidden:         null,
            /**
             * Only applied when dialog is performing ajax request.
             * @property {string} loading
             */
            loading:        null

            /**
             * @end-object
             */
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
         * @object selector
         */
        selector:           {
            /**
             * Dialog's content selector.
             * @property {string} content
             */
            content:        null

            /**
             * @end-object
             */
        },

        /**
         * Object {buttonId: selector}
         * @property {object|null} buttons
         */
        buttons: null,


        /**
         * <p><em>shorthand</em>: string -> render.tpl<br>
         * <em>shorthand</em>: function -> render.fn<br>
         * <em>shorthand</em>: dom element -> render.el<br>
         * @object render
         */
        render: {
            /**
             * Dialog's template 
             * @property {string} tpl
             */
            tpl: 			'<div></div>',

            /**
             * Call this function to get dialog's template.
             * @property {function} fn
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @returns {string|Element}
             */
            fn: 			null,

            /**
             * Selector or existing element instead of template.
             * @property {string|Element} el
             */
            el: 			null,

            /**
             * Apply this zIndex.
             * @property {number} zIndex
             */
            zIndex:			null,

            /**
             * false - render immediately, true - wait for the first event.
             * @property {bool} lazy
             */
            lazy: 			true,

            /**
             * Object to pass to elem.css()
             * @property {object} style
             */
            style:          null,

            /**
             * If set, the element will be appended to specified container.<br>
             * If set to false, element will not be appended anywhere (works with "el").
             * @property {string|Element|bool} appendTo
             */
            appendTo:		null,

            /**
             * Dialog's id attribute.
             * @property {string} id
             */
            id:				null,

            /**
             * If set to true, element's show() and hide() will never be called. Use
             * "visible" and "hidden" classes instead.
             * @property {boolean} keepVisible
             */
            keepVisible:    false,

            /**
             * When destroying dialog's elem, keep it in DOM.
             * Useful when you return it in fn() on every show()
             * and have lifetime = 0.
             * @property {boolean} keepInDOM
             */
            keepInDOM:      false,

            /**
             * Number of ms for the rendered object to live
             * after its been hidden. 0 to destroy elem immediately.
             * @property {number} lifetime
             */
            lifetime:       null

            /**
             * @end-object
             */
        },

        /**
         * Event actions.
         * @object events
         */
        events: {

            /**
             * @object show
             */
            show: {

                /**
                 * You can also add any event you use to show/hide dialog 
                 * (mouseup, mousedown, etc)
                 * @object * 
                 */
                "*": {

                    /**
                     * @property {boolean} preventDefault
                     */
                    preventDefault: false,

                    /**
                     * @property {boolean} stopPropagation
                     */
                    stopPropagation: false,

                    /**
                     * @property {boolean} returnValue
                     */
                    returnValue: null,

                    /**
                     * @property {function} process
                     * @param {Dialog} dialog
                     * @param {Event} event
                     * @param {string} type show|hide
                     * @param {string} returnMode
                     */
                    process: defaultEventProcessor

                    /**
                     * @end-object
                     */
                }

                /**
                 * @end-object
                 */
            },

            /**
             * @object hide
             */
            hide: {

                /**
                 * You can also add any event you use to show/hide dialog.
                 * @object *
                 */
                "*": {

                    /**
                     * @property {boolean} preventDefault
                     */
                    preventDefault: false,

                    /**
                     * @property {boolean} stopPropagation
                     */
                    stopPropagation: false,

                    /**
                     * @property {boolean} returnValue
                     */
                    returnValue: null,

                    /**
                     * Must return "returnValue" which will be in its turn
                     * returned from event handler. If you provide this function
                     * preventDefault and stopPropagation options are ignored.
                     * @property {function}
                     * @param {Dialog} dialog
                     * @param {Event} event
                     * @param {string} type show|hide
                     * @param {string} returnMode
                     */
                    process: defaultEventProcessor

                    /**
                     * @end-object
                     */
                }

                /**
                 * @end-object
                 */
            }

            /**
             * @end-object
             */
        },

        /**
         * <p><em>shorthand</em>: false -> show.events<br>
         * <em>shorthand</em>: string -> show.events._target</p>
         * @object show
         */
        show: {
            /**
             * Delay dialog's appearance. Milliseconds.
             * @property {number} delay
             */
            delay: 			null,

            /**
             * True to hide all other tooltips.
             * If "group" specified, will hide only
             * those dialogs that belong to that group.
             * @property {bool} single
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
             * @property {string|bool|object} events
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
             * @property {bool|string|array|function} animate
             */
            animate:		false,

            /**
             * Ignore {show: {single: true}} on other dialogs.
             * @property {bool} ignoreHideAll
             */
            ignoreHideAll:	false,

            /**
             * true - automatically set focus on input fields on buttons;
             * string - selector
             * @property {bool|string} focus
             */
            focus:          false,

            /**
             * Prevent scrolling on given element
             * true = "body"
             * @property {bool|string|Element} preventScroll
             */
            preventScroll:  false,

            /**
             * When showing, set css display to this value
             * @property {string} display
             */
            display: "block"

            /**
             * @end-object
             */
        },


        /**
         * <p><em>shorthand</em>: false -> hide.events<br>
         * <em>shorthand</em>: string -> hide.events._target</p>
         * @object hide
         */
        hide: {
            /**
             * Milliseconds. Delay hiding for this amount of time.
             * @property {number} delay
             */
            delay:			null,

            /**
             * Milliseconds. Dialog will be shown no longer than for that time.
             * @property {number} timeout
             */
            timeout: 		null,

            /**
             * See show.events
             * @property {string|bool|object} events
             */
            events: 		null,

            /**
             * Destroy dialog after hide.
             * @property {bool} destroy
             */
            destroy:        false,

            /**
             * Remove element from DOM after hide
             * @property {bool} remove
             */
            remove:         false,

            /**
             * See show.animate
             * @property {bool|string|array|function} animate
             */
            animate:		false,

            /**
             * true: hide anyway even if showing is delayed,<br>
             * false: ignore hide events until tooltip is shown.
             * @property {bool} cancelShowDelay
             */
            cancelShowDelay:true

            /**
             * @end-object
             */
        },

        /**
         * This option is required when you want to show and hide on the same event.<br>
         * <em>shorthand</em>: false -> toggle.events<br>
         * <em>shorthand</em>: string -> toggle.events._target
         * @object toggle
         */
        toggle: {
            /**
             * See show.events
             * @property {string|bool|object} events
             */
            events: 		null

            /**
             * @end-object
             */
        },

        /**
         * <p><em>shorthand</em>: false -> position.type<br>
         * <em>shorthand</em>: string -> position.type<br>
         * <em>shorthand</em>: function -> position.get
         * @object position
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
             * @property {bool|string} type
             */
            type:			't',

            /**
             * @property {string} preferredType
             */
            preferredType:  null,

            /**
             * Add this offset to dialog's x position
             * @property {number} offsetX
             */
            offsetX: 		0,

            /**
             * Add this offset to dialog's y position
             * @property {number} offsetY
             */
            offsetY:		0,

            /**
             * Follow the mouse only by this axis;
             * second coordinate will be relative to target
             * @property {string} axis
             */
            axis: 			null,

            /**
             * Overrides position.type<br>
             * If this function is provided, offsets are not applied.
             * @property {function} get
             * @param {MetaphorJs.dialog.Dialog} dialog
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
             * @property {number|bool} screenX
             */
            screenX:		false,

            /**
             * Prevent from rendering off the screen.<br>
             * Set to maximum distance between tooltip and window edge.
             * @property {number|bool} screenY
             */
            screenY:		false,

            /**
             * Calculate position relative to this element (defaults to window)
             * @property {string|Element} base
             */
            base:           null,

            /**
             * Monitor window/selector/element scroll and reposition on scroll.
             * @property {bool|string|Element} scroll
             */
            scroll:         false,

            /**
             * Monitor window resize and reposition on resize
             * @property {bool} resize
             */
            resize:         true

            /**
             * @end-object
             */
        },

        /**
         * Pointer will only work if size > 0 or el is not null<br>
         * <em>shorthand</em>: string -> pointer.position<br>
         * <em>shorthand</em>: number -> pointer.size
         * @object pointer
         */
        pointer: {

            /**
             * t / r / b / l<br>
             * tr / lt / lb / br / bl / lb / lt<br>
             * null - opposite to dialog's position
             * @property {string} position
             */
            position: 		null,

            /**
             * t / r / b / l<br>
             * null - opposite to primary position
             * @property {string} direction
             */
            direction: 		null,

            /**
             * Number of pixels (triangle's height)
             * @property {number} size
             */
            size: 			0,

            /**
             * Number of pixels (triangle's width), by default equals to size.
             * @property {number} width
             */
            width:			null,

            /**
             * '#xxxxxx'
             * @property {string} color
             */
            color: 			null,

            /**
             * Shift pointer's position by this number of pixels.
             * Shift direction will depend on position:<br>
             * t / tl / b / bl - right shift<br>
             * tr / br - left shift<br>
             * r / l / rt / lt - top shift<br>
             * rb / lb - bottom shift
             * @property {number} offset
             */
            offset: 		0,

            /**
             * Number of pixels.
             * @property {number} border
             */
            border:			0,

            /**
             * '#xxxxxx'
             * @property {string} borderColor
             */
            borderColor:	null,

            /**
             * Custom pointer.<br>
             * If you provide custom pointer el,
             * border, direction and color will not be applied.<br>
             * pointer.cls will be applied.
             * @property {string|Element} el
             */
            el:             null,

            /**
             * Apply this class to pointer.
             * @property {string} cls
             */
            cls:            null,

            /**
             * Apply this class to pointerBorder element.
             * @property {string} borderCls
             */
            borderCls:      null

            /**
             * @end-object
             */
        },

        /**
         * <p><em>shorthand</em>: boolean -> overlay.enabled<br></p>
         * @object overlay
         */
        overlay:			{

            /**
             * Enable overlay.
             * @property {bool} enabled
             */
            enabled:		false,

            /**
             * @property {string} color
             */
            color:			'#000',

            /**
             * @property {number} opacity
             */
            opacity:		.5,

            /**
             * @property {string} cls
             */
            cls:			null,

            /**
             * Same animation rules as in show.animate.
             * @property {bool} animateShow
             */
            animateShow:	false,

            /**
             * Same animation rules as in show.animate.
             * @property {bool} animateHide
             */
            animateHide:	false

            /**
             * @end-object
             */
        },

        /**
         * Callbacks are case insensitive.<br>
         * You can use camel case if you like.
         * @object callback
         */
        callback: {

            /**
             * 'this' object for all callbacks, including render.fn, position.get, etc.
             * @property {object} context
             */
            context:			null,

            /**
             * When content has changed.
             * @property {function} contentChange
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @param {string} content
             */
            "content-change": 	null,

            /**
             * Before dialog appeared.<br>
             * Return false to cancel showing.
             * @property {function} beforeShow
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @param {Event} event
             */
            "before-show": 		null,

            /**
             * Immediately after dialog appeared.
             * @property {function} show
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @param {Event} event
             */
            show: 				null,

            /**
             * Before dialog disappears.<br>
             * Return false to cancel hiding.
             * @property {function} beforeHide
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @param {Event} event
             */
            "before-hide": 		null,

            /**
             * Immediately after dialog has been hidden.
             * @property {function} hide
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @param {Event} event
             */
            hide: 				null,

            /**
             * After dialog has been rendered.
             * @property {function} render
             * @param {MetaphorJs.dialog.Dialog} dialog
             */
            render: 			null,

            /**
             * After dialog's html element has been removed.
             * @property {function} lifetime
             * @param {MetaphorJs.dialog.Dialog} dialog
             */
            lifetime:           null,

            /**
             * Called when dynamic target changes (on hide it always changes to null).
             * Also called from setTarget().
             * @property {function} targetChange
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @param {HTMLElement} newTarget
             * @param {Element|null} prevTarget
             */
            "target-change":       null,

            /**
             * One handler for all configured buttons. Called on click, enter and space.
             * @property {function} button
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @param {string} buttonId
             * @param {Event} event
             */
            button:             null

            /**
             * @end-object
             */
        }

        /**
         * @end-object
         */
    };




    /**
     * @class MetaphorJs.dialog.Dialog
     * @mixes MetaphorJs.mixin.Observable
     */
    var Dialog = cls({

        $mixins:            [MetaphorJs.mixin.Observable],

        id:                 null,
        node:               null,
        overlay:            null,
        pointer:            null,
        cfg:                null,
        position:           null,

        target:             null,
        dynamicTarget:      false,
        dynamicTargetEl:    null,

        visible:            false,
        enabled:            true,
        frozen:             false,
        rendered:           false,

        bindSelfOnRender:   false,

        hideTimeout:        null,
        hideDelay:          null,
        showDelay:          null,
        destroyDelay:       null,

        images:             0,

        positionGetType:    null,
        positionClass:      null,
        positionAttempt:    0,

        $constructor: function() {

            this.$$events = {
                "before-show": {
                    returnResult: false
                },
                "before-hide": {
                    returnResult: false
                }
            };

            this.$super.apply(this, arguments);

        },

        /**
         * @method
         * @constructor
         * @param {object} cfg See MetaphorJs.dialog.Dialog.defaults
         */
        $init: function(cfg) {

            cfg = cfg || {};
            var preset  = cfg.preset,
                self    = this;

            cfg.preset  = null;
            cfg         = extend({}, defaults,
                                fixShorthands(Dialog.defaults),
                                fixShorthands(Dialog[preset]),
                                fixShorthands(cfg),
                                    true, true);

            self.cfg    = cfg;
            self.id     = nextUid();

            self.onPreventScrollDelegate = bind(self.onPreventScroll, self);
            self.onButtonClickDelegate = bind(self.onButtonClick, self);
            self.onButtonKeyupDelegate = bind(self.onButtonKeyup, self);
            self.showDelegate = bind(self.show, self);
            self.hideDelegate = bind(self.hide, self);
            self.toggleDelegate = bind(self.toggle, self);
            self.onImageLoadDelegate = bind(self.onImageLoad, self);

            manager.register(self);

            if (cfg.modal) {
                cfg.overlay.enabled = true;
            }
            self.overlay    = new MetaphorJs.dialog.Overlay(self);

            var pointerCls = ucfirst(cfg.pointer.$class || "Html");
            self.pointer    = cls.factory(
                                "MetaphorJs.dialog.pointer." + pointerCls, 
                                self, cfg.pointer);

            if (isFunction(cfg.position.type)) {
                self.positionGetType = cfg.position.type;
            }

            self.setTarget(cfg.target);

            if (cfg.target && cfg.useHref) {
                var href = MetaphorJs.dom.getAttr(self.getTarget(), "href");
                if (href.substr(0, 1) === "#") {
                    cfg.render.el = href;
                }
                else {
                    cfg.ajax.url = href;
                }
            }

            if (!cfg.render.lazy) {
                self.render();
            }

            self.trigger("init", self);
            self.setHandlers("bind");
        },


        /* **** General api **** */


        /**
         * @method
         * @returns {HTMLElement}
         */
        getElem: function() {
            return this.node;
        },

        /**
         * @method
         * @returns {string}
         */
        getInstanceId: function() {
            return this.id;
        },

        /**
         * Get dialog's config.
         * @method
         * 
         * @return {object}
         */
        getCfg: function() {
            return this.cfg;
        },

        /**
         * Get dialog's pointer object
         * @method
         * @returns {MetaphorJs.dialog.pointer.*}
         */
        getPointer: function() {
            return this.pointer;
        },


        /**
         * Get dialog's overlay object
         * @method
         * @returns {MetaphorJs.dialog.Overlay}
         */
        getOverlay: function() {
            return this.overlay;
        },


        /**
         * @method
         * 
         * @return {boolean}
         */
        isEnabled: function() {
            return this.enabled;
        },

        /**
         * @method
         * 
         * @return {boolean}
         */
        isVisible: function() {
            return this.visible;
        },

        /**
         * @method
         * 
         * @returns {boolean}
         */
        isHideAllIgnored: function() {
            return this.cfg.show.ignoreHideAll;
        },

        /**
         * @method
         * 
         * @return {boolean}
         */
        isFrozen: function() {
            return this.frozen;
        },

        /**
         * @method
         * @returns {boolean}
         */
        isRendered: function() {
            return this.rendered;
        },

        /**
         * Enable dialog (enabled by default)
         * @method
         * 
         */
        enable: function() {
            this.enabled = true;
        },

        /**
         * Disable dialog
         * 
         * @method
         */
        disable: function() {
            this.hide();
            this.enabled = false;
        },

        /**
         * The difference between freeze and disable is that
         * disable always hides dialog and freeze makes current
         * state permanent (if it was shown, it will stay shown
         * until unfreeze() is called).
         * 
         * @method
         */
        freeze: function() {
            this.frozen   = true;
        },

        /**
         * Unfreeze dialog
         * @method
         * 
         */
        unfreeze: function() {
            this.frozen   = false;
        },

        /**
         * Get groups.
         * @method
         * 
         * @return {[]}
         */
        getGroup: function() {
            var cfg = this.cfg;
            if (!cfg.group) {
                return [""];
            }
            else {
                return isString(cfg.group) ?
                       [cfg.group] : cfg.group;
            }
        },

        /**
         * Show/hide
         * @method
         * 
         * @param {Event} e Optional
         * @param {bool} immediately Optional
         */
        toggle: function(e, immediately) {

            var self = this;

            // if switching between dynamic targets
            // we need not to hide tooltip
            if (e && e.stopPropagation && self.dynamicTarget) {

                if (self.visible && self.isDynamicTargetChanged(e)) {
                    return self.show(e);
                }
            }

            return self[self.visible ? 'hide' : 'show'](e, immediately);
        },


        /* **** Events **** */

        resetHandlers: function(fn, context) {

            var self = this;
            self.setHandlers("unbind");
            self.bindSelfOnRender = false;

            if (fn) {
                fn.call(context, self, self.getCfg());
            }

            self.setHandlers("bind");
        },

        setHandlers: function(mode, only) {

            var self    = this,
                cfg     = self.cfg,
                fns     = ["show", "hide", "toggle"],
                lfn     = mode === "bind" ? MetaphorJs.dom.addListener : 
                                            MetaphorJs.dom.removeListener,
                dfn     = mode === "bind" ? MetaphorJs.dom.delegate :
                                            MetaphorJs.dom.undelegate,
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
                    if (self.dynamicTarget) {
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
                        if (only === '_self') {
                            if (selector !== '_self' &&
                                selector !== "_overlay" &&
                                selector.substr(0,1) !== '>') {
                                continue;
                            }
                        }
                        else if (selector !== only) {
                            continue;
                        }
                    }

                    if ((selector === '_self' ||
                            selector === '_overlay' ||
                            selector.substr(0,1) === '>')
                        && !self.node) {

                        self.bindSelfOnRender = true;
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
                            el  = [self.node];
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
                            el  = [self.overlay.getElem()];
                            break;

                        default:
                            el  = selector.substr(0,1) === '>' ?
                                    MetaphorJs.dom.select(selector.substr(1), self.node) :
                                    MetaphorJs.dom.select(selector);

                    }

                    if (!el || !el.length) {
                        continue;
                    }

                    if (isString(evs)) {
                        evs     = [evs];
                    }

                    if (isArray(evs)) {
                        for (i = 0, len = evs.length; i < len; i++) {
                            for (j = -1, jl = el.length; ++j < jl; lfn(el[j], evs[i], self[fn+"Delegate"])){}
                        }
                    }
                    else {
                        for (e in evs) {
                            for (j = -1, jl = el.length; ++j < jl; dfn(el[j], evs[e], e, self[fn+"Delegate"])){}
                        }
                    }
                }
            }
        },




        onPreventScroll: function(e) {
            MetaphorJs.dom.normalizeEvent(e).preventDefault();
        },

        onButtonClick: function(e) {

            var target  = MetaphorJs.dom.normalizeEvent(e).target,
                btnId   = MetaphorJs.dom.data(target, "metaphorjsTooltip-button-id");

            if (btnId) {
                this.trigger("button", this, btnId, e);
            }
        },

        onButtonKeyup: function(e) {
            if (e.keyCode === 13 || e.keyCode === 32) {
                var target  = e.target,
                    btnId   = MetaphorJs.dom.data(target, "metaphorjsTooltip-button-id");

                if (btnId) {
                    this.trigger("button", this, btnId, MetaphorJs.dom.normalizeEvent(e));
                }
            }
        },

        getEventConfig: function(e, action) {

            var self    = this,
                ecfg    = getEventConfig(e, action, self.node),
                cfg     = self.cfg;

            if (!ecfg && cfg.events[action]) {
                ecfg   = cfg.events[action][e.type] || cfg.events[action]['*'];
            }

            return ecfg;
        },


        /* **** Show **** */

        /**
         * Show dialog
         * @method
         * 
         * @param {Event} e Optional. True to skip delay.
         * @param {bool} immediately Optional
         */
        show: function(e, immediately) {

            // if called as an event handler, we do not return api
            var self        = this,
                cfg         = self.cfg,
                returnValue	= null,
                scfg        = cfg.show,
                returnMode  = null;

            if (e) {
                e = MetaphorJs.dom.normalizeEvent(e);
            }

            // if tooltip is disabled, we do not stop propagation and do not return false.s
            if (!self.isEnabled()) {
                returnMode = "disabled";
            }

            // if tooltip is already shown
            // and hide timeout was set.
            // we need to restart timer
            if (!returnMode && self.visible && self.hideTimeout) {

                window.clearTimeout(self.hideTimeout);
                self.hideTimeout = async(self.hide, self, null, cfg.hide.timeout);

                returnMode = "hidetimeout";
            }

            // if tooltip was delayed to hide
            // we cancel it.
            if (!returnMode && self.hideDelay) {

                window.clearTimeout(self.hideDelay);
                self.hideDelay     = null;
                self.visible       = true;

                returnMode = "hidedelay";
            }


            // various checks: tooltip should be enabled,
            // should not be already shown, it should
            // have some content, or empty content is allowed.
            // also if beforeShow() returns false, we can't proceed
            // if tooltip was frozen, we do not show or hide
            if (!returnMode && self.frozen) {
                returnMode = "frozen";
            }

            // cancel delayed destroy
            // so that we don't have to re-render dialog
            if (self.destroyDelay) {
                window.clearTimeout(self.destroyDelay);
                self.destroyDelay = null;
            }


            var dtChanged   = false;

            // if we have a dynamicTarget
            if (e && self.dynamicTarget) {
                dtChanged = self.changeDynamicTarget(e);
            }

            if (self.visible) {
                if (!dtChanged) {
                    returnMode = returnMode || "visible";
                }
                else {
                    self.reposition(e);
                    returnMode = "reposition";
                }
            }

            if (!returnMode || dtChanged) {
                // if tooltip is not rendered yet we render it
                if (!self.node) {
                    self.render();
                }
                else if (dtChanged) {
                    self.changeDynamicContent();
                }
            }


            // if beforeShow callback returns false we stop.
            if (!returnMode && self.trigger('before-show', self, e) === false) {
                returnMode = "beforeshow";
            }

            var ecfg;

            if (e && (ecfg = self.getEventConfig(e, "show"))) {

                if (ecfg.process) {
                    returnValue	= ecfg.process(self, e, "show", returnMode);
                }
                else {
                    ecfg.stopPropagation && e.stopPropagation();
                    ecfg.preventDefault && e.preventDefault();
                    returnValue = ecfg.returnValue;
                }
            }

            if (returnMode) {
                return returnValue;
            }

            // first, we stop all current animations
            MetaphorJs.animate.stop(self.node);

            // as of this moment we mark dialog as visible so that hide() were able
            // to work. also, all next steps should check for this state
            // in case if tooltip case hidden back during the process
            self.visible = true;

            if (scfg.single) {
                manager.hideAll(self);
            }

            self.toggleTitleAttribute(false);

            if (scfg.delay && !immediately) {
                self.showDelay = async(self.showAfterDelay, self, [e], scfg.delay);
            }
            else {
                self.showAfterDelay(e, immediately);
            }

            return returnValue;
        },


        showAfterDelay: function(e, immediately) {

            var self = this,
                cfg = self.cfg;

            self.showDelay = null;

            // if tooltip was already hidden, we can't proceed
            if (!self.visible) {
                return;
            }

            self.trigger('show-after-delay', self, e);

            if (cfg.hide.remove) {
                self.appendElem();
            }

            self.reposition(e);

            if (cfg.show.preventScroll) {
                var ps = cfg.show.preventScroll,
                    i, l;
                if (ps === true) {
                    ps = "body";
                }
                ps = MetaphorJs.dom.select(ps);
                for (i = -1, l = ps.length; ++i < l;
                    MetaphorJs.dom.addListener(ps[i], "mousewheel", self.onPreventScrollDelegate) &&
                    MetaphorJs.dom.addListener(ps[i], "touchmove", self.onPreventScrollDelegate)
                ){}
            }

            self.overlay.show();

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

            var self = this,
                cfg = self.cfg,
                node = self.node;

            // if tooltip was already hidden, we can't proceed
            if (!self.visible) {
                return;
            }

            // now we can finally show the dialog (if it wasn't shown already
            // during the animation
            MetaphorJs.dom.removeClass(node, cfg.cls.hidden);
            MetaphorJs.dom.addClass(node, cfg.cls.visible);

            if (!cfg.render.keepVisible) {
                node.style.display = cfg.show.display || "block";
            }


            // if it has to be shown only for a limited amount of time,
            // we set timeout.
            if (cfg.hide.timeout) {
                self.hideTimeout = async(self.hide, self, null, cfg.hide.timeout);
            }

            if (cfg.show.focus) {
                async(self.setFocus, self, null, 20);
            }

            self.trigger('show', self, e);
        },





        /* **** Hide **** */


        /**
         * Hide dialog
         * @method
         * 
         * @param {Event} e Optional.
         * @param {bool} immediately Optional. True to skip delay.
         * @param {bool} cancelShowDelay Optional. If showing already started but was delayed -
         * cancel that delay.
         */
        hide: function(e, immediately, cancelShowDelay) {

            var self            = this,
                returnValue	    = null,
                returnMode      = null,
                cfg             = self.cfg;

            self.hideTimeout    = null;

            // if the timer was set to hide the tooltip
            // but then we needed to close tooltip immediately
            if (!self.visible && self.hideDelay && immediately) {
                window.clearTimeout(self.hideDelay);
                self.hideDelay     = null;
                self.visible       = true;
            }

            // various checks
            if (!self.node || !self.visible || !self.isEnabled()) {
                returnMode = !self.node ? "noelem" : (!self.visible ? "hidden" : "disabled");
            }

            // if tooltip is still waiting to be shown after delay timeout,
            // we cancel this timeout and return.
            if (self.showDelay && !returnMode) {

                if (cfg.hide.cancelShowDelay || cancelShowDelay) {
                    window.clearTimeout(self.showDelay);
                    self.showDelay     = null;
                    self.visible       = false;

                    returnMode = "cancel";
                }
                else {
                    returnMode = "delay";
                }
            }

            // if tooltip was frozen, we do not show or hide
            if (self.frozen && !returnMode) {
                returnMode = "frozen";
            }

            // lets see what the callback will tell us
            if (!returnMode && self.trigger('before-hide', self, e) === false) {
                returnMode = "beforehide";
            }

            var ecfg;
            if (e && e.stopPropagation && (ecfg = self.getEventConfig(e, "hide"))) {

                if (ecfg.process) {
                    returnValue = ecfg.process(self, e, "hide", returnMode);
                }
                else {
                    if (ecfg.stopPropagation) e.stopPropagation();
                    if (ecfg.preventDefault) e.preventDefault();
                    returnValue = ecfg.returnValue;
                }
            }

            if (returnMode) {
                return returnValue;
            }

            // now we can stop all current animations
            MetaphorJs.animate.stop(self.node);

            // and change the state
            self.visible = false;

            //self.toggleTitleAttribute(true);

            if (self.dynamicTarget) {
                self.resetDynamicTarget();
            }

            if (cfg.hide.delay && !immediately) {
                self.hideDelay = async(self.hideAfterDelay, self, [e], cfg.hide.delay);
            }
            else {
                self.hideAfterDelay(e, immediately);
            }

            return returnValue;
        },


        hideAfterDelay: function(e, immediately) {

            var self = this,
                cfg = self.cfg;

            self.hideDelay = null;

            if (self.visible) {
                return;
            }

            self.trigger('hide-after-delay', self, e);


            if (cfg.show.preventScroll) {
                var ps = cfg.show.preventScroll,
                    i, l;
                if (ps === true) {
                    ps = "body";
                }
                ps = MetaphorJs.dom.select(ps);
                for (i = -1, l = ps.length; ++i < l;
                    MetaphorJs.dom.removeListener(ps[i], "mousewheel", self.onPreventScrollDelegate) &&
                    MetaphorJs.dom.removeListener(ps[i], "touchmove", self.onPreventScrollDelegate)
                ){}
            }

            self.overlay.hide();

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

            var self = this,
                cfg = self.cfg,
                node = self.node;

            // we need to check if the tooltip was returned to visible state
            // while hiding animation
            if (self.visible) {
                return;
            }

            MetaphorJs.dom.removeClass(node, cfg.cls.visible);
            MetaphorJs.dom.addClass(node, cfg.cls.hidden);

            if (!cfg.render.keepVisible) {
                node.style.display = "none";
            }

            self.trigger('hide', self, e);

            var lt = cfg.render.lifetime;

            if (lt !== null) {
                if (lt === 0) {
                    self.destroyElem();
                }
                else {
                    self.destroyDelay = async(self.destroyElem, self, null, lt);
                }
            }

            if (node && cfg.hide.destroy) {
                raf(function(){
                    MetaphorJs.dom.data(node, cfg.instanceName, null);
                    self.$destroy();
                });
            }
            else if (node && cfg.hide.remove) {
                raf(function(){
                    self.removeElem();
                });
            }
        },



        /* **** Render **** */




        render: function() {

            var self = this,
                cfg = self.cfg,
                elem;

            // if already rendered, we return
            if (self.node) {
                return;
            }


            var rnd	    = cfg.render,
                cls     = cfg.cls;


            // custom rendering function
            if (rnd.fn) {
                var res = rnd.fn.call(self.$$callbackContext, self);
                rnd[isString(res) ? 'tpl' : 'el'] = res;
            }


            if (rnd.el) {
                if (isString(rnd.el)) {
                    elem = MetaphorJs.dom.select(rnd.el).shift();
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

            self.node = elem;

            if (rnd.id) {
                MetaphorJs.dom.setAttr(elem, 'id', rnd.id);
            }

            if (!cfg.render.keepVisible) {
                elem.style.display = "none";
            }

            MetaphorJs.dom.addClass(elem, cls.dialog);
            MetaphorJs.dom.addClass(elem, cls.hidden);

            if (rnd.style) {
                MetaphorJs.dom.setStyle(elem, rnd.style);
            }


            self.overlay.render();


            if (!cfg.hide.remove) {
                self.appendElem();
            }
            else {
                if (elem.parentNode) {
                    elem.parentNode.removeChild(elem);
                }
            }

            if (rnd.zIndex) {
                MetaphorJs.dom.setStyle(elem, {zIndex: rnd.zIndex});
            }

            var cnt = cfg.content;

            if (cnt.value !== false) {
                if (cnt.value) {
                    self.setContent(cnt.value);
                }
                else {
                    if (cnt.fn) {
                        self.setContent(cnt.fn.call(self.$$callbackContext, self));
                    }
                    else {
                        self[cfg.ajax.url ? 'loadContent' : 'readContent']();
                    }
                }
            }

            self.pointer.render();
            self.pointer.append();

            if (cfg.buttons) {
                var btnId, btn;
                for (btnId in cfg.buttons) {
                    btn = MetaphorJs.dom.select(cfg.buttons[btnId], elem).shift();
                    if (btn) {
                        MetaphorJs.dom.data(btn, "metaphorjsTooltip-button-id", btnId);
                        MetaphorJs.dom.addListener(btn, "click", self.onButtonClickDelegate);
                        MetaphorJs.dom.addListener(btn, "keyup", self.onButtonKeyupDelegate);
                    }
                }
            }

            if (self.bindSelfOnRender) {
                self.setHandlers('bind', '_self');
                self.bindSelfOnRender = false;
            }

            self.rendered = true;

            self.trigger('render', self);
        },








        /* **** Position **** */

        setPositionType: function(type) {
            var self    = this,
                positionCls     = self.getPositionClass(type);

            self.cfg.position.type = type;

            if (self.positionClass !== positionCls || !self.position) {
                if (self.position) {
                    self.position.$destroy();
                    self.position = null;
                }
                if (positionCls) {
                    self.position = cls.factory(positionCls, self);
                }
            }
            else {
                self.position.type = type;
            }

            if (self.isVisible()) {
                self.reposition();
            }
        },

        getPosition: function(e) {

            var self = this,
                cfgPos = self.cfg.position;

            if (!self.position) {

                if (!self.positionGetType && cfgPos.type !== "custom") {
                    if (isFunction(cfgPos.get) && cfgPos.type !== "m") {
                        cfgPos.type = "custom";
                    }
                }

                var type    = self.positionGetType ?
                                self.positionGetType.call(self.$$callbackContext, self, e) :
                                cfgPos.type,
                    positionCls = self.getPositionClass(type);

                cfgPos.type     = type;

                if (positionCls === false) {
                    return;
                }

                if (self.positionClass !== positionCls) {
                    self.position   = cls.factory(positionCls, self);
                }
                else {
                    self.position.type = type;
                }
            }

            return self.position;
        },

        getPositionClass: function(type) {

            if (!type) {
                return false;
            }

            if (isFunction(type) || type === "custom") {
                return "MetaphorJs.dialog.position.Custom";
            }
            else if (type === "draggable") {
                return "MetaphorJs.dialog.position.Draggable";
            }
            else if (type === "none") {
                return "MetaphorJs.dialog.position.None";
            }

            var fc = type.substr(0, 1);

            if (!fc) {
                return false;
            }
            else if (fc === "w") {
                return "MetaphorJs.dialog.position.Window";
            }
            else if (fc === "m") {
                return "MetaphorJs.dialog.position.Mouse";
            }
            else {
                return "MetaphorJs.dialog.position.Target";
            }
        },


        /**
         * Usually called internally from show().
         * @method
         * 
         * @param {Event} e Optional.
         */
        reposition: function(e) {
            var self = this;

            if (self.repositioning) {
                return;
            }

            if (self.node && !MetaphorJs.dom.isAttached(self.node)) {
                MetaphorJs.dom.whenAttached(self.node).done(function(){
                    self.reposition(e);
                });
                return;
            }

            self.repositioning = true;

            e && (e = MetaphorJs.dom.normalizeEvent(e));

            self.getPosition(e);
            self.trigger("before-reposition", self, e);
            self.getPosition(e);
            self.trigger("reposition", self, e);

            self.repositioning = false;
        },



        /* **** Target **** */

        /**
         * Get dialog's target.
         * @method
         * 
         * @return {HTMLElement}
         */
        getTarget: function() {
            return this.dynamicTarget ? this.dynamicTargetEl : this.target;
        },


        /**
         * Set new dialog's target.
         * @method
         * 
         * @param {string|Element} newTarget Selector or dom node
         */
        setTarget: function(newTarget) {

            if (!newTarget) {
                return;
            }

            var self    = this,
                change  = false,
                prev    = self.target;

            if (self.target) {
                self.setHandlers('unbind', '_target');
                change = true;
            }
            else if (self.dynamicTarget) {
                change = true;
            }

            var isStr = isString(newTarget);

            if (isStr && newTarget.substr(0,1) !== "#") {
                self.dynamicTarget = true;
                self.target        = null;
            }
            else {
                if (isStr) {
                    newTarget       = MetaphorJs.dom.select(newTarget).shift();
                }
                self.dynamicTarget = false;
                self.target        = newTarget;
            }

            if (change) {
                self.setHandlers('bind', '_target');
                self.trigger("target-change", self, newTarget, prev);
            }
        },


        resetDynamicTarget: function() {
            var self = this,
                curr = self.dynamicTargetEl;
            if (curr) {
                self.setHandlers("unbind", "_target");
                self.trigger("target-change", self, null, curr);
            }
        },

        isDynamicTargetChanged: function(e) {

            var self    = this,
                cfg     = self.cfg,
                dt	    = cfg.target,
                t	    = e.target,
                curr    = self.dynamicTargetEl;

            while (t && !MetaphorJs.dom.is(t, dt)) {
                t   = t.parentNode;
            }

            if (!t) {
                return false;
            }

            return !curr || curr !== t;
        },

        changeDynamicTarget: function(e) {

            var self    = this,
                cfg     = self.cfg,
                dt	    = cfg.target,
                t	    = e.target,
                curr    = self.dynamicTargetEl;

            while (t && !MetaphorJs.dom.is(t, dt)) {
                t   = t.parentNode;
            }

            if (!t) {
                return false;
            }

            if (!curr || curr !== t) {

                if (curr) {
                    self.setHandlers("unbind", "_target");
                }

                self.dynamicTargetEl = t;

                self.setHandlers("bind", "_target");
                self.trigger("target-change", self, t, curr);
                return true;
            }
            else {
                return false;
            }
        },









        /* **** Content **** */

        /**
         * @method
         * 
         * @return {HTMLElement}
         */
        getContentElem: function() {
            var self = this,
                node = self.node;

            if (!node) {
                return null;
            }

            if (self.cfg.selector.content) {
                var el = MetaphorJs.dom.select(self.cfg.selector.content, node).shift();
                return el || node;
            }
            else {
                return node;
            }
        },


        /**
         * Set new content.
         * @method
         * 
         * @param {string|object} content {
             *      See "selector" option
             *      @required
         * }
         * @param {string} mode "", "attribute", "ajax" -- optional (used internally). See
         * content.prepare option.
         */
        setContent: function(content, mode) {

            mode = mode || '';

            var self    = this,
                node    = self.node,
                cfg     = self.cfg,
                pnt     = self.pointer;

            if (!node) {
                cfg.content.value = content;
                return self;
            }

            if (cfg.content.prepare) {
                content = cfg.content.prepare.call(self.$$callbackContext, self, mode, content);
            }

            var contentElem = self.getContentElem(),
                fixPointer  = self.rendered && !cfg.selector.content && pnt,
                pntEl       = fixPointer && pnt.getElem();

            if (fixPointer && pntEl) {
                try {
                    node.removeChild(pntEl);
                }
                catch (thrownError) {
                    error(thrownError);
                }
            }

            if (!isString(content)) {
                for (var i in content) {
                    var sel     = cfg.selector[i];
                    if (sel) {
                        var cel = MetaphorJs.dom.select(sel, contentElem).shift();
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
                    node.appendChild(pntEl);
                }
                catch (thrownError) {
                    error(thrownError);
                }
            }

            var imgs = MetaphorJs.dom.select("img", contentElem),
                l;

            self.images = imgs.length;

            for (i = -1, l = imgs.length; ++i < l; 
                MetaphorJs.dom.addListener(imgs[i], "load", self.onImageLoadDelegate)){}

            self.trigger('content-change', self, content, mode);
            self.onContentChange();
        },

        /**
         * Force dialog to re-read content from attributes.
         * @method
         * 
         */
        readContent: function() {

            var self        = this,
                cfg         = self.cfg,
                el 			= self.getTarget(),
                content;

            if (el) {
                if (typeof cfg.content.attr === "string") {
                    content = MetaphorJs.dom.getAttr(el, cfg.content.attr);
                }
                else {
                    content = MetaphorJs.dom.getAttr(el, 'tooltip') ||
                            MetaphorJs.dom.getAttr(el, 'title') ||
                            MetaphorJs.dom.getAttr(el, 'alt');
                }
            }

            if (content) {
                self.setContent(content, 'attribute');
            }
        },

        /**
         * Load content via ajax.
         * @method
         * @param {object} options Merged with cfg.ajax
         */
        loadContent: function(options) {

            var self = this,
                cfg = self.cfg;

            MetaphorJs.dom.addClass(self.node, cfg.cls.loading);
            var opt = extend({}, cfg.ajax, options, true, true);
            self.trigger('before-ajax', self, opt);
            return ajax(opt).done(self.onAjaxLoad, self);
        },

        onAjaxLoad: function(data) {
            var self = this;
            MetaphorJs.dom.removeClass(self.node, self.cfg.cls.loading);
            self.setContent(data, 'ajax');
        },

        onImageLoad: function() {
            this.images--;
            this.onContentChange();
        },

        onContentChange: function() {
            if (this.visible) {
                this.reposition();
            }
        },

        changeDynamicContent: function() {
            var self = this,
                cfg = self.cfg;
            if (cfg.content.fn) {
                self.setContent(cfg.content.fn.call(self.$$callbackContext, self));
            }
            else if (cfg.content.attr) {
                self.readContent();
            }
        },

        toggleTitleAttribute: function(state) {

            var self = this,
                trg = self.getTarget(),
                title;

            if (trg) {
                if (state === false) {
                    if (trg.hasAttribute("title")) {
                        MetaphorJs.dom.setAttr(trg, "tooltip", MetaphorJs.dom.getAttr(trg, "title"));
                        MetaphorJs.dom.removeAttr(trg, 'title');
                    }
                }
                else if (title = MetaphorJs.dom.getAttr(trg, "tooltip")) {
                    MetaphorJs.dom.setAttr(trg, "title", title);
                }
            }
        },

        /* **** Dimension **** */


        getDialogSize: function() {

            var self    = this;

            if (!self.rendered) {
                self.render();
            }

            var cfg     = self.cfg,
                node    = self.node,
                hidden  = cfg.cls.hidden ? MetaphorJs.dom.hasClass(node, cfg.cls.hidden) : 
                                            !MetaphorJs.dom.isVisible(node),
                size,
                left    = node.style.left;

            if (hidden) {
                MetaphorJs.dom.setStyle(node, {left: "-1000px"});
                node.style.display = cfg.show.display;
            }

            size    = {
                width:      MetaphorJs.dom.getOuterWidth(node),
                height:     MetaphorJs.dom.getOuterHeight(node)
            };

            if (hidden) {
                MetaphorJs.dom.setStyle(node, {left: left});
                node.style.display = "none";
            }

            return size;
        },

        getTargetSize: function() {

            var self    = this,
                target  = self.getTarget();

            if (!target) {
                return null;
            }

            return {
                width:      MetaphorJs.dom.getOuterWidth(target),
                height:     MetaphorJs.dom.getOuterHeight(target)
            };
        },


        /* **** Misc **** */


        /**
         * Set focus based on focus setting.
         * @method
         */
        setFocus: function() {

            var self    = this,
                cfg     = self.cfg,
                af      = cfg.show.focus,
                node    = self.node,
                i,
                input;

            if (af === true) {
                input   = MetaphorJs.dom.select("input", node).concat(
                            MetaphorJs.dom.select("textarea", node));
                if (input.length > 0) {
                    input[0].focus();
                }
                else if (cfg.buttons) {
                    for (i in cfg.buttons) {
                        var btn = MetaphorJs.dom.select(cfg.buttons[i], node).shift();
                        btn && btn.focus();
                        break;
                    }
                }
            }
            else {
                var el = MetaphorJs.dom.select(af, node).shift();
                el && el.focus();
            }
        },

        getScrollEl: function(cfgScroll) {
            if (cfgScroll === true || cfgScroll === false) {
                return window;
            }
            else if (typeof cfgScroll === "string") {
                return MetaphorJs.dom.select(cfgScroll).shift();
            }
            else {
                return cfgScroll;
            }
        },


        animate: function(section, e) {

            var self = this,
                cfg = self.cfg,
                node = self.node,
                a,
                skipDisplay;

            a 	= cfg[section].animate;

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

            return MetaphorJs.animate.animate(node, a, function(){
                if (section === "show" && !skipDisplay) {
                    return new MetaphorJs.lib.Promise(function(resolve, reject){
                        raf(function(){ 
                            node.style.display = cfg.show.display || "block";
                            resolve();
                        });
                    });
                }
            }, false);
        },

        removeElem: function() {

            var self = this,
                node = self.node;

            self.overlay.remove();

            if (node && node.parentNode) {
                raf(function(){
                    if (!self.visible) {
                        node.parentNode.removeChild(node);
                    }
                });
            }
        },

        appendElem: function() {



            var self    = this,
                cfg     = self.cfg,
                body    = window.document.body,
                rnd	    = cfg.render,
                to      = rnd.appendTo || body;

            self.overlay.append();

            if (self.node && cfg.render.appendTo !== false) {
                to.appendChild(self.node);
                self.trigger("attached", self, to);
            }
            else if (self.node && MetaphorJs.dom.isAttached(self.node)) {
                self.trigger("attached", self, self.node.parentNode);
            }
        },


        /* **** Destroy **** */

        destroyElem: function() {

            var self = this,
                node = self.node;

            self.setHandlers("unbind", "_self");
            self.bindSelfOnRender = true;

            self.pointer.remove();
            self.overlay.remove();

            if (node) {
                if (!self.cfg.render.keepInDOM) {
                    node.parentNode && node.parentNode.removeChild(node);
                }
                self.node = null;
            }

            self.trigger("lifetime", self);
        },

        onDestroy: function() {

            var self = this;

            self.setHandlers("unbind");

            self.trigger("destroy", self);
            self.destroyElem();

            self.overlay && self.overlay.$destroy();
            self.pointer && self.pointer.$destroy();
            self.position && self.position.$destroy();
        }

    }, {
        defaults: null
    });



    return Dialog;

}());