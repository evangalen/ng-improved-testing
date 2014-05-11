(function(window) {
'use strict';

var injector = angular.injector(['ng', 'ngImprovedTesting']);

window.ModuleBuilder = injector.get('ModuleBuilder');
}(window));
