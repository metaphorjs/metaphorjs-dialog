require("../__init.js");
require("../mixin/Dialog.js");
require("metaphorjs/src/app/Component.js");
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.dialog.Component = MetaphorJs.app.Component.$extend({
    $mixins: [MetaphorJs.mixin.Dialog]
});
