
var defineClass = require("metaphorjs-class/src/func/defineClass.js");

require("./Abstract.js");

module.exports = defineClass({

    $class: "$dialog.position.Custom",
    $extends: "$dialog.position.Abstract",

    getCoords: function(e) {

        var dlg = this.dialog;
        return this.get.call(dlg.$$callbackContext, dlg, e);
    }
});

