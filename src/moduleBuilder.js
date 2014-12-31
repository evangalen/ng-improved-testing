'use strict';


// @ngInject
function moduleBuilderFactory(moduleIntrospector, mockCreator, $log) {

    /**
     * @constructor
     */
    function ModuleBuilder(moduleName) {

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

            if (providerName === '$animateProvider') {
                $animateProviderUsed = true;
            }
        }

        function asIsMethodNameForProviderName(providerName) {
            if (providerName === '$provide') {
                return 'serviceAsIs';
            } else if (providerName === '$filterProvider') {
                return 'filterAsIs';
            } else if (providerName === '$controllerProvider') {
                return 'controllerAsIs';
            } else if (providerName === '$compileProvider') {
                return 'directiveAsIs';
            } else if (providerName === '$animateProvider') {
                return 'animationAsIs';
            } else {
                throw 'Unsupported provider: ' + providerName;
            }
        }


        var $animateProviderUsed = false;

        /** @type {?Function} */
        var moduleConfigFn = null;

        var includeAll = false;

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
         * @param {Function} callback
         */
        this.config = function(callback) {
            moduleConfigFn = callback;
            return this;
        };

        //TODO: finalize the name of this method
        this.includeAll = function() {
            includeAll = true;
            return this;
        };

        //TODO: comment
        this.serviceWithMocks = function(serviceName) {
            includeProviderComponent('$provide', serviceName, 'withMocks');
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
            toBeMockedDependencies = Array.prototype.slice.call(arguments, 1);
            includeProviderComponent('$provide', serviceName, 'withMocks', 'for', toBeMockedDependencies);
            return this;
        };

        //TODO: comment
        this.serviceWithMocksExcept = function(serviceName, notToBeMockedDependencies) {
            notToBeMockedDependencies = Array.prototype.slice.call(arguments, 1);
            includeProviderComponent('$provide', serviceName, 'withMocks', 'except', notToBeMockedDependencies);
            return this;
        };

        /**
         * Including an actual service (and not a mocked one) in the module
         *
         * @param {string} serviceName name of the service to be included in the to be build module
         * @returns {moduleIntrospectorFactory.ModuleBuilder}
         */
        this.serviceAsIs = function(serviceName) {
            includeProviderComponent('$provide', serviceName, 'asIs');
            return this;
        };

        //TODO: comment
        this.filterWithMocks = function(filterName) {
            includeProviderComponent('$filterProvider', filterName, 'withMocks');
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
            includeProviderComponent('$filterProvider', filterName, 'withMocks', 'for', toBeMockedDependencies);
            return this;
        };

        //TODO: comment
        this.filterWithMocksExcept = function(filterName, notToBeMockedDependencies) {
            includeProviderComponent('$filterProvider', filterName, 'withMocks', 'except', notToBeMockedDependencies);
            return this;
        };

        /**
         * Including an actual filter (and not a mocked one) in the module
         *
         * @param {string} filterName name of the filter to be included in the to be build module
         * @returns {moduleIntrospectorFactory.ModuleBuilder}
         */
        this.filterAsIs = function(filterName) {
            includeProviderComponent('$filterProvider', filterName, 'asIs');
            return this;
        };

        //TODO: puts entry to the mockedFilters hash causing the $filter to return the mocked filter
        //  (instead of the original one).
        //TODO: decide if we only want $filter to work for explicitly registered components, which could in this case
        //  also be `...AsIs` components, (which could possible retrieve $filter using $injector.get('$filter')
        //TODO: decide if we want to expose filters with '...FilterMock' (possibly) together with '...Mock'
        //TODO: should we support mocking filters using '...WithMocks', '...WithMocksFor' and ''...WithMocksExcept' in
        //  case the filter is used as an injected service through the '...Filter' name.
        //TODO: should be using using '...WithMocks', '...WithMocksFor' and ''...WithMocksExcept' together with
        //  'filterMock' the mock always be mocked? (i.e. also when nog included in '...WithMocks')
//        this.filterMock = function(filterName) {
//            // include a filter that can be found using "...FilterMock" (or not ?!?) and also through $filter('...')
//        };

        //TODO: comment
        this.controllerWithMocks = function(controllerName) {
            includeProviderComponent('$controllerProvider', controllerName, 'withMocks');
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
            toBeMockedDependencies = Array.prototype.slice.call(arguments, 1);
            includeProviderComponent('$controllerProvider', controllerName, 'withMocks', 'for', toBeMockedDependencies);
            return this;
        };

        //TODO: comment
        this.controllerWithMocksExcept = function(controllerName, toBeMockedDependencies) {
            includeProviderComponent('$controllerProvider', controllerName, 'withMocks', 'except', toBeMockedDependencies);
            return this;
        };

        /**
         * Including an actual controller (and not a mocked one) in the module
         *
         * @param {string} controllerName name of the controller to be included in the to be build module
         * @returns {moduleIntrospectorFactory.ModuleBuilder}
         */
        this.controllerAsIs = function(controllerName) {
            includeProviderComponent('$controllerProvider', controllerName, 'asIs');
            return this;
        };

        //TODO: puts entry to the mockedControllers hash causing the $controller to use the mocked controller
        //  (instead of the original one).
        //TODO: decide if we only want $controller to work for explicitly registered components, which could in this
        //  case also be `...AsIs` components, (which could possible retrieve $controller using
        //  $injector.get('$controller')
        //      - same should also apply when using `inject(...)` in your tests
//        this.controllerMock = function(controllerName, controllerMockConfigurator) {
//            // include a mocked controller; should support both "controller as" as traditional $scope-style
//            //  TODO: how should I mock a $scope-style controller
//            //  TODO: make sure that controllerMockConfigurator is optional
//        };

        //TODO: comment
        this.directiveWithMocks = function(directiveName) {
            includeProviderComponent('$compileProvider', directiveName, 'withMocks');
            return this;
        };

        /**
         * Includes a directive that uses mocked service dependencies (instead of actual services) in the module.
         *
         * @param {string} directiveName name of the controller to be included in the to be build module
         * @param {...string} toBeMockedDependencies dependencies to be replaced with a mock implementation
         * @returns {moduleIntrospectorFactory.ModuleBuilder}
         */
        this.directiveWithMocksFor = function(directiveName, toBeMockedDependencies) {
            toBeMockedDependencies = Array.prototype.slice.call(arguments, 1);
            includeProviderComponent('$compileProvider', directiveName, 'withMocks', 'for', toBeMockedDependencies);
            return this;
        };

        //TODO: comment
        this.directiveWithMocksExcept = function(directiveName, toBeMockedDependencies) {
            includeProviderComponent('$compileProvider', directiveName, 'withMocks', 'except', toBeMockedDependencies);
            return this;
        };

        /**
         * Including an actual directive (and not a mocked one) in the module
         *
         * @param {string} directiveName name of the directive to be included in the to be build module
         * @returns {moduleIntrospectorFactory.ModuleBuilder}
         */
        this.directiveAsIs = function(directiveName) {
            includeProviderComponent('$compileProvider', directiveName, 'asIs');
            return this;
        };

        //TODO: puts entry to the mockedDirectives hash causing the $compile to use the mocked directive
        //  (instead of the original one).
        //TODO: decide if we only want $compile to work for explicitly registered components, which could in this
        //  case also be `...AsIs` components, (which could possible retrieve $compile using $injector.get('$compile')
        //      - same should also apply when using `inject(...)` in your tests
//        this.directiveMock = function(directiveName, directiveMockConfigurator) {
//            // include a directive with a mocked controller but without any "link" or "compile" method;
//            // should only work if there is exactly "one" directive with the provided directiveName that has a
//            // (directive) controller
//            //  TODO: make sure that directiveMockConfigurator is optional
//        };

        //TODO: comment
        this.animationWithMocks = function(animationName) {
            includeProviderComponent('$animateProvider', animationName, 'withMocks');
            return this;
        };

        /**
         * Includes a animation that uses mocked service dependencies (instead of actual services) in the module.
         *
         * @param {string} animationName name of the controller to be included in the to be build module
         * @param {...string} toBeMockedDependencies dependencies to be replaced with a mock implementation
         * @returns {moduleIntrospectorFactory.ModuleBuilder}
         */
        this.animationWithMocksFor = function(animationName, toBeMockedDependencies) {
            toBeMockedDependencies = Array.prototype.slice.call(arguments, 1);
            includeProviderComponent('$animateProvider', animationName, 'withMocks', 'for', toBeMockedDependencies);
            return this;
        };

        //TODO: comment
        this.animationWithMocksExcept = function(animationName, toBeMockedDependencies) {
            includeProviderComponent('$animateProvider', animationName, 'withMocks', 'except', toBeMockedDependencies);
            return this;
        };

        /**
         * Including an actual animation (and not a mocked one) in the module
         *
         * @param {string} animationName name of the animation to be included in the to be build module
         * @returns {moduleIntrospectorFactory.ModuleBuilder}
         */
        this.animationAsIs = function(animationName) {
            includeProviderComponent('$animateProvider', animationName, 'asIs');
            return this;
        };


        /**
         * Builds ...
         * @returns {Function}
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


            var builtInServices = {};

            var populateModuleComponents = configureProviders(function(providers) {
                function handleAsIsComponentKind(toBeIncludedModuleComponent) {
                    var providerName = toBeIncludedModuleComponent.providerName;
                    var componentName = toBeIncludedModuleComponent.componentName;

                    if (includeAll) {
                        $log.warn('Ignoring `' + asIsMethodNameForProviderName(providerName) + '(' + componentName +
                                ')` since `includeAll()` is also used.');
                        return;
                    }

                    if (providerName === '$controllerProvider' || providerName === '$filterProvider' ||
                        providerName === '$compileProvider' || providerName === '$animateProvider') {
                        var providerComponentDeclaration =
                            introspector.getProviderComponentDeclaration(providerName, componentName);

                        angular.forEach(providerComponentDeclaration.injectedServices, function(injectedService) {
                            if (injector.has(injectedService)) {
                                asIsServices[injectedService] = injector.get(injectedService);
                            }
                        });

                        declarations[componentName] = {
                            providerName: providerName,
                            providerMethod: providerComponentDeclaration.providerMethod,
                            declaration: providerComponentDeclaration.rawDeclaration
                        };
                    } else if (providerName === '$provide') {
                        asIsServices[componentName] = injector.get(componentName);
                    } else {
                        throw 'Unsupported provider: ' + providerName;
                    }
                }

                function handleWithMocksComponentKind(toBeIncludedModuleComponent) {
                    var providerName = toBeIncludedModuleComponent.providerName;
                    var componentName = toBeIncludedModuleComponent.componentName;

                    var providerComponentDeclaration =
                        introspector.getProviderComponentDeclaration(providerName, componentName);

                    /** @type {(Array.<(string|Function)>|{$get: Array.<(string|Function)})} */
                    var annotatedDeclaration = [];

                    if (providerName === '$provide') {
                        var providerMethod =
                            introspector.getProviderComponentDeclaration('$provide', componentName).providerMethod;

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
                            } else if (!includeAll) {
                                asIsServices[injectedService] = injectedServiceInstance;
                            }

                            annotatedDeclaration.push(injectedService + (toBeMocked ? 'Mock' : ''));
                        }
                    });

                    annotatedDeclaration.push(providerComponentDeclaration.strippedDeclaration);

                    if (providerName === '$provide' && providerComponentDeclaration.providerMethod === 'provider') {
                        annotatedDeclaration = {$get: annotatedDeclaration};
                    }

                    declarations[componentName] = {
                        providerName: providerName,
                        providerMethod: providerComponentDeclaration.providerMethod,
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

                function ensureModuleExist(moduleName) {
                    angular.module(moduleName);
                }


                /** @type Object.<Object> */
                var mockedServices = {};

                /** @type Object.<Object> */
                var asIsServices = {};

                /**
                 * @type {Object.<{providerName: string, providerMethod: string, declaration: Array.<(string|Function)>}>}
                 */
                var declarations = {};


                // ensure that the module exists. Throws an [$injector:nomod] whenever it not exists
                ensureModuleExist(moduleName);


                var registrationMethodNamePerProvider = {
                    $filterProvider: 'register',
                    $controllerProvider: 'register',
                    $compileProvider: 'directive',
                    $animateProvider: 'register'
                };

                var originalRegistrationMethodPerProvider = null;

                var temporaryChangeProviderRegistrationMethodConfig = function(
                        $filterProvider, $controllerProvider, $compileProvider, $animateProvider) {
                    originalRegistrationMethodPerProvider = {
                        $filterProvider: $filterProvider[registrationMethodNamePerProvider.$filterProvider],
                        $controllerProvider: $controllerProvider[registrationMethodNamePerProvider.$controllerProvider],
                        $compileProvider: $compileProvider[registrationMethodNamePerProvider.$compileProvider],
                        $animateProvider: $animateProvider[registrationMethodNamePerProvider.$animateProvider]
                    };

                    registrationMethodNamePerProvider.$filterProvider = angular.noop;
                    registrationMethodNamePerProvider.$controllerProvider = angular.noop;
                    registrationMethodNamePerProvider.$compileProvider = angular.noop;
                    registrationMethodNamePerProvider.$animateProvider = angular.noop;
                };

                var restoreProviderRegistrationMethodConfig = function(
                        $filterProvider, $controllerProvider, $compileProvider, $animateProvider) {
                    $filterProvider[registrationMethodNamePerProvider.$filterProvider] =
                        originalRegistrationMethodPerProvider.$filterProvider;
                    $controllerProvider[registrationMethodNamePerProvider.$controllerProvider] =
                        originalRegistrationMethodPerProvider.$controllerProvider;
                    $compileProvider[registrationMethodNamePerProvider.$compileProvider] =
                        originalRegistrationMethodPerProvider.$compileProvider;
                    $animateProvider[registrationMethodNamePerProvider.$animateProvider] =
                        originalRegistrationMethodPerProvider.$animateProvider;
                };

                var injectorModules = ['ng', 'ngMock'];

                if (!includeAll) {
                    injectorModules.push(temporaryChangeProviderRegistrationMethodConfig);
                }

                injectorModules.push(moduleName);

                if (!includeAll) {
                    injectorModules.push(restoreProviderRegistrationMethodConfig);
                }

                if (moduleConfigFn) {
                    injectorModules.push(moduleConfigFn);
                }

                var introspector = moduleIntrospector(moduleName, true);

                var injector = /** @type {$injector} */ angular.injector(injectorModules);

                if (!includeAll) {
                    var builtInProviderNames = introspector.getBuiltInProviderNames();

                    angular.forEach(builtInProviderNames, function(providerName) {
                        var serviceName = providerName.substring(0, providerName.length - 'Provider'.length);
                        builtInServices[serviceName] = injector.get(serviceName);
                    });
                }

                if ($animateProviderUsed) {
                    var $animate = injector.get('$animate');

                    if ($animate.enabled === angular.noop) {
                        throw 'Animations are included in the to be build module, but the original module did not ' +
                                'the "ngAnimate" module: ' + moduleName;
                    }
                }




                angular.forEach(toBeIncludedModuleComponents, function(toBeIncludedModuleComponent) {
                    if (toBeIncludedModuleComponent.componentKind === 'asIs') {
                        handleAsIsComponentKind(toBeIncludedModuleComponent);
                    } else if (toBeIncludedModuleComponent.componentKind === 'withMocks') {
                        handleWithMocksComponentKind(toBeIncludedModuleComponent);
                    }
                });


                angular.forEach(mockedServices, function (originalService, serviceName) {
                    var mockedService = mockCreator.mockInstance(originalService);
                    providers.$provide.value(serviceName + 'Mock', mockedService);
                });

                angular.forEach(asIsServices, function (originalService, serviceName) {
                    //TODO: skip built-in services?!? Or not?!?
                    //TODO: should we also skip the services ($animate) from ngAnimate?!?
                    providers.$provide.value(serviceName, originalService);
                });

                angular.forEach(declarations, function (declarationInfo, declarationName) {
                    providers[declarationInfo.providerName][declarationInfo.providerMethod](
                        declarationName, declarationInfo.declaration);
                });
            });

            var mockModuleArgs = [];
            if ($animateProviderUsed && !includeAll) {
                mockModuleArgs.push('ngAnimate');
            }

            if (includeAll) {
                mockModuleArgs.push(moduleName);
            } else {
                mockModuleArgs.push(function($provide) {
                    angular.forEach(builtInServices, function (serviceInstance, serviceName) {
                        $provide.value(serviceName, serviceInstance);
                    });
                });
            }

            mockModuleArgs.push(populateModuleComponents);

            mockModuleArgs.push('ngImprovedTesting');

            return angular.mock.module.apply(undefined, mockModuleArgs);
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
         * @returns {moduleBuilderFactory.ModuleBuilder}
         */
        forModule: function(moduleName) {
            return new ModuleBuilder(moduleName);
        }
    };

}


angular.module('ngImprovedTesting.internal.moduleBuilder', [
        'ngModuleIntrospector',
        'ngImprovedTesting.internal.mockCreator'
    ])
    .factory('moduleBuilder', moduleBuilderFactory);
