
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

require("../../__init.js");
require("./Abstract.js");
require("metaphorjs/src/func/dom/getOffset.js");

module.exports = MetaphorJs.dialog.position.Draggable = 
                    MetaphorJs.dialog.position.Abstract.$extend({


    getCoords: function(e) {
        var dlg = this.dialog;
        if (this.get) {
            return this.get.call(dlg.$$callbackContext, dlg, e);
        }
        else {
            // if node is not yet visible,
            // we try to extract position from style
            if (!MetaphorJs.dom.isVisible(dlg.getElem())) {
                var elem = dlg.getElem(),
                    left = elem.style.left,
                    top = elem.style.top;

                if (left && top) {
                    return {
                        x: parseInt(left),
                        y: parseInt(top)
                    }
                }
            }
            
            // otherwise get element offset
            var ofs = MetaphorJs.dom.getOffset(dlg.getElem());
            return {
                x: ofs.left,
                y: ofs.top
            }
        }
    },

    correctPosition: function(e) {
        var self        = this,
            dlg         = self.dialog,
            boundary    = self.getBoundary(),
            size        = dlg.getDialogSize();

        if (!self.checkIfFits(e, self.type, boundary, size, true)) {
            return self.fitToBoundary(self.getCoords(e), boundary, size);
        }

        return self.getCoords(e);
    }
});

