
require("metaphorjs/src/lib/Config.js");
require("../dialog/Dialog.js");

var Directive = require("metaphorjs/src/app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    isThenable = require("metaphorjs-shared/src/func/isThenable.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js");

Directive.registerAttribute("dropdown", 1100,
    Directive.$extend({
        $class: "MetaphorJs.app.Directive.attr.Dropdown",
        id: "dropdown",

        _autoOnChange: false,
        _dialog: null,
        _contentNode: null,
        _hostCmp: null,
        _contentCmp: null,

        _asyncInit: true,

        initConfig: function() {
            this.$super();
            var s = MetaphorJs.lib.Config.MODE_STATIC,
                config = this.config;
            config.disableProperty("value");
            config.setDefaultMode("ref", s);
            config.setDefaultMode("selector", s);
            config.setDefaultMode("cmp", s);
            config.setDefaultMode("dialog", s);
            config.setDefaultMode("on", s);
            config.setDefaultMode("un", s);
            config.setDefaultMode("appendTo", s);
            config.setDefaultMode("position", s);
            config.setDefaultMode("preset", s);
            config.setType("animate", "bool", s);
            config.setDefaultValue("dialog", "MetaphorJs.dialog.Dialog");
            config.setDefaultValue("on", "click");
        },

        initDirective: function() {

            var self = this,
                config = self.config,
                scope = self.scope,
                ref = config.get("ref"),
                cmpid = config.get("cmp"),
                selector = config.get("selector"),
                cmp;

            if (self.component) {
                if (ref) {
                    cmp = self.component.getRefCmp(ref) || 
                            self.component.getRefCmpPromise(ref);
                }
                else if (cmpid) {
                    if (typeof cmpid === "string") {
                        if (scope.$app) {
                            cmp = scope.$app.getCmp(cmpid) ||
                                    scope.$app.onAvailable(cmpid);
                        }
                    }
                    else {
                        cmp = cmpid;
                    }
                }
                else if (selector) {
                    self._contentNode = document.querySelector(selector);    
                }

                if (cmp) {
                    if (isThenable(cmp)) {
                        cmp.done(function(component) {
                            self._contentCmp = component;
                            self._contentNode = component.getRefEl("main");
                        });
                        cmp.done(self._initDialog, self);
                    }
                    else {
                        self._contentCmp = cmp;
                        self._contentNode = cmp.getRefEl("main");
                        self._initDialog();
                    }
                }
            }
            else {
                self._contentNode = document.getElementById(ref);
                self._initDialog();
            }

            self.$super();
        },

        initChange: function(){
            // skip setting onChange listener
        },

        _initDialog: function() {
            if (!this._dialog) {
                var cls = ns.get(this.config.get("dialog")),
                    cfg = this._getDialogConfig();
                this._dialog = new cls(cfg);
            }

            return this._dialog;
        },

        _getDialogConfig: function() {
            var self = this,
                config = self.config,
                cfgCfg = config.get("config"),
                on = config.get("on"),
                un = config.get("un"),
                appendTo = config.get("appendTo"),
                position = config.get("position"),
                animate = config.get("animate"),
                opposite = {
                    "click": "click",
                    "mouseover": "mouseout"
                };

            if (appendTo && typeof appendTo === "string") {
                appendTo = document.querySelector(appendTo);
            }

            var defCfg = {
                preset: config.get("preset") || null,
                target: self.node,
                content: false,
                render: {
                    el: self._contentNode,
                    keepInDOM: true,
                    appendTo: appendTo || false
                },
                position: position || false
            };

            if (on === "click") {
                extend(defCfg, {
                    events: {
                        show: {
                            "click": {
                                stopPropagation: true,
                                preventDefault: true
                            }
                        },
                        hide: {
                            click: {
                                stopPropagation: false,
                                preventDefault: false
                            }
                        }
                    },
                    toggle: {
                        events: {
                            _target: on
                        }
                    },
                    hide: {
                        animate: animate,
                        events: {
                            _html: "click"
                        }
                    },
                    show: {
                        animate: animate
                    }
                });
            }
            else if (on === "mouseover") {
                extend(defCfg, {
                    show: {
                        animate: animate,
                        events: {
                            _target: on,
                            _self: on
                        }
                    },
                    hide: {
                        animate: animate,
                        events: {
                            _target: un || opposite[on]
                        }
                    }
                });
            }

            var cfg = extend({}, cfgCfg, defCfg, true, true);
            return cfg;
        },

        onDestroy: function() {
            if (this._dialog) {
                this._dialog.$destroy();
            }
            this.$super();
        }
    })

);
