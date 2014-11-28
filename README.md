# ngImprovedTesting &nbsp;[![Travis build status](https://travis-ci.org/evangalen/ng-improved-testing.png?branch=master)](https://travis-ci.org/evangalen/ng-improved-testing)&nbsp;[![Coverage Status](https://coveralls.io/repos/evangalen/ng-improved-testing/badge.png?branch=master)](https://coveralls.io/r/evangalen/ng-improved-testing?branch=master)&nbsp;[![Bower version](https://badge.fury.io/bo/ng-improved-testing.svg)](http://badge.fury.io/bo/ng-improved-testing)

Improves AngularJS testing

For more information about:
 - the mock testing support read this blog [post](http://blog.jdriven.com/2014/07/ng-improved-testing-mock-testing-for-angularjs-made-easy/).
 - the added $q.tick() that improved testing promises read this blog
[post](http://blog.jdriven.com/2014/11/ngimprovedtesting-0-2-adding-q-tick-to-improve-testing-promises/).

Changes
-------
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
