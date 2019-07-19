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
  template: undefined,
};

export default function singleSpaAngularJS(userOpts) {
  if (typeof userOpts !== 'object') {
    throw new Error(`single-spa-angularjs requires a configuration object`);
  }

  const opts = {
    ...defaultOpts,
    ...userOpts,
  };

  if (!opts.angular) {
    throw new Error(`single-spa-angularjs must be passed opts.angular`);
  }

  if (opts.domElementGetter && typeof opts.domElementGetter !== 'function') {
    throw new Error(`single-spa-angularjs opts.domElementGetter must be a function`);
  }

  if (!opts.mainAngularModule) {
    throw new Error(`single-spa-angularjs must be passed opts.mainAngularModule string`);
  }

  // A shared object to store mounted object state
  const mountedInstances = {};

  return {
    bootstrap: bootstrap.bind(null, opts, mountedInstances),
    mount: mount.bind(null, opts, mountedInstances),
    unmount: unmount.bind(null, opts, mountedInstances),
  };
}

function bootstrap(opts) {
  return Promise.resolve();
}

function mount(opts, mountedInstances, props = {}) {
  return Promise
    .resolve()
    .then(() => {
      window.angular = opts.angular;

      const containerEl = getContainerEl(opts, props);
      const bootstrapEl = document.createElement('div');
      bootstrapEl.id = opts.elementId;

      containerEl.appendChild(bootstrapEl);

      if (opts.uiRouter) {
        const uiViewEl = document.createElement('div');
        uiViewEl.setAttribute('ui-view', opts.uiRouter === true ? "" : opts.uiRouter);
        bootstrapEl.appendChild(uiViewEl);
      }

      if (opts.template) {
        bootstrapEl.innerHTML = opts.template;
      }

      if (opts.strictDi) {
        mountedInstances.instance = opts.angular.bootstrap(bootstrapEl, [opts.mainAngularModule], {strictDi: opts.strictDi})
      } else {
        mountedInstances.instance = opts.angular.bootstrap(bootstrapEl, [opts.mainAngularModule])
      }
  });
}

function unmount(opts, mountedInstances, props = {}) {
  return new Promise((resolve, reject) => {
    mountedInstances.instance.get('$rootScope').$destroy();
    getContainerEl(opts, props).innerHTML = '';

    if (opts.angular === window.angular && !opts.preserveGlobal)
      delete window.angular;

    setTimeout(resolve);
  });
}

function getContainerEl(opts, props) {
  let element;
  if (opts.domElementGetter) {
    element = opts.domElementGetter()
  } else {
    const htmlId = `single-spa-application:${props.name || props.appName}`
    element = document.getElementById(htmlId)
    if (!element) {
      element = document.createElement('div')
      element.id = htmlId
      document.body.appendChild(element)
    }
  }

  if (!element) {
    throw new Error(`domElementGetter did not return a valid dom element`);
  }

  return element;
}
