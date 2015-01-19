'use strict';


// @ngInject
function moduleBuilderFactory(moduleIntrospector, mockCreator) {

    /**
     * @constructor
     * @param {Array.<(string|Function|Object)>} modules
     */
    function ModuleBuilder(modules) {

        /**
         * @param {string} providerName
         * @param {string} componentName
         * @param {string} componentKind
         * @param {string} [dependenciesUsage]
         * @param {Array.<string>} [dependencies]
         */
        function includeProviderComponent(providerName, componentName, componentKind, dependenciesUsage, dependencies) {
            var toBeIncludedModuleComponent = {
                providerName: providerName,
                componentName: componentName,
                componentKind: componentKind
            };

            if (dependenciesUsage) {
                toBeIncludedModuleComponent.dependenciesUsage = dependenciesUsage;
                toBeIncludedModuleComponent.dependencies = dependencies;
            }

            toBeIncludedModuleComponents.push(toBeIncludedModuleComponent);
        }


        /**
         * @name ModuleBuilder.ToBeIncludedModuleComponent
         * @typedef {Object}
         * @property {string} type
         * @property {string} componentName
         * @property {string} componentKind
         * @property {(undefined|string)} dependenciesUsage
         * @property {(undefined|Array.<string>)} dependencies
         */

        /** @type {Object.<ModuleBuilder.ToBeIncludedModuleComponent>} */
        var toBeIncludedModuleComponents = [];

        /**
         * Includes a service that replaces all of its dependencies with mock implementations.
         *
         * @param {string} serviceName the name of the service to be registered
         * @returns {moduleBuilderFactory.ModuleBuilder} the module builder instance
         */
        this.serviceWithMocks = function(serviceName) {
            includeProviderComponent('$provide', serviceName, 'withMocks');
            return this;
        };

        /**
         * Includes a service that replaces the dependencies specified in <em>toBeMockedDependencies</em> with mock
         * implementations.
         *
         * @param {string} serviceName the name of the service to be registered
         * @param {...string} toBeMockedDependencies dependencies to be replaced with a mock implementation
         * @returns {moduleBuilderFactory.ModuleBuilder} the module builder instance
         */
        this.serviceWithMocksFor = function(serviceName, toBeMockedDependencies) {
            toBeMockedDependencies = Array.prototype.slice.call(arguments, 1);
            includeProviderComponent('$provide', serviceName, 'withMocks', 'for', toBeMockedDependencies);
            return this;
        };

        /**
         * Includes a service that replaces its dependencies with mock implementations except those specified in
         * <em>notToBeMockedDependencies</em>.
         *
         * @param {string} serviceName the name of the service to be registered
         * @param {...string} notToBeMockedDependencies dependencies that should "not" be replaced with a mock implementation
         * @returns {moduleBuilderFactory.ModuleBuilder} the module builder instance
         */
        this.serviceWithMocksExcept = function(serviceName, notToBeMockedDependencies) {
            notToBeMockedDependencies = Array.prototype.slice.call(arguments, 1);
            includeProviderComponent('$provide', serviceName, 'withMocks', 'except', notToBeMockedDependencies);
            return this;
        };

        /**
         * Includes a filter that replaces all of its dependencies with mock implementations.
         *
         * @param {string} filterName name of the filter to be included in the to be build module
         * @returns {moduleBuilderFactory.ModuleBuilder} the module builder instance
         */
        this.filterWithMocks = function(filterName) {
            includeProviderComponent('$filterProvider', filterName, 'withMocks');
            return this;
        };

        /**
         * Includes a filter that replaces the dependencies specified in <em>toBeMockedDependencies</em> with mock
         * implementations.
         *
         * @param {string} filterName name of the filter to be included in the to be build module
         * @param {...string} toBeMockedDependencies dependencies to be replaced with a mock implementation
         * @returns {moduleBuilderFactory.ModuleBuilder} the module builder instance
         */
        this.filterWithMocksFor = function(filterName, toBeMockedDependencies) {
            toBeMockedDependencies = Array.prototype.slice.call(arguments, 1);
            includeProviderComponent('$filterProvider', filterName, 'withMocks', 'for', toBeMockedDependencies);
            return this;
        };

        /**
         * Includes a filter that replaces its dependencies with mock implementations except those specified in
         * <em>notToBeMockedDependencies</em>.
         *
         * @param {string} filterName name of the filter to be included in the to be build module
         * @param {...string} notToBeMockedDependencies dependencies that should "not" be replaced with a mock implementation
         * @returns {moduleBuilderFactory.ModuleBuilder} the module builder instance
         */
        this.filterWithMocksExcept = function(filterName, notToBeMockedDependencies) {
            notToBeMockedDependencies = Array.prototype.slice.call(arguments, 1);
            includeProviderComponent('$filterProvider', filterName, 'withMocks', 'except', notToBeMockedDependencies);
            return this;
        };

        //TODO: puts entry to the mockedFilters hash causing the $filter to return the mocked filter
        //  (instead of the original one).
        //TODO: should be using using '...WithMocks', '...WithMocksFor' and ''...WithMocksExcept' together with
        //  'filterMock' the mock always be mocked? (i.e. also when nog included in '...WithMocks')
//        this.filterMock = function(filterName) {
//            // include a filter that can be found using "...FilterMock" (or not ?!?) and also through $filter('...')
//        };

        /**
         * Includes a controller that replaces all of its dependencies with mock implementations.
         *
         * @param {string} controllerName name of the controller to be included in the to be build module
         * @returns {moduleBuilderFactory.ModuleBuilder}
         */
        this.controllerWithMocks = function(controllerName) {
            includeProviderComponent('$controllerProvider', controllerName, 'withMocks');
            return this;
        };

        /**
         * Includes a controller that replaces the dependencies specified in <em>toBeMockedDependencies</em> with mock
         * implementations.
         *
         * @param {string} controllerName name of the controller to be included in the to be build module
         * @param {...string} toBeMockedDependencies dependencies to be replaced with a mock implementation
         * @returns {moduleBuilderFactory.ModuleBuilder}
         */
        this.controllerWithMocksFor = function(controllerName, toBeMockedDependencies) {
            toBeMockedDependencies = Array.prototype.slice.call(arguments, 1);
            includeProviderComponent('$controllerProvider', controllerName, 'withMocks', 'for', toBeMockedDependencies);
            return this;
        };

        /**
         * Includes a controller that replaces its dependencies with mock implementations except those specified in
         * <em>notToBeMockedDependencies</em>.
         *
         * @param {string} controllerName name of the controller to be included in the to be build module
         * @param {...string} notToBeMockedDependencies dependencies that should "not" be replaced with a mock implementation
         * @returns {moduleBuilderFactory.ModuleBuilder}
         */
        this.controllerWithMocksExcept = function(controllerName, notToBeMockedDependencies) {
            notToBeMockedDependencies = Array.prototype.slice.call(arguments, 1);
            includeProviderComponent('$controllerProvider', controllerName, 'withMocks', 'except', notToBeMockedDependencies);
            return this;
        };

        //TODO: puts entry to the mockedControllers hash causing the $controller to use the mocked controller
        //  (instead of the original one).
//        this.controllerMock = function(controllerName, controllerMockConfigurator) {
//            // include a mocked controller; should support both "controller as" as traditional $scope-style
//            //  TODO: how should I mock a $scope-style controller
//            //  TODO: make sure that controllerMockConfigurator is optional
//        };

        /**
         * Includes a directive that replaces all of its dependencies with mock implementations.
         *
         * @param {string} directiveName name of the controller to be included in the to be build module
         * @returns {moduleBuilderFactory.ModuleBuilder}
         */
        this.directiveWithMocks = function(directiveName) {
            includeProviderComponent('$compileProvider', directiveName, 'withMocks');
            return this;
        };

        /**
         * Includes a directive that replaces the dependencies specified in <em>toBeMockedDependencies</em> with mock
         * implementations.
         *
         * @param {string} directiveName name of the controller to be included in the to be build module
         * @param {...string} toBeMockedDependencies dependencies to be replaced with a mock implementation
         * @returns {moduleBuilderFactory.ModuleBuilder}
         */
        this.directiveWithMocksFor = function(directiveName, toBeMockedDependencies) {
            toBeMockedDependencies = Array.prototype.slice.call(arguments, 1);
            includeProviderComponent('$compileProvider', directiveName, 'withMocks', 'for', toBeMockedDependencies);
            return this;
        };

        /**
         * Includes a directive that replaces its dependencies with mock implementations except those specified in
         * <em>notToBeMockedDependencies</em>.
         *
         * @param {string} directiveName name of the controller to be included in the to be build module
         * @param {...string} notToBeMockedDependencies dependencies that should "not" be replaced with a mock implementation
         * @returns {moduleBuilderFactory.ModuleBuilder}
         */
        this.directiveWithMocksExcept = function(directiveName, notToBeMockedDependencies) {
            notToBeMockedDependencies = Array.prototype.slice.call(arguments, 1);
            includeProviderComponent('$compileProvider', directiveName, 'withMocks', 'except', notToBeMockedDependencies);
            return this;
        };

        //TODO: puts entry to the mockedDirectives hash causing the $compile to use the mocked directive
        //  (instead of the original one).
//        this.directiveMock = function(directiveName, directiveMockConfigurator) {
//            // include a directive with a mocked controller but without any "link" or "compile" method;
//            // should only work if there is exactly "one" directive with the provided directiveName that has a
//            // (directive) controller
//            //  TODO: make sure that directiveMockConfigurator is optional
//        };

        /**
         * Includes a animation that replaces all of its dependencies with mock implementations.
         *
         * @param {string} animationName name of the controller to be included in the to be build module
         * @returns {moduleBuilderFactory.ModuleBuilder}
         */
        this.animationWithMocks = function(animationName) {
            includeProviderComponent('$animateProvider', animationName, 'withMocks');
            return this;
        };

        /**
         * Includes a animation that replaces the dependencies specified in <em>toBeMockedDependencies</em> with mock implementations.
         *
         * @param {string} animationName name of the controller to be included in the to be build module
         * @param {...string} toBeMockedDependencies dependencies to be replaced with a mock implementation
         * @returns {moduleBuilderFactory.ModuleBuilder}
         */
        this.animationWithMocksFor = function(animationName, toBeMockedDependencies) {
            toBeMockedDependencies = Array.prototype.slice.call(arguments, 1);
            includeProviderComponent('$animateProvider', animationName, 'withMocks', 'for', toBeMockedDependencies);
            return this;
        };

        /**
         * Includes a animation that replaces its dependencies with mock implementations except those specified in
         * <em>notToBeMockedDependencies</em>.
         *
         * @param {string} animationName name of the controller to be included in the to be build module
         * @param {...string} notToBeMockedDependencies dependencies that should "not" be replaced with a mock implementation
         * @returns {moduleBuilderFactory.ModuleBuilder}
         */
        this.animationWithMocksExcept = function(animationName, notToBeMockedDependencies) {
            notToBeMockedDependencies = Array.prototype.slice.call(arguments, 1);
            includeProviderComponent('$animateProvider', animationName, 'withMocks', 'except', notToBeMockedDependencies);
            return this;
        };

        /**
         * Builds the AngularJS module by invoking `angular.mock.module`.
         */
        this.build = function() {

            /**
             * @param {function(object)} callback
             * @returns {Array.<string|Function>}
             */
            function configureProviders(callback) {
                return ['$provide', '$filterProvider', '$controllerProvider', '$compileProvider', '$animateProvider',
                        function($provide, $filterProvider, $controllerProvider, $compileProvider, $animateProvider) {
                    var providers = {
                        $provide: $provide,
                        $filterProvider: $filterProvider,
                        $controllerProvider: $controllerProvider,
                        $compileProvider: $compileProvider,
                        $animateProvider: $animateProvider
                    };

                    callback(providers);
                }];
            }


            var populateModuleComponents = configureProviders(function(providers) {

                function handleWithMocksComponentKind(toBeIncludedModuleComponent) {
                    var providerName = toBeIncludedModuleComponent.providerName;
                    var componentName = toBeIncludedModuleComponent.componentName;

                    var providerComponentDeclaration = getProviderComponentDeclaration(providerName, componentName);

                    if (providerComponentDeclaration.builtIn) {
                        throw 'Built-in components are not allowed to be overridden: ' + componentName;
                    }

                    /** @type {(Array.<(string|Function)>|{$get: Array.<(string|Function)})} */
                    var annotatedDeclaration = [];

                    if (providerName === '$provide') {
                        var providerMethod = providerComponentDeclaration.providerMethod;

                        if (providerMethod === 'constant' || providerMethod === 'value') {
                            throw 'Services declared with "contact" or "value" are not supported';
                        }
                    }


                    angular.forEach(providerComponentDeclaration.injectedServices, function (injectedService) {

                        if (!injector.has(injectedService)) {
                            annotatedDeclaration.push(injectedService);
                        } else {
                            var shouldBeMocked = dependencyShouldBeMocked(toBeIncludedModuleComponent, injectedService);

                            var injectedServiceInstance = injector.get(injectedService);
                            var canBeMocked = mockCreator.canInstanceBeMocked(injectedServiceInstance);

                            if (shouldBeMocked && !canBeMocked &&
                                toBeIncludedModuleComponent.dependenciesUsage === 'for') {
                                throw 'Could not mock the dependency explicitly asked to mock: ' + injectedService;
                            }

                            var toBeMocked = shouldBeMocked && canBeMocked;

                            if (toBeMocked) {
                                mockedServices[injectedService] = injectedServiceInstance;
                            }

                            annotatedDeclaration.push(injectedService + (toBeMocked ? 'Mock' : ''));
                        }
                    });

                    annotatedDeclaration.push(providerComponentDeclaration.strippedDeclaration);

                    if (providerName === '$provide' && providerComponentDeclaration.providerMethod === 'provider') {
                        var $provideProviderDeclaration =
                            introspector.getProviderDeclaration(componentName + 'Provider');

                        if (angular.isFunction($provideProviderDeclaration.strippedDeclaration)) {
                            var original$provideProviderFactory = $provideProviderDeclaration.strippedDeclaration;

                            var originalAnnotatedDeclaration = annotatedDeclaration;

                            var modified$ProvideProviderFactory = function() {
                                var result = original$provideProviderFactory.apply(this, arguments);
                                var instance = angular.isObject(result) ? result : this;
                                instance.$get = originalAnnotatedDeclaration;
                                return result;
                            };

                            annotatedDeclaration =
                                Array.prototype.slice.call($provideProviderDeclaration.injectedProviders);
                            annotatedDeclaration.push(modified$ProvideProviderFactory);
                        } else {
                            annotatedDeclaration = {$get: annotatedDeclaration};
                        }
                    }

                    declarations[componentName] = {
                        providerName: providerName,
                        providerMethod: providerComponentDeclaration.providerMethod,
                        declaration: annotatedDeclaration
                    };
                }

                function getProviderComponentDeclaration(providerName, componentName) {
                    var providerComponentDeclarations = introspector.getProviderComponentDeclarations(providerName, componentName);

                    if (providerComponentDeclarations.length === 1) {
                        return providerComponentDeclarations[0];
                    } else if (providerComponentDeclarations.length === 2 && providerName === '$compileProvider' &&
                            providerComponentDeclarations[0].builtIn) {
                        return providerComponentDeclarations[1];
                    } else {
                        throw new Error('Could not determine unique component declaration for provider "' + providerName + '": ' +
                                componentName);
                    }

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

                function valueFn(value) {
                    return function() {
                        return value;
                    };
                }


                /** @type Object.<Object> */
                var mockedServices = {};

                /**
                 * @type {Object.<{providerName: string, providerMethod: string, declaration: Array.<(string|Function)>}>}
                 */
                var declarations = {};


                var injectorModules = ['ng', 'ngMock'];

                angular.forEach(modules, function(currentModule) {
                    if (angular.isObject(currentModule) && !angular.isArray(currentModule)) {
                        injectorModules.push(function($provide) {
                            angular.forEach(currentModule, function(value, key) {
                                $provide.value(key, value);
                            });
                        });
                    } else {
                        injectorModules.push(currentModule);
                    }
                });

                var introspector = moduleIntrospector(modules, true);

                var injector = /** @type {$injector} */ angular.injector(injectorModules);


                angular.forEach(toBeIncludedModuleComponents, function(toBeIncludedModuleComponent) {
                    if (toBeIncludedModuleComponent.componentKind === 'withMocks') {
                        handleWithMocksComponentKind(toBeIncludedModuleComponent);
                    }
                });


                angular.forEach(mockedServices, function (originalService, serviceName) {
                    var mockedService = mockCreator.mockInstance(originalService);
                    providers.$provide.value(serviceName + 'Mock', mockedService);
                });

                angular.forEach(declarations, function (declarationInfo, declarationName) {
                    if (declarationInfo.providerName !== '$compileProvider') {
                        providers[declarationInfo.providerName][declarationInfo.providerMethod](
                            declarationName, declarationInfo.declaration);
                    } else {
                        providers.$provide.decorator(declarationName + 'Directive', function($delegate, $injector) {
                            var index = $delegate.length === 1 ? 0 : 1;

                            var directive = $injector.invoke(declarationInfo.declaration);

                            if (angular.isFunction(directive)) {
                                $delegate[index].compile = valueFn(directive);
                            } else if (!directive.compile && directive.link) {
                                $delegate[index].compile = valueFn(directive.link);
                            } else if (directive.compile) {
                                $delegate[index].compile = directive.compile;
                            }

                            if (directive.controller) {
                                $delegate[index].controller = directive.controller;
                            }

                            return $delegate;
                        });
                    }
                });

                providers.$provide.value('ngImprovedTestingMockedServices', mockedServices);
            });

            return angular.mock.module.apply(undefined, [].concat(modules).concat([populateModuleComponents, 'ngImprovedTesting']));
        };

    }

    /**
     * @ngdoc service
     * @name moduleBuilder
     */
    return {
        /**
         * @name moduleBuilder#forModule
         * @param {string|Function|Object} module
         * @returns {moduleBuilderFactory.ModuleBuilder}
         */
        forModule: function(module) {
            return new ModuleBuilder([module]);
        },

        /**
         * @name moduleBuilder#forModules
         * @param {...(string|Function|Object)} modules
         * @returns {moduleBuilderFactory.ModuleBuilder}
         */
        forModules: function(modules) {
            modules = Array.prototype.slice.call(arguments);

            return new ModuleBuilder(modules);
        }
    };

}


angular.module('ngImprovedTesting.internal.moduleBuilder', [
        'ngModuleIntrospector',
        'ngImprovedTesting.internal.mockCreator'
    ])
    .factory('moduleBuilder', moduleBuilderFactory);
