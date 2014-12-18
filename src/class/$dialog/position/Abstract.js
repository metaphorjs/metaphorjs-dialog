
var defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    extend = require("metaphorjs/src/func/extend.js"),
    setStyle = require("metaphorjs/src/func/dom/setStyle.js"),
    select = require("metaphorjs-select/src/metaphorjs.select.js"),
    normalizeEvent = require("metaphorjs/src/func/event/normalizeEvent.js"),
    addListener = require("metaphorjs/src/func/event/addListener.js"),
    removeListener = require("metaphorjs/src/func/event/removeListener.js");

defineClass({

    $class: "$dialog.position.Abstract",
    dialog: null,
    positionBase: null,

    $init: function(dialog) {
        var self = this;
        self.dialog = dialog;
        extend(self, dialog.getCfg().position, true, false);

        self.onWindowResizeDelegate = bind(self.onWindowResize, self);
        self.onWindowScrollDelegate = bind(self.onWindowScroll, self);

        dialog.on("correct-position", self.onCorrectPosition, self);
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



    onCorrectPosition: function(dlg, pos) {

        /*var pBase   = self.getPositionBase(),
            size    = self.getDialogSize(),
            st      = getScrollTop(pBase),
            sl      = getScrollLeft(pBase),
            ww      = getOuterWidth(pBase),
            wh      = getOuterHeight(pBase);

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
        }

        return pos;*/
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

        var dlg = this.dialog;

        setStyle(dlg.getElem(), {
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

        var self = this;
        self.dialog.un("correct-position", self.onCorrectPosition, self);

        if (self.dialog.isVisible()) {
            self.onHideAfterDelay();
        }
    }



});

