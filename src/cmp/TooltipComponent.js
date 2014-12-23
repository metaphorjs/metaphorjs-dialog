
var DialogComponent = require("./DialogComponent.js");

module.exports = DialogComponent.$extend({

    target: null,
    isTooltip: true

}, {
    $resumeRenderer: true
});