define("metaphorjs-dialog", ['metaphorjs-observable', 'metaphorjs-promise', 'metaphorjs-ajax', 'metaphorjs-select', 'metaphorjs-animate'], function(Observable, Promise, ajax, select, animate) {

var stopAnimation = animate.stop;

function isFunction(value) {
    return typeof value == 'function';
};

var toString = Object.prototype.toString;

var undf = undefined;




var varType = function(){

    var types = {
        '[object String]': 0,
        '[object Number]': 1,
        '[object Boolean]': 2,
        '[object Object]': 3,
        '[object Function]': 4,
        '[object Array]': 5,
        '[object RegExp]': 9,
        '[object Date]': 10
    };


    /**
     * 'string': 0,
     * 'number': 1,
     * 'boolean': 2,
     * 'object': 3,
     * 'function': 4,
     * 'array': 5,
     * 'null': 6,
     * 'undefined': 7,
     * 'NaN': 8,
     * 'regexp': 9,
     * 'date': 10,
     * unknown: -1
     * @param {*} value
     * @returns {number}
     */
    return function varType(val) {

        if (!val) {
            if (val === null) {
                return 6;
            }
            if (val === undf) {
                return 7;
            }
        }

        var num = types[toString.call(val)];

        if (num === undf) {
            return -1;
        }

        if (num == 1 && isNaN(val)) {
            return 8;
        }

        return num;
    };

}();



function isString(value) {
    return typeof value == "string" || value === ""+value;
    //return typeof value == "string" || varType(value) === 0;
};



/**
 * @param {*} value
 * @returns {boolean}
 */
function isArray(value) {
    return typeof value == "object" && varType(value) === 5;
};

var strUndef = "undefined";



function isObject(value) {
    if (value === null || typeof value != "object") {
        return false;
    }
    var vt = varType(value);
    return vt > 2 || vt == -1;
};



var Cache = function(){

    var globalCache;

    /**
     * @class Cache
     * @param {bool} cacheRewritable
     * @constructor
     */
    var Cache = function(cacheRewritable) {

        var storage = {},

            finders = [];

        if (arguments.length == 0) {
            cacheRewritable = true;
        }

        return {

            /**
             * @param {function} fn
             * @param {object} context
             * @param {bool} prepend
             */
            addFinder: function(fn, context, prepend) {
                finders[prepend? "unshift" : "push"]({fn: fn, context: context});
            },

            /**
             * @method
             * @param {string} name
             * @param {*} value
             * @param {bool} rewritable
             * @returns {*} value
             */
            add: function(name, value, rewritable) {

                if (storage[name] && storage[name].rewritable === false) {
                    return storage[name];
                }

                storage[name] = {
                    rewritable: typeof rewritable != strUndef ? rewritable : cacheRewritable,
                    value: value
                };

                return value;
            },

            /**
             * @method
             * @param {string} name
             * @returns {*}
             */
            get: function(name) {

                if (!storage[name]) {
                    if (finders.length) {

                        var i, l, res,
                            self = this;

                        for (i = 0, l = finders.length; i < l; i++) {

                            res = finders[i].fn.call(finders[i].context, name, self);

                            if (res !== undf) {
                                return self.add(name, res, true);
                            }
                        }
                    }

                    return undf;
                }

                return storage[name].value;
            },

            /**
             * @method
             * @param {string} name
             * @returns {*}
             */
            remove: function(name) {
                var rec = storage[name];
                if (rec && rec.rewritable === true) {
                    delete storage[name];
                }
                return rec ? rec.value : undf;
            },

            /**
             * @method
             * @param {string} name
             * @returns {boolean}
             */
            exists: function(name) {
                return !!storage[name];
            },

            /**
             * @param {function} fn
             * @param {object} context
             */
            eachEntry: function(fn, context) {
                var k;
                for (k in storage) {
                    fn.call(context, storage[k].value, k);
                }
            },

            /**
             * @method
             */
            destroy: function() {

                var self = this;

                if (self === globalCache) {
                    globalCache = null;
                }

                storage = null;
                cacheRewritable = null;

                self.add = null;
                self.get = null;
                self.destroy = null;
                self.exists = null;
                self.remove = null;
            }
        };
    };

    /**
     * @method
     * @static
     * @returns {Cache}
     */
    Cache.global = function() {

        if (!globalCache) {
            globalCache = new Cache(true);
        }

        return globalCache;
    };

    return Cache;

}();





/**
 * @class Namespace
 * @code ../examples/main.js
 */
var Namespace = function(){


    /**
     * @param {Object} root optional; usually window or global
     * @param {String} rootName optional. If you want custom object to be root and
     * this object itself is the first level of namespace
     * @param {Cache} cache optional
     * @constructor
     */
    var Namespace   = function(root, rootName, cache) {

        cache       = cache || new Cache(false);
        var self    = this,
            rootL   = rootName ? rootName.length : null;

        if (!root) {
            if (typeof global != strUndef) {
                root    = global;
            }
            else {
                root    = window;
            }
        }

        var normalize   = function(ns) {
            if (ns && rootName && ns.substr(0, rootL) != rootName) {
                return rootName + "." + ns;
            }
            return ns;
        };

        var parseNs     = function(ns) {

            ns = normalize(ns);

            var tmp     = ns.split("."),
                i,
                last    = tmp.pop(),
                parent  = tmp.join("."),
                len     = tmp.length,
                name,
                current = root;


            if (cache[parent]) {
                return [cache[parent], last, ns];
            }

            if (len > 0) {
                for (i = 0; i < len; i++) {

                    name    = tmp[i];

                    if (rootName && i == 0 && name == rootName) {
                        current = root;
                        continue;
                    }

                    if (current[name] === undf) {
                        current[name]   = {};
                    }

                    current = current[name];
                }
            }

            return [current, last, ns];
        };

        /**
         * Get namespace/cache object
         * @method
         * @param {string} ns
         * @param {bool} cacheOnly
         * @returns {*}
         */
        var get       = function(ns, cacheOnly) {

            ns = normalize(ns);

            if (cache.exists(ns)) {
                return cache.get(ns);
            }

            if (cacheOnly) {
                return undf;
            }

            var tmp     = ns.split("."),
                i,
                len     = tmp.length,
                name,
                current = root;

            for (i = 0; i < len; i++) {

                name    = tmp[i];

                if (rootName && i == 0 && name == rootName) {
                    current = root;
                    continue;
                }

                if (current[name] === undf) {
                    return undf;
                }

                current = current[name];
            }

            if (current) {
                cache.add(ns, current);
            }

            return current;
        };

        /**
         * Register item
         * @method
         * @param {string} ns
         * @param {*} value
         */
        var register    = function(ns, value) {

            var parse   = parseNs(ns),
                parent  = parse[0],
                name    = parse[1];

            if (isObject(parent) && parent[name] === undf) {

                parent[name]        = value;
                cache.add(parse[2], value);
            }

            return value;
        };

        /**
         * Item exists
         * @method
         * @param {string} ns
         * @returns boolean
         */
        var exists      = function(ns) {
            return get(ns, true) !== undf;
        };

        /**
         * Add item only to the cache
         * @function add
         * @param {string} ns
         * @param {*} value
         */
        var add = function(ns, value) {

            ns = normalize(ns);
            cache.add(ns, value);
            return value;
        };

        /**
         * Remove item from cache
         * @method
         * @param {string} ns
         */
        var remove = function(ns) {
            ns = normalize(ns);
            cache.remove(ns);
        };

        /**
         * Make alias in the cache
         * @method
         * @param {string} from
         * @param {string} to
         */
        var makeAlias = function(from, to) {

            from = normalize(from);
            to = normalize(to);

            var value = cache.get(from);

            if (value !== undf) {
                cache.add(to, value);
            }
        };

        /**
         * Destroy namespace and all classes in it
         * @method
         */
        var destroy     = function() {

            var self = this,
                k;

            if (self === globalNs) {
                globalNs = null;
            }

            cache.eachEntry(function(entry){
                if (entry && entry.$destroy) {
                    entry.$destroy();
                }
            });

            cache.destroy();
            cache = null;

            for (k in self) {
                self[k] = null;
            }
        };

        self.register   = register;
        self.exists     = exists;
        self.get        = get;
        self.add        = add;
        self.remove     = remove;
        self.normalize  = normalize;
        self.makeAlias  = makeAlias;
        self.destroy    = destroy;
    };

    Namespace.prototype.register = null;
    Namespace.prototype.exists = null;
    Namespace.prototype.get = null;
    Namespace.prototype.add = null;
    Namespace.prototype.remove = null;
    Namespace.prototype.normalize = null;
    Namespace.prototype.makeAlias = null;
    Namespace.prototype.destroy = null;

    var globalNs;

    /**
     * Get global namespace
     * @method
     * @static
     * @returns {Namespace}
     */
    Namespace.global = function() {
        if (!globalNs) {
            globalNs = new Namespace;
        }
        return globalNs;
    };

    return Namespace;

}();



var slice = Array.prototype.slice;



function isPlainObject(value) {
    // IE < 9 returns [object Object] from toString(htmlElement)
    return typeof value == "object" &&
           varType(value) === 3 &&
            !value.nodeType &&
            value.constructor === Object;

};

function isBool(value) {
    return value === true || value === false;
};




var extend = function(){

    /**
     * @param {Object} dst
     * @param {Object} src
     * @param {Object} src2 ... srcN
     * @param {boolean} override = false
     * @param {boolean} deep = false
     * @returns {object}
     */
    var extend = function extend() {


        var override    = false,
            deep        = false,
            args        = slice.call(arguments),
            dst         = args.shift(),
            src,
            k,
            value;

        if (isBool(args[args.length - 1])) {
            override    = args.pop();
        }
        if (isBool(args[args.length - 1])) {
            deep        = override;
            override    = args.pop();
        }

        while (args.length) {
            if (src = args.shift()) {
                for (k in src) {

                    if (src.hasOwnProperty(k) && (value = src[k]) !== undf) {

                        if (deep) {
                            if (dst[k] && isPlainObject(dst[k]) && isPlainObject(value)) {
                                extend(dst[k], value, override, deep);
                            }
                            else {
                                if (override === true || dst[k] == undf) { // == checks for null and undefined
                                    if (isPlainObject(value)) {
                                        dst[k] = {};
                                        extend(dst[k], value, override, true);
                                    }
                                    else {
                                        dst[k] = value;
                                    }
                                }
                            }
                        }
                        else {
                            if (override === true || dst[k] == undf) {
                                dst[k] = value;
                            }
                        }
                    }
                }
            }
        }

        return dst;
    };

    return extend;
}();


function emptyFn(){};



var instantiate = function(fn, args) {

    var Temp = function(){},
        inst, ret;

    Temp.prototype  = fn.prototype;
    inst            = new Temp;
    ret             = fn.apply(inst, args);

    // If an object has been returned then return it otherwise
    // return the original instance.
    // (consistent with behaviour of the new operator)
    return isObject(ret) || ret === false ? ret : inst;

};
/**
 * Function interceptor
 * @param {function} origFn
 * @param {function} interceptor
 * @param {object|null} context
 * @param {object|null} origContext
 * @param {string} when
 * @param {bool} replaceValue
 * @returns {Function}
 */
function intercept(origFn, interceptor, context, origContext, when, replaceValue) {

    when = when || "before";

    return function() {

        var intrRes,
            origRes;

        if (when == "instead") {
            return interceptor.apply(context || origContext, arguments);
        }
        else if (when == "before") {
            intrRes = interceptor.apply(context || origContext, arguments);
            origRes = intrRes !== false ? origFn.apply(origContext || context, arguments) : null;
        }
        else {
            origRes = origFn.apply(origContext || context, arguments);
            intrRes = interceptor.apply(context || origContext, arguments);
        }

        return replaceValue ? intrRes : origRes;
    };
};



var Class = function(){


    var proto   = "prototype",

        constr  = "$constructor",

        $constr = function $constr() {
            var self = this;
            if (self.$super && self.$super !== emptyFn) {
                self.$super.apply(self, arguments);
            }
        },

        wrapPrototypeMethod = function wrapPrototypeMethod(parent, k, fn) {

            var $super = parent[proto][k] || (k == constr ? parent : emptyFn) || emptyFn;

            return function() {
                var ret,
                    self    = this,
                    prev    = self.$super;

                self.$super     = $super;
                ret             = fn.apply(self, arguments);
                self.$super     = prev;

                return ret;
            };
        },

        preparePrototype = function preparePrototype(prototype, cls, parent, onlyWrap) {
            var k, ck, pk, pp = parent[proto];

            for (k in cls) {
                if (cls.hasOwnProperty(k)) {
                    
                    pk = pp[k];
                    ck = cls[k];

                    prototype[k] = isFunction(ck) && (!pk || isFunction(pk)) ?
                                    wrapPrototypeMethod(parent, k, ck) :
                                    ck;
                }
            }

            if (onlyWrap) {
                return;
            }

            prototype.$plugins = null;

            if (pp.$beforeInit) {
                prototype.$beforeInit = pp.$beforeInit.slice();
                prototype.$afterInit = pp.$afterInit.slice();
                prototype.$beforeDestroy = pp.$beforeDestroy.slice();
                prototype.$afterDestroy = pp.$afterDestroy.slice();
            }
            else {
                prototype.$beforeInit = [];
                prototype.$afterInit = [];
                prototype.$beforeDestroy = [];
                prototype.$afterDestroy = [];
            }
        },
        
        mixinToPrototype = function(prototype, mixin) {
            
            var k;
            for (k in mixin) {
                if (mixin.hasOwnProperty(k)) {
                    if (k == "$beforeInit") {
                        prototype.$beforeInit.push(mixin[k]);
                    }
                    else if (k == "$afterInit") {
                        prototype.$afterInit.push(mixin[k]);
                    }
                    else if (k == "$beforeDestroy") {
                        prototype.$beforeDestroy.push(mixin[k]);
                    }
                    else if (k == "$afterDestroy") {
                        prototype.$afterDestroy.push(mixin[k]);
                    }
                    else if (!prototype[k]) {
                        prototype[k] = mixin[k];
                    }
                }
            }
        };


    var Class = function(ns){

        if (!ns) {
            ns = new Namespace;
        }

        var createConstructor = function() {

            return function() {

                var self    = this,
                    before  = [],
                    after   = [],
                    args    = arguments,
                    newArgs,
                    i, l,
                    plugins, plugin,
                    plCls;

                if (!self) {
                    throw "Must instantiate via new";
                }

                self.$plugins = [];

                newArgs = self[constr].apply(self, arguments);

                if (newArgs && isArray(newArgs)) {
                    args = newArgs;
                }

                plugins = self.$plugins;

                for (i = -1, l = self.$beforeInit.length; ++i < l;
                     before.push([self.$beforeInit[i], self])) {}

                for (i = -1, l = self.$afterInit.length; ++i < l;
                     after.push([self.$afterInit[i], self])) {}

                if (plugins && plugins.length) {

                    for (i = 0, l = plugins.length; i < l; i++) {

                        plugin = plugins[i];

                        if (isString(plugin)) {
                            plCls = plugin;
                            plugin = ns.get(plugin, true);
                            if (!plugin) {
                                throw plCls + " not found";
                            }
                        }

                        plugin = new plugin(self, args);

                        if (plugin.$beforeHostInit) {
                            before.push([plugin.$beforeHostInit, plugin]);
                        }
                        if (plugin.$afterHostInit) {
                            after.push([plugin.$afterHostInit, plugin]);
                        }

                        plugins[i] = plugin;
                    }
                }

                for (i = -1, l = before.length; ++i < l;
                     before[i][0].apply(before[i][1], args)){}

                if (self.$init) {
                    self.$init.apply(self, args);
                }

                for (i = -1, l = after.length; ++i < l;
                     after[i][0].apply(after[i][1], args)){}

            };
        };


        /**
         * @class BaseClass
         * @description All classes defined with MetaphorJs.Class extend this class.
         * You can access it via <code>cs.BaseClass</code>. Basically,
         * <code>cs.define({});</code> is the same as <code>cs.BaseClass.$extend({})</code>.
         * @constructor
         */
        var BaseClass = function() {

        };

        extend(BaseClass.prototype, {

            $class: null,
            $extends: null,
            $plugins: null,
            $mixins: null,

            $destroyed: false,

            $constructor: emptyFn,
            $init: emptyFn,
            $beforeInit: [],
            $afterInit: [],
            $beforeDestroy: [],
            $afterDestroy: [],

            /**
             * Get class name
             * @method
             * @returns {string}
             */
            $getClass: function() {
                return this.$class;
            },

            /**
             * Get parent class name
             * @method
             * @returns {string | null}
             */
            $getParentClass: function() {
                return this.$extends;
            },

            /**
             * Intercept method
             * @method
             * @param {string} method Intercepted method name
             * @param {function} fn function to call before or after intercepted method
             * @param {object} newContext optional interceptor's "this" object
             * @param {string} when optional, when to call interceptor before | after | instead; default "before"
             * @param {bool} replaceValue optional, return interceptor's return value or original method's; default false
             * @returns {function} original method
             */
            $intercept: function(method, fn, newContext, when, replaceValue) {
                var self = this,
                    orig = self[method];
                self[method] = intercept(orig, fn, newContext || self, self, when, replaceValue);
                return orig;
            },

            /**
             * Implement new methods or properties on instance
             * @param {object} methods
             */
            $implement: function(methods) {
                var $self = this.constructor;
                if ($self && $self.$parent) {
                    preparePrototype(this, methods, $self.$parent);
                }
            },

            /**
             * Does this instance have a plugin
             * @param cls
             * @returns {bool}
             */
            $hasPlugin: function(cls) {
                var pls = this.$plugins,
                    i, l;
                if (!cls) {
                    return pls.length > 0;
                }
                for (i = 0, l = pls.length; i < l; i++) {
                    if (isInstanceOf(pls[i], cls)) {
                        return true;
                    }
                }
                return false;
            },

            /**
             * Destroy instance
             * @method
             */
            $destroy: function() {

                var self    = this,
                    before  = self.$beforeDestroy,
                    after   = self.$afterDestroy,
                    plugins = self.$plugins,
                    i, l, res;

                if (self.$destroyed) {
                    return;
                }

                self.$destroyed = true;

                for (i = -1, l = before.length; ++i < l;
                     before[i].apply(self, arguments)){}

                for (i = 0, l = plugins.length; i < l; i++) {
                    if (plugins[i].$beforeHostDestroy) {
                        plugins[i].$beforeHostDestroy.call(plugins[i], arguments);
                    }
                }

                res = self.destroy.apply(self, arguments);

                for (i = -1, l = before.length; ++i < l;
                     after[i].apply(self, arguments)){}

                for (i = 0, l = plugins.length; i < l; i++) {
                    plugins[i].$destroy.apply(plugins[i], arguments);
                }

                if (res !== false) {
                    for (i in self) {
                        if (self.hasOwnProperty(i)) {
                            self[i] = null;
                        }
                    }
                }

                self.$destroyed = true;
            },

            destroy: function(){}
        });

        BaseClass.$self = BaseClass;

        /**
         * Create an instance of current class. Same as cs.factory(name)
         * @method
         * @static
         * @code var myObj = My.Class.$instantiate(arg1, arg2, ...);
         * @returns {object} class instance
         */
        BaseClass.$instantiate = function() {

            var cls = this,
                args = arguments,
                cnt = args.length;

            // lets make it ugly, but without creating temprorary classes and leaks.
            // and fallback to normal instantiation.

            switch (cnt) {
                case 0:
                    return new cls;
                case 1:
                    return new cls(args[0]);
                case 2:
                    return new cls(args[0], args[1]);
                case 3:
                    return new cls(args[0], args[1], args[2]);
                case 4:
                    return new cls(args[0], args[1], args[2], args[3]);
                default:
                    return instantiate(cls, args);
            }
        };

        /**
         * Override class methods (on prototype level, not on instance level)
         * @method
         * @static
         * @param {object} methods
         */
        BaseClass.$override = function(methods) {
            var $self = this.$self,
                $parent = this.$parent;

            if ($self && $parent) {
                preparePrototype($self.prototype, methods, $parent);
            }
        };

        /**
         * Create new class based on current one
         * @param {object} definition
         * @param {object} statics
         * @returns {function}
         */
        BaseClass.$extend = function(definition, statics) {
            return define(definition, statics, this);
        };

        /**
         * Destroy class
         * @method
         */
        BaseClass.$destroy = function() {
            var self = this,
                k;

            for (k in self) {
                self[k] = null;
            }
        };

        /**
         * @class Class
         */

        /**
         * @method Class
         * @constructor
         * @param {Namespace} ns optional namespace. See metaphorjs-namespace repository
         */

        /**
         * @method
         * @param {object} definition {
         *  @type {string} $class optional
         *  @type {string} $extends optional
         *  @type {array} $mixins optional
         *  @type {function} $constructor optional
         *  @type {function} $init optional
         *  @type {function} $beforeInit if this is a mixin
         *  @type {function} $afterInit if this is a mixin
         *  @type {function} $beforeHostInit if this is a plugin
         *  @type {function} $afterHostInit if this is a plugin
         *  @type {function} $beforeDestroy if this is a mixin
         *  @type {function} $afterDestroy if this is a mixin
         *  @type {function} $beforeHostDestroy if this is a plugin
         *  @type {function} destroy your own destroy function
         * }
         * @param {object} statics any statis properties or methods
         * @param {string|function} $extends this is a private parameter; use definition.$extends
         * @code var cls = cs.define({$class: "Name"});
         */
        var define = function(definition, statics, $extends) {

            definition          = definition || {};
            
            var name            = definition.$class,
                parentClass     = $extends || definition.$extends,
                mixins          = definition.$mixins,
                pConstructor,
                i, l, k, noop, prototype, c, mixin;

            if (parentClass) {
                if (isString(parentClass)) {
                    pConstructor = ns.get(parentClass);
                }
                else {
                    pConstructor = parentClass;
                    parentClass = pConstructor.$class || "";
                }
            }
            else {
                pConstructor = BaseClass;
                parentClass = "";
            }

            if (parentClass && !pConstructor) {
                throw parentClass + " not found";
            }

            if (name) {
                name = ns.normalize(name);
            }

            definition.$class   = name;
            definition.$extends = parentClass;
            definition.$mixins  = null;


            noop                = function(){};
            noop[proto]         = pConstructor[proto];
            prototype           = new noop;
            noop                = null;
            definition[constr]  = definition[constr] || $constr;

            preparePrototype(prototype, definition, pConstructor);

            if (mixins) {
                for (i = 0, l = mixins.length; i < l; i++) {
                    mixin = mixins[i];
                    if (isString(mixin)) {
                        mixin = ns.get("mixin." + mixin, true);
                    }
                    mixinToPrototype(prototype, mixin);
                }
            }

            c = createConstructor();
            prototype.constructor = c;
            c[proto] = prototype;

            for (k in BaseClass) {
                if (k != proto && BaseClass.hasOwnProperty(k)) {
                    c[k] = BaseClass[k];
                }
            }

            for (k in pConstructor) {
                if (k != proto && pConstructor.hasOwnProperty(k)) {
                    c[k] = pConstructor[k];
                }
            }

            if (statics) {
                for (k in statics) {
                    if (k != proto && statics.hasOwnProperty(k)) {
                        c[k] = statics[k];
                    }
                }
            }

            c.$parent   = pConstructor;
            c.$self     = c;

            if (name) {
                ns.register(name, c);
            }

            return c;
        };




        /**
         * Instantiate class. Pass constructor parameters after "name"
         * @method
         * @code cs.factory("My.Class.Name", arg1, arg2, ...);
         * @param {string} name Full name of the class
         * @returns {object} class instance
         */
        var factory = function(name) {

            var cls     = ns.get(name),
                args    = slice.call(arguments, 1);

            if (!cls) {
                throw name + " not found";
            }

            return cls.$instantiate.apply(cls, args);
        };



        /**
         * Is cmp instance of cls
         * @method
         * @code cs.instanceOf(myObj, "My.Class");
         * @code cs.instanceOf(myObj, My.Class);
         * @param {object} cmp
         * @param {string|object} cls
         * @returns {boolean}
         */
        var isInstanceOf = function(cmp, cls) {
            var _cls    = isString(cls) ? ns.get(cls) : cls;
            return _cls ? cmp instanceof _cls : false;
        };



        /**
         * Is one class subclass of another class
         * @method
         * @code cs.isSubclassOf("My.Subclass", "My.Class");
         * @code cs.isSubclassOf(myObj, "My.Class");
         * @code cs.isSubclassOf("My.Subclass", My.Class);
         * @code cs.isSubclassOf(myObj, My.Class);
         * @param {string|object} childClass
         * @param {string|object} parentClass
         * @return {bool}
         */
        var isSubclassOf = function(childClass, parentClass) {

            var p   = childClass,
                g   = ns.get;

            if (!isString(parentClass)) {
                parentClass  = parentClass.prototype.$class;
            }
            else {
                parentClass = ns.normalize(parentClass);
            }
            if (isString(childClass)) {
                p   = g(ns.normalize(childClass));
            }

            while (p && p.prototype) {

                if (p.prototype.$class == parentClass) {
                    return true;
                }

                p = p.$parent;
            }

            return false;
        };

        var self    = this;

        self.factory = factory;
        self.isSubclassOf = isSubclassOf;
        self.isInstanceOf = isInstanceOf;
        self.define = define;

        self.destroy = function(){

            if (self === globalCs) {
                globalCs = null;
            }

            BaseClass.$destroy();
            BaseClass = null;

            ns.destroy();
            ns = null;

            Class = null;

        };

        /**
         * @type {BaseClass} BaseClass reference to the BaseClass class
         */
        self.BaseClass = BaseClass;

    };

    Class.prototype = {

        factory: null,
        isSubclassOf: null,
        isInstanceOf: null,
        define: null,
        destroy: null
    };

    var globalCs;

    /**
     * Get default global class manager
     * @method
     * @static
     * @returns {Class}
     */
    Class.global = function() {
        if (!globalCs) {
            globalCs = new Class(Namespace.global());
        }
        return globalCs;
    };

    return Class;

}();



var MetaphorJs = {


};




var ns  = new Namespace(MetaphorJs, "MetaphorJs");



var cs = new Class(ns);





var defineClass = cs.define;



var factory = cs.factory;


var nextUid = function(){
    var uid = ['0', '0', '0'];

    // from AngularJs
    /**
     * @returns {String}
     */
    return function nextUid() {
        var index = uid.length;
        var digit;

        while(index) {
            index--;
            digit = uid[index].charCodeAt(0);
            if (digit == 57 /*'9'*/) {
                uid[index] = 'A';
                return uid.join('');
            }
            if (digit == 90  /*'Z'*/) {
                uid[index] = '0';
            } else {
                uid[index] = String.fromCharCode(digit + 1);
                return uid.join('');
            }
        }
        uid.unshift('0');
        return uid.join('');
    };
}();


/**
 * @param {Function} fn
 * @param {*} context
 */
var bind = Function.prototype.bind ?
              function(fn, context){
                  return fn.bind(context);
              } :
              function(fn, context) {
                  return function() {
                      return fn.apply(context, arguments);
                  };
              };



var getRegExp = function(){

    var cache = {};

    /**
     * @param {String} expr
     * @returns RegExp
     */
    return function getRegExp(expr) {
        return cache[expr] || (cache[expr] = new RegExp(expr));
    };
}();



/**
 * @param {String} cls
 * @returns {RegExp}
 */
function getClsReg(cls) {
    return getRegExp('(?:^|\\s)'+cls+'(?!\\S)');
};



/**
 * @param {Element} el
 * @param {String} cls
 * @returns {boolean}
 */
function hasClass(el, cls) {
    return cls ? getClsReg(cls).test(el.className) : false;
};



/**
 * @param {Element} el
 * @param {String} cls
 */
function addClass(el, cls) {
    if (cls && !hasClass(el, cls)) {
        el.className += " " + cls;
    }
};



/**
 * @param {Element} el
 * @param {String} cls
 */
function removeClass(el, cls) {
    if (cls) {
        el.className = el.className.replace(getClsReg(cls), '');
    }
};


function setStyle(el, name, value) {

    if (!el) {
        return;
    }

    var props,
        style = el.style,
        k;

    if (typeof name == "string") {
        props = {};
        props[name] = value;
    }
    else {
        props = name;
    }

    for (k in props) {
        style[k] = props[k];
    }
};




var data = function(){

    var dataCache   = {},

        getNodeId   = function(el) {
            return el._mjsid || (el._mjsid = nextUid());
        };

    /**
     * @param {Element} el
     * @param {String} key
     * @param {*} value optional
     */
    return function data(el, key, value) {
        var id  = getNodeId(el),
            obj = dataCache[id];

        if (value !== undf) {
            if (!obj) {
                obj = dataCache[id] = {};
            }
            obj[key] = value;
            return value;
        }
        else {
            return obj ? obj[key] : undf;
        }
    };

}();

function getAttr(el, name) {
    return el.getAttribute ? el.getAttribute(name) : null;
};

function setAttr(el, name, value) {
    return el.setAttribute(name, value);
};

function removeAttr(el, name) {
    return el.removeAttribute(name);
};

function returnFalse() {
    return false;
};


function returnTrue() {
    return true;
};

function isNull(value) {
    return value === null;
};



// from jQuery

var DomEvent = function(src) {

    if (src instanceof DomEvent) {
        return src;
    }

    // Allow instantiation without the 'new' keyword
    if (!(this instanceof DomEvent)) {
        return new DomEvent(src);
    }


    var self    = this;

    for (var i in src) {
        if (!self[i]) {
            try {
                self[i] = src[i];
            }
            catch (thrownError){}
        }
    }


    // Event object
    self.originalEvent = src;
    self.type = src.type;

    if (!self.target && src.srcElement) {
        self.target = src.srcElement;
    }


    var eventDoc, doc, body,
        button = src.button;

    // Calculate pageX/Y if missing and clientX/Y available
    if (self.pageX === undf && !isNull(src.clientX)) {
        eventDoc = self.target ? self.target.ownerDocument || window.document : window.document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        self.pageX = src.clientX +
                      ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
                      ( doc && doc.clientLeft || body && body.clientLeft || 0 );
        self.pageY = src.clientY +
                      ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
                      ( doc && doc.clientTop  || body && body.clientTop  || 0 );
    }

    // Add which for click: 1 === left; 2 === middle; 3 === right
    // Note: button is not normalized, so don't use it
    if ( !self.which && button !== undf ) {
        self.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
    }

    // Events bubbling up the document may have been marked as prevented
    // by a handler lower down the tree; reflect the correct value.
    self.isDefaultPrevented = src.defaultPrevented ||
                              src.defaultPrevented === undf &&
                                  // Support: Android<4.0
                              src.returnValue === false ?
                              returnTrue :
                              returnFalse;


    // Create a timestamp if incoming event doesn't have one
    self.timeStamp = src && src.timeStamp || (new Date).getTime();
};

// Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
extend(DomEvent.prototype, {

    isDefaultPrevented: returnFalse,
    isPropagationStopped: returnFalse,
    isImmediatePropagationStopped: returnFalse,

    preventDefault: function() {
        var e = this.originalEvent;

        this.isDefaultPrevented = returnTrue;
        e.returnValue = false;

        if ( e && e.preventDefault ) {
            e.preventDefault();
        }
    },
    stopPropagation: function() {
        var e = this.originalEvent;

        this.isPropagationStopped = returnTrue;

        if ( e && e.stopPropagation ) {
            e.stopPropagation();
        }
    },
    stopImmediatePropagation: function() {
        var e = this.originalEvent;

        this.isImmediatePropagationStopped = returnTrue;

        if ( e && e.stopImmediatePropagation ) {
            e.stopImmediatePropagation();
        }

        this.stopPropagation();
    }
}, true, false);




function normalizeEvent(originalEvent) {
    return new DomEvent(originalEvent);
};


// from jquery.mousewheel plugin



var mousewheelHandler = function(e) {

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    var toBind = ( 'onwheel' in window.document || window.document.documentMode >= 9 ) ?
                 ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        nullLowestDeltaTimeout, lowestDelta;

    var mousewheelHandler = function(fn) {

        return function(e) {

            var event = normalizeEvent(e || window.event),
                args = slice.call(arguments, 1),
                delta = 0,
                deltaX = 0,
                deltaY = 0,
                absDelta = 0,
                offsetX = 0,
                offsetY = 0;


            event.type = 'mousewheel';

            // Old school scrollwheel delta
            if ('detail'      in event) { deltaY = event.detail * -1; }
            if ('wheelDelta'  in event) { deltaY = event.wheelDelta; }
            if ('wheelDeltaY' in event) { deltaY = event.wheelDeltaY; }
            if ('wheelDeltaX' in event) { deltaX = event.wheelDeltaX * -1; }

            // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
            if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
                deltaX = deltaY * -1;
                deltaY = 0;
            }

            // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
            delta = deltaY === 0 ? deltaX : deltaY;

            // New school wheel delta (wheel event)
            if ('deltaY' in event) {
                deltaY = event.deltaY * -1;
                delta = deltaY;
            }
            if ('deltaX' in event) {
                deltaX = event.deltaX;
                if (deltaY === 0) { delta = deltaX * -1; }
            }

            // No change actually happened, no reason to go any further
            if (deltaY === 0 && deltaX === 0) { return; }

            // Store lowest absolute delta to normalize the delta values
            absDelta = Math.max(Math.abs(deltaY), Math.abs(deltaX));

            if (!lowestDelta || absDelta < lowestDelta) {
                lowestDelta = absDelta;

                // Adjust older deltas if necessary
                if (shouldAdjustOldDeltas(event, absDelta)) {
                    lowestDelta /= 40;
                }
            }

            // Adjust older deltas if necessary
            if (shouldAdjustOldDeltas(event, absDelta)) {
                // Divide all the things by 40!
                delta /= 40;
                deltaX /= 40;
                deltaY /= 40;
            }

            // Get a whole, normalized value for the deltas
            delta = Math[delta >= 1 ? 'floor' : 'ceil'](delta / lowestDelta);
            deltaX = Math[deltaX >= 1 ? 'floor' : 'ceil'](deltaX / lowestDelta);
            deltaY = Math[deltaY >= 1 ? 'floor' : 'ceil'](deltaY / lowestDelta);

            // Normalise offsetX and offsetY properties
            if (this.getBoundingClientRect) {
                var boundingRect = this.getBoundingClientRect();
                offsetX = event.clientX - boundingRect.left;
                offsetY = event.clientY - boundingRect.top;
            }

            // Add information to the event object
            event.deltaX = deltaX;
            event.deltaY = deltaY;
            event.deltaFactor = lowestDelta;
            event.offsetX = offsetX;
            event.offsetY = offsetY;
            // Go ahead and set deltaMode to 0 since we converted to pixels
            // Although this is a little odd since we overwrite the deltaX/Y
            // properties with normalized deltas.
            event.deltaMode = 0;

            // Add event and delta to the front of the arguments
            args.unshift(event, delta, deltaX, deltaY);

            // Clearout lowestDelta after sometime to better
            // handle multiple device types that give different
            // a different lowestDelta
            // Ex: trackpad = 3 and mouse wheel = 120
            if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
            nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);



            return fn.apply(this, args);
        }
    };

    mousewheelHandler.events = function() {
        var doc = window.document;
        return ( 'onwheel' in doc || doc.documentMode >= 9 ) ?
               ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
    };

    return mousewheelHandler;

}();



