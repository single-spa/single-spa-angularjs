export function regexRouteMatching(regex) {
	if (!(regex instanceof RegExp)) {
		throw new Error(`A regular expression is required`);
	}
	return function() {
		return new Promise(function(resolve) {
			console.log('Loading angular!');
			System.import('angular')
			.then((angular) => {
				let routeToTest = angular.injector().get('$locationProvider').html5Mode() ? window.location.pathname : window.location.hash;
				resolve(regex.test(routeToTest));
			});
		});
	}
}

export function entryWillBeInstalled(customPromise) {
	return function() {
		return new Promise(function(resolve) {
			callCustomPromise(resolve, customPromise);
		});
	}
}

export function applicationWillMount(customPromise) {
	return function() {
		return new Promise(function(resolve) {
			callCustomPromise(resolve, customPromise);
		});
	}
}

export function mountApplication(customPromise, angularModules) {
	if (!Array.isArray(angularModules)) {
		throw new Error(`The array of angular modules to bootstrap is required`);
	}
	return function() {
		return new Promise(function(resolve) {
			System.import('angular')
			.then((angular) => {
				if (isUsingUIRouter(angular)) {
					let uiView = document.createElement('div');
					uiView.setAttribute('ui-view', '');
					uiView.setAttribute('single-spa-register-angular1-app', '');
					document.body.appendChild(uiView);
					angular.bootstrap(document.body, angularModules);
					callCustomPromise(resolve, customPromise);
				} else {
					throw new Error(`Angular apps not using ui-router are not yet supported`);
				}
			});
		})
	}
}

export function applicationWasMounted(customPromise) {
	return function() {
		return new Promise((resolve) => {
			callCustomPromise(resolve, customPromise);
		});
	}
}

export function applicationWillUnmount(customPromise) {
	return function() {
		return new Promise((resolve) => {
			callCustomPromise(resolve, customPromise);
		})
	}
}

export function unmountApplication() {
	return function() {
		return new Promise((resolve) => {
			System.import('angular')
			.then((angular) => {
				getRootScope(angular).$destroy();
				document.querySelector('[single-spa-register-angular1-app]').remove();
				delete window.angular;
				resolve();
			})
		})
	}
}

export function activeApplicationSourceWillUpdate() {
	return function() {
		return new Promise(function(resolve) {
			resolve();
		})
	}
}

export function activeApplicationSourceWasUpdated() {
	return function() {
		return new Promise(function(resolve) {
			resolve();
		})
	}
}

function getRootScope(angular) {
	return angular.element(document.body).scope().$root;
}

function isUsingUIRouter(angular) {
	try {
		angular.module('ui.router');
		return true;
	} catch (ex) {
		return false;
	}
}

function callCustomPromise(resolve, customPromise) {
	if (customPromise) {
		customPromise = customPromise();
		if (!customPromise.then) {
			throw new Error(`customPromise must be thenable`);
		}
		customPromise.then(() => resolve());
	} else {
		resolve();
	}
}
