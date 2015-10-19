export function defaultAngular1App(config) {
    if (!config) throw new Error('must provide a config object as the first parameter');
    if (typeof config.rootElementGetter !== 'function') throw new Error(`must provide a function 'rootElementGetter' that returns the root element to bootstrap`);
    if (typeof config.publicRoot !== 'string') throw new Error(`must provide a string called 'publicRoot'`);
    if (typeof config.rootAngularModule !== 'string') throw new Error(`must provide a string called rootAngularModule`);

    let app = {};
    app.scriptsWillBeLoaded = function() { return scriptsWillBeLoaded.apply(config, arguments) }
    app.scriptsWereLoaded = function() { return scriptsWereLoaded.apply(config, arguments); }
    app.applicationWillMount = function() { return applicationWillMount.apply(config, arguments); }
    app.mountApplication = function() { return mountApplication.apply(config, arguments); }
    app.applicationWasMounted = function() { return applicationWasMounted.apply(config, arguments); }
    app.applicationWillUnmount = function() { return applicationWillUnmount.apply(config, arguments); }
    app.applicationWasUnmounted = function() { return applicationWasUnmounted.apply(config, arguments); }
    app.activeApplicationSourceWillUpdate = function() { return activeApplicationSourceWillUpdate.apply(config, arguments); }
    app.activeApplicationSourceWasUpdated = function() { return activeApplicationSourceWasUpdated.apply(config, arguments); }
    return app;
}

export function scriptsWillBeLoaded() {
    const config = this;
    return new Promise(function (resolve) {
        //single-spa owns the base tag, but angular doesn't like that much. This is the workaround.
        config.nativeGetElementsByTagName = document.getElementsByTagName;
        document.getElementsByTagName = function(query) {
            if (query === 'base') {
                return [];
            } else {
                return config.nativeGetElementsByTagName.apply(this, arguments);
            }
        }
        resolve();
    });
}

export function scriptsWereLoaded() {
    var config = this;

    let appAngular;
    function waitForAngularGlobal(callback) {
        if (appAngular) {
            callback(appAngular);
        } else if (window.angular) {
            appAngular = window.angular;
            callback(appAngular);
        } else {
            setTimeout(function() {
                waitForAngularGlobal(callback);
            }, 3);
        }
    }
    config.angularPromise = function() {
        return new Promise(function (resolve) {
            waitForAngularGlobal((angular) => resolve(angular));
        })
    }

    return new Promise(function(resolve) {
        config.angularPromise()
        .then(function(angular) {
            config.jQuery = window.jQuery;
            angular.module(config.rootAngularModule).factory('SingleSpaPrefixURLsInterceptor', function() {
                return {
                    request: function(requestConfig) {
                        requestConfig.url = window.singlespa.prependUrl(config.publicRoot, requestConfig.url);
                        return requestConfig;
                    }
                };
            });

            angular.module(config.rootAngularModule).config(function($httpProvider, $locationProvider) {
                $httpProvider.interceptors.push('SingleSpaPrefixURLsInterceptor');
            });
            resolve();
        });
    });
}

export function applicationWillMount() {
    const config = this;
    return new Promise(function (resolve) {
        window.jQuery = config.jQuery;
        document.getElementsByTagName = function(query) {
            if (query === 'base') {
                return [];
            } else {
                return config.nativeGetElementsByTagName.apply(this, arguments);
            }
        }
        resolve();
    });
}

export function applicationWasMounted() {
    const config = this;
    if (config.numMounts) {
        config.numMounts++;
    } else {
        config.numMounts = 1;
    }
    return new Promise(function (resolve) {
        config.angularPromise()
        .then((angular) => {
            //leak global
            window.angular = angular;

            //bootstrap
            let element = config.rootElementGetter()
            let numMountsAutoMounted = document.querySelector('[ng-app]') ? 1 : 0;
            if (config.numMounts > numMountsAutoMounted) {
                //we need to bootstrap
                angular.bootstrap(element, [config.rootAngularModule]);
            } else if (document.documentElement.getAttribute('ng-app')) {
                angular.bootstrap(element, [document.documentElement.getAttribute('ng-app')]);
            }
            resolve()
        })
    });
}

export function applicationWillUnmount() {
    const config = this;
    return new Promise(function (resolve) {
        config.angularPromise()
        .then((angular) => {
            let rootScope = angular.injector(['ng']).get('$rootScope');
            rootScope.$destroy();
            delete window.angular;
            delete window.jQuery;
            resolve()
        })
    })
}

export function applicationWasUnmounted() {
    const config = this;
    return new Promise(function (resolve) {
        document.getElementsByTagName = config.nativeGetElementsByTagName;
        resolve();
    })
}

export function activeApplicationSourceWillUpdate() {
    const config = this;
    return new Promise(function (resolve) {
        resolve();
    })
}

export function activeApplicationSourceWasUpdated() {
    const config = this;
    return new Promise(function (resolve) {
        resolve();
    })
}

function removeRedundantSlashes(str) {
    return str.replace(/[\/]+/g, '/');
}