var addListener = function(){

    var fn = null,
        prefix = null;

    return function addListener(el, event, func) {

        if (fn === null) {
            fn = el.attachEvent ? "attachEvent" : "addEventListener";
            prefix = el.attachEvent ? "on" : "";
        }


        if (event == "mousewheel") {
            func = mousewheelHandler(func);
            var events = mousewheelHandler.events(),
                i, l;
            for (i = 0, l = events.length; i < l; i++) {
                el[fn](prefix + events[i], func, false);
            }
        }
        else {
            el[fn](prefix + event, func, false);
        }

        return func;
    }

}();


var removeListener = function(){

    var fn = null,
        prefix = null;

    return function removeListener(el, event, func) {

        if (fn === null) {
            fn = el.detachEvent ? "detachEvent" : "removeEventListener";
            prefix = el.detachEvent ? "on" : "";
        }

        el[fn](prefix + event, func);
    }
}();
/**
 * @param {Element} el
 * @returns {boolean}
 */
function isVisible(el) {
    return el && !(el.offsetWidth <= 0 || el.offsetHeight <= 0);
};



/**
 * @param {Element} el
 * @param {String} selector
 * @returns {boolean}
 */
var is = select.is;



function isNumber(value) {
    return varType(value) === 1;
};

function ucfirst(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
};

