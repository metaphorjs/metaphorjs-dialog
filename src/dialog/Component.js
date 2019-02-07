
require("../__init.js");
require("metaphorjs/src/lib/DomEvent.js");
require("./Dialog.js");
require("metaphorjs/src/app/Component.js");

var extend  = require("metaphorjs-shared/src/func/extend.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.dialog.Component = MetaphorJs.app.Component.$extend({

    dialog: null,
    dialogPreset: null,
    dialogCfg: null,
    dialogNode: null,

    hidden: true,

    target: null,
    isTooltip: false,

    $init: function(cfg) {

        var self = this;

        if (self.isTooltip) {
            self.target = cfg.node;
            cfg.node = null;
        }

        self.$super(cfg);
        this._createDialog();
    },

    _initConfig: function() {
        this.config.set("tag", "div");
    },

    _getDialogCfg: function() {

        var self    = this;

        return extend({}, self.dialogCfg, {
            preset: self.dialogPreset,
            render: {
                el: self.dialogNode || self.node,
                keepInDOM: true
            }
        }, true, true);
    },

    _createDialog: function() {

        var self    = this;
        self.dialog = new MetaphorJs.dialog.Dialog(self._getDialogCfg());
        self.dialog.on("show", self.onDialogShow, self);
        self.dialog.on("hide", self.onDialogHide, self);
        self.dialog.on("before-show", self.onBeforeDialogShow, self);
        self.dialog.on("before-hide", self.onBeforeDialogHide, self);
        self.dialog.on("destroy", self.onDialogDestroy, self);
    },

    getDialog: function() {
        return this.dialog;
    },

    // skips the append part
    _onRenderingFinished: function() {
        var self = this;
        self._rendered   = true;
        self.afterRender();
        self.trigger('after-render', self);
        if (self.directives) {
            self._initDirectives();
        }
    },

    show: function(e) {
        if (e && !(e instanceof MetaphorJs.lib.DomEvent)) {
            e = null;
        }

        this.dialog.show(e);
    },

    hide: function(e) {

        if (e && !(e instanceof MetaphorJs.lib.DomEvent)) {
            e = null;
        }

        this.dialog.hide(e);
    },

    onBeforeDialogShow: function() {

        var self = this;
        if (!self._rendered) {
            self.render();
        }

        self.hidden = false;
    },

    onDialogShow: function() {
        var self = this;
        self.trigger("show", self);
    },

    onBeforeDialogHide: function() {},

    onDialogHide: function() {
        var self = this;
        if (!self.$destroyed) {
            self.hidden = true;
            self.trigger("hide", self);
        }
    },

    onDialogDestroy: function() {
        var self    = this;

        if (!self.$destroying) {
            self.dialog = null;
            self.$destroy();
        }
    },

    onDestroy: function() {

        var self    = this;

        if (self.dialog) {
            self.dialog.$destroy();
        }

        self.$super();

    }

});
