export function defaultAngular1App(config) {
	if (!config) throw new Error('must provide a config object as the first parameter');
	if (typeof config.angularPromise !== 'function') throw new Error(`must provide a promise that returns the angular object`);
	if (!Array.isArray(config.angularModulesToBootstrap)) throw new Error('must provide a angularModulesToBootstrap array');

	let app = {};
	app.entryWillBeInstalled = function() {
		return entryWillBeInstalled.apply(config, arguments);
	}
	app.entryWasInstalled = function() { return entryWasInstalled.apply(config, arguments); }
	app.applicationWillMount = function() { return applicationWillMount.apply(config, arguments); }
	app.mountApplication = function() { return mountApplication.apply(config, arguments); }
	app.applicationWasMounted = function() { return applicationWasMounted.apply(config, arguments); }
	app.applicationWillUnmount = function() { return applicationWillUnmount.apply(config, arguments); }
	app.unmountApplication = function() { return unmountApplication.apply(config, arguments); }
	app.activeApplicationSourceWillUpdate = function() { return activeApplicationSourceWillUpdate.apply(config, arguments); }
	app.activeApplicationSourceWasUpdated = function() { return activeApplicationSourceWasUpdated.apply(config, arguments); }
	return app;
}

export function entryWillBeInstalled() {
	return new Promise(function (resolve) {
		resolve();
	}.bind(this));
}

export function entryWasInstalled() {
	return new Promise(function (resolve) {
		resolve();
	}.bind(this));
}

export function applicationWillMount() {
	return new Promise(function(resolve) {
		resolve()
	}.bind(this));
}

export function mountApplication(elementToUse) {
	return new Promise(function(resolve) {
		this.angularPromise()
		.then(function (appAngular) {
			var isUsingUIRouter;
			try {
				appAngular.module('ui.router');
				isUsingUIRouter = true;
			} catch (ex) {
				isUsingUIRouter = false;
			}
			if (isUsingUIRouter) {
				window.angular = appAngular;
				let uiView = document.createElement('div');
				uiView.setAttribute('ui-view', '');
				uiView.setAttribute('single-spa-angular1-app', '');
				elementToUse.appendChild(uiView);
				appAngular.bootstrap(elementToUse, this.angularModulesToBootstrap);
				resolve()
			} else {
				throw new Error(`Angular apps not using ui-router are not yet supported`);
			}
		}.bind(this))
	}.bind(this))
}

export function applicationWasMounted() {
	return new Promise(function (resolve) {
		resolve()
	}.bind(this));
}

export function applicationWillUnmount() {
	return new Promise(function (resolve) {
		resolve()
	}.bind(this))
}

export function unmountApplication(bootstrappedElement) {
	return new Promise(function (resolve) {
		this.angularPromise()
		.then((angular) => {
			angular.element(bootstrappedElement).scope().$root.$destroy()
			document.querySelector('[single-spa-angular1-app]').remove();
			delete window.angular;
			resolve()
		})
	}.bind(this))
}

export function activeApplicationSourceWillUpdate() {
	return new Promise(function (resolve) {
		resolve();
	}.bind(this))
}

export function activeApplicationSourceWasUpdated() {
	return new Promise(function (resolve) {
		resolve();
	}.bind(this))
}