var getStyle = function(node, prop, numeric) {

    var style, val;

    if (window.getComputedStyle) {

        if (node === window) {
            return prop? (numeric ? 0 : null) : {};
        }
        style = getComputedStyle(node, null);
        val = prop ? style[prop] : style;
    }
    else {
        style = node.currentStyle || node.style || {};
        val = prop ? style[prop] : style;
    }

    return numeric ? parseFloat(val) || 0 : val;

};



var boxSizingReliable = function() {

    var boxSizingReliableVal;

    var computePixelPositionAndBoxSizingReliable = function() {

        var doc = window.document,
            container = doc.createElement("div"),
            div = doc.createElement("div"),
            body = doc.body;

        if (!div.style || !window.getComputedStyle) {
            return false;
        }

        container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;" +
                                  "position:absolute";
        container.appendChild(div);

        div.style.cssText =
            // Support: Firefox<29, Android 2.3
            // Vendor-prefix box-sizing
        "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
        "box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
        "border:1px;padding:1px;width:4px;position:absolute";
        div.innerHTML = "";
        body.appendChild(container);

        var divStyle = window.getComputedStyle(div, null),
            ret = divStyle.width === "4px";

        body.removeChild(container);

        return ret;
    };

    return function boxSizingReliable() {
        if (boxSizingReliableVal === undf) {
            boxSizingReliableVal = computePixelPositionAndBoxSizingReliable();
        }

        return boxSizingReliableVal;
    };
}();

// from jQuery



var getDimensions = function(type, name) {

    var rnumnonpx = new RegExp( "^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(?!px)[a-z%]+$", "i"),
        cssExpand = [ "Top", "Right", "Bottom", "Left" ],
        defaultExtra = !type ? "content" : (type == "inner" ? "padding" : "");

    var augmentWidthOrHeight = function(elem, name, extra, isBorderBox, styles) {
        var i = extra === (isBorderBox ? "border" : "content") ?
                // If we already have the right measurement, avoid augmentation
                4 :
                // Otherwise initialize for horizontal or vertical properties
                name === "width" ? 1 : 0,

            val = 0;

        for (; i < 4; i += 2) {
            // Both box models exclude margin, so add it if we want it
            if (extra === "margin") {
                val += parseFloat(styles[extra + cssExpand[i]]);
            }

            if (isBorderBox) {
                // border-box includes padding, so remove it if we want content
                if (extra === "content") {
                    val -= parseFloat(styles["padding" + cssExpand[i]]);
                }

                // At this point, extra isn't border nor margin, so remove border
                if (extra !== "margin") {
                    val -= parseFloat(styles["border" + cssExpand[i] + "Width"]);
                }
            } else {
                // At this point, extra isn't content, so add padding
                val += parseFloat(styles["padding" + cssExpand[i]]);

                // At this point, extra isn't content nor padding, so add border
                if (extra !== "padding") {
                    val += parseFloat(styles["border" + cssExpand[i] + "Width"]);
                }
            }
        }

        return val;
    };

    var getWidthOrHeight = function(elem, name, extra, styles) {

        // Start with offset property, which is equivalent to the border-box value
        var valueIsBorderBox = true,
            val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
            isBorderBox = styles["boxSizing"] === "border-box";

        // Some non-html elements return undefined for offsetWidth, so check for null/undefined
        // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
        // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
        if ( val <= 0 || val == null ) {
            val = elem.style[name];

            // Computed unit is not pixels. Stop here and return.
            if (rnumnonpx.test(val)) {
                return val;
            }

            // Check for style in case a browser which returns unreliable values
            // for getComputedStyle silently falls back to the reliable elem.style
            valueIsBorderBox = isBorderBox &&
                               (boxSizingReliable() || val === elem.style[name]);

            // Normalize "", auto, and prepare for extra
            val = parseFloat(val) || 0;
        }

        // Use the active box-sizing model to add/subtract irrelevant styles
        return val +
                 augmentWidthOrHeight(
                     elem,
                     name,
                     extra || (isBorderBox ? "border" : "content"),
                     valueIsBorderBox,
                     styles
                 );
    };


    return function getDimensions(elem, margin) {

        if (elem === window) {
            return elem.document.documentElement["client" + name];
        }

        // Get document width or height
        if (elem.nodeType === 9) {
            var doc = elem.documentElement;

            // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
            // whichever is greatest
            return Math.max(
                elem.body["scroll" + name], doc["scroll" + name],
                elem.body["offset" + name], doc["offset" + name],
                doc["client" + name]
            );
        }

        return getWidthOrHeight(
            elem,
            name.toLowerCase(),
            defaultExtra || (margin === true ? "margin" : "border"),
            getStyle(elem)
        );
    };

};



var getOuterWidth = getDimensions("outer", "Width");



var getOuterHeight = getDimensions("outer", "Height");

var delegates = {};




function delegate(el, selector, event, fn) {

    var key = selector + "-" + event,
        listener    = function(e) {
            e = normalizeEvent(e);
            if (is(e.target, selector)) {
                return fn(e);
            }
            return null;
        };

    if (!delegates[key]) {
        delegates[key] = [];
    }

    delegates[key].push({el: el, ls: listener, fn: fn});

    addListener(el, event, listener);
};



function undelegate(el, selector, event, fn) {

    var key = selector + "-" + event,
        i, l,
        ds;

    if (ds = delegates[key]) {
        for (i = -1, l = ds.length; ++i < l;) {
            if (ds[i].el === el && ds[i].fn === fn) {
                removeListener(el, event, ds[i].ls);
            }
        }
    }
};



var raf = function() {

    var raf,
        cancel;

    if (typeof window != strUndef) {
        var w   = window;
        raf     = w.requestAnimationFrame ||
                    w.webkitRequestAnimationFrame ||
                    w.mozRequestAnimationFrame;
        cancel  = w.cancelAnimationFrame ||
                    w.webkitCancelAnimationFrame ||
                    w.mozCancelAnimationFrame ||
                    w.webkitCancelRequestAnimationFrame;

        if (raf) {
            return function(fn) {
                var id = raf(fn);
                return function() {
                    cancel(id);
                };
            };
        }
    }

    return function(fn) {
        var id = setTimeout(fn, 0);
        return function() {
            clearTimeout(id);
        }
    };
}();
/**
 * @param {Function} fn
 * @param {Object} context
 * @param {[]} args
 * @param {number} timeout
 */
function async(fn, context, args, timeout) {
    return setTimeout(function(){
        fn.apply(context, args || []);
    }, timeout || 0);
};



/**
 * @mixin ObservableMixin
 */
var ObservableMixin = ns.add("mixin.Observable", {

    /**
     * @type {Observable}
     */
    $$observable: null,
    $$callbackContext: null,

    $beforeInit: function(cfg) {

        var self = this;

        self.$$observable = new Observable;

        if (cfg && cfg.callback) {
            var ls = cfg.callback,
                context = ls.context || ls.scope,
                i;

            ls.context = null;
            ls.scope = null;

            for (i in ls) {
                if (ls[i]) {
                    self.$$observable.on(i, ls[i], context || self);
                }
            }

            cfg.callback = null;

            if (context) {
                self.$$callbackContext = context;
            }
        }
    },

    on: function() {
        var o = this.$$observable;
        return o.on.apply(o, arguments);
    },

    un: function() {
        var o = this.$$observable;
        return o.un.apply(o, arguments);
    },

    once: function() {
        var o = this.$$observable;
        return o.once.apply(o, arguments);
    },

    trigger: function() {
        var o = this.$$observable;
        return o.trigger.apply(o, arguments);
    },

    $beforeDestroy: function() {
        this.$$observable.trigger("before-destroy", this);
    },

    $afterDestroy: function() {
        var self = this;
        self.$$observable.trigger("destroy", self);
        self.$$observable.destroy();
        self.$$observable = null;
    }
});




var getScrollTopOrLeft = function(vertical) {

    var defaultST,
        wProp = vertical ? "pageYOffset" : "pageXOffset",
        sProp = vertical ? "scrollTop" : "scrollLeft",
        doc = window.document,
        body = doc.body,
        html = doc.documentElement;

    if(window[wProp] !== undf) {
        //most browsers except IE before #9
        defaultST = function(){
            return window[wProp];
        };
    }
    else{
        if (html.clientHeight) {
            defaultST = function() {
                return html[sProp];
            };
        }
        else {
            defaultST = function() {
                return body[sProp];
            };
        }
    }

    return function(node) {
        if (!node || node === window) {
            return defaultST();
        }
        else if (node && node.nodeType == 1 &&
            node !== body && node !== html) {
            return node[sProp];
        }
        else {
            return defaultST();
        }
    }

};



var getScrollTop = getScrollTopOrLeft(true);



var getScrollLeft = getScrollTopOrLeft(false);



var getWidth = getDimensions("", "Width");


var getHeight = getDimensions("", "Height");



defineClass({

    $class: "$dialog.position.Abstract",
    dialog: null,
    positionBase: null,
    correct: "solid",

    $init: function(dialog) {
        var self = this;
        self.dialog = dialog;
        extend(self, dialog.getCfg().position, true, false);

        self.onWindowResizeDelegate = bind(self.onWindowResize, self);
        self.onWindowScrollDelegate = bind(self.onWindowScroll, self);

        var pt = self.preferredType || self.type;
        if (typeof pt == "string") {
            var pts = self.getAllPositions(),
                inx;
            if ((inx = pts.indexOf(pt)) != -1) {
                pts.splice(inx, 1);
                pts.unshift(pt);
            }
            self.preferredType = pts;
        }
        else if (!pt) {
            self.preferredType = self.getAllPositions();
        }

        dialog.on("reposition", self.onReposition, self);
        dialog.on("show-after-delay", self.onShowAfterDelay, self);
        dialog.on("hide-after-delay", self.onHideAfterDelay, self);

        if (dialog.isVisible()) {
            self.onShowAfterDelay();
        }

    },


    getPositionBase: function() {

        var self = this,
            dlg = self.dialog;

        if (self.positionBase) {
            return self.positionBase;
        }
        var b;
        if (b = dlg.getCfg().position.base) {
            if (typeof b == "string") {
                self.positionBase = select(b).shift();
            }
            else {
                self.positionBase = b;
            }
            return self.positionBase;
        }
        return null;
    },

    getBoundary: function() {

        var self    = this,
            base    = self.getPositionBase(),
            sx      = self.screenX || 0,
            sy      = self.screenY || 0,
            w, h,
            st, sl,
            ofs;

        if (base) {
            ofs = getOffset(base);
            w = getOuterWidth(base);
            h = getOuterHeight(base);
            return {
                x: ofs.left + sx,
                y: ofs.top + sy,
                x1: ofs.left + w - sx,
                y1: ofs.top + h - sy,
                w: w,
                h: h
            };
        }
        else {
            w = getWidth(window);
            h = getHeight(window);
            st = getScrollTop(window);
            sl = getScrollLeft(window);
            return {
                x: sl + sx,
                y: st + sy,
                x1: sl + w - sx,
                y1: st + h - sy,
                w: w,
                h: h
            };
        }
    },


    getPrimaryPosition: function(pos) {
        return false;
    },
    getSecondaryPosition: function(pos) {
        return false;
    },

    getAllPositions: function() {
        return [];
    },

    correctPosition: function(e) {

        var self        = this,
            pri         = self.getPrimaryPosition(),
            strategy    = self.correct;

        if (!pri || !strategy) {
            return;
        }

        var dlg         = self.dialog,
            boundary    = self.getBoundary(),
            size        = dlg.getDialogSize(),
            pts         = self.preferredType,
            pt          = pts[0],
            i, l;

        if (strategy && strategy != "solid") {
            if (self.type != pt && self.checkIfFits(e, pt, boundary, size, false)) {
                self.changeType(pt);
                return self.fitToBoundary(self.getCoords(e), boundary, size);
            }

            if (self.checkIfFits(e, self.type, boundary, size, false)) {
                return self.fitToBoundary(self.getCoords(e), boundary, size);
            }
        }
        if (strategy && strategy != "position-only") {
            for (i = 0, l = pts.length; i < l; i++) {
                if (self.checkIfFits(e, pts[i], boundary, size, true)) {
                    self.changeType(pts[i]);
                    return self.getCoords(e);
                }
            }
        }

        return self.getCoords(e);
    },

    checkIfFits: function(e, position, boundary, size, fully) {

        var self    = this,
            coords  = self.getCoords(e, position, true);

        // leave only basic positions here
        if (!fully && self.getSecondaryPosition(position)) {
            return false;
        }

        if (fully) {
            return !(coords.x < boundary.x ||
                     coords.y < boundary.y ||
                     coords.x + size.width > boundary.x1 ||
                     coords.y + size.height > boundary.y1);
        }
        else {
            var pri = self.getPrimaryPosition(position);
            switch (pri) {
                case "t":
                    return coords.y >= boundary.y;
                case "r":
                    return coords.x + size.width <= boundary.x1;
                case "b":
                    return coords.y + size.height <= boundary.y1;
                case "l":
                    return coords.x >= boundary.x;
            }
        }
    },

    fitToBoundary: function(coords, boundary, size) {

        var self = this,
            base = self.getPositionBase(),
            x = base ? 0 : boundary.x,
            y = base ? 0 : boundary.y,
            x1 = base ? boundary.w : boundary.x1,
            y1 = base ? boundary.h : boundary.y1,
            xDiff = 0,
            yDiff = 0,
            pointer = self.dialog.getPointer();

        if (coords.x < x) {
            xDiff = coords.x - x;
            coords.x = x;
        }
        if (coords.y < y) {
            yDiff = coords.y - y;
            coords.y = y;
        }
        if (coords.x + size.width > x1) {
            xDiff = (coords.x + size.width) - x1;
            coords.x -= xDiff;
        }
        if (coords.y + size.height > y1) {
            yDiff = (coords.y + size.height) - y1;
            coords.y -= yDiff;
        }

        pointer.setCorrectionOffset(xDiff, yDiff);
        pointer.reposition();

        return coords;
    },

    changeType: function(type) {
        var self = this,
            dlg = self.dialog,
            pointer = dlg.getPointer();

        self.type = type;
        pointer.setType(null, null);
    },

    onReposition: function(dlg, e) {

        var self    = this,
            coords;

        if (self.screenX !== false || self.screenY !== false) {
            coords  = self.correctPosition(e);
        }
        else {
            coords  = self.getCoords(e);
        }

        self.apply(coords);
    },

    getCoords: function(e){
        return {
            left: 0,
            top: 0
        }
    },

    apply: function(coords) {

        if (!coords) {
            return;
        }

        setStyle(this.dialog.getElem(), {
            left: coords.x + "px",
            top: coords.y + "px"
        });
    },

    onWindowResize: function(e) {
        this.dialog.reposition(normalizeEvent(e));
    },

    onWindowScroll: function(e) {
        this.dialog.reposition(normalizeEvent(e));
    },

    onShowAfterDelay: function() {
        var self = this;

        if (self.resize || self.screenX || self.screenY) {
            addListener(window, "resize", self.onWindowResizeDelegate);
        }

        if (self.scroll || self.screenX || self.screenY) {
            addListener(self.dialog.getScrollEl(self.scroll), "scroll", self.onWindowScrollDelegate);
        }
    },

    onHideAfterDelay: function() {

        var self = this;

        if (self.resize || self.screenX || self.screenY) {
            removeListener(window, "resize", self.onWindowResizeDelegate);
        }

        if (self.scroll || self.screenX || self.screenY) {
            removeListener(self.dialog.getScrollEl(self.scroll), "scroll", self.onWindowScrollDelegate);
        }
    },

    destroy: function() {

        var self = this,
            dlg = self.dialog;

        dlg.un("reposition", self.onReposition, self);
        dlg.un("show-after-delay", self.onShowAfterDelay, self);
        dlg.un("hide-after-delay", self.onHideAfterDelay, self);

        if (self.dialog.isVisible()) {
            self.onHideAfterDelay();
        }
    }



});






