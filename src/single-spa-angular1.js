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
            angular.module(config.rootAngularModule).directive('ngSrc', function () {
                return {
                    restrict: 'A',
                    priority: 100, //Just higher than the real ngSrc
                    link: function(scope, element, attr) {
                        attr.$observe('ngSrc', function(value) {
                            if (!value) {
                                return;
                            }
                            if (value.indexOf(config.publicRoot) < 0) {
                                attr.$set('ngSrc', prependUrl(config.publicRoot, value));
                            }
                        })
                    }
                }
            })

            angular.module(config.rootAngularModule).factory('SingleSpaPrefixURLsInterceptor', function() {
                return {
                    request: function(requestConfig) {
                        requestConfig.url = prependUrl(config.publicRoot, requestConfig.url);
                        return requestConfig;
                    },
                    response: function(response) {
                        if (response.headers('Content-Type') === 'text/html') {
                            let parser = new DOMParser();
                            let dom = parser.parseFromString(response.data, 'text/html');
                            let scripts = dom.querySelectorAll('script');
                            for (let i=0; i<scripts.length; i++) {
                                if (scripts[i].getAttribute('src')) {
                                    scripts[i].setAttribute('src', prependUrl(config.publicRoot, scripts[i].getAttribute('src')));
                                }
                            }
                            let stylesheets = dom.querySelectorAll('link');
                            for (let i=0; i<stylesheets.length; i++) {
                                if (stylesheets[i].getAttribute('href')) {
                                    stylesheets[i].setAttribute('href', prependUrl(config.publicRoot, stylesheet[i].getAttribute('href')));
                                }
                            }
                            let images = dom.querySelectorAll('img');
                            for (let i=0; i<images.length; i++) {
                                if (images[i].getAttribute('src')) {
                                    images[i].setAttribute('src', prependUrl(config.publicRoot, stylesheet[i].getAttribute('src')));
                                }
                            }
                            response.data = dom.documentElement.innerHTML;
                        }
                        return response;
                    }
                }
            })

            angular.module(config.rootAngularModule).config(function($httpProvider) {
                $httpProvider.interceptors.push('SingleSpaPrefixURLsInterceptor');
            })
            resolve();
        })
    });
}

export function applicationWillMount() {
    const config = this;
    return new Promise(function (resolve) {
        window.jQuery = config.jQuery;
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

function prependUrl(prefix, url) {
    let parsedURL = document.createElement('a');
    parsedURL.href = url;
    return `${parsedURL.protocol}//` + removeRedundantSlashes(`${parsedURL.hostname}:${parsedURL.port}/${prefix}/${parsedURL.pathname}${parsedURL.search}${parsedURL.hash}`);
}

function removeRedundantSlashes(str) {
    return str.replace(/[\/]+/g, '/');
}
