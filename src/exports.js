'use strict';

var injector = angular.injector([
        'ng',
        'ngImprovedTesting.internal.config',
        'ngImprovedTesting.internal.mockCreator',
        'ngImprovedTesting.internal.moduleBuilder'
    ]);


var mockCreator = injector.get('mockCreator');

window.ngImprovedTesting = {
    mockInstance: mockCreator.mockInstance,
    config: injector.get('ngImprovedTestingConfig')
};

window.mockInstance = window.ngImprovedTesting.mockInstance;

window.ModuleBuilder = injector.get('moduleBuilder');
