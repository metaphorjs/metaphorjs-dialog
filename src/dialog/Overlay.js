
require("../__init.js");
require("metaphorjs/src/func/dom/setStyle.js");
require("metaphorjs/src/func/dom/addListener.js");
require("metaphorjs/src/func/dom/normalizeEvent.js");
require("metaphorjs-animate/src/animate/animate.js");
require("metaphorjs-promise/src/lib/Promise.js");
require("metaphorjs-observable/src/mixin/Observable.js");

const cls = require("metaphorjs-class/src/cls.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    raf = require("metaphorjs-animate/src/func/raf.js"),
    bind = require("metaphorjs-shared/src/func/bind.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    isFunction = require("metaphorjs-shared/src/func/isFunction.js"),
    isString = require("metaphorjs-shared/src/func/isString.js"),
    isBool = require("metaphorjs-shared/src/func/isBool.js");

module.exports = MetaphorJs.dialog.Overlay = cls({

    dialog:         null,
    enabled:		false,
    color:			'#000',
    opacity:		.5,
    cls:			null,
    animateShow:	false,
    animateHide:	false,

    $mixins:        [MetaphorJs.mixin.Observable],

    $init: function(dialog) {

        var self = this;

        self.dialog = dialog;
        self.onClickDelegate = bind(self.onClick, self);
        extend(self, dialog.getCfg().overlay, true, false);

        self.$$observable.createEvent("click", false);

        if (self.enabled) {
            self.enabled = false;
            self.enable();
        }
    },

    getElem: function() {
        var self = this;
        if (self.enabled && !self.node) {
            self.render();
        }
        return self.node;
    },

    enable: function() {
        var self = this;
        if (!self.enabled) {
            self.enabled = true;
        }
    },

    disable: function() {
        var self = this;
        if (self.enabled) {
            self.remove();
            self.enabled = false;
        }
    },

    show: function(e) {
        var self = this;

        if (!self.enabled) {
            return;
        }

        if (self.animateShow) {
            self.animate("show", e);
        }
        else {
            self.node.style.display = "block";
        }
    },

    hide: function(e) {
        var self = this;
        if (self.node) {
            if (self.animateHide) {
                self.animate("hide", e);
            }
            else {
                self.node.style.display = "none";
            }
        }
    },

    render: function() {

        var self = this;

        if (!self.enabled) {
            return;
        }

        var node = window.document.createElement("div"),
            cfg = self.dialog.getCfg(),
            style = {
                display:            "none",
                position: 			"fixed",
                left:				0,
                top:				0,
                right:              0,
                bottom:             0
            };

        if (self.opacity !== false) {
            style.opacity = self.opacity;
        }
        if (self.color !== false) {
            style.backgroundColor = self.color;
        }

        MetaphorJs.dom.setStyle(node, style);
        MetaphorJs.dom.addListener(node, "click", self.onClickDelegate);

        if (cfg.render.zIndex) {
            MetaphorJs.dom.setStyle(node, "zIndex", cfg.render.zIndex);
        }
        if (self.cls) {
            MetaphorJs.dom.addClass(node, self.cls);
        }

        self.node = node;
    },

    remove: function() {
        var self = this,
            node = self.node;

        if (node) {
            raf(function() {
                //if (!dialog.isVisible() && node.parentNode) {
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            });
        }
    },

    append: function() {
        var self = this,
            cfg = self.dialog.getCfg(),
            to = cfg.render.appendTo || window.document.body;

        if (!self.enabled || self.$destroyed) {
            return;
        }

        if (!self.node) {
            self.render();
        }

        to.appendChild(self.node);
    },

    animate: function(type, e) {
        var self = this,
            node = self.node,
            a;

        a = type == "show" ? self.animateShow : self.animateHide;

        if (isFunction(a)) {
            a   = a(self, e);
        }

        if (isBool(a)) {
            a = type;
        }
        else if (isString(a)) {
            a = [a];
        }

        return MetaphorJs.animate.animate(node, a, function(){
            if (type == "show") {
                return new MetaphorJs.lib.Promise(function(resolve, reject){
                    raf(function(){
                        node.style.display = "";
                        resolve();
                    });
                });
            }
        }, false);
    },

    onClick: function(e) {

        var self = this;

        var res = self.trigger("click", self.dialog, self, e);

        if (res === false) {
            return null;
        }

        if (self.modal) {
            e = MetaphorJs.dom.normalizeEvent(e);
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        return null;
    },

    onDestroy: function() {
        var self = this;
        self.remove();
    }
});