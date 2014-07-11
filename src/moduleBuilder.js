;(function() {
'use strict';

// @ngInject
function moduleIntrospectorFactory(moduleIntrospector, mockCreator) {

    var numberOfBuildModules = 0;

    /**
     * @constructor
     */
    function ModuleBuilder(moduleName) {

        function includeComponent(type, componentName, componentKind, dependenciesUsage, dependencies) {
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

        //TODO: comment
        this.serviceWithMocks = function(serviceName) {
            includeComponent('service', serviceName, 'withMocks');
            return this;
        };

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
            includeComponent('service', serviceName, 'withMocks', 'for', toBeMockedDependencies);
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
            includeComponent('filter', filterName, 'withMocks', 'for', toBeMockedDependencies);
            return this;
        };

        /**
         * Including an actual filter (and not a mocked one) in the module
         *
         * @param {string} filterName name of the filter to be included in the to be build module
         * @returns {moduleIntrospectorFactory.ModuleBuilder}
         */
        this.filterAsIs = function(filterName) {
            includeComponent('filter', filterName, 'asIs');
            return this;
        };

        /**
         * Includes a controller that uses mocked service dependencies (instead of actual services) in the module.
         *
         * @param {string} controllerName name of the controller to be included in the to be build module
         * @param {...string} toBeMockedDependencies dependencies to be replaced with a mock implementation
         * @returns {moduleIntrospectorFactory.ModuleBuilder}
         */
        this.controllerWithMocksFor = function(controllerName, toBeMockedDependencies) {
            includeComponent('controller', controllerName, 'withMocks', 'for', toBeMockedDependencies);
            return this;
        };

        /**
         * Including an actual controller (and not a mocked one) in the module
         *
         * @param {string} controllerName name of the controller to be included in the to be build module
         * @returns {moduleIntrospectorFactory.ModuleBuilder}
         */
        this.controllerAsIs = function(controllerName) {
            includeComponent('controller', controllerName, 'asIs');
            return this;
        };

        /**
         * Builds ...
         * @returns {Function}
         */
        this.build = function() {

            function getModuleComponentDependencies(type, name) {
                var result;

                if (type === 'service') {
                    result = introspector.getServiceDependencies(injector, name);
                } else if (type === 'controller') {
                    result = introspector.getControllerDependencies(injector, name);
                } else if (type === 'filter') {
                    result = introspector.getFilterDependencies(injector, name);
                } else {
                    throw 'Unsupported module component type: ' + type;
                }

                return result;
            }

            function getDeclaredModuleComponent(type, name) {
                var result;

                if (type === 'service') {
                    result = introspector.getServiceDeclaration(name);
                } else if (type === 'controller') {
                    result = introspector.getControllerDeclaration(name);
                } else if (type === 'filter') {
                    result = introspector.getFilterDeclaration(name);
                } else {
                    throw 'Unsupported module component type: ' + type;
                }

                return result;
            }

            function handleAsIsComponentKind(toBeIncludedModuleComponent) {
                var type = toBeIncludedModuleComponent.type;
                var name = toBeIncludedModuleComponent.componentName;

                if (type === 'controller' || type === 'filter') {
                    var dependencies = getModuleComponentDependencies(type, name);

                    angular.forEach(dependencies, function(dependencyInfo, dependencyName) {
                        asIsServices[dependencyName] = dependencyInfo.instance;
                    });

                    var declaredModuleComponent = getDeclaredModuleComponent(type, name);

                    declarations[name] = {
                        provideMethod: declaredModuleComponent.providerMethod,
                        declaration: declaredModuleComponent.declaration
                    };
                } else if (type === 'service') {
                    asIsServices[name] = injector.get(name);
                } else {
                    throw 'Unsupported module component type: ' + type;
                }
            }

            function handleWithMocksComponentKind(toBeIncludedModuleComponent) {
                var type = toBeIncludedModuleComponent.type;
                var name = toBeIncludedModuleComponent.componentName;

                var dependencies = getModuleComponentDependencies(type, name);

                var declaredModuleComponent = getDeclaredModuleComponent(type, name);
                var declaration = declaredModuleComponent.declaration;

                var annotatedDeclaration = [];

                angular.forEach(dependencies, function (dependencyInfo, dependencyName) {
                    var shouldBeMocked = dependencyShouldBeMocked(toBeIncludedModuleComponent, dependencyName);
                    var canBeMocked = mockCreator.canBeMocked(dependencyInfo.instance);

                    console.log(dependencyName + ' shouldBeMocked=' + shouldBeMocked);
                    console.log(dependencyName + ' canBeMocked=' + canBeMocked);

                    if (shouldBeMocked && !canBeMocked &&
                            toBeIncludedModuleComponent.dependenciesUsage === 'for') {
                        throw 'Could not mock the dependency explicitly asked to mock: ' + dependencyName;
                    }

                    var toBeMocked = dependencyShouldBeMocked && canBeMocked;

                    if (toBeMocked) {
                        mockedServices[dependencyName] = dependencyInfo.instance;
                    } else {
                        asIsServices[dependencyName] = dependencyInfo.instance;
                    }

                    annotatedDeclaration.push(dependencyName + (toBeMocked ? 'Mock' : ''));
                });

                var originalNonAnnotatedServiceDeclaration;
                if (angular.isArray(declaration)) {
                    originalNonAnnotatedServiceDeclaration = declaration[declaration.length - 1];
                } else {
                    originalNonAnnotatedServiceDeclaration = declaration;
                }

                annotatedDeclaration.push(originalNonAnnotatedServiceDeclaration);

                declarations[name] = {
                    providerMethod: declaredModuleComponent.providerMethod,
                    declaration: annotatedDeclaration
                };
            }

            function dependencyShouldBeMocked(toBeIncludedModuleComponent, dependencyName) {
                var dependenciesUsage = toBeIncludedModuleComponent.dependenciesUsage;

                if (dependenciesUsage === 'for') {
                    return toBeIncludedModuleComponent.dependencies.indexOf(dependencyName) !== -1;
                } else if (dependenciesUsage === 'except') {
                    return toBeIncludedModuleComponent.dependencies.indexOf(dependencyName) === -1;
                } else if (!dependenciesUsage) {
                    return true;
                } else {
                    throw 'Invalid dependencies usage: ' + dependenciesUsage;
                }
            }

            numberOfBuildModules += 1;

            var buildModuleName = 'generatedByNgImprovedTesting#' + numberOfBuildModules;

            /** @type Object.<Object> */
            var mockedServices = {};

            /** @type Object.<Object> */
            var asIsServices = {};

            /**
             * @type {Object.<{$providerMethod: string, declaration: (Function|Array.<(string|Function)>)}>}
             */
            var declarations = {};

            var buildModule = angular.module(buildModuleName, originalModule.requires);

            angular.forEach(toBeIncludedModuleComponents, function (toBeIncludedModuleComponent) {
                if (toBeIncludedModuleComponent.componentKind === 'asIs') {
                    handleAsIsComponentKind(toBeIncludedModuleComponent);
                } else if (toBeIncludedModuleComponent.componentKind === 'withMocks') {
                    handleWithMocksComponentKind(toBeIncludedModuleComponent);
                }
            });

            return angular.mock.module(function($provide) {
                angular.forEach(mockedServices, function(originalService, serviceName) {
                    var mockedService = mockCreator.createMock(originalService);
                    $provide.value(serviceName + 'Mock', mockedService);
                });

                angular.forEach(asIsServices, function(originalService, serviceName) {
                    $provide.value(serviceName, originalService);
                });

                angular.forEach(declarations, function(declarationInfo, declarationName) {
                    console.log(declarationInfo.declaration);
                    $provide[declarationInfo.providerMethod](declarationName, declarationInfo.declaration);
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
