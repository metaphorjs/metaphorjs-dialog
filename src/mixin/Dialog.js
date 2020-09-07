
require("../__init.js");
require("metaphorjs/src/lib/DomEvent.js");
require("../dialog/Dialog.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    extend = require("metaphorjs-shared/src/func/extend.js");


module.exports = MetaphorJs.mixin.Dialog = {
    dialog: null,
    dialogPreset: null,
    dialogCfg: null,

    _hidden: true,
    autoRender: true,

    target: null,
    isTooltip: false,

    $beforeInit: function(cfg) {

        var self = this;

        self.autoRender = true;

        if ((!cfg || !cfg.node) && 
            !self.template && 
            (!cfg || !cfg.template)) {
            self.node = window.document.createElement("div");
        }

        self.$intercept(
            "_onRenderingFinished", 
            self._onDialogRenderingFinished, 
            self,
            "after"
        );
    },

    $beforeDestroy: function() {
        if (this.dialog) {
            this.dialog.$destroy();
        }
    },

    getDialogCfg: function() {

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

    getDialog: function() {
        return this.dialog;
    },



    _onDialogRenderingFinished: function() {
        var self = this, i, l, items = self.items;

        if (items) {
            // insert all placeholders, but
            // attach only resolved items
            for (i = -1, l = items.length; ++i < l;){
                self._putItemInPlace(items[i]);
            }
        }

        this._createDialog();  
    },

    _createDialog: function() {
        var self    = this;
        self.dialog = new MetaphorJs.dialog.Dialog(self.getDialogCfg());
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
    }

}