;(function() {
'use strict';

// @ngInject
function moduleIntrospectorFactory(moduleIntrospector, mockCreator) {

    var numberOfBuildModules = 0;

    /**
     * @constructor
     */
    function ModuleBuilder(moduleName) {

        function registerComponent(type, componentName, componentKind, dependenciesUsage, dependencies) {
            var toBeIncludedModuleComponent = {
                type: type,
                componentName: componentName,
                componentKind: componentKind
            };

            if (dependenciesUsage) {
                toBeIncludedModuleComponent.dependenciesUsage = dependenciesUsage;
                toBeIncludedModuleComponent.dependencies = dependencies;
            }

            toBeIncludedModuleComponents.push(toBeIncludedModuleComponent);
        }

        var servicesUsingMockedServices = [];

        /** @type {angular.Module} */
        var originalModule = angular.module(moduleName);

        /** @type {$injector} */
        var injector = angular.injector(['ng', moduleName]);

        var introspector = moduleIntrospector(moduleName);

        /**
         * @name ModuleBuilder.ToBeIncludedModuleComponent
         * @typedef {Object}
         * @property {string} type
         * @property {string} componentName
         * @property {string} componentKind
         * @property {string} [dependenciesUsage]
         * @property {Array.<string>} [dependencies]
         */

        /** @type {Object.<ModuleBuilder.ToBeIncludedModuleComponent>} */
        var toBeIncludedModuleComponents = [];

        /**
         * Includes a service that replaces the dependencies specified in <em>toBeMockedDependencies</em> with mock
         * implementations.
         *
         * NOTE: services from AngularJS itself will never be mocked.
         *
         * @param {string} serviceName the name of the service to be registered
         * @param {...string} toBeMockedDependencies dependencies to be replaced with a mock implementation
         * @returns {moduleIntrospectorFactory.ModuleBuilder} the module builder instance
         */
        this.serviceWithMocksFor = function(serviceName, toBeMockedDependencies) {
            registerComponent('service', serviceName, 'withMocks', 'for', toBeMockedDependencies);
            return this;
        };

        /**
         * Includes a filter that replaces the dependencies specified in <em>toBeMockedDependencies</em> with mock
         * implementations.
         *
         * NOTE: services from AngularJS itself will never be mocked
         *
         * @param {string} filterName name of the filter to be included in the to be build module
         * @param {...string} toBeMockedDependencies dependencies to be replaced with a mock implementation
         * @returns {moduleIntrospectorFactory.ModuleBuilder} the module builder instance
         */
        this.filterWithMocksFor = function(filterName, toBeMockedDependencies) {
            registerComponent('filter', filterName, 'withMocks', 'for', toBeMockedDependencies)
            return this;
        };

        /**
         * Including an actual filter (and not a mocked one) in the module
         *
         * @param {string} filterName name of the filter to be included in the to be build module
         * @returns {moduleIntrospectorFactory.ModuleBuilder}
         */
        this.filterAsIs = function(filterName) {
            registerComponent('filter', filterName, 'actual');
            return this;
        };

//        /**
//         * Including a mocked filter (instead of the actual one) in the module
//         *
//         * @param {string} filterName name of the filter to be included in the to be build module
//         * @returns {moduleIntrospectorFactory.ModuleBuilder}
//         */
//        this.WithMockedFilter = function(filterName) {
//            registrations.push({type: RegistrationType.MOCKED_FILTER, name: filterName});
//            return this;
//        };

        /**
         * Includes a controller that uses mocked service dependencies (instead of actual services) in the module.
         *
         * @param {string} controllerName name of the controller to be included in the to be build module
         * @param {...string} toBeMockedDependencies dependencies to be replaced with a mock implementation
         * @returns {moduleIntrospectorFactory.ModuleBuilder}
         */
        this.controllerWithMocksFor = function(controllerName, toBeMockedDependencies) {
            registerComponent('controller', controllerName, 'withMocks', 'for', toBeMockedDependencies);
            return this;
        };

        /**
         * Including an actual controller (and not a mocked one) in the module
         *
         * @param {string} controllerName name of the controller to be included in the to be build module
         * @returns {moduleIntrospectorFactory.ModuleBuilder}
         */
        this.controllerAsIs = function(controllerName) {
            registerComponent('controller', controllerName, 'actual');
            return this;
        };

//        /**
//         * Including a mocked controller (instead of the actual one) in the module
//         *
//         * @param {string} controllerName name of the controller to be included in the to be build module
//         * @returns {moduleIntrospectorFactory.ModuleBuilder}
//         */
//        this.withMockedController = function(controllerName) {
//            //TODO: make this the to instantiate "inside" the tests you need to suffix "Mock" but not inside a
//            //  "real" service; inside a test you need "$controller('...CtrlMock', {$scope: ...})" but in a "real"
//            //  service the following should still work: "$controller('....Ctrl', ....);"
//            //TODO: determine how a test obtains the mock for the Controller constructor function;
//            //  a controllers isn't registered on $provide at all!
//            //  alternative... still "mocked" controller support and allow a callback with $provide on the
//            //  "moduleBuilder" (just like the "angular.mock.module" function)
//
//            registrations.push({type: RegistrationType.MOCKED_CONTROLLER, name: controllerName});
//            return this;
//        };

//        //TODO: also add: this.withDirective
//        /**
//         * @param {string} directiveName
//         * @returns {ModuleBuilder}
//         */
//        this.withDirectiveUsingMockedServices = function() {
//            throw 'not implemented yet';
//        };
//
//        /**
//         * @param {string} directiveName
//         * @param {...string} except
//         * @returns {ModuleBuilder}
//         */
//        this.withDirectiveUsingMockedServicesExcept = function() {
//            throw 'not implemented yet';
//        };
//
//        //NOT IMPLEMENTED: withMockedDirective
//        // not commonly needed... can always be made using the "function($provide)" callback

        /**
         * Builds ...
         * @returns {Function}
         */
        this.build = function() {
            numberOfBuildModules += 1;
            var buildModuleName = 'generatedByNgImprovedTesting#' + numberOfBuildModules;

            /** @type Array.<string> */
            var toBeMockedServices = [];

            var nonMockServiceDependencies = [];

            var buildModule = angular.module(buildModuleName, originalModule.requires);



            moduleServices = {
                'a': 'actual',
                'b': 'mock',
                'c': 'actualAndMock'
            };


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
         * @returns {moduleIntrospectorFactory.ModuleBuilder}
         */
        forModule: function(moduleName) {
            return new ModuleBuilder(moduleName);
        }
    };

}


angular.module('ngImprovedTesting')
    .factory('moduleBuilder', moduleIntrospectorFactory);

}());
