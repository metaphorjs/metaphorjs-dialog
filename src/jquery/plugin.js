
if (window.jQuery) {

    /**
     * jQuery plugin. Basically the same as new MetaphorJs.lib.Dialog({target: $("...")});
     * @function
     * @param {string|object} options See constructor.
     * @param {string} instanceName {
     *   You can access dialog's api later by $(...).data("dialog-"+instanceName)
     *   @default "default"
     * }
     * @return jQuery
     */
    jQuery.fn.metaphorjsTooltip = function(options, instanceName) {

        var dataName    = "dialog",
            preset;

        if (typeof options == "string" && options != "destroy") {
            preset          = options;
            options         = arguments[1];
            instanceName    = arguments[2];
        }

        instanceName    = instanceName || "default";
        options         = options || {};

        dataName        += "-" + instanceName;

        this.each(function() {

            var el  = this,
                t   = data(el, dataName);

            if (!t) {
                options.target          = el;
                options.instanceName    = dataName;
                data(el, dataName, new Dialog(preset, options));
            }
            else if (options == "destroy") {
                t.destroy();
                data(el, dataName, null);
            }
            else {
                throw new Error("MetaphorJs tooltip already instantiated for this html element");
            }
        });
    };

}
