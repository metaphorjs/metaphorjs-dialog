
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

require("../../__init.js");
require("metaphorjs/src/func/dom/getScrollTop.js");
require("metaphorjs/src/func/dom/getScrollLeft.js");
require("metaphorjs/src/func/dom/getOuterWidth.js");
require("metaphorjs/src/func/dom/getOuterHeight.js");
require("./Abstract.js");

module.exports = MetaphorJs.dialog.position.Window = MetaphorJs.dialog.position.Abstract.$extend({

    getCoords: function(e, type) {

        var self    = this,
            dlg     = self.dialog,
            pBase   = self.getPositionBase() || window,
            size    = dlg.getDialogSize(),
            pos     = {},
            type    = (type || self.type).substr(1),
            offsetX = self.offsetX,
            offsetY = self.offsetY,
            st      = MetaphorJs.dom.getScrollTop(pBase),
            sl      = MetaphorJs.dom.getScrollLeft(pBase),
            ww      = MetaphorJs.dom.getOuterWidth(pBase),
            wh      = MetaphorJs.dom.getOuterHeight(pBase);

        switch (type) {
            case "c": {
                pos.y   = (wh / 2) - (size.height / 2) + st + offsetY;
                pos.x   = (ww / 2) - (size.width / 2) + sl + offsetX;
                break;
            }
            case "t": {
                pos.y   = st + offsetY;
                pos.x   = (ww / 2) - (size.width / 2) + sl + offsetX;
                break;
            }
            case "r": {
                pos.y   = (wh / 2) - (size.height / 2) + st - offsetY;
                pos.x   = ww - size.width + sl - offsetX;
                break;
            }
            case "b": {
                pos.y   = wh - size.height + st - offsetY;
                pos.x   = (ww / 2) - (size.width / 2) + sl + offsetX;
                break;
            }
            case "l": {
                pos.y   = (wh / 2) - (size.height / 2) + st + offsetY;
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

