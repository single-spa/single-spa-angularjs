let opts;

const defaultOpts = {
	// required opts
	angular: null,
	domElementGetter: null,
	mainAngularModule: null,

	// optional opts
	uiRouter: false,
};

export default function singleSpaAngular1(userOpts) {
	if (typeof userOpts !== 'object') {
		throw new Error(`single-spa-angular1 requires a configuration object`);
	}

	opts = {
		...defaultOpts,
		...userOpts,
	};

	if (!opts.angular) {
		throw new Error(`single-spa-angular1 must be passed opts.angular`);
	}

	if (!opts.domElementGetter) {
		throw new Error(`single-spa-angular1 must be passed opts.domElementGetter function`);
	}

	if (!opts.mainAngularModule) {
		throw new Error(`single-spa-angular1 must be passed opts.mainAngularModule string`);
	}

	return {
		bootstrap,
		mount,
		unmount,
	};
}

function bootstrap() {
	return new Promise((resolve, reject) => {
		resolve();
	});
}

function mount() {
	return new Promise((resolve, reject) => {
		window.angular = opts.angular;

		const containerEl = getContainerEl();
		const bootstrapEl = document.createElement('div');
		containerEl.appendChild(bootstrapEl);

		if (opts.uiRouter) {
			const uiViewEl = document.createElement('div');
			uiViewEl.setAttribute('ui-view', '');
			bootstrapEl.appendChild(uiViewEl);
		}

		opts.angular.bootstrap(bootstrapEl, [opts.mainAngularModule])

		resolve();
	});
}

function unmount() {
	return new Promise((resolve, reject) => {
		let rootScope = angular.injector(['ng']).get('$rootScope');
		const result = rootScope.$destroy();

		getContainerEl().innerHTML = '';

		if (opts.angular === window.angular)
			delete window.angular;

		setTimeout(resolve);
	});
}

function getContainerEl() {
	const element = opts.domElementGetter();
	if (!element) {
		throw new Error(`domElementGetter did not return a valid dom element`);
	}

	return element;
}
