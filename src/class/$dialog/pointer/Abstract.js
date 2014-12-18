
var defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    extend = require("metaphorjs/src/func/extend.js");

module.exports = defineClass({

    $class: "$dialog.pointer.Abstract",
    enabled: null,
    node: null,

    $init: function(dialog, cfg) {

        var self = this;

        extend(self, cfg, true, false);

        self.origCfg    = cfg;
        self.dialog     = dialog;
        self.opposite   = {t: "b", r: "l", b: "t", l: "r"};
        self.names      = {t: 'top', r: 'right', b: 'bottom', l: 'left'};
        self.sides      = {t: ['l','r'], r: ['t','b'], b: ['r','l'], l: ['b','t']};

        if (self.enabled !== false && cfg.size) {
            self.enable();
        }
        if (!self.size) {
            self.enabled = false;
        }
    },

    enable: function() {
        var self = this;
        if (!self.enabled) {
            self.enabled = true;
            self.render();
            if (self.dialog.isVisible()) {
                self.dialog.reposition();
            }
        }
    },

    disable: function() {
        var self = this;
        if (self.enabled) {
            self.remove();
            self.enabled = false;
            if (self.dialog.isVisible()) {
                self.dialog.reposition();
            }
        }
    },

    getElem: function() {
        return this.node;
    },

    getSize: function() {
        return this.enabled ? this.size : 0;
    },

    getDialogPositionOffset: function() {
        var self    = this,
            pp      = (self.detectPointerPosition() || "").substr(0,1),
            dp      = (self.dialog.getCfg().position.type || "").replace(/(w|m|c)/, "").substr(0,1),
            ofs     = {x: 0, y: 0};

        if (!self.enabled) {
            return ofs;
        }

        if (pp == self.opposite[dp]) {
            ofs[pp == "t" || pp == "b" ? "y" : "x"] =
                pp == "b" || pp == "r" ? -self.size : self.size;
        }

        return ofs;
    },

    detectPointerPosition: function() {

        var self = this;

        if (self.position) {
            if (isFunction(self.position)) {
                return self.position.call(self.dialog.$$callbackContext, self.dialog, self.origCfg);
            }
            return self.position;
        }
        var pri = (self.dialog.getCfg().position.type || "").replace(/(w|m|c)/, "").substr(0,1);

        if (!pri) {
            return null;
        }

        return self.opposite[pri];
    },

    detectPointerDirection: function(position) {

        var self = this;

        if (self.direction) {
            if (isFunction(self.direction)) {
                return self.direction.call(self.dialog.$$callbackContext, self.dialog, position, self.origCfg);
            }
            return self.direction;
        }
        return position;
    },

    update: function(){
        var self = this;
        self.remove();
        self.render();
        self.append();
        if (self.dialog.isVisible()) {
            self.dialog.reposition();
        }
    },

    render: function() {

    },

    destroy: function() {
        var self = this;
        self.remove();
    },

    reposition: function() {

    },

    append: function() {

        var self = this;
        if (!self.enabled) {
            return;
        }
        if (!self.node) {
            self.render();
        }
        if (!self.node) {
            return;
        }

        self.reposition();

        var parent = self.dialog.getElem();
        if (parent) {
            parent.appendChild(self.node);
        }
    },

    remove: function(){

        var self = this;

        if (self.node) {
            self.node.parentNode.removeChild(self.node);
            self.node = null;
        }
    }
});