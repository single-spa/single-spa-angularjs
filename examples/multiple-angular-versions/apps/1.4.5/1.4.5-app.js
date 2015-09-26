import * as registerHelpers from "single-spa-register-angular1";

var nativeSystemGlobal;
var appLoader;

export default {
	entry: '/apps/1.4.5/1.4.5-entry.js',
	entryWillBeInstalled: registerHelpers.entryWillBeInstalled(function() {
		return new Promise(function(resolve, reject) {
			switchToAppLoader()
			.then(() => window.System.import('/apps/1.4.5/config.js'))
			.then(() => resolve());
		});
	}),
	entryWasInstalled: registerHelpers.entryWasInstalled(function() {
		return new Promise(function(resolve) {
			switchToNativeLoader()
			.then(() => resolve());
		})
	}),
	applicationWillMount: registerHelpers.applicationWillMount(function() {
		return new Promise(function(resolve) {
			switchToAppLoader()
			.then(() => resolve());
		});
	}),
	mountApplication: registerHelpers.mountApplication(undefined, ['root-angular-module']),
	applicationWasMounted: registerHelpers.applicationWasMounted(),
	applicationWillUnmount: registerHelpers.applicationWillUnmount(),
	unmountApplication: registerHelpers.unmountApplication(function() {
		return new Promise(function(resolve) {
			switchToNativeLoader()
			.then(() => resolve());
		});
	}),

	activeApplicationSourceWillUpdate: registerHelpers.activeApplicationSourceWillUpdate(),
	activeApplicationSourceWasUpdated: registerHelpers.activeApplicationSourceWasUpdated()
}

function switchToAppLoader() {
	return new Promise((resolve) => {
		if (!appLoader) {
			nativeSystemGlobal = window.System;
			delete window.System;
			let scriptEl = document.createElement('script');
			scriptEl.src = `/jspm_packages/system.src.js?1.4.5`;
			scriptEl.async = true;
			scriptEl.onreadystatechange = scriptEl.onload = function() {
				appLoader = window.System;
				resolve();
			}
			document.head.appendChild(scriptEl);
		} else {
			nativeSystemGlobal = window.System;
			window.System = appLoader;
			resolve();
		}
	})
}

function switchToNativeLoader() {
	return new Promise((resolve) => {
		window.System = nativeSystemGlobal;
		resolve();
	})
}
