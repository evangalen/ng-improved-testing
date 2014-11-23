'use strict';

var injector = angular.injector([
        'ng',
        'ngImprovedTesting.internal.config',
        'ngImprovedTesting.internal.mockCreator',
        'ngImprovedTesting.internal.moduleBuilder'
    ]);

window.ngImprovedTestingConfig = injector.get('ngImprovedTestingConfig');

var mockCreator = injector.get('mockCreator');
window.mockInstance = mockCreator.mockInstance;

window.ModuleBuilder = injector.get('moduleBuilder');
