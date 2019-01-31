
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

        _dialog: null,
        _contentNode: null,
        _hostCmp: null,
        _contentCmp: null,

        $init: function(scope, node, config, renderer) {

            var self = this,
                s = MetaphorJs.lib.Config.MODE_STATIC;

            // value holds the ref name or cmp id or cmp itself
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
            config.setDefaultValue("dialog", "MetaphorJs.dialog.Dialog");
            config.setDefaultValue("on", "click");

            this.$super.apply(this, arguments);

            var ref = config.get("ref"),
                cmpid = config.get("cmp"),
                selector = config.get("selector"),
                cmp;
            
            if (node.getDomApi) {
                self._hostCmp = node;
                self.node = node.getDomApi("dropdown");

                if (ref) {
                    cmp = self._hostCmp.getRefCmp(ref) || 
                            self._hostCmp.getRefCmpPromise(ref);
                }
                else if (cmpid) {
                    if (typeof cmpid === "string") {
                        cmp = scope.$app.getCmp(cmpid) ||
                                scope.$app.onAvailable(cmpid);
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
                        cmp.done(function(component){
                            self._contentCmp = component;
                            self._contentNode = component.getEl();
                        });
                        cmp.done(self._initDialog, self);
                    }
                    else {
                        self._contentCmp = cmp;
                        self._contentNode = cmp.getEl();
                        self._initDialog();
                    }
                }
            }
            else {
                this._contentNode = document.getElementById(ref);
                self._initDialog();
            }            
        },

        initialSet: function(){
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
                cfgCfg = self.config.get("config"),
                on = self.config.get("on"),
                un = self.config.get("un"),
                appendTo = self.config.get("appendTo"),
                position = self.config.get("position"),
                opposite = {
                    "click": "click",
                    "mouseover": "mouseout"
                };

            if (appendTo && typeof appendTo === "string") {
                appendTo = document.querySelector(appendTo);
            }

            var defCfg = {
                preset: self.config.get("preset") || null,
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
                                stopPropagation: true
                            }
                        }
                    },
                    toggle: {
                        events: {
                            _target: on
                        }
                    },
                    hide: {
                        events: {
                            body: "click"
                        }
                    }
                });
            }
            else if (on === "mouseover") {
                extend(defCfg, {
                    show: {
                        events: {
                            _target: on
                        }
                    },
                    hide: {
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
