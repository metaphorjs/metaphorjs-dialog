
var Dialog = require("../class/Dialog.js"),
    extend  = require("metaphorjs/src/func/extend.js"),
    Component = require("metaphorjs/src/class/Component.js");

module.exports = Component.$extend({

    $class: "DialogComponent",

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
    },

    initComponent: function() {

        var self    = this;

        self.$super();
        self._createDialog();
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
        self.dialog = new Dialog(self._getDialogCfg());
        self.dialog.on("show", self.onDialogShow, self);
        self.dialog.on("hide", self.onDialogHide, self);
        self.dialog.on("before-show", self.onBeforeDialogShow, self);
        self.dialog.on("before-hide", self.onBeforeDialogHide, self);
        self.dialog.on("destroy", self.onDialogDestroy, self);
    },

    // skips the append part
    onRenderingFinished: function() {
        var self = this;
        self.rendered   = true;
        self.afterRender();
        self.trigger('after-render', self);
    },

    show: function() {
        this.dialog.show();
    },

    hide: function() {
        this.dialog.hide();
    },

    onBeforeDialogShow: function() {

        var self = this;
        if (!self.rendered) {
            self.render();
        }

        self.template.setAnimation(true);
        self.hidden = false;
    },

    onDialogShow: function() {
        var self = this;
        self.onShow();
        self.trigger("show", self);
    },

    onBeforeDialogHide: function() {

    },

    onDialogHide: function() {
        var self = this;
        self.template.setAnimation(false);
        self.hidden = true;
        self.onHide();
        self.trigger("hide", self);
    },

    onDialogDestroy: function() {
        var self    = this;

        if (!self.destroying) {
            self.dialog = null;
            self.$destroy();
        }
    },

    destroy: function() {

        var self    = this;

        self.destroying = true;

        if (self.dialog) {
            self.dialog.destroy();
        }

        self.$super();

    }

});
