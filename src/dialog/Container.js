
require("../__init.js");
require("../mixin/Dialog.js");
require("metaphorjs/src/app/Container.js");
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.dialog.Container = MetaphorJs.app.Container.$extend({
    $mixins: [MetaphorJs.mixin.Dialog]
});
