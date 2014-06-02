;(function() {
'use strict';


// @ngInject
function moduleIntrospectorFactory(moduleIntrospector, mockCreator) {

    var numberOfBuildModules = 0;

    var angularModuleNames = ['ng', 'ngAnimate', 'ngCookies', 'ngMessages', 'ngMock',
        'ngAnimateMock', 'ngMockE2E', 'ngResource', 'ngRoute', 'ngSanitize', 'ngTouch'];

    /**
     * @ngdoc type
     * @name ModuleBuilder
     * @constructor
     */
    function ModuleBuilder(moduleName) {
        var servicesUsingMockedServices = [];

        var originalModule = angular.module(moduleName);
        var injector = angular.injector(['ng', moduleName]);

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
         * @param {string} serviceName
         * @param {...string} except
         * @returns {ModuleBuilder}
         */
        this.withServiceUsingMocksExcept = function() {
            throw 'not implemented yet';
        };

        /**
         * @param {string} filterName
         * @returns {ModuleBuilder}
         */
        this.withFilterUsingMocks = function() {
            throw 'not implemented yet';
        };

        /**
         * @param {string} filterName
         * @param {...string} except
         * @returns {ModuleBuilder}
         */
        this.withFilterUsingMocksExcept = function() {
            throw 'not implemented yet';
        };

        //this.withFilter

        /**
         * @param {string} filterName
         * @returns {ModuleBuilder}
         */
        this.WithMockedFilter = function() {
            //TODO: make sure that a filter is registerd with $provide with the "Mock" suffix
            //  (i.e. "...FilterMock"). However when using the "$filter" function it should this be accessible with
            //  its original name, even from the tests but also from a "real" service
            throw 'not implemented yet';
        };

        //TODO: also add: this.withController

        /**
         * @param {string} controllerName
         * @returns {ModuleBuilder}
         */
        this.withControllerUsingMocks = function() {
            throw 'not implemented yet';
        };

        /**
         * @param {string} controllerName
         * @param {...string} except
         * @returns {ModuleBuilder}
         */
        this.withControllerUsingMocksExcept = function(controllerName, except) {
            throw 'not implemented yet';
        };

        this.withMockedController = function(controllerName) {
            //TODO: make this the to instantiate "inside" the tests you need to suffix "Mock" but not inside a
            //  "real" service; inside a test you need "$controller('...CtrlMock', {$scope: ...})" but in a "real"
            //  service the following should still work: "$controller('....Ctrl', ....);"
            //TODO: determine how a test obtains the mock for the Controller constructor function;
            //  a controllers isn't registered on $provide at all!
            //  alternative... still "mocked" controller support and allow a callback with $provide on the
            //  "moduleBuilder" (just like the "angular.mock.module" function)
            throw 'not implemented yet';
        };

        //TODO: also add: this.withDirective

        /**
         * @param {string} directiveName
         * @returns {ModuleBuilder}
         */
        this.withDirectiveUsingMocks = function(directiveName) {
            throw 'not implemented yet';
        };

        /**
         * @param {string} directiveName
         * @param {...string} except
         * @returns {ModuleBuilder}
         */
        this.withDirectiveUsingMocksExcept = function(directiveName, except) {
            throw 'not implemented yet';
        };

        //NOT IMPLEMENTED: withMockedDirective
        // not commonly needed... can always be made using the "function($provide)" callback

        /**
         * @returns {function()}
         */
        this.build = function() {
            numberOfBuildModules += 1;
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

                var originalNonAnnotatedServiceDeclaration;
                if (angular.isArray(serviceDeclaration.declaration)) {
                    originalNonAnnotatedServiceDeclaration =
                        serviceDeclaration.declaration[serviceDeclaration.declaration.length - 1];
                } else {
                    originalNonAnnotatedServiceDeclaration = serviceDeclaration.declaration;
                }

                annotatedService.push(originalNonAnnotatedServiceDeclaration);

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
     * @name moduleBuilder
     */
    return {
        /**
         * @name moduleBuilder#forModule
         * @param {string} moduleName
         * @returns {ModuleBuilder}
         */
        forModule: function(moduleName) {
            return new ModuleBuilder(moduleName);
        }
    };

}


angular.module('ngImprovedTesting')
    .factory('moduleBuilder', moduleIntrospectorFactory);

}());
