require("../__init.js");

var cls = require("metaphorjs-class/src/cls.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.dialog.Manager = cls({

    all: null,
    groups: null,

    $init: function() {
        this.all = {};
        this.groups = {};
    },

    register: function(dialog) {

        var id      = dialog.getInstanceId(),
            grps    = dialog.getGroup(),
            self    = this,
            all     = self.all,
            groups  = self.groups,
            i, len,
            g;

        all[id]     = dialog;

        for (i = 0, len = grps.length; i < len; i++) {
            g   = grps[i];
            if (!groups[g]) {
                groups[g]   = {};
            }
            groups[g][id] = true;
        }

        dialog.on("destroy", this.unregister, this);
    },

    unregister: function(dialog) {

        var id  = dialog.getInstanceId();
        delete this.all[id];
    },

    hideAll: function(dialog) {

        var id      = dialog.getInstanceId(),
            grps    = dialog.getGroup(),
            self    = this,
            all     = self.all,
            groups  = self.groups,
            i, len, gid,
            ds, did;

        for (i = 0, len = grps.length; i < len; i++) {
            gid     = grps[i];
            ds      = groups[gid];
            for (did in ds) {
                if (!all[did]) {
                    delete ds[did];
                }
                else if (did != id && !all[did].isHideAllIgnored()) {
                    all[did].hide(null, true, true);
                }
            }
        }
    }

});