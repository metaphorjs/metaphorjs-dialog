
require("../../__init.js");
require("./Abstract.js");
require("metaphorjs/src/func/dom/getOffset.js");
require("metaphorjs/src/func/dom/removeStyle.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.dialog.position.None = 
                    MetaphorJs.dialog.position.Abstract.$extend({

    $init: function(dialog) {

        this.$super(dialog);
        MetaphorJs.dom.removeStyle(dialog.getElem(), "left");
        MetaphorJs.dom.removeStyle(dialog.getElem(), "top");
    },

    getCoords: function(e) {
        var dlg = this.dialog,
            ofs = MetaphorJs.dom.getOffset(dlg.getElem());
        return {
            x: ofs.left,
            y: ofs.top
        };
    },

    apply: function() {

    },

    correctPosition: function(e) {
        return this.getCoords(e);
    }
});