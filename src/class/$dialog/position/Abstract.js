
var defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    extend = require("metaphorjs/src/func/extend.js"),
    setStyle = require("metaphorjs/src/func/dom/setStyle.js"),
    select = require("metaphorjs-select/src/metaphorjs.select.js"),
    normalizeEvent = require("metaphorjs/src/func/event/normalizeEvent.js"),
    addListener = require("metaphorjs/src/func/event/addListener.js"),
    removeListener = require("metaphorjs/src/func/event/removeListener.js"),
    getScrollTop    = require("metaphorjs/src/func/dom/getScrollTop.js"),
    getScrollLeft   = require("metaphorjs/src/func/dom/getScrollLeft.js"),
    getOuterWidth   = require("metaphorjs/src/func/dom/getOuterWidth.js"),
    getOuterHeight  = require("metaphorjs/src/func/dom/getOuterHeight.js");

defineClass({

    $class: "$dialog.position.Abstract",
    dialog: null,
    positionBase: null,
    correct: "boundary",

    $init: function(dialog) {
        var self = this;
        self.dialog = dialog;
        extend(self, dialog.getCfg().position, true, false);

        self.onWindowResizeDelegate = bind(self.onWindowResize, self);
        self.onWindowScrollDelegate = bind(self.onWindowScroll, self);

        var pt = self.preferredType || self.type;
        if (typeof pt == "string") {
            var pts = self.getAllPositions(),
                inx;
            if ((inx = pts.indexOf(pt)) != -1) {
                pts.splice(inx, 1);
                pts.unshift(pt);
            }
            self.preferredType = pts;
        }
        else if (!pt) {
            self.preferredType = self.getAllPositions();
        }

        dialog.on("before-reposition", self.onBeforeReposition, self);
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
            if (typeof b == "string") {
                self.positionBase = select(b).shift();
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
            sy      = self.screenY || 0;

        if (base) {
            var ofs = getOffset(base);
            return {
                x: ofs.left + sx,
                y: ofs.top + sy,
                x1: ofs.left + getOuterWidth(base) - sx,
                y1: ofs.top + getOuterHeight(base) - sy
            };
        }
        else {
            return {
                x: sx,
                y: sy,
                x1: getWidth(window) - sx,
                y1: getHeight(window) - sy
            };
        }
    },

    onBeforeReposition: function(dlg, e) {
        var self = this;

        if (self.screenX !== false || self.screenY !== false) {
            self.correctType(e);
        }
    },

    getPrimaryPosition: function() {
        return false;
    },
    getSecondaryPosition: function() {
        return false;
    },

    getAllPositions: function() {
        return [];
    },

    correctType: function(e) {

        var self        = this,
            pri         = self.getPrimaryPosition(),
            strategy    = self.correct;

        if (!pri || !strategy) {
            return;
        }

        var dlg         = self.dialog,
            boundary    = self.getBoundary(),
            size        = dlg.getDialogSize(),
            i, l;

        if (self.preferredType[0] != self.type &&
            self.checkIfFits(e, self.preferredType[0], boundary, size)) {
            self.changeType(self.preferredType[0]);
            return;
        }

        for (i = 0, l = self.preferredType.length; i < l; i++) {
            if (self.checkIfFits(e, self.preferredType[i], boundary, size)) {
                self.changeType(self.preferredType[i]);
                break;
            }
        }
    },

    checkIfFits: function(e, position, boundary, size) {

        var self    = this,
            coords  = self.getCoords(e, position, true);

        return !(coords.x < boundary.x ||
                    coords.y < boundary.y ||
                    coords.x + size.width > boundary.x1 ||
                    coords.y + size.height > boundary.y1);
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
            coords  = self.getCoords(e);

        if (self.screenX !== false || self.screenY !== false) {
            self.correctPosition(coords, e);
        }

        self.apply(coords);
    },


    correctPosition: function(pos, e) {

        /*var self    = this,
            pBase   = self.getPositionBase() || window,
            size    = dlg.getDialogSize(),
            st      = getScrollTop(pBase),
            sl      = getScrollLeft(pBase),
            ww      = getOuterWidth(pBase),
            wh      = getOuterHeight(pBase),
            offsetY = self.screenY,
            offsetX = self.screenX;

        if (offsetY && pos.y + size.height > wh + st - offsetY) {
            pos.y   = wh + st - offsetY - size.height;
        }
        if (offsetX && pos.x + size.width > ww + sl - offsetX) {
            pos.x   = ww + sl - offsetX - size.width;
        }
        if (offsetY && pos.y < st + offsetY) {
            pos.y = st + offsetY;
        }
        if (offsetX && pos.x < sl + offsetX) {
            pos.x = sl + offsetX;
        }*/
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

        setStyle(this.dialog.getElem(), {
            left: coords.x + "px",
            top: coords.y + "px"
        });
    },

    onWindowResize: function(e) {
        this.dialog.reposition(normalizeEvent(e));
    },

    onWindowScroll: function(e) {
        this.dialog.reposition(normalizeEvent(e));
    },

    onShowAfterDelay: function() {
        var self = this;

        if (self.resize || self.screenX || self.screenY) {
            addListener(window, "resize", self.onWindowResizeDelegate);
        }

        if (self.scroll || self.screenX || self.screenY) {
            addListener(self.dialog.getScrollEl(self.scroll), "scroll", self.onWindowScrollDelegate);
        }
    },

    onHideAfterDelay: function() {

        var self = this;

        if (self.resize || self.screenX || self.screenY) {
            removeListener(window, "resize", self.onWindowResizeDelegate);
        }

        if (self.scroll || self.screenX || self.screenY) {
            removeListener(self.dialog.getScrollEl(self.scroll), "scroll", self.onWindowScrollDelegate);
        }
    },

    destroy: function() {

        var self = this,
            dlg = self.dialog;

        dlg.un("before-reposition", self.onBeforeReposition, self);
        dlg.un("reposition", self.onReposition, self);
        dlg.un("show-after-delay", self.onShowAfterDelay, self);
        dlg.un("hide-after-delay", self.onHideAfterDelay, self);

        if (self.dialog.isVisible()) {
            self.onHideAfterDelay();
        }
    }



});

