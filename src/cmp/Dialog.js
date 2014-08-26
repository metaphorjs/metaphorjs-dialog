//#require ../vars/Dialog.js
//#require ../../../metaphorjs/src/func/extend.js
//#require ../../../metaphorjs/src/func/class/defineClass.js

defineClass("MetaphorJs.cmp.Dialog", "MetaphorJs.cmp.Component", {

    dialog: null,
    dialogPreset: null,
    dialogCfg: null,

    initComponent: function() {

        var self    = this;

        self.supr();
        self._createDialog();
        self._oldShow = self.show;
        self._oldHide = self.hide;
    },

    _getDialogCfg: function() {

        var self    = this;

        return extend({}, self.dialogCfg || {}, {
            render: {
                el: self.node,
                keepInDOM: true
            }
        }, true, true);
    },

    _createDialog: function() {

        var self    = this;
        self.dialog = new Dialog(self.dialogPreset, self._getDialogCfg());
        self.dialog.on("show", self._oldShow, self);
        self.dialog.on("hide", self._oldHide, self);
        self.dialog.on("destroy", self.onDialogDestroy, self);
    },

    show: function() {
        this.dialog.show();
    },

    hide: function() {
        this.dialog.hide();
    },

    onDialogDestroy: function() {
        var self    = this;

        if (!self.destroying) {
            delete self.dialog;
            self.destroy();
        }
    },

    onDestroy: function() {

        var self    = this;

        self.destroying = true;

        if (self.dialog) {
            self.dialog.destroy();
        }
        delete self.dialog;
        delete self.dialogCfg;
        delete self.dialogPreset;

        self.supr();

        self.destroying = false;
    }

});
