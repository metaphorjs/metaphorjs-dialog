
var MetaphorJs = require("metaphorjs/src/MetaphorJs.js");

require("./Abstract.js");

module.exports = MetaphorJs.dialog.position.Abstract.$extend({

    $class: "MetaphorJs.dialog.position.Window",

    getCoords: function(e, type) {

        var self    = this,
            dlg     = self.dialog,
            pBase   = self.getPositionBase() || window,
            size    = dlg.getDialogSize(),
            pos     = {},
            type    = (type || self.type).substr(1),
            offsetX = self.offsetX,
            offsetY = self.offsetY,
            st      = getScrollTop(pBase),
            sl      = getScrollLeft(pBase),
            ww      = getOuterWidth(pBase),
            wh      = getOuterHeight(pBase);

        switch (type) {
            case "c": {
                pos.y   = (wh / 2) - (size.height / 2) + st;
                pos.x   = (ww / 2) - (size.width / 2) + sl;
                break;
            }
            case "t": {
                pos.y   = st + offsetY;
                pos.x   = (ww / 2) - (size.width / 2) + sl;
                break;
            }
            case "r": {
                pos.y   = (wh / 2) - (size.height / 2) + st;
                pos.x   = ww - size.width + sl - offsetX;
                break;
            }
            case "b": {
                pos.y   = wh - size.height + st - offsetY;
                pos.x   = (ww / 2) - (size.width / 2) + sl;
                break;
            }
            case "l": {
                pos.y   = (wh / 2) - (size.height / 2) + st;
                pos.x   = sl + offsetX;
                break;
            }
            case "rt": {
                pos.y   = st + offsetY;
                pos.x   = ww - size.width + sl - offsetX;
                break;
            }
            case "rb": {
                pos.y   = wh - size.height + st - offsetY;
                pos.x   = ww - size.width + sl - offsetX;
                break;
            }
            case "lt": {
                pos.y   = st + offsetY;
                pos.x   = sl + offsetX;
                break;
            }
            case "lb": {
                pos.y   = wh - size.height + st - offsetY;
                pos.x   = sl + offsetX;
                break;
            }
        }

        return pos;
    },

    getPrimaryPosition: function(type) {
        return (type || this.type).substr(1, 1);
    },

    getSecondaryPosition: function(type) {
        return (type || this.type).substr(2);
    },


    getAllPositions: function() {
        return ["wt", "wr", "wb", "wl", "wrt", "wrb", "wlb", "wlt", "wc"];
    },

    correctPosition: function(e) {
        return this.getCoords(e);
    }

});

