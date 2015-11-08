'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.defaultAngular1App = defaultAngular1App;
exports.scriptsWillBeLoaded = scriptsWillBeLoaded;
exports.scriptsWereLoaded = scriptsWereLoaded;
exports.applicationWillMount = applicationWillMount;
exports.applicationWasMounted = applicationWasMounted;
exports.applicationWillUnmount = applicationWillUnmount;
exports.applicationWasUnmounted = applicationWasUnmounted;
function defaultAngular1App(config) {
    if (!config) throw new Error('must provide a config object as the first parameter');
    if (typeof config.rootElementGetter !== 'function') throw new Error('must provide a function \'rootElementGetter\' that returns the root element to bootstrap');
    if (typeof config.publicRoot !== 'string') throw new Error('must provide a string called \'publicRoot\'');
    if (typeof config.rootAngularModule !== 'string') throw new Error('must provide a string called rootAngularModule');

    var app = {};
    app.scriptsWillBeLoaded = function () {
        return scriptsWillBeLoaded.apply(config, arguments);
    };
    app.scriptsWereLoaded = function () {
        return scriptsWereLoaded.apply(config, arguments);
    };
    app.applicationWillMount = function () {
        return applicationWillMount.apply(config, arguments);
    };
    app.mountApplication = function () {
        return mountApplication.apply(config, arguments);
    };
    app.applicationWasMounted = function () {
        return applicationWasMounted.apply(config, arguments);
    };
    app.applicationWillUnmount = function () {
        return applicationWillUnmount.apply(config, arguments);
    };
    app.applicationWasUnmounted = function () {
        return applicationWasUnmounted.apply(config, arguments);
    };
    return app;
}

function scriptsWillBeLoaded() {
    var config = this;
    return new Promise(function (resolve) {
        //single-spa owns the base tag, but angular doesn't like that much. This is the workaround.
        config.nativeGetElementsByTagName = document.getElementsByTagName;
        document.getElementsByTagName = function (query) {
            if (query === 'base') {
                return [];
            } else {
                return config.nativeGetElementsByTagName.apply(this, arguments);
            }
        };
        resolve();
    });
}

function scriptsWereLoaded() {
    var config = this;

    var appAngular = undefined;
    function waitForAngularGlobal(callback) {
        if (appAngular) {
            callback(appAngular);
        } else if (window.angular) {
            appAngular = window.angular;
            callback(appAngular);
        } else {
            setTimeout(function () {
                waitForAngularGlobal(callback);
            }, 3);
        }
    }
    config.angularPromise = function () {
        return new Promise(function (resolve) {
            waitForAngularGlobal(function (angular) {
                return resolve(angular);
            });
        });
    };

    return new Promise(function (resolve) {
        config.angularPromise().then(function (angular) {
            config.jQuery = window.jQuery;
            angular.module(config.rootAngularModule).factory('SingleSpaPrefixURLsInterceptor', function () {
                return {
                    request: function request(requestConfig) {
                        requestConfig.url = window.singlespa.prependUrl(config.publicRoot, requestConfig.url);
                        return requestConfig;
                    }
                };
            });

            angular.module(config.rootAngularModule).config(function ($httpProvider, $locationProvider) {
                $httpProvider.interceptors.push('SingleSpaPrefixURLsInterceptor');
            });
            resolve();
        }).catch(function (ex) {
            throw ex;
        });
    });
}

function applicationWillMount() {
    var config = this;
    return new Promise(function (resolve) {
        window.jQuery = config.jQuery;
        document.getElementsByTagName = function (query) {
            if (query === 'base') {
                return [];
            } else {
                return config.nativeGetElementsByTagName.apply(this, arguments);
            }
        };
        resolve();
    });
}

function applicationWasMounted() {
    var config = this;
    if (config.numMounts) {
        config.numMounts++;
    } else {
        config.numMounts = 1;
    }
    return new Promise(function (resolve) {
        config.angularPromise().then(function (angular) {
            //leak global
            window.angular = angular;

            //bootstrap
            var element = config.rootElementGetter();
            var numMountsAutoMounted = document.querySelector('[ng-app]') ? 1 : 0;
            if (config.numMounts > numMountsAutoMounted) {
                //we need to bootstrap
                angular.bootstrap(element, [config.rootAngularModule]);
            } else if (document.documentElement.getAttribute('ng-app')) {
                angular.bootstrap(element, [document.documentElement.getAttribute('ng-app')]);
            }
            resolve();
        }).catch(function (ex) {
            throw ex;
        });
    });
}

function applicationWillUnmount() {
    var config = this;
    return new Promise(function (resolve) {
        config.angularPromise().then(function (angular) {
            var rootScope = angular.injector(['ng']).get('$rootScope');
            rootScope.$destroy();
            delete window.angular;
            delete window.jQuery;
            resolve();
        }).catch(function (ex) {
            throw ex;
        });
    });
}

function applicationWasUnmounted() {
    var config = this;
    return new Promise(function (resolve) {
        document.getElementsByTagName = config.nativeGetElementsByTagName;
        resolve();
    });
}

function removeRedundantSlashes(str) {
    return str.replace(/[\/]+/g, '/');
}

//# sourceMappingURL=single-spa-angular1.dist.js.map