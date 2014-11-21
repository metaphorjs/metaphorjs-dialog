
var Dialog = require("../metaphorjs.dialog.js"),
    extend  = require("../../../metaphorjs/src/func/extend.js"),
    defineClass = require("../../../metaphorjs-class/src/func/defineClass.js"),
    Component = require("../../../metaphorjs/src/class/Component.js");

module.exports = defineClass({

    $class: "DialogComponent",
    $extends: Component,

    dialog: null,
    dialogPreset: null,
    dialogCfg: null,

    initComponent: function() {

        var self    = this;

        self.$super();
        self._createDialog();
    },

    _getDialogCfg: function() {

        var self    = this;

        return extend({}, self.dialogCfg, {
            render: {
                el: self.node,
                keepInDOM: true
            }
        }, true, true);
    },

    _createDialog: function() {

        var self    = this;
        self.dialog = new Dialog(self.dialogPreset, self._getDialogCfg());
        self.dialog.on("show", self.onDialogShow, self);
        self.dialog.on("hide", self.onDialogHide, self);
        self.dialog.on("destroy", self.onDialogDestroy, self);
    },

    show: function() {
        this.dialog.show();
        this.$super();
    },

    hide: function() {
        this.dialog.hide();
        this.$super();
    },

    onDialogShow: function() {
        this.show();
    },

    onDialogHide: function() {
        this.hide();
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
