
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

require("../../__init.js");
require("./Abstract.js");

module.exports = MetaphorJs.dialog.position.Custom = 
                    MetaphorJs.dialog.position.Abstract.$extend({

    getCoords: function(e) {
        var dlg = this.dialog;
        return this.get.call(dlg.$$callbackContext || this, dlg, e);
    }
});

