import * as registerHelpers from "single-spa-register-angular1";

export default {
	entry: '1.2.0-entry.js',
	entryWillBeInstalled: registerHelpers.entryWillBeInstalled(function() {
		return new Promise(function(resolve, reject) {
			System.import('/apps/1.2.0/config.js').then(function() {
				hijackSystemLocate();
				resolve();
			});
		});
	}),
	applicationWillMount: registerHelpers.applicationWillMount(function() {
		return new Promise(function(resolve) {
			hijackSystemLocate();
			resolve();
		});
	}),
	mountApplication: registerHelpers.mountApplication(undefined, ['root-angular-module']),
	applicationWasMounted: registerHelpers.applicationWasMounted(),
	applicationWillUnmount: registerHelpers.applicationWillUnmount(function() {
		return new Promise(function(resolve) {
			unhijackSystemLocate();
			resolve();
		});
	}),
	unmountApplication: registerHelpers.unmountApplication(function() {
		return new Promise(function(resolve) {
			System.normalize = (name) => name;
			resolve();
		});
	}),

	activeApplicationSourceWillUpdate: registerHelpers.activeApplicationSourceWillUpdate(),
	activeApplicationSourceWasUpdated: registerHelpers.activeApplicationSourceWasUpdated()
}

var nativeSystemLocate;
var hijacked = false;

function hijackSystemLocate() {
	if (!hijacked) {
		nativeSystemLocate = System.locate;
		hijacked = true;
		System.locate = function(locationObj) {
			let url = locationObj.name;
			if (url.startsWith(this.baseURL)) {
				let name = url.substring(this.baseURL.length);
				if (name.startsWith('./')) {
					return `/apps/1.2.0/${name.substring(2)}`;
				} else {
					return `/apps/1.2.0/${name}`;
				}
			}
		}
	}
}

function unhijackSystemLocate() {
	if (hijacked) {
		System.locate = nativeSystemLocate;
		hijacked = false;
	}
}