function getOffsetParent(node) {

    var html = window.document.documentElement,
        offsetParent = node.offsetParent || html;

    while (offsetParent && (offsetParent != html &&
                              getStyle(offsetParent, "position") == "static")) {
        offsetParent = offsetParent.offsetParent;
    }

    return offsetParent || html;

};

var isAttached = function(){
    var isAttached = function isAttached(node) {

        if (node === window) {
            return true;
        }
        if (node.nodeType == 3) {
            if (node.parentElement) {
                return isAttached(node.parentElement);
            }
            else {
                return true;
            }
        }

        var html = window.document.documentElement;

        return node === html ? true : html.contains(node);
    };
    return isAttached;
}();



function getOffset(node) {

    var box = {top: 0, left: 0},
        html = window.document.documentElement;

    // Make sure it's not a disconnected DOM node
    if (!isAttached(node) || node === window) {
        return box;
    }

    // Support: BlackBerry 5, iOS 3 (original iPhone)
    // If we don't have gBCR, just use 0,0 rather than error
    if (node.getBoundingClientRect ) {
        box = node.getBoundingClientRect();
    }

    return {
        top: box.top + getScrollTop() - html.clientTop,
        left: box.left + getScrollLeft() - html.clientLeft
    };
};



function getPosition(node, to) {

    var offsetParent, offset,
        parentOffset = {top: 0, left: 0},
        html = window.document.documentElement;

    if (node === window || node === html) {
        return parentOffset;
    }

    // Fixed elements are offset from window (parentOffset = {top:0, left: 0},
    // because it is its only offset parent
    if (getStyle(node, "position" ) == "fixed") {
        // Assume getBoundingClientRect is there when computed position is fixed
        offset = node.getBoundingClientRect();
    }
    else if (to) {
        var thisOffset = getOffset(node),
            toOffset = getOffset(to),
            position = {
                left: thisOffset.left - toOffset.left,
                top: thisOffset.top - toOffset.top
            };

        if (position.left < 0) {
            position.left = 0;
        }
        if (position.top < 0) {
            position.top = 0;
        }
        return position;
    }
    else {
        // Get *real* offsetParent
        offsetParent = getOffsetParent(node);

        // Get correct offsets
        offset = getOffset(node);

        if (offsetParent !== html) {
            parentOffset = getOffset(offsetParent);
        }

        // Add offsetParent borders
        parentOffset.top += getStyle(offsetParent, "borderTopWidth", true);
        parentOffset.left += getStyle(offsetParent, "borderLeftWidth", true);
    }

    // Subtract parent offsets and element margins
    return {
        top: offset.top - parentOffset.top - getStyle(node, "marginTop", true),
        left: offset.left - parentOffset.left - getStyle(node, "marginLeft", true)
    };
};





defineClass({

    $class: "$dialog.position.Target",
    $extends: "$dialog.position.Abstract",

    getCoords: function(e, type, absolute) {

        var self    = this,
            dlg     = self.dialog,
            cfg     = dlg.getCfg(),
            target  = dlg.getTarget();

        if (!target) {
            return null;
        }

        var pBase   = self.getPositionBase(),
            size    = dlg.getDialogSize(),
            offset  = pBase && !absolute ? getPosition(target, pBase) : getOffset(target),
            tsize   = dlg.getTargetSize(),
            pos     = {},
            type    = type || self.type,
            pri     = type.substr(0, 1),
            sec     = type.substr(1),
            offsetX = cfg.position.offsetX,
            offsetY = cfg.position.offsetY,
            pntOfs  = dlg.pointer.getDialogPositionOffset(type);



        switch (pri) {
            case "t": {
                pos.y   = offset.top - size.height - offsetY;
                break;
            }
            case "r": {
                pos.x   = offset.left + tsize.width + offsetX;
                break;
            }
            case "b": {
                pos.y   = offset.top + tsize.height + offsetY;
                break;
            }
            case "l": {
                pos.x   = offset.left - size.width - offsetX;
                break;
            }
        }

        switch (sec) {
            case "t": {
                pos.y   = offset.top + offsetY;
                break;
            }
            case "r": {
                pos.x   = offset.left + tsize.width - size.width - offsetX;
                break;
            }
            case "b": {
                pos.y   = offset.top + tsize.height - size.height - offsetY;
                break;
            }
            case "l": {
                pos.x   = offset.left + offsetX;
                break;
            }
            case "rc": {
                pos.x   = offset.left + tsize.width + offsetX;
                break;
            }
            case "lc": {
                pos.x   = offset.left - size.width - offsetX;
                break;
            }
            case "": {
                switch (pri) {
                    case "t":
                    case "b": {
                        pos.x   = offset.left + (tsize.width / 2) - (size.width / 2);
                        break;
                    }
                    case "r":
                    case "l": {
                        pos.y   = offset.top + (tsize.height / 2) - (size.height / 2);
                        break;
                    }
                }
                break;
            }
        }

        if (pntOfs) {
            pos.x += pntOfs.x;
            pos.y += pntOfs.y;
        }

        return pos;
    },

    getPrimaryPosition: function(pos) {
        return (pos || this.type).substr(0, 1);
    },

    getSecondaryPosition: function(pos) {
        return (pos || this.type).substr(1);
    },

    getAllPositions: function() {
        return ["t", "r", "b", "l", "tl", "tr", "rt", "rb", "br", "bl", "lb", "lt", "tlc", "trc", "brc", "blc"];
    }

});









defineClass({

    $class: "$dialog.position.Mouse",
    $extends: "$dialog.position.Target",
    correct: "position",

    $init: function(dialog) {

        var self = this;

        self.onMouseMoveDelegate = bind(self.onMouseMove, self);
        self.$super(dialog);
    },

    getCoords: function(e, type, absolute) {

        if (!e) {
            return null;
        }

        var self    = this,
            origType= type || self.type,
            dlg     = self.dialog,
            cfg     = dlg.getCfg(),
            size    = dlg.getDialogSize(),
            base    = self.getPositionBase(),
            pos     = {},
            type    = (type || self.type).substr(1),
            offsetX = cfg.position.offsetX,
            offsetY = cfg.position.offsetY,
            axis    = cfg.position.axis,
            pntOfs  = dlg.getPointer().getDialogPositionOffset(origType),
            absOfs  = {x: 0, y: 0};

        if (!absolute && base) {
            var baseOfs = getOffset(base);
            absOfs.x = baseOfs.left;
            absOfs.y = baseOfs.top;
        }

        switch (type) {
            case "": {
                pos     = self.get.call(dlg.$$callbackContext, dlg, e, type, absolute);
                break;
            }
            case "c": {
                pos.y   = e.pageY - absOfs.y - (size.height / 2);
                pos.x   = e.pageX - absOfs.x - (size.width / 2);
                break;
            }
            case "t": {
                pos.y   = e.pageY - absOfs.y - size.height - offsetY;
                pos.x   = e.pageX - absOfs.x - (size.width / 2);
                break;
            }
            case "r": {
                pos.y   = e.pageY - absOfs.y - (size.height / 2);
                pos.x   = e.pageX - absOfs.x + offsetX;
                break;
            }
            case "b": {
                pos.y   = e.pageY - absOfs.y + offsetY;
                pos.x   = e.pageX - absOfs.x - (size.width / 2);
                break;
            }
            case "l": {
                pos.y   = e.pageY - absOfs.y - (size.height / 2);
                pos.x   = e.pageX - absOfs.x - size.width - offsetX;
                break;
            }
            case "rt": {
                pos.y   = e.pageY - absOfs.y - size.height - offsetY;
                pos.x   = e.pageX - absOfs.x + offsetX;
                break;
            }
            case "rb": {
                pos.y   = e.pageY - absOfs.y + offsetY;
                pos.x   = e.pageX - absOfs.x + offsetX;
                break;
            }
            case "lt": {
                pos.y   = e.pageY - absOfs.y - size.height - offsetY;
                pos.x   = e.pageX - absOfs.x - size.width - offsetX;
                break;
            }
            case "lb": {
                pos.y   = e.pageY - absOfs.y + offsetY;
                pos.x   = e.pageX - absOfs.x - size.width - offsetX;
                break;
            }
        }

        if (pntOfs) {
            pos.x += pntOfs.x;
            pos.y += pntOfs.y;
        }

        if (axis) {
            var tp = self.$super(e, type);
            if (tp) {
                if (axis == "x") {
                    pos.y = tp.y;
                }
                else {
                    pos.x = tp.x;
                }
            }
        }

        return pos;
    },

    onShowAfterDelay: function() {
        var self = this;
        self.$super();
        addListener(window.document.documentElement, "mousemove", self.onMouseMoveDelegate);
    },

    onHideAfterDelay: function() {
        var self = this;
        self.$super();
        removeListener(window.document.documentElement, "mousemove", self.onMouseMoveDelegate);
    },

    onMouseMove: function(e) {
        this.dialog.reposition(normalizeEvent(e));
    },

    getPrimaryPosition: function(pos) {
        return (pos || this.type).substr(1, 1);
    },

    getSecondaryPosition: function(pos) {
        return (pos || this.type).substr(2);
    },

    getAllPositions: function() {
        return ["mt", "mr", "mb", "ml", "mrt", "mrb", "mlb", "mlt"];
    }
});







defineClass({

    $class: "$dialog.position.Window",
    $extends: "$dialog.position.Abstract",


    getCoords: function(e) {
        var self    = this,
            dlg     = self.dialog,
            pBase   = self.getPositionBase() || window,
            size    = dlg.getDialogSize(),
            pos     = {},
            type    = self.type.substr(1),
            offsetX = self.offsetX,
            offsetY = self.offsetY,
            st      = getScrollTop(pBase),
            sl      = getScrollLeft(pBase),
            ww      = getOuterWidth(pBase),
            wh      = getOuterHeight(pBase);

        switch (type) {
            case "c": {
                pos.y   = (wh / 2) - (size.height / 2) + st;
                pos.x   = (ww / 2) - (size.width / 2) + sl;
                break;
            }
            case "t": {
                pos.y   = st + offsetY;
                pos.x   = (ww / 2) - (size.width / 2) + sl;
                break;
            }
            case "r": {
                pos.y   = (wh / 2) - (size.height / 2) + st;
                pos.x   = ww - size.width + sl - offsetX;
                break;
            }
            case "b": {
                pos.y   = wh - size.height + st - offsetY;
                pos.x   = (ww / 2) - (size.width / 2) + sl;
                break;
            }
            case "l": {
                pos.y   = (wh / 2) - (size.height / 2) + st;
                pos.x   = sl + offsetX;
                break;
            }
            case "rt": {
                pos.y   = st + offsetY;
                pos.x   = ww - size.width + sl - offsetX;
                break;
            }
            case "rb": {
                pos.y   = wh - size.height + st - offsetY;
                pos.x   = ww - size.width + sl - offsetX;
                break;
            }
            case "lt": {
                pos.y   = st + offsetY;
                pos.x   = sl + offsetX;
                break;
            }
            case "lb": {
                pos.y   = wh - size.height + st - offsetY;
                pos.x   = sl + offsetX;
                break;
            }
        }

        return pos;
    },

    getPrimaryPosition: function() {
        return this.type.substr(1, 1);
    },

    getSecondaryPosition: function() {
        return this.type.substr(2);
    },

    // window positioning doesn't need correction
    correctType: function() {},
    correctPosition: function() {}
});







defineClass({

    $class: "$dialog.position.Custom",
    $extends: "$dialog.position.Abstract",

    getCoords: function(e) {

        var dlg = this.dialog;
        return this.get.call(dlg.$$callbackContext, dlg, e);
    }
});





