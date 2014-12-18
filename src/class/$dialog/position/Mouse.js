
var defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    bind = require("metaphorjs/src/func/bind.js"),
    normalizeEvent = require("metaphorjs/src/func/event/normalizeEvent.js"),
    addListener = require("metaphorjs/src/func/event/addListener.js"),
    removeListener = require("metaphorjs/src/func/event/removeListener.js");


require("./Target.js");


defineClass({

    $class: "$dialog.position.Mouse",
    $extends: "$dialog.position.Target",

    $init: function(dialog) {

        var self = this;

        self.onMouseMoveDelegate = bind(self.onMouseMove, self);
        self.$super(dialog);
    },

    getCoords: function(e) {

        if (!e) {
            return null;
        }

        var self    = this,
            dlg     = self.dialog,
            cfg     = dlg.getCfg(),
            size    = dlg.getDialogSize(),
            pos     = {},
            type    = self.type.substr(1),
            offsetX = cfg.position.offsetX,
            offsetY = cfg.position.offsetY,
            axis    = cfg.position.axis;/*,
            pntOfs  = pnt ? pnt.getDialogPositionOffset() : null;*/

        switch (type) {
            case "": {
                pos     = self.get.call(dlg.$$callbackContext, dlg, e);
                break;
            }
            case "c": {
                pos.y   = e.pageY - (size.height / 2);
                pos.x   = e.pageX - (size.width / 2);
                break;
            }
            case "t": {
                pos.y   = e.pageY - size.height - offsetY;
                pos.x   = e.pageX - (size.width / 2);
                break;
            }
            case "r": {
                pos.y   = e.pageY - (size.height / 2);
                pos.x   = e.pageX + offsetX;
                break;
            }
            case "b": {
                pos.y   = e.pageY + offsetY;
                pos.x   = e.pageX - (size.width / 2);
                break;
            }
            case "l": {
                pos.y   = e.pageY - (size.height / 2);
                pos.x   = e.pageX - size.width - offsetX;
                break;
            }
            case "rt": {
                pos.y   = e.pageY - size.height - offsetY;
                pos.x   = e.pageX + offsetX;
                break;
            }
            case "rb": {
                pos.y   = e.pageY + offsetY;
                pos.x   = e.pageX + offsetX;
                break;
            }
            case "lt": {
                pos.y   = e.pageY - size.height - offsetY;
                pos.x   = e.pageX - size.width - offsetX;
                break;
            }
            case "lb": {
                pos.y   = e.pageY + offsetY;
                pos.x   = e.pageX - size.width - offsetX;
                break;
            }
        }

        /*if (pntOfs) {
            pos.x += pntOfs.x;
            pos.y += pntOfs.y;
        }*/

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
        addListener(window.document.documentElement, "mousemove", self.onMouseMoveDelegate);
    },

    onHideAfterDelay: function() {
        var self = this;
        self.$super();
        removeListener(window.document.documentElement, "mousemove", self.onMouseMoveDelegate);
    },

    onMouseMove: function(e) {
        this.dialog.reposition(normalizeEvent(e));
    }
});

