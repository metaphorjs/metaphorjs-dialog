
require("../../__init.js");
require("metaphorjs/src/func/dom/setStyle.js");
require("metaphorjs/src/func/dom/select.js");
require("metaphorjs/src/func/dom/normalizeEvent.js");
require("metaphorjs/src/func/dom/addListener.js");
require("metaphorjs/src/func/dom/removeListener.js");
require("metaphorjs/src/func/dom/getScrollTop.js");
require("metaphorjs/src/func/dom/getScrollLeft.js");
require("metaphorjs/src/func/dom/getOuterWidth.js");
require("metaphorjs/src/func/dom/getOuterHeight.js");
require("metaphorjs/src/func/dom/getWidth.js");
require("metaphorjs/src/func/dom/getHeight.js");
require("metaphorjs/src/func/dom/isAttached.js");

var cls = require("metaphorjs-class/src/cls.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.dialog.position.Abstract = cls({

    dialog: null,
    positionBase: null,
    correct: "solid",

    $init: function(dialog) {
        var self = this;
        self.dialog = dialog;
        extend(self, dialog.getCfg().position, true, false);

        self.onWindowResizeDelegate = bind(self.onWindowResize, self);
        self.onWindowScrollDelegate = bind(self.onWindowScroll, self);

        if (self.type === "auto") {
            self.type = null;
        }

        var pt = self.preferredType || self.type;
        if (typeof pt === "string") {
            var pts = self.getAllPositions(),
                inx;
            if ((inx = pts.indexOf(pt)) !== -1) {
                pts.splice(inx, 1);
                pts.unshift(pt);
            }
            self.preferredType = pts;
            !self.type && (self.type = pts[0]);
        }
        else if (!pt) {
            self.preferredType = self.getAllPositions();
            !self.type && (self.type = self.preferredType[0]);
        }
        else {
            !self.type && (self.type = self.preferredType[0]);
        }

        dialog.on("reposition", self.onReposition, self);
        dialog.on("show-after-delay", self.onShowAfterDelay, self);
        dialog.on("hide-after-delay", self.onHideAfterDelay, self);

        if (dialog.isVisible()) {
            self.onShowAfterDelay();
        }

    },


    getPositionBase: function() {

        var self = this,
            dlg = self.dialog;

        if (self.positionBase) {
            return self.positionBase;
        }
        var b;
        if (b = dlg.getCfg().position.base) {
            if (typeof b === "string") {
                self.positionBase = MetaphorJs.dom.select(b).shift();
            }
            else {
                self.positionBase = b;
            }
            return self.positionBase;
        }
        return null;
    },

    getBoundary: function() {

        var self    = this,
            base    = self.getPositionBase(),
            sx      = self.screenX || 0,
            sy      = self.screenY || 0,
            w, h,
            st, sl,
            ofs;

        if (base) {
            ofs = MetaphorJs.dom.getOffset(base);
            w = MetaphorJs.dom.getOuterWidth(base);
            h = MetaphorJs.dom.getOuterHeight(base);
            return {
                x: ofs.left + sx,
                y: ofs.top + sy,
                x1: ofs.left + w - sx,
                y1: ofs.top + h - sy,
                w: w,
                h: h
            };
        }
        else {
            w = MetaphorJs.dom.getWidth(window);
            h = MetaphorJs.dom.getHeight(window);
            st = MetaphorJs.dom.getScrollTop(window);
            sl = MetaphorJs.dom.getScrollLeft(window);
            return {
                x: sl + sx,
                y: st + sy,
                x1: sl + w - sx,
                y1: st + h - sy,
                w: w,
                h: h
            };
        }
    },


    getPrimaryPosition: function(pos) {
        return false;
    },
    getSecondaryPosition: function(pos) {
        return false;
    },

    getAllPositions: function() {
        return [];
    },

    correctPosition: function(e) {

        var self        = this,
            pri         = self.getPrimaryPosition(),
            strategy    = self.correct;

        if (!pri || !strategy) {
            return;
        }

        var dlg         = self.dialog,
            boundary    = self.getBoundary(),
            size        = dlg.getDialogSize(),
            pts         = self.preferredType,
            pt          = pts[0],
            i, l;

        if (strategy && strategy !== "none") {
            if (strategy && strategy != "solid") {
                if (self.type != pt && self.checkIfFits(e, pt, boundary, size, false)) {
                    self.changeType(pt);
                    return self.fitToBoundary(self.getCoords(e), boundary, size);
                }

                if (self.checkIfFits(e, self.type, boundary, size, false)) {
                    return self.fitToBoundary(self.getCoords(e), boundary, size);
                }
            }
            if (strategy && strategy != "position-only") {
                for (i = 0, l = pts.length; i < l; i++) {
                    if (self.checkIfFits(e, pts[i], boundary, size, true)) {
                        self.changeType(pts[i]);
                        return self.getCoords(e);
                    }
                }
            }
        }

        return self.getCoords(e);
    },

    checkIfFits: function(e, position, boundary, size, fully) {

        var self    = this,
            coords  = self.getCoords(e, position, true);

        // leave only basic positions here
        if (!fully && self.getSecondaryPosition(position)) {
            return false;
        }

        if (fully) {
            return !(coords.x < boundary.x ||
                     coords.y < boundary.y ||
                     coords.x + size.width > boundary.x1 ||
                     coords.y + size.height > boundary.y1);
        }
        else {
            var pri = self.getPrimaryPosition(position);
            switch (pri) {
                case "t":
                    return coords.y >= boundary.y;
                case "r":
                    return coords.x + size.width <= boundary.x1;
                case "b":
                    return coords.y + size.height <= boundary.y1;
                case "l":
                    return coords.x >= boundary.x;
            }
        }
    },

    fitToBoundary: function(coords, boundary, size) {

        var self = this,
            base = self.getPositionBase(),
            x = base ? 0 : boundary.x,
            y = base ? 0 : boundary.y,
            x1 = base ? boundary.w : boundary.x1,
            y1 = base ? boundary.h : boundary.y1,
            xDiff = 0,
            yDiff = 0,
            pointer = self.dialog.getPointer();

        if (coords.x < x) {
            xDiff = coords.x - x;
            coords.x = x;
        }
        if (coords.y < y) {
            yDiff = coords.y - y;
            coords.y = y;
        }
        if (coords.x + size.width > x1) {
            xDiff = (coords.x + size.width) - x1;
            coords.x -= xDiff;
        }
        if (coords.y + size.height > y1) {
            yDiff = (coords.y + size.height) - y1;
            coords.y -= yDiff;
        }

        pointer.setCorrectionOffset(xDiff, yDiff);
        pointer.reposition();

        return coords;
    },

    changeType: function(type) {
        var self = this,
            dlg = self.dialog,
            pointer = dlg.getPointer();

        self.type = type;
        pointer.setType(null, null);
    },

    onReposition: function(dlg, e) {

        var self    = this,
            coords;

        // cannot calculate and apply position
        if (!dlg.node || !MetaphorJs.dom.isAttached(dlg.node)) {
            return;
        }

        if (self.screenX !== false || self.screenY !== false) {
            coords  = self.correctPosition(e);
        }
        else {
            coords  = self.getCoords(e);
        }

        self.apply(coords);
    },

    getCoords: function(e){
        return {
            left: 0,
            top: 0
        }
    },

    apply: function(coords) {

        if (!coords) {
            return;
        }

        if (isNaN(coords.x) || isNaN(coords.y)) {
            return;
        }

        var self    = this,
            dlg     = self.dialog,
            axis    = dlg.getCfg().position.axis,
            pos     = {};

        axis != "y" && (pos.left = coords.x + "px");
        axis != "x" && (pos.top = coords.y + "px");

        MetaphorJs.dom.setStyle(dlg.getElem(), pos);
    },

    onWindowResize: function(e) {
        this.dialog.reposition(MetaphorJs.dom.normalizeEvent(e));
    },

    onWindowScroll: function(e) {
        this.dialog.reposition(MetaphorJs.dom.normalizeEvent(e));
    },

    onShowAfterDelay: function() {
        var self = this;

        if (self.resize || self.screenX || self.screenY) {
            MetaphorJs.dom.addListener(window, "resize", self.onWindowResizeDelegate);
        }

        if (self.scroll || self.screenX || self.screenY) {
            MetaphorJs.dom.addListener(self.dialog.getScrollEl(self.scroll), "scroll", self.onWindowScrollDelegate);
        }
    },

    onHideAfterDelay: function() {

        var self = this;

        if (self.resize || self.screenX || self.screenY) {
            MetaphorJs.dom.removeListener(window, "resize", self.onWindowResizeDelegate);
        }

        if (self.scroll || self.screenX || self.screenY) {
            MetaphorJs.dom.removeListener(self.dialog.getScrollEl(self.scroll), "scroll", self.onWindowScrollDelegate);
        }
    },

    onDestroy: function() {

        var self = this,
            dlg = self.dialog;

        MetaphorJs.dom.removeListener(window, "resize", self.onWindowResizeDelegate);
        MetaphorJs.dom.removeListener(dlg.getScrollEl(self.scroll), "scroll", self.onWindowScrollDelegate);

        dlg.un("reposition", self.onReposition, self);
        dlg.un("show-after-delay", self.onShowAfterDelay, self);
        dlg.un("hide-after-delay", self.onHideAfterDelay, self);

        if (dlg.isVisible()) {
            self.onHideAfterDelay();
        }
    }



});

