
require("../__init.js");
require("metaphorjs/src/lib/DomEvent.js");
require("./Dialog.js");
require("metaphorjs/src/app/Container.js");

var extend  = require("metaphorjs-shared/src/func/extend.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.dialog.Container = MetaphorJs.app.Container.$extend({

    dialog: null,
    dialogPreset: null,
    dialogCfg: null,

    _hidden: true,
    autoRender: true,

    target: null,
    isTooltip: false,

    $init: function(cfg) {

        var self = this;

        if ((!cfg || !cfg.node) && 
            !self.template && 
            (!cfg || !cfg.template)) {
            self.node = window.document.createElement("div");
        }

        self.$super(cfg);
    },

    _getDialogCfg: function() {

        var self    = this;

        return extend({}, self.dialogCfg, {
            preset: self.dialogPreset,
            render: {
                el: self.getRefEl("main"),
                keepInDOM: true,
                appendTo: false,
                lazy: false
            }
        }, true, true);
    },

    _onRenderingFinished: function() {
        var self = this, i, l, items = self.items
        self.$super();
        // insert all placeholders, but
        // attach only resolved items
        for (i = -1, l = items.length; ++i < l;){
            self._putItemInPlace(items[i]);
        }

        this._createDialog();  
    },

    _createDialog: function() {

        var self    = this;
        self.dialog = new MetaphorJs.dialog.Dialog(self._getDialogCfg());
        self.dialog.on("show", self.onDialogShow, self);
        self.dialog.on("hide", self.onDialogHide, self);
        self.dialog.on("before-show", self.onBeforeDialogShow, self);
        self.dialog.on("before-hide", self.onBeforeDialogHide, self);
        self.dialog.on("destroy", self.onDialogDestroy, self);
        self.dialog.on("attached", self.onDialogAttached, self);

        if (!self._hidden) {
            self.show();
        }
    },

    getDialog: function() {
        return this.dialog;
    },


    show: function(e) {
        if (e && !(e instanceof MetaphorJs.lib.DomEvent)) {
            e = null;
        }

        if (this.dialog) {
            this.dialog.show(e);
        }
        else this._hidden = false;
    },

    hide: function(e) {
        if (e && !(e instanceof MetaphorJs.lib.DomEvent)) {
            e = null;
        }

        if (this.dialog) {
            this.dialog.hide(e);
        }
        else this._hidden = true;
    },

    onDialogAttached: function() {
        if (!this._attached) {
            this.render(this.node.parentNode);
        }
    },

    onBeforeDialogShow: function() {
        var self = this;
        if (!self._rendered) {
            self.render();
        }
        else if (!self._attached && self.renderTo) {
            self.attach(self.renderTo, self.renderBefore);
        }

        self._hidden = false;
    },

    onDialogShow: function() {
        var self = this;
        self.trigger("show", self);
    },

    onBeforeDialogHide: function() {},

    onDialogHide: function() {
        var self = this;
        if (!self.$destroyed) {
            self._hidden = true;
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
