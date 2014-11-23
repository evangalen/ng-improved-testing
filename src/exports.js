(function(window) {
'use strict';

var injector = angular.injector([
        'ng', 'ngImprovedTesting.internal.mockCreator', 'ngImprovedTesting.internal.moduleBuilder'
    ]);

var mockCreator = injector.get('mockCreator');
window.mockInstance = mockCreator.mockInstance;

window.ModuleBuilder = injector.get('moduleBuilder');
}(window));