defineClass({

    $class: "$dialog.pointer.Abstract",
    enabled: null,
    node: null,
    correctX: 0,
    correctY: 0,

    $init: function(dialog, cfg) {

        var self = this;

        extend(self, cfg, true, false);

        self.origCfg    = cfg;
        self.dialog     = dialog;
        self.opposite   = {t: "b", r: "l", b: "t", l: "r"};
        self.names      = {t: 'top', r: 'right', b: 'bottom', l: 'left'};
        self.sides      = {t: ['l','r'], r: ['t','b'], b: ['r','l'], l: ['b','t']};

        if (self.enabled !== false && cfg.size) {
            self.enabled = true;
        }
        else {
            self.enabled = false;
        }
    },

    enable: function() {
        var self = this;
        if (!self.enabled) {
            self.enabled = true;
            self.render();
            if (self.dialog.isVisible()) {
                self.dialog.reposition();
            }
        }
    },

    disable: function() {
        var self = this;
        if (self.enabled) {
            self.remove();
            self.enabled = false;
            if (self.dialog.isVisible()) {
                self.dialog.reposition();
            }
        }
    },

    getElem: function() {
        return this.node;
    },

    getSize: function() {
        return this.enabled ? this.size : 0;
    },

    setCorrectionOffset: function(x, y) {
        this.correctX = x;
        this.correctY = y;
    },

    getCorrectionValue: function(type, value, position) {

        if (!value) {
            return 0;
        }

        var self    = this,
            pri     = position.substr(0,1),
            sec     = position.substr(1,1),
            tsize   = self.dialog.getDialogSize(),
            width   = self.width,
            sprop   = pri == "t" || pri == "b" ? "width" : "height",
            min,
            max;

        switch (sec) {
            case "":
                max = (tsize[sprop] / 2) - (width / 2);
                min = -max;
                break;
            case "l":
                min = 0;
                max = tsize[sprop] - (width / 2);
                break;
            case "r":
                min = -(tsize[sprop] - (width / 2));
                max = 0;
                break;
        }

        value = value < 0 ? Math.max(min, value) : Math.min(max, value);

        if ((pri == "t" || pri == "b") && type == "x") {
            return value;
        }
        if ((pri == "l" || pri == "r") && type == "y") {
            return value;
        }

        return 0;
    },

    getDialogPositionOffset: function(position) {
        var self    = this,
            pp      = (self.detectPointerPosition(position) || "").substr(0,1),
            dp      = self.dialog.getPosition().getPrimaryPosition(),
            ofs     = {x: 0, y: 0};

        if (!self.enabled) {
            return ofs;
        }

        if (pp == self.opposite[dp]) {
            ofs[pp == "t" || pp == "b" ? "y" : "x"] =
                pp == "b" || pp == "r" ? -self.size : self.size;
        }

        return ofs;
    },

    detectPointerPosition: function(dialogPosition) {

        var self = this,
            pri, sec;

        if (self.position && !dialogPosition) {
            if (isFunction(self.position)) {
                return self.position.call(self.dialog.$$callbackContext, self.dialog, self.origCfg);
            }
            return self.position;
        }

        pri = self.dialog.getPosition().getPrimaryPosition(dialogPosition);
        sec = self.dialog.getPosition().getSecondaryPosition(dialogPosition);

        if (!pri) {
            return null;
        }

        var position = self.opposite[pri];

        if (sec) {
            sec = sec.substr(0, 1);
            position += self.opposite[sec];
        }

        return position;
    },

    detectPointerDirection: function(position) {

        var self = this;

        if (self.direction) {
            if (isFunction(self.direction)) {
                return self.direction.call(self.dialog.$$callbackContext, self.dialog, position, self.origCfg);
            }
            return self.direction;
        }
        return position;
    },

    update: function(){
        var self = this;
        self.remove();
        self.render();
        self.append();
        if (self.dialog.isVisible()) {
            self.dialog.reposition();
        }
    },



    setType: function(position, direction) {
        var self = this;
        self.position = position;
        self.direction = direction;
        self.update();
        self.reposition();
    },


    render: function() {},

    destroy: function() {
        var self = this;
        self.remove();
    },

    reposition: function() {

    },

    append: function() {

        var self = this;
        if (!self.enabled) {
            return;
        }
        if (!self.node) {
            self.render();
        }
        if (!self.node) {
            return;
        }

        self.reposition();

        var parent = self.dialog.getElem();
        if (parent) {
            parent.appendChild(self.node);
        }
    },

    remove: function(){

        var self = this,
            node = self.node;

        if (node) {

            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }

            self.node = null;
        }
    }
});



var getAnimationPrefixes = function(){

    var domPrefixes         = ['Moz', 'Webkit', 'ms', 'O', 'Khtml'],
        animationDelay      = "animationDelay",
        animationDuration   = "animationDuration",
        transitionDelay     = "transitionDelay",
        transitionDuration  = "transitionDuration",
        transform           = "transform",
        transitionend       = null,
        prefixes            = null,

        probed              = false,

        detectCssPrefixes   = function() {

            var el = window.document.createElement("div"),
                animation = false,
                pfx,
                i, len;

            if (el.style['animationName'] !== undf) {
                animation = true;
            }
            else {
                for(i = 0, len = domPrefixes.length; i < len; i++) {
                    pfx = domPrefixes[i];
                    if (el.style[ pfx + 'AnimationName' ] !== undf) {
                        animation           = true;
                        animationDelay      = pfx + "AnimationDelay";
                        animationDuration   = pfx + "AnimationDuration";
                        transitionDelay     = pfx + "TransitionDelay";
                        transitionDuration  = pfx + "TransitionDuration";
                        transform           = pfx + "Transform";
                        break;
                    }
                }
            }

            if (animation) {
                if('ontransitionend' in window) {
                    // Chrome/Saf (+ Mobile Saf)/Android
                    transitionend = 'transitionend';
                }
                else if('onwebkittransitionend' in window) {
                    // Chrome/Saf (+ Mobile Saf)/Android
                    transitionend = 'webkitTransitionEnd';
                }
            }

            return animation;
        };


    /**
     * @function animate.getPrefixes
     * @returns {object}
     */
    return function() {

        if (!probed) {
            if (detectCssPrefixes()) {
                prefixes = {
                    animationDelay: animationDelay,
                    animationDuration: animationDuration,
                    transitionDelay: transitionDelay,
                    transitionDuration: transitionDuration,
                    transform: transform,
                    transitionend: transitionend
                };
            }
            else {
                prefixes = {};
            }

            probed = true;
        }


        return prefixes;
    };
}();






(function(){

    var ie6             = null,
        defaultProps    = {
            backgroundColor: 'transparent',
            width: 			'0px',
            height: 		'0px',
            position: 		'absolute',
            fontSize: 	    '0px', // ie6
            lineHeight:     '0px' // ie6
        };


    defineClass({

        $class: "$dialog.pointer.Html",
        $extends: "$dialog.pointer.Abstract",

        node: null,
        sub: null,

        $init: function(dialog, cfg) {

            if (ie6 === null) {
                ie6 = window.document.all && !window.XMLHttpRequest
            }

            var self = this;

            self.$super(dialog, cfg);

            self.width = self.width || self.size * 2;

            if (self.inner) {
                self.enabled = true;
            }
        },



        createInner: function() {
            var self        = this,
                newcfg 		= extend({}, self.origCfg);

            newcfg.size 	= self.size - (self.border * 2);
            newcfg.width	= self.width - (self.border * 4);

            newcfg.border = 0;
            newcfg.borderColor = null;
            newcfg.borderCls = null;
            newcfg.offset = 0;
            newcfg.inner = self.border;

            self.sub = factory("$dialog.pointer.Html", self.dialog, newcfg);
        },


        getBorders: function(position, direction, color) {

            var self        = this,
                borders 	= {},
                pri 		= position.substr(0,1),
                dpri        = direction.substr(0,1),
                dsec        = direction.substr(1),
                style       = ie6 ? "dotted" : "solid",
                names       = self.names,
                sides       = self.sides,
                opposite    = self.opposite;

            // in ie6 "solid" wouldn't make transparency :(

            // this is always height : border which is opposite to direction
            borders['border'+ucfirst(names[opposite[pri]])] = self.size + "px solid "+color;
            // border which is similar to direction is always 0
            borders['border'+ucfirst(names[pri])] = "0 "+style+" transparent";

            if (!dsec) {
                // if pointer's direction matches pointer primary position (p: l|lt|lb, d: l)
                // then we set both side borders to a half of the width;
                var side = Math.floor(self.width / 2);
                borders['border' + ucfirst(names[sides[dpri][0]])] = side + "px "+style+" transparent";
                borders['border' + ucfirst(names[sides[dpri][1]])] = side + "px "+style+" transparent";
            }
            else {
                // if pointer's direction doesn't match with primary position (p: l|lt|lb, d: t|b)
                // we set the border opposite to direction to the full width;
                borders['border'+ucfirst(names[dsec])] = "0 solid transparent";
                borders['border'+ucfirst(names[opposite[dsec]])] = self.width + "px "+style+" transparent";
            }

            return borders;
        },

        getOffsets: function(position, direction) {

            var self    = this,
                offsets = {},
                names   = self.names,
                opposite= self.opposite,
                pri		= position.substr(0,1),
                auto 	= (pri == 't' || pri == 'b') ? "r" : "b";

            offsets[names[pri]] = self.inner ? 'auto' : -self.size+"px";
            offsets[names[auto]] = "auto";

            if (!self.inner) {

                var margin;

                switch (position) {
                    case 't': case 'r': case 'b': case 'l':
                        if (direction != position) {
                            if (direction == 'l' || direction == 't') {
                                margin = self.offset;
                            }
                            else {
                                margin = -self.width + self.offset;
                            }
                        }
                        else {
                            margin = -self.width/2 + self.offset;
                        }
                        break;

                    case 'bl': case 'tl': case 'lt': case 'rt':
                        margin = self.offset;
                        break;

                    default:
                        margin = -self.width - self.offset;
                        break;
                }

                offsets['margin' + ucfirst(names[opposite[auto]])] = margin + "px";

                var positionOffset;

                switch (position) {
                    case 't': case 'r': case 'b': case 'l':
                        positionOffset = '50%';
                        break;

                    case 'tr': case 'rb': case 'br': case 'lb':
                        positionOffset = '100%';
                        break;

                    default:
                        positionOffset = 0;
                        break;
                }

                offsets[names[opposite[auto]]]  = positionOffset;

                var pfxs = getAnimationPrefixes(),
                    transformPfx = pfxs.transform,
                    transform = "",
                    cx = self.correctX,
                    cy = self.correctY;

                if (transformPfx) {

                    if (cx) {
                        transform += " translateX(" + self.getCorrectionValue("x", cx, position) + "px)";
                    }
                    if (cy) {
                        transform += " translateY(" + self.getCorrectionValue("y", cy, position) + "px)";
                    }

                    offsets[transformPfx] = transform;
                }
            }
            else {

                var innerOffset,
                    dpri    = direction.substr(0, 1),
                    dsec    = direction.substr(1);

                if (dsec) {
                    if (dsec == 'l' || dsec == 't') {
                        innerOffset = self.inner + 'px';
                    }
                    else {
                        innerOffset = -self.width - self.inner + 'px';
                    }
                }
                else {
                    innerOffset = Math.floor(-self.width / 2) + 'px';
                }

                offsets[names[opposite[auto]]]  = innerOffset;
                offsets[names[opposite[dpri]]] = -(self.size + (self.inner * 2)) + 'px';
            }


            return offsets;
        },

        render: function() {

            var self = this;

            if (!self.enabled) {
                return;
            }

            if (self.node) {
                return;
            }

            var position    = self.detectPointerPosition();
            if (!position) {
                return;
            }

            if (self.border && !self.sub) {
                self.createInner();
            }

            self.node   = window.document.createElement('div');
            var cmt     = window.document.createComment(" ");

            self.node.appendChild(cmt);

            setStyle(self.node, defaultProps);
            addClass(self.node, self.borderCls || self.cls);

            if (self.sub) {
                self.sub.render();
                self.node.appendChild(self.sub.getElem());
            }
        },

        reposition: function() {

            var self        = this,
                position    = self.detectPointerPosition(),
                direction   = self.detectPointerDirection(position);

            if (!self.node) {
                return;
            }

            setStyle(self.node, self.getBorders(position, direction, self.borderColor || self.color));
            setStyle(self.node, self.getOffsets(position, direction));

            if (self.sub) {
                self.sub.reposition();
            }
        },

        update: function() {
            var self = this;
            if (self.sub) {
                self.sub.$destroy();
                self.sub = null;
            }
            self.remove();
            self.node = null;
            self.render();
            self.append();

            if (self.dialog.isVisible()) {
                self.dialog.reposition();
            }
        },

        destroy: function() {

            var self = this;

            if (self.sub) {
                self.sub.$destroy();
                self.sub = null;
            }

            self.$super();
        },

        remove: function() {

            var self = this;

            if (self.sub) {
                self.sub.remove();
            }

            self.$super();
        }
    });
}());







