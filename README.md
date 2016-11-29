# single-spa-angular1

Generic lifecycle hooks for angular 1 applications that are registered as [child applications](https://github.com/CanopyTax/single-spa/blob/master/docs/child-applications.md) of [single-spa](https://github.com/CanopyTax/single-spa).

## Examples

In addition to this Readme, example usage of single-spa-angular1 can be found in the [single-spa-examples](https://github.com/CanopyTax/single-spa-examples/blob/master/src/angular1/angular1.app.js) project.

## Quickstart

First, in the child application, run `npm install --save single-spa-angular1` (or `jspm install npm:single-spa-angular1` if your child application is managed by jspm). Then, in your [child app's entry file](https://github.com/CanopyTax/single-spa/blob/docs-1/docs/configuring-child-applications.md#the-entry-file), do the following:

```js
import singleSpaAngular1 from 'single-spa-angular1';
import angular from 'angular';

const ng1Lifecycles = singleSpaAngular1({
  angular: angular,
  domElementGetter: () => document.getElementById('main-content'),
  mainAngularModule: 'app',
  uiRouter: true,
	preserveGlobal: false
});

export const bootstrap = [
  ng1Lifecycles.bootstrap,
];

export const mount = [
  ng1Lifecycles.mount,
];

export const unmount = [
  ng1Lifecycles.unmount,
];
```

## Options

Most options are passed to single-spa-angular1 via the `opts` parameter when calling `singleSpaAngular1(opts)`. The following options are available:

- `angular`: (required) The main angular object, which is generally either exposed onto the window or is available via `require('angular')` or `import angular from 'angular'`.
- `domElementGetter`: (required) A function that takes in no arguments and returns a DOMElement. This dom element is where the angular application will be bootstrapped, mounted, and unmounted.
- `mainAngularModule`: (required) A string that is the name of the angular module that will be bootstrapped by angular. See [angular docs](https://docs.angularjs.org/api/ng/function/angular.bootstrap) for `angular.bootstrap()`.
- `uiRouter`: (optional) A boolean that defaults to false. Set this to true if you are using [angular-ui-router](https://github.com/angular-ui/ui-router). This will ensure that `ui-view` elements will be part of the bootstrap process so that ui-router will actually work.
- `preserveGlobal`: (optional) A boolean that defaults to false. Set if you want to keep angular on the global even after an app unmounts.
- `elementId`: (optional) A string which will be used to identify the element appended to the DOM and bootstrapped by Angular.

Additionally you can pass a `bootstrapConfigurationObject` [Bootstrap Usage](https://docs.angularjs.org/api/ng/function/angular.bootstrap#usage) directly to the method that calls `angular.bootstrap`