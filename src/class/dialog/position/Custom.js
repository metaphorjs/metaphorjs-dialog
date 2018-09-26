
var MetaphorJs = require("metaphorjs/src/MetaphorJs.js");

require("./Abstract.js");

module.exports = MetaphorJs.dialog.position.Abstract.$extend({

    $class: "MetaphorJs.dialog.position.Custom",

    getCoords: function(e) {
        var dlg = this.dialog;
        return this.get.call(dlg.$$callbackContext, dlg, e);
    }
});

