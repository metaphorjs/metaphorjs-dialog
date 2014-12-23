
var defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    extend = require("metaphorjs/src/func/extend.js");

module.exports = defineClass({

    $class: "$dialog.pointer.Abstract",
    enabled: null,
    node: null,
    correctX: 0,
    correctY: 0,

    $init: function(dialog, cfg) {

        var self = this;

        extend(self, cfg, true, false);

        self.origCfg    = cfg;
        self.dialog     = dialog;
        self.opposite   = {t: "b", r: "l", b: "t", l: "r"};
        self.names      = {t: 'top', r: 'right', b: 'bottom', l: 'left'};
        self.sides      = {t: ['l','r'], r: ['t','b'], b: ['r','l'], l: ['b','t']};

        if (self.enabled !== false && cfg.size) {
            self.enabled = true;
        }
        else {
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

    setCorrectionOffset: function(x, y) {
        this.correctX = x;
        this.correctY = y;
    },

    getCorrectionValue: function(type, value, position) {

        if (!value) {
            return 0;
        }

        var self    = this,
            pri     = position.substr(0,1),
            sec     = position.substr(1,1),
            tsize   = self.dialog.getDialogSize(),
            width   = self.width,
            sprop   = pri == "t" || pri == "b" ? "width" : "height",
            min,
            max;

        switch (sec) {
            case "":
                max = (tsize[sprop] / 2) - (width / 2);
                min = -max;
                break;
            case "l":
                min = 0;
                max = tsize[sprop] - (width / 2);
                break;
            case "r":
                min = -(tsize[sprop] - (width / 2));
                max = 0;
                break;
        }

        value = value < 0 ? Math.max(min, value) : Math.min(max, value);

        if ((pri == "t" || pri == "b") && type == "x") {
            return value;
        }
        if ((pri == "l" || pri == "r") && type == "y") {
            return value;
        }

        return 0;
    },

    getDialogPositionOffset: function(position) {
        var self    = this,
            pp      = (self.detectPointerPosition(position) || "").substr(0,1),
            dp      = self.dialog.getPosition().getPrimaryPosition(),
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

    detectPointerPosition: function(dialogPosition) {

        var self = this,
            pri, sec;

        if (self.position && !dialogPosition) {
            if (isFunction(self.position)) {
                return self.position.call(self.dialog.$$callbackContext, self.dialog, self.origCfg);
            }
            return self.position;
        }

        pri = self.dialog.getPosition().getPrimaryPosition(dialogPosition);
        sec = self.dialog.getPosition().getSecondaryPosition(dialogPosition);

        if (!pri) {
            return null;
        }

        var position = self.opposite[pri];

        if (sec) {
            sec = sec.substr(0, 1);
            //position += self.opposite[sec];
            position += sec;
        }

        return position;
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



    setType: function(position, direction) {
        var self = this;
        self.position = position;
        self.direction = direction;
        self.update();
        self.reposition();
    },


    render: function() {},

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

        var self = this,
            node = self.node;

        if (node) {

            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }

            self.node = null;
        }
    }
});