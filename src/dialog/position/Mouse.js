

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    bind = require("metaphorjs-shared/src/func/bind.js");

require("../../__init.js");
require("metaphorjs/src/func/dom/normalizeEvent.js");
require("metaphorjs/src/func/dom/addListener.js");
require("metaphorjs/src/func/dom/removeListener.js");
require("metaphorjs/src/func/dom/getOffset.js");
require("./Target.js");


module.exports = MetaphorJs.dialog.position.Mouse = MetaphorJs.dialog.position.Target.$extend({

    correct: "position",

    $init: function(dialog) {

        var self = this;

        self.onMouseMoveDelegate = bind(self.onMouseMove, self);
        self.$super(dialog);
    },

    getCoords: function(e, type, absolute) {

        if (!e) {
            return null;
        }

        var self    = this,
            origType= type || self.type,
            dlg     = self.dialog,
            cfg     = dlg.getCfg(),
            size    = dlg.getDialogSize(),
            base    = self.getPositionBase(),
            pos     = {},
            type    = (type || self.type).substr(1),
            offsetX = cfg.position.offsetX,
            offsetY = cfg.position.offsetY,
            axis    = cfg.position.axis,
            pntOfs  = dlg.getPointer().getDialogPositionOffset(origType),
            absOfs  = {x: 0, y: 0};

        if (!absolute && base) {
            var baseOfs = MetaphorJs.dom.getOffset(base);
            absOfs.x = baseOfs.left;
            absOfs.y = baseOfs.top;
        }

        switch (type) {
            case "": {
                pos     = self.get.call(dlg.$$callbackContext, dlg, e, type, absolute);
                break;
            }
            case "c": {
                pos.y   = e.pageY - absOfs.y - (size.height / 2);
                pos.x   = e.pageX - absOfs.x - (size.width / 2);
                break;
            }
            case "t": {
                pos.y   = e.pageY - absOfs.y - size.height - offsetY;
                pos.x   = e.pageX - absOfs.x - (size.width / 2);
                break;
            }
            case "r": {
                pos.y   = e.pageY - absOfs.y - (size.height / 2);
                pos.x   = e.pageX - absOfs.x + offsetX;
                break;
            }
            case "b": {
                pos.y   = e.pageY - absOfs.y + offsetY;
                pos.x   = e.pageX - absOfs.x - (size.width / 2);
                break;
            }
            case "l": {
                pos.y   = e.pageY - absOfs.y - (size.height / 2);
                pos.x   = e.pageX - absOfs.x - size.width - offsetX;
                break;
            }
            case "rt": {
                pos.y   = e.pageY - absOfs.y - size.height - offsetY;
                pos.x   = e.pageX - absOfs.x + offsetX;
                break;
            }
            case "rb": {
                pos.y   = e.pageY - absOfs.y + offsetY;
                pos.x   = e.pageX - absOfs.x + offsetX;
                break;
            }
            case "lt": {
                pos.y   = e.pageY - absOfs.y - size.height - offsetY;
                pos.x   = e.pageX - absOfs.x - size.width - offsetX;
                break;
            }
            case "lb": {
                pos.y   = e.pageY - absOfs.y + offsetY;
                pos.x   = e.pageX - absOfs.x - size.width - offsetX;
                break;
            }
        }

        if (pntOfs) {
            pos.x += pntOfs.x;
            pos.y += pntOfs.y;
        }

        if (axis) {
            var tp = self.$super(e, type);
            if (tp) {
                if (axis == "x") {
                    pos.y = tp.y;
                }
                else {
                    pos.x = tp.x;
                }
            }
        }

        return pos;
    },

    onShowAfterDelay: function() {
        var self = this;
        self.$super();
        MetaphorJs.dom.addListener(window.document.documentElement, "mousemove", self.onMouseMoveDelegate);
    },

    onHideAfterDelay: function() {
        var self = this;
        self.$super();
        MetaphorJs.dom.removeListener(window.document.documentElement, "mousemove", self.onMouseMoveDelegate);
    },

    onMouseMove: function(e) {
        this.dialog.reposition(MetaphorJs.dom.normalizeEvent(e));
    },

    getPrimaryPosition: function(pos) {
        return (pos || this.type).substr(1, 1);
    },

    getSecondaryPosition: function(pos) {
        return (pos || this.type).substr(2);
    },

    getAllPositions: function() {
        return ["mt", "mr", "mb", "ml", "mrt", "mrb", "mlb", "mlt"];
    }
});

