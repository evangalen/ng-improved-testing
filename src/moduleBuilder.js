/* global ngImprovedTesting,ngImprovedTestingModule */
(function() {
'use strict';

angular.module('ngImprovedTesting').factory('moduleBuilder', [
        'moduleIntrospector', 'mockCreator',
        function(moduleIntrospector, mockCreator) {

    var numberOfBuildModules = 0;

    var angularModuleNames = ['ng', 'ngAnimate', 'ngCookies', 'ngMessages', 'ngMock',
            'ngAnimateMock', 'ngMockE2E', 'ngResource', 'ngRoute', 'ngSanitize', 'ngTouch'];

    /**
     * @ngdoc type
     * @constructor
     */
    function ModuleBuilder(moduleName) {
        var servicesUsingMockedServices = [];

        var originalModule = angular.module(moduleName);
        var injector = angular.injector(['ng', moduleName]);

        //noinspection SpellCheckingInspection
        var introspector = moduleIntrospector(moduleName);

        /**
         * @param serviceName
         * @returns {ModuleBuilder}
         */
        this.withServiceUsingMocks = function(serviceName) {
            var serviceDeclaration = introspector.getServiceDeclaration(serviceName);

            if (serviceDeclaration.providerMethod === 'constant' || serviceDeclaration.providerMethod === 'value') {
                throw 'Services declares with "contact" or "value" are not supported';
            }

            servicesUsingMockedServices.push(serviceName);
            return this;
        };

        /**
         * @returns {function()}
         */
        this.build = function() {
            numberOfBuildModules++;
            var buildModuleName = 'generatedByNgImprovedTesting#' + numberOfBuildModules;

            /** @type Array.<string> */
            var toBeMockedServices = [];

            var nonMockServiceDependencies = [];

            var buildModule = angular.module(buildModuleName, originalModule.requires);

            angular.forEach(servicesUsingMockedServices, function (serviceName) {
                var serviceDependencies = introspector.getServiceDependencies(injector, serviceName);

                var annotatedService = [];

                angular.forEach(serviceDependencies, function (serviceDependencyInfo, serviceDependencyName) {
                    var toBeMocked = angularModuleNames.indexOf(serviceDependencyInfo.module.name) === -1 &&
                            mockCreator.canBeMocked(serviceDependencyInfo.instance);

                    if (toBeMocked) {
                        toBeMockedServices.push(serviceDependencyName);
                    } else {
                        nonMockServiceDependencies.push(serviceDependencyName);
                    }

                    annotatedService.push(serviceDependencyName + (toBeMocked ? 'Mock' : ''));
                });

                var serviceDeclaration = introspector.getServiceDeclaration(serviceName);

                annotatedService.push(serviceDeclaration.declaration);

                buildModule[serviceDeclaration.providerMethod](serviceName, annotatedService);
            });

            return angular.mock.module(function($provide) {
                angular.forEach(toBeMockedServices, function(toBeMockService) {
                    var originalService = injector.get(toBeMockService);

                    var serviceMock = mockCreator.createMock(originalService);
                    $provide.value(toBeMockService + 'Mock', serviceMock);
                });

                angular.forEach(nonMockServiceDependencies, function(nonMockServiceDependency) {
                    $provide.value(nonMockServiceDependency, injector.get(nonMockServiceDependency));
                });
            }, buildModule.name);
        };

    }

    /**
     * @ngdoc service
     * @name ModuleBuilder
     */
    return {
        /**
         * @name ModuleBuilder#forModule
         * @param {string} moduleName
         * @returns {ModuleBuilder}
         */
        forModule: function(moduleName) {
            return new ModuleBuilder(moduleName);
        }
    };

}]);

}());
