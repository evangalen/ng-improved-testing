# ngImprovedTesting &nbsp;[![Travis build status](https://travis-ci.org/evangalen/ng-improved-testing.png?branch=master)](https://travis-ci.org/evangalen/ng-improved-testing)&nbsp;[![Coverage Status](https://coveralls.io/repos/evangalen/ng-improved-testing/badge.png?branch=master)](https://coveralls.io/r/evangalen/ng-improved-testing?branch=master)&nbsp;[![Bower version](https://badge.fury.io/bo/ng-improved-testing.svg)](http://badge.fury.io/bo/ng-improved-testing)

Improves AngularJS testing

For more information about:
 - the mock testing support read this blog [post](http://blog.jdriven.com/2014/07/ng-improved-testing-mock-testing-for-angularjs-made-easy/).
 - using $q.tick() to improve testing promises read this blog
[post](http://blog.jdriven.com/2014/11/ngimprovedtesting-0-2-adding-q-tick-to-improve-testing-promises/).

Changes
-------
0.3.0
 - The ModuleBuilder now includes the whole original module;
   Since the whole module is now includes there is no need for any of the "...AsIs" methods (i.e. "serviceAsIs") and therefor all off them hav been removed.
 - Introduced the a new static `ModuleBuilder.forModules` method with a variable argument and the same possible argument types as [angular.mock.module](https://docs.angularjs.org/api/ngMock/function/angular.mock.module).
 - Deprecated the existing static `ModuleBuilder.forModule` method in favor of `ModuleBuilder.forModules`.
 - The "angular.mock.inject" functionality has been modified to disallow injecting the original service instead of its mocked counterpart. This to prevent mistakingly injecting the original (non-mocked) service in your tests.
 - Fixed #16 (Some of the "...MocksFor" and "...MocksExcept" don't support variable arguments bug)
 - Fixed #15 ($httpBackend doesn't work with mocks enabled bug)
 - Fixed #14 (Using "directiveWithMocks..." should only be allowed when directive is registered once or only once overriden a built-in one enhancement)
 - Fixed #13 (Using "...WithMocks..." should not be allowed on built-in components)
 - Fixed #8 (MockBuilder doesn't correctly handle components declared in inherited modules)
 - Fixed #11 (Using ModuleBuilder.forModule('app') on a module which uses $location breaks the tests)
 - Fixed #12 (Prevent duplicate directive when mocking the injected services of a directive enhancement)

0.2.3
 - Fixed #9 (ModuleBuilder doesn't support angular modules declared in .js file loading after .js file of Jasmine spec)

0.2.2
 - Fixed #5 (Chained promises are not included when using $q.tick())

0.2.1
 - Various changes to actually get $q.tick() working including enabling / disabling it

0.2.0
  - AngularJS 1.0.x is no longer supported
  - no longer uses any internal AngularJS API (like 0.1.x did)
  - mocks can now also be manually created using the (global) `mockInstance(...)` method
  - when using a ModuleBuilder or using the "ngImprovedTesting" module the $q service is extended with "tick()" method

0.1.3
 - Fixes #3 (Internally created $injector doesn't include "ngMock")

0.1.2
 - Support for AngularJS 1.0 (as well as the latest stable 1.3)
 - Support for "provider" registered services
 - Support for testing animations with mocked dependencies (when using AngularJS 1.2+)
 - Fixes #2 (looks like cannot inject $rootScopeMock)
   Object with only inherited method (and no own methods) will now be mocked.
   For instance a $rootScope with only inherited methods from its prototype will now correct result in a $rootScopeMock
   dependency with its being requested for mocking.

0.1.1
 - Fixes #1 (Error on circular module dependencies.)
 - Support for testing directives with mocked dependencies

0.1.0 Initial release

Bower
-----
You can easily install and add it to an existing project using the following command:

    bower install ng-improved-testing --save-dev
