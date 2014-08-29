# ngImprovedTesting

[![devDependency Status](https://david-dm.org/evangalen/ng-improved-testing/dev-status.svg)](https://david-dm.org/evangalen/ng-improved-testing#info=devDependencies)

Improves AngularJS testing

For more information about ngImprovedTesting read this blog [post](http://blog.jdriven.com/2014/07/ng-improved-testing-mock-testing-for-angularjs-made-easy/).

Changes
-------
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