defineClass({

    $class:         "$dialog.Overlay",
    dialog:         null,
    enabled:		false,
    color:			'#000',
    opacity:		.5,
    cls:			null,
    animateShow:	false,
    animateHide:	false,

    $init: function(dialog){

        var self = this;

        self.dialog = dialog;
        self.onClickDelegate = bind(self.onClick, self);
        extend(self, dialog.getCfg().overlay, true, false);

        if (self.enabled) {
            self.enabled = false;
            self.enable();
        }
    },

    getElem: function() {
        var self = this;
        if (self.enabled && !self.node) {
            self.render();
        }
        return self.node;
    },

    enable: function() {
        var self = this;
        if (!self.enabled) {
            self.enabled = true;
        }
    },

    disable: function() {
        var self = this;
        if (self.enabled) {
            self.remove();
            self.enabled = false;
        }
    },

    show: function(e) {
        var self = this;

        if (!self.enabled) {
            return;
        }

        if (self.animateShow) {
            self.animate("show", e);
        }
        else {
            self.node.style.display = "block";
        }
    },

    hide: function(e) {
        var self = this;
        if (self.node) {
            if (self.animateHide) {
                self.animate("hide", e);
            }
            else {
                self.node.style.display = "none";
            }
        }
    },

    render: function() {

        var self = this;

        if (!self.enabled) {
            return;
        }

        var node = window.document.createElement("div"),
            cfg = self.dialog.getCfg();

        setStyle(node, {
            display:            "none",
            position: 			"fixed",
            left:				0,
            top:				0,
            right:              0,
            bottom:             0,
            opacity:			self.opacity,
            backgroundColor: 	self.color
        });

        addListener(node, "click", self.onClickDelegate);

        if (cfg.render.zIndex) {
            setStyle(node, "zIndex", cfg.render.zIndex);
        }
        if (self.cls) {
            addClass(node, self.cls);
        }

        self.node = node;
    },

    remove: function() {
        var self = this,
            dialog = self.dialog,
            node = self.node;

        if (node && node.parentNode) {
            raf(function () {
                if (!dialog.isVisible()) {
                    node.parentNode.removeChild(node);
                }
            });
        }
    },

    append: function() {
        var self = this,
            cfg = self.dialog.getCfg(),
            to = cfg.render.appendTo || window.document.body;

        if (!self.enabled) {
            return;
        }

        if (!self.node) {
            self.render();
        }

        to.appendChild(self.node);
    },

    animate: function(type, e) {
        var self = this,
            node = self.node,
            a;

        a = type == "show" ? self.animateShow : self.animateHide;

        if (isFunction(a)) {
            a   = a(self, e);
        }

        if (isBool(a)) {
            a = type;
        }
        else if (isString(a)) {
            a = [a];
        }

        return animate(node, a, function(){
            if (type == "show") {

                var p = new Promise;

                raf(function(){
                    node.style.display = "";
                    p.resolve();
                });

                return p;
            }
        }, false);
    },

    onClick: function(e) {
        if (this.modal) {
            e = normalizeEvent(e);
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        return null;
    },

    destroy: function() {

        var self = this;
        self.remove();

    }
});



defineClass({
    $class: "$dialog.Manager",
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

















var Dialog = (function(){

    var manager = factory("$dialog.Manager");

    var defaultEventProcessor = function(dlg, e, type, returnMode){
        if (type == "show" || !returnMode) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };

    /*
     * Shorthands
     */

    var fixShorthand = function(options, level1, level2, type) {
        var value   = options[level1],
            yes     = false;

        if (value === undf) {
            return;
        }

        switch (type) {
            case "string": {
                yes     = isString(value);
                break;
            }
            case "function": {
                yes     = isFunction(value);
                break;
            }
            case "number": {
                yes     = isNumber(value) || value == parseInt(value);
                break;
            }
            case "dom": {
                yes     = value && (value.tagName || value.nodeName) ? true : false;
                break;
            }
            case "jquery": {
                yes     = value && value.jquery ? true : false;
                if (yes) {
                    value = value.get(0);
                }
                break;
            }
            case "boolean": {
                if (value === true || value === false) {
                    yes = true;
                }
                break;
            }
            default: {
                if (type === true && value === true) {
                    yes = true;
                }
                if (type === false && value === false) {
                    yes = true;
                }
            }
        }
        if (yes) {
            options[level1] = {};
            options[level1][level2] = value;
        }
    };

    var fixShorthands   = function(options) {

        if (!options) {
            return {};
        }

        fixShorthand(options, "content", "value", "string");
        fixShorthand(options, "content", "value", "boolean");
        fixShorthand(options, "content", "fn", "function");
        fixShorthand(options, "ajax", "url", "string");
        fixShorthand(options, "cls", "dialog", "string");
        fixShorthand(options, "render", "tpl", "string");
        fixShorthand(options, "render", "fn", "function");
        fixShorthand(options, "render", "el", "dom");
        fixShorthand(options, "render", "el", "jquery");
        fixShorthand(options, "show", "events", false);
        fixShorthand(options, "show", "events", "string");
        fixShorthand(options, "hide", "events", false);
        fixShorthand(options, "hide", "events", "string");
        fixShorthand(options, "toggle", "events", false);
        fixShorthand(options, "toggle", "events", "string");
        fixShorthand(options, "position", "type", "string");
        fixShorthand(options, "position", "type", false);
        fixShorthand(options, "position", "get", "function");
        fixShorthand(options, "overlay", "enabled", "boolean");
        fixShorthand(options, "pointer", "position", "string");
        fixShorthand(options, "pointer", "size", "number");

        return options;
    };


    /**
     * @type {object}
     * @md-tmp defaults
     * @md-stack add
     */
    var defaults    = {

        /**
         * Target element(s) which trigger dialog's show and hide.<br>
         * If {Element}: will be used as a single target,<br>
         * if selector: will be used as dynamic target.<br>
         * Dynamic targets work like this:<br>
         * you provide delegates: {someElem: {click: someClass}} -- see "show" function<br>
         * when show() is called, target will be determined from the event using
         * the selector.
         * @type {string|Element}
         */
        target:         null,

        /**
         * One or more group names.
         * @type {string|array}
         */
        group:          null,

        /**
         * If dialog is modal, overlay will be forcefully enabled.
         * @type {bool}
         */
        modal:			false,

        /**
         * Use link's href attribute as ajax.url or as render.el
         * @type {bool}
         */
        useHref:        false,


        /**
         * If neither content value nor ajax url are provided,
         * plugin will try to read target's attribute values: 'tooltip', 'title' and 'alt'.
         * (unless attr is specified).<br>
         * <em>shorthand</em>: string -> content.value<br>
         * <em>shorthand</em>: false -> content.value<br>
         * <em>shorthand</em>: function -> content.fn<br>
         * @type {object|string|function}
         * @md-stack add
         */
        content: {

            /**
             * Dialog's text content. Has priority before readContent/loadContent.
             * If set to false, no content will be automatically set whether via fn() or attributes.
             * @type {string|boolean}
             */
            value: 			'',

            /**
             * Must return content value
             * @function
             * @param {Element} target
             * @param {MetaphorJs.lib.Dialog} dialog
             * @returns string
             */
            fn:				null,

            /**
             * This function receives new content and returns string value (processed content).
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {string} mode
             *      empty string - content has come from content.value or setContent()<br>
             *      'attribute' - content has been read from target attributes<br>
             *      'ajax' - data returned by ajax request
             *      @default '' | 'attribute' | 'ajax'
             *
             * @param {string} content
             * @returns string
             */
            prepare:		null,

            /**
             * Get content from this attribute (belongs to target)
             * @type {string}
             * @md-stack remove
             */
            attr:           null
        },


        /**
         * All these options are passed to $.ajax().
         * You can provide more options in this section
         * but 'success' will be overriden (use content.prepare for data processing).<br>
         * <em>shorthand</em>: string -> ajax.url
         * @type {string|object}
         * @md-stack add
         */
        ajax: {

            /**
             * Url to load content from.
             * @type {string}
             */
            url: 			null,

            /**
             * Pass this data along with xhr.
             * @type {object}
             */
            data: 			null,

            /**
             * @type {string}
             */
            dataType: 		'text',

            /**
             * @type {string}
             * @md-stack remove
             */
            method: 		'GET'
        },

        /**
         * Classes to apply to the dialog.
         * <em>shorthand</em>: string -> cls.dialog
         * @type {string|object}
         * @md-stack add
         */
        cls: {
            /**
             * Base class.
             * @type {string}
             */
            dialog:         null,
            /**
             * Only applied when dialog is visible.
             * @type {string}
             */
            visible:        null,
            /**
             * Only applied when dialog is hidden.
             * @type {string}
             */
            hidden:         null,
            /**
             * Only applied when dialog is performing ajax request.
             * @type {string}
             * @md-stack remove
             */
            loading:        null
        },

        /**
         * <p>Selector is used when dialog has inner structure and you
         * want to change its content.</p>
         * <pre><code class="language-javascript">
         * {
         *      render: {
         *          tpl: '&lt;div&gt;&lt;div class=&quot;content&quot;&gt;&lt;/div&gt;&lt;/div&gt;'
         *      },
         *      selector: {
         *          content: '.content'
         *      }
         * }
         * </code></pre>
         * <p>If no selector provided, setContent will replace all inner html.
         * Another thing relates to structurally complex content:</p>
         *
         * <pre><code class="language-javascript">
         * setContent({title: "...", body: "..."});
         * selector: {
         *      title:  ".title",
         *      body:   ".body"
         * }
         * </code></pre>
         * @type {object}
         * @md-stack add
         */
        selector:           {
            /**
             * Dialog's content selector.
             * @type {string}
             * @md-stack remove
             */
            content:        null
        },

        /**
         * Object {buttonId: selector}
         * @type {object|null}
         */
        buttons: null,


        /**
         * <p><em>shorthand</em>: string -> render.tpl<br>
         * <em>shorthand</em>: function -> render.fn<br>
         * <em>shorthand</em>: dom element -> render.el<br>
         * @type {object|string|function|Element}
         * @md-stack add
         */
        render: {
            /**
             * Dialog's template
             * @type {string}
             */
            tpl: 			'<div></div>',

            /**
             * Call this function to get dialog's template.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @returns {string|Element}
             */
            fn: 			null,

            /**
             * Selector or existing element instead of template.
             * @type {string|Element}
             */
            el: 			null,

            /**
             * Apply this zIndex.
             * @type {number}
             */
            zIndex:			null,

            /**
             * false - render immediately, true - wait for the first event.
             * @type {bool}
             */
            lazy: 			true,

            /**
             * Object to pass to elem.css()
             * @type {object}
             */
            style:          null,

            /**
             * If set, the element will be appended to specified container.<br>
             * If set to false, element will not be appended anywhere (works with "el").
             * @type {string|Element|bool}
             */
            appendTo:		null,

            /**
             * Dialog's id attribute.
             * @type {string}
             */
            id:				null,

            /**
             * If set to true, element's show() and hide() will never be called. Use
             * "visible" and "hidden" classes instead.
             * @type {boolean}
             */
            keepVisible:    false,

            /**
             * When destroying dialog's elem, keep it in DOM.
             * Useful when you return it in fn() on every show()
             * and have lifetime = 0.
             * @type {boolean}
             */
            keepInDOM:      false,

            /**
             * Number of ms for the rendered object to live
             * after its been hidden. 0 to destroy elem immediately.
             * @type {number}
             * @md-stack remove
             */
            lifetime:       null
        },

        /**
         * Event actions.
         * @type {object}
         * @md-stack add
         */
        events: {

            /**
             * @type {object}
             * @md-stack add
             */
            show: {

                /**
                 * You can also add any event you use to show/hide dialog.
                 * @type {object}
                 * @md-stack add
                 */
                "*": {

                    /**
                     * @type {function}
                     * @md-stack remove 2
                     */
                    process: defaultEventProcessor
                }
            },

            /**
             * @type {object}
             * @md-stack add
             */
            hide: {

                /**
                 * You can also add any event you use to show/hide dialog.
                 * @type {object}
                 * @md-stack add
                 */
                "*": {

                    /**
                     * Must return "returnValue" which will be in its turn
                     * returned from event handler. If you provide this function
                     * preventDefault and stopPropagation options are ignored.
                     * @function
                     * @param {Dialog} dialog
                     * @param {Event} event
                     * @md-stack remove 3
                     */
                    process: defaultEventProcessor
                }
            }
        },

        /**
         * <p><em>shorthand</em>: false -> show.events<br>
         * <em>shorthand</em>: string -> show.events._target</p>
         * @type {string|bool|object}
         * @md-stack add
         */
        show: {
            /**
             * Delay dialog's appearance. Milliseconds.
             * @type {number}
             */
            delay: 			null,

            /**
             * True to hide all other tooltips.
             * If "group" specified, will hide only
             * those dialogs that belong to that group.
             * @type {bool}
             */
            single:			false,

            /**
             * Works for show, hide and toggle
             * <pre><code class="language-javascript">
             * events: false // disable all
             *
             * events: eventName || [eventName, eventName, ...]
             * // same as events: {"_target": ...}
             *
             * events: {
             *  "body":         eventName || [eventName, eventName, ...],
             *  "_self":        same, // dialog itself
             *  "_target":      same, // target element
             *  "_document":    same,
             *  "_window":      same,
             *  "_html":        same,
             *  "_overlay":     same, // overlay element (works with hiding)
             *  ">.selector":   same // selector inside dialog
             * }
             *
             * events: {
             *  "(body|_self|_target|...)": {
             *      eventName: ".selector"
             *  }
             *  // $("body|_self|_target|...").delegate(".selector", eventName)
             *  // this one is for dynamic targets
             * }
             * </code></pre>
             * @type {string|bool|object}
             */
            events:			null,

            /**
             * <p>true -- ["mjs-show"] or ["mjs-hide"]<br>
             * string -- class name -> [class]<br>
             * array -- [{properties before}, {properties after}]<br>
             * array -- [class, class]<br>
             * object --
             * .fn -- string: "fadeIn", "fadeOut", etc. (optional) requires jQuery<br>
             * .fn -- function(Element, completeCallback)
             * .stages -- [class, class] (optional)
             * .before -- {} apply css properties before animation (optional)
             * .after -- {} animate these properties (optional) requires jQuery
             * .options - {} jQuery's .animate() options
             * .context -- fn's this object
             * .duration -- used when .fn is string
             * .skipDisplayChange -- do not set style.display = "" on start
             * function(){}<br>
             * function must return any of the above:</p>
             * <pre><code class="language-javascript">
             * animate: function(dlg, e) {
             *      return {
             *          before: {
             *             width: '200px'
             *          },
             *          after: {
             *              width: '400px'
             *          },
             *          options: {
             *             step: function() {
             *               dlg.reposition();
             *             }
             *          }
             *      };
             * }
             * </code></pre>
             * @type {bool|string|array|function}
             */
            animate:		false,

            /**
             * Ignore {show: {single: true}} on other dialogs.
             * @type {bool}
             */
            ignoreHideAll:	false,

            /**
             * true - automatically set focus on input fields on buttons;
             * string - selector
             * @type {bool|string}
             */
            focus:          false,

            /**
             * Prevent scrolling
             * true = "body"
             * @type {bool|string|Element}
             */
            preventScroll:  false,

            /**
             * When showing, set css display to this value
             * @type {string}
             * @md-stack remove
             */
            display: "block"
        },


        /**
         * <p><em>shorthand</em>: false -> hide.events<br>
         * <em>shorthand</em>: string -> hide.events._target</p>
         * @type {bool|string|object}
         * @md-stack add
         */
        hide: {
            /**
             * Milliseconds. Delay hiding for this amount of time.
             * @type {number}
             */
            delay:			null,

            /**
             * Milliseconds. Dialog will be shown no longer than for that time.
             * @type {number}
             */
            timeout: 		null,

            /**
             * See show.events
             * @type {string|bool|object}
             */
            events: 		null,

            /**
             * Destroy dialog after hide.
             * @type {bool}
             */
            destroy:        false,

            /**
             * Remove element from DOM after hide
             * @type {bool}
             */
            remove:         false,

            /**
             * See show.animate
             * @type {bool|string|array|function}
             */
            animate:		false,

            /**
             * true: hide anyway even if showing is delayed,<br>
             * false: ignore hide events until tooltip is shown.
             * @type {bool}
             * @md-stack remove
             */
            cancelShowDelay:true
        },

        /**
         * This option is required when you want to show and hide on the same event.<br>
         * <em>shorthand</em>: false -> toggle.events<br>
         * <em>shorthand</em>: string -> toggle.events._target
         * @type {bool|string|object}
         * @md-stack add
         */
        toggle: {
            /**
             * See show.events
             * @type {string|bool|object}
             * @md-stack remove
             */
            events: 		null
        },

        /**
         * <p><em>shorthand</em>: false -> position.type<br>
         * <em>shorthand</em>: string -> position.type<br>
         * <em>shorthand</em>: function -> position.get
         * @type {bool|string|function|object}
         * @md-stack add
         */
        position: {

            /**
             * false -- do not apply position<br>
             * function(api) - must return one of the following:<br>
             * "auto" - detect position automatically<br>
             *
             * <b>relative to target:</b><br>
             * t | r | b | l -- simple positions aligned by center<br>
             * tr | rt | rb | br | bl | lb | lt | tl -- aligned by side<br>
             * trc | brc | blc | tlc -- corner positions<br>
             *
             * <b>relative to mouse:</b><br>
             * m -- works only with get(). get() function will be called on mousemove<br>
             * mt | mr | mb | ml -- following the mouse, aligned by center<br>
             * mrt | mrb | mlb | mlt -- following the mouse, corner positions<br>
             *
             * <b>window positions:</b><br>
             * wc | wt | wr | wb | wl<br>
             * wrt | wrb | wlt | wlb
             *
             * Defaults to 't'
             * @type {bool|string}
             */
            type:			't',

            /**
             * @type {string}
             */
            preferredType:  null,

            /**
             * Add this offset to dialog's x position
             * @type {number}
             */
            offsetX: 		0,

            /**
             * Add this offset to dialog's y position
             * @type {number}
             */
            offsetY:		0,

            /**
             * Follow the mouse only by this axis;
             * second coordinate will be relative to target
             * @type {string}
             */
            axis: 			null,

            /**
             * Overrides position.type<br>
             * If this function is provided, offsets are not applied.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {Event} event
             * @returns {object} {
             *      @type {number} x If object contains only one coordinate - x or y -
             *                       the other one will not be updated.
             *      @type {number} y
             *      @type {number} top If object does not contain x and y, it will be applied
             *                          as is.
             *      @type {number} right
             *      @type {number} bottom
             *      @type {number} left
             * }
             */
            get:			null,

            /**
             * Prevent from rendering off the screen.<br>
             * Set to maximum distance between tooltip and window edge.
             * @type {number|bool}
             */
            screenX:		false,

            /**
             * Prevent from rendering off the screen.<br>
             * Set to maximum distance between tooltip and window edge.
             * @type {number|bool}
             */
            screenY:		false,

            /**
             * Calculate position relative to this element (defaults to window)
             * @type {string|Element}
             */
            base:           null,

            /**
             * Monitor window/selector/element scroll.
             * @type {bool|string|Element}
             */
            scroll:         false,

            /**
             * Monitor window resize.
             * @type {bool}
             * @md-stack remove
             */
            resize:         true
        },

        /**
         * Pointer will only work if size > 0 or el is not null<br>
         * <em>shorthand</em>: string -> pointer.position<br>
         * <em>shorthand</em>: number -> pointer.size
         * @type {object|string|number}
         * @md-stack add
         */
        pointer: {

            /**
             * t / r / b / l<br>
             * tr / lt / lb / br / bl / lb / lt<br>
             * null - opposite to dialog's position
             * @type {string}
             */
            position: 		null,

            /**
             * t / r / b / l<br>
             * null - opposite to primary position
             * @type {string}
             */
            direction: 		null,

            /**
             * Number of pixels (triangle's height)
             * @type {number}
             */
            size: 			0,

            /**
             * Number of pixels (triangle's width), by default equals to size.
             * @type {number}
             */
            width:			null,

            /**
             * '#xxxxxx'
             * @type {string}
             */
            color: 			null,

            /**
             * Shift pointer's position by this number of pixels.
             * Shift direction will depend on position:<br>
             * t / tl / b / bl - right shift<br>
             * tr / br - left shift<br>
             * r / l / rt / lt - top shift<br>
             * rb / lb - bottom shift
             * @type {number}
             */
            offset: 		0,

            /**
             * Number of pixels.
             * @type {number}
             */
            border:			0,

            /**
             * '#xxxxxx'
             * @type {string}
             */
            borderColor:	null,

            /**
             * Custom pointer.<br>
             * If you provide custom pointer el,
             * border, direction and color will not be applied.<br>
             * pointer.cls will be applied.
             * @type {string|Element}
             */
            el:             null,

            /**
             * Apply this class to pointer.
             * @type {string}
             */
            cls:            null,

            /**
             * Apply this class to pointerBorder element.
             * @type {string}
             * @md-stack remove
             */
            borderCls:      null
        },

        /**
         * <p><em>shorthand</em>: boolean -> overlay.enabled<br></p>
         * @type {bool|object}
         * @md-stack add
         */
        overlay:			{

            /**
             * Enable overlay.
             * @type {bool}
             */
            enabled:		false,

            /**
             * @type {string}
             */
            color:			'#000',

            /**
             * @type {number}
             */
            opacity:		.5,

            /**
             * @type {string}
             */
            cls:			null,

            /**
             * Same animation rules as in show.animate.
             * @type {bool}
             */
            animateShow:	false,

            /**
             * Same animation rules as in show.animate.
             * @type {bool}
             * @md-stack remove
             */
            animateHide:	false
        },

        /**
         * Callbacks are case insensitive.<br>
         * You can use camel case if you like.
         * @type {object}
         * @md-stack add
         */
        callback: {

            /**
             * 'this' object for all callbacks, including render.fn, position.get, etc.
             * @type {object}
             */
            scope:				null,

            /**
             * When content has changed.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {string} content
             */
            contentchange:	 	null,

            /**
             * Before dialog appeared.<br>
             * Return false to cancel showing.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {Event} event
             */
            beforeshow: 		null,

            /**
             * Immediately after dialog appeared.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {Event} event
             */
            show: 				null,

            /**
             * Before dialog disappears.<br>
             * Return false to cancel hiding.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {Event} event
             */
            beforehide: 		null,

            /**
             * Immediately after dialog has been hidden.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {Event} event
             */
            hide: 				null,

            /**
             * After dialog has been rendered.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             */
            render: 			null,

            /**
             * After dialog's html element has been removed.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             */
            lifetime:           null,

            /**
             * Called when dynamic target changes (on hide it always changes to null).
             * Also called from setTarget().
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {Element} newTarget
             * @param {Element|null} prevTarget
             */
            targetchange:       null,

            /**
             * One handler for all configured buttons. Called on click, enter and space.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {string} buttonId
             * @param {Event} event
             * @md-stack finish
             */
            button:             null
        }

    };




    var Dialog = defineClass({

        $class:             "Dialog",
        $mixins:            [ObservableMixin],

        id:                 null,
        node:               null,
        overlay:            null,
        pointer:            null,
        cfg:                null,
        position:           null,

        target:             null,
        dynamicTarget:      false,
        dynamicTargetEl:    null,

        visible:            false,
        enabled:            true,
        frozen:             false,
        rendered:           false,

        bindSelfOnRender:   false,

        hideTimeout:        null,
        hideDelay:          null,
        showDelay:          null,
        destroyDelay:       null,

        images:             0,

        positionGetType:    null,
        positionClass:      null,
        positionAttempt:    0,

        $init: function(cfg) {

            cfg = cfg || {};
            var preset  = cfg.preset,
                self    = this;

            cfg.preset  = null;
            cfg         = extend({}, defaults,
                                fixShorthands(Dialog.defaults),
                                fixShorthands(Dialog[preset]),
                                fixShorthands(cfg),
                                    true, true);

            self.cfg    = cfg;
            self.id     = nextUid();

            self.onPreventScrollDelegate = bind(self.onPreventScroll, self);
            self.onButtonClickDelegate = bind(self.onButtonClick, self);
            self.onButtonKeyupDelegate = bind(self.onButtonKeyup, self);
            self.showDelegate = bind(self.show, self);
            self.hideDelegate = bind(self.hide, self);
            self.toggleDelegate = bind(self.toggle, self);
            self.onImageLoadDelegate = bind(self.onImageLoad, self);

            manager.register(self);

            if (cfg.modal) {
                cfg.overlay.enabled = true;
            }
            self.overlay    = factory("$dialog.Overlay", self);

            var pointerCls = ucfirst(cfg.pointer.$class || "Html");
            self.pointer    = factory("$dialog.pointer." + pointerCls, self, cfg.pointer);

            if (isFunction(cfg.position.type)) {
                self.positionGetType = cfg.position.type;
            }

            self.setTarget(cfg.target);

            if (cfg.target && cfg.useHref) {
                var href = getAttr(self.getTarget(), "href");
                if (href.substr(0, 1) == "#") {
                    cfg.render.el = href;
                }
                else {
                    cfg.ajax.url = href;
                }
            }

            if (!cfg.render.lazy) {
                self.render();
            }

            self.trigger("init", self);
            self.setHandlers("bind");
        },


        /* **** General api **** */


        /**
         * @returns {Element}
         */
        getElem: function() {
            return this.node;
        },

        /**
         * @returns {string}
         */
        getInstanceId: function() {
            return this.id;
        },

        /**
         * Get dialog's config.
         * @access public
         * @return {object}
         */
        getCfg: function() {
            return this.cfg;
        },

        /**
         * Get dialog's pointer object
         * @returns {$dialog.pointer.Abstract}
         */
        getPointer: function() {
            return this.pointer;
        },


        /**
         * Get dialog's overlay object
         * @returns {$dialog.Overlay}
         */
        getOverlay: function() {
            return this.overlay;
        },


        /**
         * @access public
         * @return {boolean}
         */
        isEnabled: function() {
            return this.enabled;
        },

        /**
         * @access public
         * @return {boolean}
         */
        isVisible: function() {
            return this.visible;
        },

        /**
         * @access public
         * @returns {boolean}
         */
        isHideAllIgnored: function() {
            return this.cfg.show.ignoreHideAll;
        },

        /**
         * @access public
         * @return {boolean}
         */
        isFrozen: function() {
            return this.frozen;
        },

        /**
         * @returns {boolean}
         */
        isRendered: function() {
            return this.rendered;
        },

        /**
         * Enable dialog
         * @access public
         * @method
         */
        enable: function() {
            this.enabled = true;
        },

        /**
         * Disable dialog
         * @access public
         * @method
         */
        disable: function() {
            this.hide();
            this.enabled = false;
        },

        /**
         * The difference between freeze and disable is that
         * disable always hides dialog and freeze makes current
         * state permanent (if it was shown, it will stay shown
         * until unfreeze() is called).
         * @access public
         * @method
         */
        freeze: function() {
            this.frozen   = true;
        },

        /**
         * Unfreeze dialog
         * @access public
         * @method
         */
        unfreeze: function() {
            this.frozen   = false;
        },

        /**
         * Get groups.
         * @access public
         * @return {[]}
         */
        getGroup: function() {
            var cfg = this.cfg;
            if (!cfg.group) {
                return [""];
            }
            else {
                return isString(cfg.group) ?
                       [cfg.group] : cfg.group;
            }
        },

        /**
         * Show/hide
         * @access public
         * @param {Event} e Optional
         * @param {bool} immediately Optional
         */
        toggle: function(e, immediately) {

            var self = this;

            // if switching between dynamic targets
            // we need not to hide tooltip
            if (e && e.stopPropagation && self.dynamicTarget) {

                if (self.visible && self.isDynamicTargetChanged(e)) {
                    return self.show(e);
                }
            }

            return self[self.visible ? 'hide' : 'show'](e, immediately);
        },


        /* **** Events **** */

        resetHandlers: function(fn, context) {

            var self = this;
            self.setHandlers("unbind");
            self.bindSelfOnRender = false;

            if (fn) {
                fn.call(context, self, self.getCfg());
            }

            self.setHandlers("bind");
        },

        setHandlers: function(mode, only) {

            var self    = this,
                cfg     = self.cfg,
                fns     = ["show", "hide", "toggle"],
                lfn     = mode == "bind" ? addListener : removeListener,
                dfn     = mode == "bind" ? delegate : undelegate,
                fn,
                fnCfg,
                selector,
                e, i, len,
                evs, el,
                j, jl;

            while (fn = fns.shift()) {

                fnCfg   = cfg[fn].events;

                if (fnCfg === false) {
                    continue;
                }

                if (isString(fnCfg) || isArray(fnCfg)) {
                    if (self.dynamicTarget) {
                        var tmp     = {};
                        tmp[fnCfg]  = cfg.target;
                        fnCfg       = {
                            "_html": tmp
                        }
                    }
                    else {
                        fnCfg   = {"_target": fnCfg};
                    }
                }

                for (selector in fnCfg) {

                    if (only) {
                        if (only == '_self') {
                            if (selector != '_self' && selector != "_overlay" && selector.substr(0,1) != '>') {
                                continue;
                            }
                        }
                        else if (selector != only) {
                            continue;
                        }
                    }

                    if ((selector == '_self' || selector == '_overlay' || selector.substr(0,1) == '>')
                        && !self.node) {

                        self.bindSelfOnRender = true;
                        continue;
                    }

                    evs         = fnCfg[selector];

                    if (!evs) {
                        continue;
                    }

                    switch (selector) {
                        case "_target":
                            el  = [self.getTarget()];
                            break;

                        case "_self":
                            el  = [self.node];
                            break;

                        case "_window":
                            el  = [window];
                            break;

                        case "_document":
                            el  = [window.document];
                            break;

                        case "_html":
                            el  = [window.document.documentElement];
                            break;

                        case "_overlay":
                            el  = [self.overlay.getElem()];
                            break;

                        default:
                            el  = selector.substr(0,1) == '>' ?
                                  select(selector.substr(1), self.node) :
                                  select(selector);

                    }

                    if (!el || !el.length) {
                        continue;
                    }

                    if (isString(evs)) {
                        evs     = [evs];
                    }

                    if (isArray(evs)) {
                        for (i = 0, len = evs.length; i < len; i++) {
                            for (j = -1, jl = el.length; ++j < jl; lfn(el[j], evs[i], self[fn+"Delegate"])){}
                        }
                    }
                    else {
                        for (e in evs) {
                            for (j = -1, jl = el.length; ++j < jl; dfn(el[j], evs[e], e, self[fn+"Delegate"])){}
                        }
                    }
                }
            }
        },




        onPreventScroll: function(e) {
            normalizeEvent(e).preventDefault();
        },

        onButtonClick: function(e) {

            var target  = normalizeEvent(e).target,
                btnId   = data(target, "metaphorjsTooltip-button-id");

            if (btnId) {
                this.trigger("button", this, btnId, e);
            }
        },

        onButtonKeyup: function(e) {
            if (e.keyCode == 13 || e.keyCode == 32) {
                var target  = e.target,
                    btnId   = data(target, "metaphorjsTooltip-button-id");

                if (btnId) {
                    this.trigger("button", this, btnId, normalizeEvent(e));
                }
            }
        },


        /* **** Show **** */

        /**
         * Show dialog
         * @access public
         * @param {Event} e Optional. True to skip delay.
         * @param {bool} immediately Optional
         */
        show: function(e, immediately) {

            // if called as an event handler, we do not return api
            var self        = this,
                cfg         = self.cfg,
                returnValue	= null,
                scfg        = cfg.show,
                returnMode  = null;

            // if tooltip is disabled, we do not stop propagation and do not return false.s
            if (!self.isEnabled()) {
                returnMode = "disabled";
            }

            // if tooltip is already shown
            // and hide timeout was set.
            // we need to restart timer
            if (!returnMode && self.visible && self.hideTimeout) {

                window.clearTimeout(self.hideTimeout);
                self.hideTimeout = async(self.hide, self, null, cfg.hide.timeout);

                returnMode = "hidetimeout";
            }

            // if tooltip was delayed to hide
            // we cancel it.
            if (!returnMode && self.hideDelay) {

                window.clearTimeout(self.hideDelay);
                self.hideDelay     = null;
                self.visible       = true;

                returnMode = "hidedelay";
            }


            // various checks: tooltip should be enabled,
            // should not be already shown, it should
            // have some content, or empty content is allowed.
            // also if beforeShow() returns false, we can't proceed
            // if tooltip was frozen, we do not show or hide
            if (!returnMode && self.frozen) {
                returnMode = "frozen";
            }

            // cancel delayed destroy
            // so that we don't have to re-render dialog
            if (self.destroyDelay) {
                window.clearTimeout(self.destroyDelay);
                self.destroyDelay = null;
            }


            var dtChanged   = false;

            // if we have a dynamicTarget
            if (e && e.stopPropagation && self.dynamicTarget) {
                dtChanged = self.changeDynamicTarget(e);
            }

            if (self.visible) {
                if (!dtChanged) {
                    returnMode = returnMode || "visible";
                }
                else {
                    self.reposition(e);
                    returnMode = "reposition";
                }
            }

            if (!returnMode || dtChanged) {
                // if tooltip is not rendered yet we render it
                if (!self.node) {
                    self.render();
                }
                else if (dtChanged) {
                    self.changeDynamicContent();
                }
            }


            // if beforeShow callback returns false we stop.
            if (!returnMode && self.trigger('before-show', self, e) === false) {
                returnMode = "beforeshow";
            }

            if (e && e.stopPropagation && cfg.events.show && (cfg.events.show[e.type] || cfg.events.show['*'])) {
                var et = cfg.events.show[e.type] || cfg.events.show["*"];

                if (et.process) {
                    returnValue	= et.process(self, e, "show", returnMode);
                }
                else {
                    et.stopPropagation && e.stopPropagation();
                    et.preventDefault && e.preventDefault();
                    returnValue = et.returnValue;
                }
            }

            if (returnMode) {
                return returnMode;
            }

            // first, we stop all current animations
            stopAnimation(self.node);

            // as of this moment we mark dialog as visible so that hide() were able
            // to work. also, all next steps should check for this state
            // in case if tooltip case hidden back during the process
            self.visible = true;

            if (scfg.single) {
                manager.hideAll(self);
            }

            self.toggleTitleAttribute(false);

            if (scfg.delay && !immediately) {
                self.showDelay = async(self.showAfterDelay, self, [e], scfg.delay);
            }
            else {
                self.showAfterDelay(e, immediately);
            }

            return returnValue;
        },


        showAfterDelay: function(e, immediately) {

            var self = this,
                cfg = self.cfg;

            self.showDelay = null;

            // if tooltip was already hidden, we can't proceed
            if (!self.visible) {
                return;
            }

            self.trigger('show-after-delay', self, e);

            if (cfg.hide.remove) {
                self.appendElem();
            }

            self.reposition(e);


            if (cfg.show.preventScroll) {
                var ps = cfg.show.preventScroll,
                    i, l;
                if (ps === true) {
                    ps = "body";
                }
                ps = select(ps);
                for (i = -1, l = ps.length; ++i < l;
                     addListener(ps[i], "mousewheel", self.onPreventScrollDelegate) &&
                     addListener(ps[i], "touchmove", self.onPreventScrollDelegate)
                ){}
            }

            self.overlay.show();

            if (cfg.show.animate && !immediately) {
                self.animate("show").done(function() {
                    self.showAfterAnimation(e);
                });
            }
            else {
                raf(function(){
                    self.showAfterAnimation(e);
                });
            }
        },

        showAfterAnimation: function(e) {

            var self = this,
                cfg = self.cfg,
                node = self.node;

            // if tooltip was already hidden, we can't proceed
            if (!self.visible) {
                return;
            }

            // now we can finally show the dialog (if it wasn't shown already
            // during the animation
            removeClass(node, cfg.cls.hidden);
            addClass(node, cfg.cls.visible);

            if (!cfg.render.keepVisible) {
                node.style.display = cfg.show.display || "block";
            }


            // if it has to be shown only for a limited amount of time,
            // we set timeout.
            if (cfg.hide.timeout) {
                self.hideTimeout = async(self.hide, self, null, cfg.hide.timeout);
            }

            if (cfg.show.focus) {
                async(self.setFocus, self, null, 20);
            }

            self.trigger('show', self, e);
        },





        /* **** Hide **** */


        /**
         * Hide dialog
         * @access public
         * @param {Event} e Optional.
         * @param {bool} immediately Optional. True to skip delay.
         * @param {bool} cancelShowDelay Optional. If showing already started but was delayed -
         * cancel that delay.
         */
        hide: function(e, immediately, cancelShowDelay) {

            var self            = this,
                returnValue	    = null,
                returnMode      = null,
                cfg             = self.cfg;

            self.hideTimeout    = null;

            // if the timer was set to hide the tooltip
            // but then we needed to close tooltip immediately
            if (!self.visible && self.hideDelay && immediately) {
                window.clearTimeout(self.hideDelay);
                self.hideDelay     = null;
                self.visible       = true;
            }

            // various checks
            if (!self.node || !self.visible || !self.isEnabled()) {
                returnMode = !self.node ? "noelem" : (!self.visible ? "hidden" : "disabled");
            }

            // if tooltip is still waiting to be shown after delay timeout,
            // we cancel this timeout and return.
            if (self.showDelay && !returnMode) {

                if (cfg.hide.cancelShowDelay || cancelShowDelay) {
                    window.clearTimeout(self.showDelay);
                    self.showDelay     = null;
                    self.visible       = false;

                    returnMode = "cancel";
                }
                else {
                    returnMode = "delay";
                }
            }

            // if tooltip was frozen, we do not show or hide
            if (self.frozen && !returnMode) {
                returnMode = "frozen";
            }

            // lets see what the callback will tell us
            if (!returnMode && self.trigger('before-hide', self, e) === false) {
                returnMode = "beforehide";
            }


            if (e && e.stopPropagation && cfg.events.hide && (cfg.events.hide[e.type] || cfg.events.hide["*"])) {
                var et = cfg.events.hide[e.type] || cfg.events.hide["*"];

                if (et.process) {
                    returnValue = et.process(self, e, "hide", returnMode);
                }
                else {
                    if (et.stopPropagation) e.stopPropagation();
                    if (et.preventDefault) e.preventDefault();
                    returnValue = et.returnValue;
                }
            }

            if (returnMode) {
                return returnValue;
            }

            // now we can stop all current animations
            stopAnimation(self.node);

            // and change the state
            self.visible = false;

            self.toggleTitleAttribute(true);

            if (self.dynamicTarget) {
                self.resetDynamicTarget();
            }

            if (cfg.hide.delay && !immediately) {
                self.hideDelay = async(self.hideAfterDelay, self, [e], cfg.hide.delay);
            }
            else {
                self.hideAfterDelay(e, immediately);
            }

            return returnValue;
        },


        hideAfterDelay: function(e, immediately) {

            var self = this,
                cfg = self.cfg;

            self.hideDelay = null;

            if (self.visible) {
                return;
            }

            self.trigger('hide-after-delay', self, e);


            if (cfg.show.preventScroll) {
                var ps = cfg.show.preventScroll,
                    i, l;
                if (ps === true) {
                    ps = "body";
                }
                ps = select(ps);
                for (i = -1, l = ps.length; ++i < l;
                     removeListener(ps[i], "mousewheel", self.onPreventScrollDelegate) &&
                     removeListener(ps[i], "touchmove", self.onPreventScrollDelegate)
                ){}
            }

            self.overlay.hide();

            if (cfg.hide.animate && !immediately) {
                self.animate("hide").done(function() {
                    self.hideAfterAnimation(e);
                });
            }
            else {
                raf(function(){
                    self.hideAfterAnimation(e);
                });
            }
        },

        hideAfterAnimation: function(e) {

            var self = this,
                cfg = self.cfg,
                node = self.node;

            // we need to check if the tooltip was returned to visible state
            // while hiding animation
            if (self.visible) {
                return;
            }

            removeClass(node, cfg.cls.visible);
            addClass(node, cfg.cls.hidden);

            if (!cfg.render.keepVisible) {
                node.style.display = "none";
            }

            self.trigger('hide', self, e);

            var lt = cfg.render.lifetime;

            if (lt !== null) {
                if (lt === 0) {
                    self.destroyElem();
                }
                else {
                    self.destroyDelay = async(self.destroyElem, self, null, lt);
                }
            }

            if (node && cfg.hide.destroy) {
                raf(function(){
                    data(node, cfg.instanceName, null);
                    self.destroy();
                });
            }

            if (node && cfg.hide.remove) {
                raf(function(){
                    self.removeElem();
                });
            }
        },



        /* **** Render **** */




        render: function() {

            var self = this,
                cfg = self.cfg,
                elem;

            // if already rendered, we return
            if (self.node) {
                return;
            }


            var rnd	    = cfg.render,
                cls     = cfg.cls;


            // custom rendering function
            if (rnd.fn) {
                var res = rnd.fn.call(self.$$callbackContext, self);
                rnd[isString(res) ? 'tpl' : 'el'] = res;
            }


            if (rnd.el) {
                if (isString(rnd.el)) {
                    elem = select(rnd.el).shift();
                    rnd.keepInDOM = true;
                }
                else {
                    elem = rnd.el;
                }
            }
            else {
                var tmp = window.document.createElement("div");
                tmp.innerHTML = rnd.tpl;
                elem = tmp.firstChild;
            }


            if (!elem) {
                elem = window.document.createElement("div");
            }

            self.node = elem;

            if (rnd.id) {
                setAttr(elem, 'id', rnd.id);
            }

            if (!cfg.render.keepVisible) {
                elem.style.display = "none";
            }

            addClass(elem, cls.dialog);
            addClass(elem, cls.hidden);

            if (rnd.style) {
                setStyle(elem, rnd.style);
            }


            self.overlay.render();


            if (!cfg.hide.remove) {
                self.appendElem();
            }
            else {
                if (elem.parentNode) {
                    elem.parentNode.removeChild(elem);
                }
            }

            if (rnd.zIndex) {
                setStyle(elem, {zIndex: rnd.zIndex});
            }

            var cnt = cfg.content;

            if (cnt.value !== false) {
                if (cnt.value) {
                    self.setContent(cnt.value);
                }
                else {
                    if (cnt.fn) {
                        self.setContent(cnt.fn.call(self.$$callbackContext, self));
                    }
                    else {
                        self[cfg.ajax.url ? 'loadContent' : 'readContent']();
                    }
                }
            }

            self.pointer.render();
            self.pointer.append();

            if (cfg.buttons) {
                var btnId, btn;
                for (btnId in cfg.buttons) {
                    btn = select(cfg.buttons[btnId], elem).shift();
                    if (btn) {
                        data(btn, "metaphorjsTooltip-button-id", btnId);
                        addListener(btn, "click", self.onButtonClickDelegate);
                        addListener(btn, "keyup", self.onButtonKeyupDelegate);
                    }
                }
            }

            if (self.bindSelfOnRender) {
                self.setHandlers('bind', '_self');
                self.bindSelfOnRender = false;
            }

            self.rendered = true;

            self.trigger('render', self);
        },








        /* **** Position **** */

        setPositionType: function(type) {
            var self    = this,
                cls     = self.getPositionClass(type);

            self.cfg.position.type = type;

            if (self.positionClass != cls || !self.position) {
                if (self.position) {
                    self.position.$destroy();
                    self.position = null;
                }
                if (cls) {
                    self.position = factory(cls, self);
                }
            }
            else {
                self.position.type = type;
            }

            if (self.isVisible()) {
                self.reposition();
            }
        },

        getPosition: function(e) {

            var self = this,
                cfgPos = self.cfg.position;

            if (!self.position) {

                if (!self.positionGetType && cfgPos.type != "custom") {
                    if (isFunction(cfgPos.get) && cfgPos.type != "m") {
                        cfgPos.type = "custom";
                    }
                }

                var type    = self.positionGetType ?
                                self.positionGetType.call(self.$$callbackContext, self, e) :
                                cfgPos.type,
                    cls     = self.getPositionClass(type);


                cfgPos.type     = type;

                if (cls === false) {
                    return;
                }

                if (self.positionClass != cls) {
                    self.position   = factory(self.getPositionClass(type), self);
                }
                else {
                    self.position.type = type;
                }
            }

            return self.position;
        },

        getPositionClass: function(type) {

            if (!type) {
                return false;
            }

            if (isFunction(type) || type == "custom") {
                return "$dialog.position.Custom";
            }

            var fc = type.substr(0, 1);

            if (!fc) {
                return false;
            }
            else if (fc == "w") {
                return "$dialog.position.Window";
            }
            else if (fc == "m") {
                return "$dialog.position.Mouse";
            }
            else {
                return "$dialog.position.Target";
            }
        },


        /**
         * Usually called internally from show().
         * @access public
         * @param {Event} e Optional.
         */
        reposition: function(e) {
            var self = this;

            if (self.repositioning) {
                return;
            }

            self.repositioning = true;

            e && (e = normalizeEvent(e));

            self.getPosition(e);
            self.trigger("before-reposition", self, e);
            self.getPosition(e);
            self.trigger("reposition", self, e);

            self.repositioning = false;
        },



        /* **** Target **** */

        /**
         * Get dialog's target.
         * @access public
         * @return {Element}
         */
        getTarget: function() {
            return this.dynamicTarget ? this.dynamicTargetEl : this.target;
        },


        /**
         * Set new dialog's target.
         * @access public
         * @param newTarget Element {
             *     @required
         * }
         */
        setTarget: function(newTarget) {

            if (!newTarget) {
                return;
            }

            var self    = this,
                change  = false,
                prev    = self.target;

            if (self.target) {
                self.setHandlers('unbind', '_target');
                change = true;
            }
            else if (self.dynamicTarget) {
                change = true;
            }

            var isStr = isString(newTarget);

            if (isStr && newTarget.substr(0,1) != "#") {
                self.dynamicTarget = true;
                self.target        = null;
            }
            else {
                if (isStr) {
                    newTarget       = select(newTarget).shift();
                }
                self.dynamicTarget = false;
                self.target        = newTarget;
            }

            if (change) {
                self.setHandlers('bind', '_target');
                self.trigger("target-change", self, newTarget, prev);
            }
        },


        resetDynamicTarget: function() {
            var self = this,
                curr = self.dynamicTargetEl;
            if (curr) {
                self.setHandlers("unbind", "_target");
                self.trigger("target-change", self, null, curr);
            }
        },

        isDynamicTargetChanged: function(e) {

            var self    = this,
                cfg     = self.cfg,
                dt	    = cfg.target,
                t	    = e.target,
                curr    = self.dynamicTargetEl;

            while (t && !is(t, dt)) {
                t   = t.parentNode;
            }

            if (!t) {
                return false;
            }

            return !curr || curr !== t;
        },

        changeDynamicTarget: function(e) {

            var self    = this,
                cfg     = self.cfg,
                dt	    = cfg.target,
                t	    = e.target,
                curr    = self.dynamicTargetEl;

            while (t && !is(t, dt)) {
                t   = t.parentNode;
            }

            if (!t) {
                return false;
            }

            if (!curr || curr !== t) {

                if (curr) {
                    self.setHandlers("unbind", "_target");
                }

                self.dynamicTargetEl = t;

                self.setHandlers("bind", "_target");
                self.trigger("target-change", self, t, curr);
                return true;
            }
            else {
                return false;
            }
        },









        /* **** Content **** */

        /**
         * @access public
         * @return {Element}
         */
        getContentElem: function() {
            var self = this,
                node = self.node;

            if (!node) {
                return null;
            }

            if (self.cfg.selector.content) {
                var el = select(self.cfg.selector.content, node).shift();
                return el || node;
            }
            else {
                return node;
            }
        },


        /**
         * Set new content.
         * @access public
         * @param {string|object} content {
             *      See "selector" option
             *      @required
         * }
         * @param {string} mode "", "attribute", "ajax" -- optional (used internally). See
         * content.prepare option.
         */
        setContent: function(content, mode) {

            mode = mode || '';

            var self    = this,
                node    = self.node,
                cfg     = self.cfg,
                pnt     = self.pointer;

            if (!node) {
                cfg.content.value = content;
                return self;
            }

            if (cfg.content.prepare) {
                content = cfg.content.prepare.call(self.$$callbackContext, self, mode, content);
            }

            var contentElem = self.getContentElem(),
                fixPointer  = self.rendered && !cfg.selector.content && pnt,
                pntEl       = fixPointer && pnt.getElem();

            if (fixPointer && pntEl) {
                try {
                    node.removeChild(pntEl);
                }
                catch (thrownError) {}
            }

            if (!isString(content)) {
                for (var i in content) {
                    var sel     = cfg.selector[i];
                    if (sel) {
                        var cel = select(sel, contentElem).shift();
                        if (cel) {
                            cel.innerHTML = content[i];
                        }
                    }
                }
            }
            else {
                contentElem.innerHTML = content;
            }

            // if there a pointer, and this is not initial content set,
            // and there is no selector for content
            // we must restore pointer after dialog's inner html
            // has been replaced with new content
            if (fixPointer && pntEl) {
                try {
                    node.appendChild(pntEl);
                }
                catch (thrownError){}
            }

            var imgs = select("img", contentElem),
                l;

            self.images = imgs.length;

            for (i = -1, l = imgs.length; ++i < l; addListener(imgs[i], "load", self.onImageLoadDelegate)){}

            self.trigger('content-change', self, content, mode);
            self.onContentChange();
        },

        /**
         * Force dialog to re-read content from attributes.
         * @access public
         * @method
         */
        readContent: function() {

            var self        = this,
                cfg         = self.cfg,
                el 			= self.getTarget(),
                content;

            if (el) {
                if (cfg.content.attr) {
                    content = getAttr(el, cfg.content.attr);
                }
                else {
                    content = getAttr(el, 'tooltip') ||
                              getAttr(el, 'title') ||
                              getAttr(el, 'alt');
                }
            }

            if (content) {
                self.setContent(content, 'attribute');
            }
        },

        /**
         * Load content via ajax.
         * @access public
         * @param {object} options Merged with cfg.ajax
         */
        loadContent: function(options) {

            var self = this,
                cfg = self.cfg;

            addClass(self.node, cfg.cls.loading);
            var opt = extend({}, cfg.ajax, options, true, true);
            self.trigger('before-ajax', self, opt);
            return ajax(opt).done(self.onAjaxLoad, self);
        },

        onAjaxLoad: function(data) {
            var self = this;
            removeClass(self.node, self.cfg.cls.loading);
            self.setContent(data, 'ajax');
        },

        onImageLoad: function() {
            this.images--;
            this.onContentChange();
        },

        onContentChange: function() {
            if (this.visible) {
                this.reposition();
            }
        },

        changeDynamicContent: function() {
            var self = this,
                cfg = self.cfg;
            if (cfg.content.fn) {
                self.setContent(cfg.content.fn.call(self.$$callbackContext, self));
            }
            else if (cfg.content.attr) {
                self.readContent();
            }
        },

        toggleTitleAttribute: function(state) {

            var self = this,
                trg = self.getTarget(),
                title;

            if (trg) {
                if (state === false) {
                    data(trg, "tmp-title", getAttr(trg, "title"));
                    removeAttr(trg, 'title');
                }
                else if (title = data(trg, "tmp-title")) {
                    setAttr(trg, "title", title);
                }
            }
        },

        /* **** Dimension **** */


        getDialogSize: function() {

            var self    = this;

            if (!self.rendered) {
                self.render();
            }

            var cfg     = self.cfg,
                node    = self.node,
                hidden  = cfg.cls.hidden ? hasClass(node, cfg.cls.hidden) : !isVisible(node),
                size,
                left    = node.style.left;

            if (hidden) {
                setStyle(node, {left: "-1000px"});
                node.style.display = cfg.show.display;
            }

            size    = {
                width:      getOuterWidth(node),
                height:     getOuterHeight(node)
            };

            if (hidden) {
                setStyle(node, {left: left});
                node.style.display = "none";
            }

            return size;
        },

        getTargetSize: function() {

            var self    = this,
                target  = self.getTarget();

            if (!target) {
                return null;
            }

            return {
                width:      getOuterWidth(target),
                height:     getOuterHeight(target)
            };
        },


        /* **** Misc **** */


        /**
         * Set focus based on focus setting.
         * @access public
         * @method
         */
        setFocus: function() {

            var self    = this,
                cfg     = self.cfg,
                af      = cfg.show.focus,
                node    = self.node,
                i,
                input;

            if (af === true) {
                input   = select("input", node).concat(select("textarea", node));
                if (input.length > 0) {
                    input[0].focus();
                }
                else if (cfg.buttons) {
                    for (i in cfg.buttons) {
                        var btn = select(cfg.buttons[i], node).shift();
                        btn && btn.focus();
                        break;
                    }
                }
            }
            else {
                var el = select(af, node).shift();
                el && el.focus();
            }
        },

        getScrollEl: function(cfgScroll) {
            if (cfgScroll === true || cfgScroll === false) {
                return window;
            }
            else if (typeof cfgScroll == "string") {
                return select(cfgScroll).shift();
            }
            else {
                return cfgScroll;
            }
        },


        animate: function(section, e) {

            var self = this,
                cfg = self.cfg,
                node = self.node,
                a,
                skipDisplay;

            a 	= cfg[section].animate;

            if (isFunction(a)) {
                a   = a(self, e);
            }

            skipDisplay = a.skipDisplayChange || false;

            if (isBool(a)) {
                a = section;
            }
            else if (isString(a)) {
                a = [a];
            }

            return animate(node, a, function(){
                if (section == "show" && !skipDisplay) {

                    var p = new Promise;

                    raf(function(){
                        node.style.display = cfg.show.display || "block";
                        p.resolve();
                    });

                    return p;
                }
            }, false);
        },

        removeElem: function() {

            var self = this,
                node = self.node;

            self.overlay.remove();

            if (node && node.parentNode) {
                raf(function(){
                    if (!self.visible) {
                        node.parentNode.removeChild(node);
                    }
                });
            }
        },

        appendElem: function() {



            var self    = this,
                cfg     = self.cfg,
                body    = window.document.body,
                rnd	    = cfg.render,
                to      = rnd.appendTo || body;

            self.overlay.append();

            if (self.node) {
                to.appendChild(self.node);
            }
        },


        /* **** Destroy **** */

        destroyElem: function() {

            var self = this,
                node = self.node;

            self.setHandlers("unbind", "_self");
            self.bindSelfOnRender = true;

            self.pointer.remove();
            self.overlay.remove();

            if (node) {
                if (!self.cfg.render.keepInDOM) {
                    node.parentNode.removeChild(node);
                }
                self.node = null;
            }

            self.trigger("lifetime", self);
        },

        /**
         * Destroy dialog.
         * @access public
         * @method
         */
        destroy: function() {

            var self = this;

            self.trigger("destroy", self);

            removeListener(window, "resize", self.onWindowResizeDelegate);
            removeListener(window, "scroll", self.onWindowScrollDelegate);

            self.destroyElem();

            self.overlay.$destroy();
            self.pointer.$destroy();
            self.position.$destroy();

            self.setHandlers("unbind");
        }

    }, {
        defaults: null
    });



    return Dialog;

}());

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
                options.preset          = preset;
                data(el, dataName, new MetaphorJs.Dialog(options));
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


return Dialog;
});

