const defaultOpts = {
	// required opts
	angular: null,
	domElementGetter: null,
	mainAngularModule: null,

	// optional opts
	uiRouter: false,
	preserveGlobal: false,
	elementId: '__single_spa_angular_1',
	strictDi: false,
};

export default function singleSpaAngular1(userOpts) {
	if (typeof userOpts !== 'object') {
		throw new Error(`single-spa-angular1 requires a configuration object`);
	}

	const opts = {
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
		bootstrap: bootstrap.bind(null, opts),
		mount: mount.bind(null, opts),
		unmount: unmount.bind(null, opts),
	};
}

function bootstrap(opts) {
	return new Promise((resolve, reject) => {
		resolve();
	});
}

function mount(opts) {
	return new Promise((resolve, reject) => {
		window.angular = opts.angular;

		const containerEl = getContainerEl(opts);
		const bootstrapEl = document.createElement('div');
		bootstrapEl.id = opts.elementId;

		containerEl.appendChild(bootstrapEl);

		if (opts.uiRouter) {
			const uiViewEl = document.createElement('div');
			uiViewEl.setAttribute('ui-view', '');
			bootstrapEl.appendChild(uiViewEl);
		}
		
		if (opts.strictDi) {
			opts.angular.bootstrap(bootstrapEl, [opts.mainAngularModule], {strictDi: opts.strictDi})
		} else {
			opts.angular.bootstrap(bootstrapEl, [opts.mainAngularModule])
		}

		resolve();
	});
}

function unmount(opts) {
	return new Promise((resolve, reject) => {
		let rootElement = angular.element(getContainerEl(opts).querySelector(`#${opts.elementId}`));
		let rootScope = rootElement.injector().get('$rootScope');

		const result = rootScope.$destroy();

		getContainerEl(opts).innerHTML = '';

		if (opts.angular === window.angular && !opts.preserveGlobal)
			delete window.angular;

		setTimeout(resolve);
	});
}

function getContainerEl(opts) {
	const element = opts.domElementGetter();
	if (!element) {
		throw new Error(`domElementGetter did not return a valid dom element`);
	}

	return element;
}
