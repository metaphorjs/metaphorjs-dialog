
var DialogComponent = require("./DialogComponent.js");

module.exports = DialogComponent.$extend({

    target: null,

    $init: function(cfg) {

        this.target = cfg.node;
        cfg.node = null;

        this.$super(cfg);
    }

});