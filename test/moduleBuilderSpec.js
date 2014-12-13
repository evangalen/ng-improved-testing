'use strict';

describe('moduleBuilder service', function() {

    //TODO: add spec to test that:
    // - "ngImprovedTesting" is added to the modules requires of the generated / created module
    // - expection is thrown when animations are used by no "ngAnimate" requires exist
    // - module config fn call be added `withConfig`
    // - only the whole original module is included when `includeAll()` was invoked
    // - only the components included using the ModuleBuilder (and its dependencies) will be added created module


    /** @const */
    var nonMockableService = Object.freeze({aProperty: 'aValue'});

    /** @const */
    var mockableServiceA = Object.freeze({aMethod: function() {}});

    /** @const */
    var mockableServiceB = Object.freeze({aMethod: function() {}});


    /**
     * @constructor
     * @const
     */
    var AServiceConstructor = jasmine.createSpy();

    /** @const */
    var aServiceFactoryFactory = jasmine.createSpy().andCallFake(function() {
        return {};
    });

    /**
     * @constructor
     * @const
     */
    var AControllerConstructor = jasmine.createSpy();

    /**
     * @const
     */
    var aDirectiveLinkFn = jasmine.createSpy();

    /**
     * @const
     */
    var aDirectiveFactory = jasmine.createSpy().andCallFake(function() {
        return aDirectiveLinkFn;
    });

    /** @const */
    var $getProviderFactory = jasmine.createSpy().andCallFake(function() {
        return {};
    });

    /** @const */
    var aFilter = function(input) {
        return input;
    };

    /** @const */
    var aFilterFactory = jasmine.createSpy().andCallFake(function() {
        return aFilter;
    });

    /** @const */
    var anAnimationEnterMethod = jasmine.createSpy();

    /** @const */
    var anAnimationFactory = jasmine.createSpy().andCallFake(function() {
        return {
            enter: anAnimationEnterMethod
        };
    });

    /** @const */
    var originalModuleInstance = angular.module('moduleBuilderSpecModule', ['ngAnimate'])
        .value('nonMockableService', nonMockableService)
        .value('mockableServiceA', mockableServiceA)
        .value('mockableServiceB', mockableServiceB)
        .factory('aServiceFactory',
                ['nonMockableService', 'mockableServiceA', 'mockableServiceB', aServiceFactoryFactory])
        .service('aServiceService',
                ['nonMockableService', 'mockableServiceA', 'mockableServiceB', AServiceConstructor])
        .provider('aServiceProviderObject', {
            $get: ['nonMockableService', 'mockableServiceA', 'mockableServiceB', $getProviderFactory]
        })
        .provider('aServiceProviderFactory', function() {
            return {
                $get: ['nonMockableService', 'mockableServiceA', 'mockableServiceB', $getProviderFactory]
            };
        })
        .filter('aFilter', ['nonMockableService', 'mockableServiceA', 'mockableServiceB', aFilterFactory])
        .controller('aController',
                ['$scope', 'nonMockableService', 'mockableServiceA', 'mockableServiceB', AControllerConstructor])
        .directive('aDirective',
                ['nonMockableService', 'mockableServiceA', 'mockableServiceB', aDirectiveFactory])
        .animation('.anAnimation',
            ['nonMockableService', 'mockableServiceA', 'mockableServiceB', anAnimationFactory]);


    var moduleBuilder;

    var createdInjector = null;
    var moduleIntrospectorInstance = null;


    beforeEach(function(){
        this.addMatchers({
            toThrowModuleError: function(expectedWrappedMessage) {
                var result = false;

                if (typeof this.actual !== 'function') {
                    throw new Error('Actual is not a function');
                } else if (this.isNot) {
                    throw new Error('Using ".not" is not supported with this matcher');
                }

                var exception;

                try {
                    this.actual();
                } catch (e) {
                    exception = e;

                    var isError = Object.prototype.toString.call(e) === '[object Error]';
                    if (!isError) {
                        this.message = function() {
                            return 'Excepted an exception of type Error:' + e;
                        };
                    }

                    var actualErrorMessage = e.message;

                    var errorMessageRegExp =
                        /^\[\$injector:modulerr\]\ Failed to instantiate module .* due to:\n(.*)\n.*/;

                    var regExpExecResult = errorMessageRegExp.exec(actualErrorMessage);

                    result = regExpExecResult && regExpExecResult[1] === expectedWrappedMessage;

                }

                this.message = function() {
                    return 'Expected function to throw ' + expectedWrappedMessage + ', but it threw ' +
                            (exception && exception.message);
                };

                return result;
            }
        });
    });


    beforeEach(function() {
        var ngModuleIntrospectorInjector = angular.injector(['ngModuleIntrospector']);
        var originalModuleIntrospector = ngModuleIntrospectorInjector.get('moduleIntrospector');

        var ngImprovedTestingInjector = angular.injector(['ngImprovedTesting.internal.moduleBuilder', function($provide) {
            var spiedModuleIntrospector = jasmine.createSpy().andCallFake(function() {
                var result = originalModuleIntrospector.apply(this, arguments);

                moduleIntrospectorInstance = result;

                for (var propertyName in result) {
                    if (result.hasOwnProperty(propertyName) && angular.isFunction(result[propertyName])) {
                        spyOn(result, propertyName).andCallThrough();
                    }
                }

                return result;
            });

            $provide.value('moduleIntrospector', spiedModuleIntrospector);
        }]);

        moduleBuilder = ngImprovedTestingInjector.get('moduleBuilder');

        var originalInjectorFn = angular.injector;
        spyOn(angular, 'injector').andCallFake(function() {
            var result = originalInjectorFn.apply(this, arguments);

            createdInjector = result;

            return result;
        });
    });

    afterEach(function() {
        createdInjector = null;
        moduleIntrospectorInstance = null;
    });



    describe('forModule method', function() {

        it('should create a builder object', function() {
            var result = moduleBuilder.forModule(originalModuleInstance.name);

            expect(angular.isObject(result)).toBe(true);
            expect(angular.isFunction(result.build)).toBe(true);
        });

    });



    describe('ngImprovedTesting.ModuleBuilder', function() {

        function generateSpecTestingMockingOfDependenciesOfConstantAndValueServicesIsNotAllowed(methodName) {
            it('for a "constant" service', function() {
                originalModuleInstance.constant('aConstant', 'aConstantValue');

                moduleBuilder.forModule(originalModuleInstance.name)[methodName]('aConstant').build();

                expect(function() {
                    inject();
                }).toThrowModuleError('Services declared with "contact" or "value" are not supported');
            });

            it('for a "value" service', function() {
                originalModuleInstance.value('aValue', 'aValueValue');

                moduleBuilder.forModule(originalModuleInstance.name)[methodName]('aValue').build();

                expect(function() {
                    inject();
                }).toThrowModuleError('Services declared with "contact" or "value" are not supported');
            });
        }

        function assertMockableDepenciesWereMocked(
                declaration, expectMockableServiceAMocked, expectMockableServiceBMocked, prependedDependenciesCount) {
            prependedDependenciesCount = prependedDependenciesCount || 0;

            expect(declaration).toHaveBeenCalled();
            expect(declaration.mostRecentCall.args.length).toBe(3 + prependedDependenciesCount);
            expect(declaration.mostRecentCall.args[prependedDependenciesCount + 0]).toBe(nonMockableService);

            if (expectMockableServiceAMocked) {
                expect(declaration.mostRecentCall.args[prependedDependenciesCount + 1]).not.toBe(mockableServiceA);
                expect(jasmine.isSpy(declaration.mostRecentCall.args[prependedDependenciesCount + 1].aMethod))
                    .toBe(true);
            } else {
                expect(declaration.mostRecentCall.args[prependedDependenciesCount + 1]).toBe(mockableServiceA);
            }

            if (expectMockableServiceBMocked) {
                expect(declaration.mostRecentCall.args[prependedDependenciesCount + 2]).not.toBe(mockableServiceB);
                expect(jasmine.isSpy(declaration.mostRecentCall.args[prependedDependenciesCount + 2].aMethod))
                    .toBe(true);
            } else {
                expect(declaration.mostRecentCall.args[prependedDependenciesCount + 2]).toBe(mockableServiceB);
            }
        }

        function testAnimationWithMocks(expectMockableServiceAMocked, expectMockableServiceBMocked) {
            inject(function($rootScope, $compile, $rootElement, $animate) {
                var $scope = $rootScope.$new();
                var parentElement = $compile('<div><div class="anAnimation"></div></div>')($scope);

                var element = parentElement.children().eq(0);

                $animate.enabled(true);
                $animate.enter(element, parentElement);
                $scope.$digest();

                assertMockableDepenciesWereMocked(
                        anAnimationFactory, expectMockableServiceAMocked, expectMockableServiceBMocked);
            });
        }


        describe('serviceWithMocks method', function() {

            describe('should throw an exception when when build() and then inject(...) is invoked', function() {
                generateSpecTestingMockingOfDependenciesOfConstantAndValueServicesIsNotAllowed('serviceWithMocks');
            });

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.serviceWithMocks('aServiceFactory');

                expect(result).toBe(moduleBuilderInstance);
            });


            describe('when build() and then inject(...) is invoked', function() {

                it('should mock all mockable dependencies', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocks('aServiceFactory')
                        .build();

                    inject(function(aServiceFactory) {
                        expect(aServiceFactory).toBeDefined();
                        assertMockableDepenciesWereMocked(aServiceFactoryFactory, true, true);
                    });
                });

                it('should support mocking dependencies of a "service" registered service', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocks('aServiceService')
                        .build();

                    inject(function(aServiceService) {
                        assertMockableDepenciesWereMocked(AServiceConstructor, true, true);
                        expect(aServiceService instanceof AServiceConstructor).toBe(true);
                    });
                });

                it('should support mocking dependencies of a "provider" registered service with an object', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocks('aServiceProviderObject')
                        .build();

                    inject(function(aServiceProviderObject) {
                        expect(aServiceProviderObject).toBeDefined();
                        assertMockableDepenciesWereMocked($getProviderFactory, true, true);
                    });
                });

                it('should support mocking dependencies of a "provider" registered service with an ' +
                        'factory', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocks('aServiceProviderFactory')
                        .build();

                    inject(function(aServiceProviderFactory) {
                        expect(aServiceProviderFactory).toBeDefined();
                        assertMockableDepenciesWereMocked($getProviderFactory, true, true);
                    });
                });
            });
        });


        describe('serviceWithMocksFor method', function() {

            describe('should throw an exception when when build() and then inject(...) is invoked', function() {
                generateSpecTestingMockingOfDependenciesOfConstantAndValueServicesIsNotAllowed('serviceWithMocksFor');
            });

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.serviceWithMocksFor('aServiceFactory', 'mockableServiceB');

                expect(result).toBe(moduleBuilderInstance);
            });

            describe('when build() and then inject(...) is invoked', function() {

                it('only a explicitly specified dependency should be mocked when its mockable', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksFor('aServiceFactory', 'mockableServiceB')
                        .build();

                    inject(function(aServiceFactory) {
                        expect(aServiceFactory).toBeDefined();
                        assertMockableDepenciesWereMocked(aServiceFactoryFactory, false, true);
                    });
                });

                it('should throw exception when you explicitly want to mock a non-mockable service', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksFor('aServiceFactory', 'nonMockableService')
                        .build();

                    expect(function() {
                        inject();
                    }).toThrowModuleError('Could not mock the dependency explicitly asked to mock: nonMockableService');
                });

                it('should support mocking dependencies of a "service" registered service', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksFor('aServiceService', 'mockableServiceB')
                        .build();

                    inject(function(aServiceService) {
                        assertMockableDepenciesWereMocked(AServiceConstructor, false, true);
                        expect(aServiceService instanceof AServiceConstructor).toBe(true);
                    });
                });

                it('should support mocking dependencies of a "provider" registered service with an object', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksFor('aServiceProviderObject', 'mockableServiceB')
                        .build();

                    inject(function(aServiceProviderObject) {
                        expect(aServiceProviderObject).toBeDefined();
                        assertMockableDepenciesWereMocked($getProviderFactory, false, true);
                    });
                });

                it('should support mocking dependencies of a "provider" registered service with an ' +
                        'factory', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksFor('aServiceProviderFactory', 'mockableServiceB')
                        .build();

                    inject(function(aServiceProviderFactory) {
                        expect(aServiceProviderFactory).toBeDefined();
                        assertMockableDepenciesWereMocked($getProviderFactory, false, true);
                    });
                });

            });
        });


        describe('serviceWithMocksExcept method', function() {

            describe('should throw an exception when when build() and then inject(...) is invoked', function() {
                generateSpecTestingMockingOfDependenciesOfConstantAndValueServicesIsNotAllowed(
                        'serviceWithMocksExcept');
            });

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.serviceWithMocksExcept('aServiceFactory', 'mockableServiceA');

                expect(result).toBe(moduleBuilderInstance);
            });

            describe('when build() and then inject(...) is invoked', function() {

                it('should mock all mockable dependencies except when provided to be excluded', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksExcept('aServiceFactory', 'mockableServiceA')
                        .build();

                    inject(function(aServiceFactory) {
                        expect(aServiceFactory).toBeDefined();
                        assertMockableDepenciesWereMocked(aServiceFactoryFactory, false, true);
                    });
                });

                it('should ignore (not throw an exception) any non-mockable dependencies when provided to be ' +
                        'excluded', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksExcept('aServiceFactory', 'mockableServiceA', 'nonMockableService')
                        .build();

                    inject(function(aServiceFactory) {
                        expect(aServiceFactory).toBeDefined();
                        assertMockableDepenciesWereMocked(aServiceFactoryFactory, false, true);
                    });
                });

                it('should support mocking dependencies of a "service" registered service', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksExcept('aServiceService', 'mockableServiceA')
                        .build();

                    inject(function(aServiceService) {
                        assertMockableDepenciesWereMocked(AServiceConstructor, false, true);
                        expect(aServiceService instanceof AServiceConstructor).toBe(true);
                    });
                });

                it('should support mocking dependencies of a "provider" registered service with an object', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksExcept('aServiceProviderObject', 'mockableServiceA')
                        .build();

                    inject(function(aServiceProviderObject) {
                        expect(aServiceProviderObject).toBeDefined();
                        assertMockableDepenciesWereMocked($getProviderFactory, false, true);
                    });
                });

                it('should support mocking dependencies of a "provider" registered service with an ' +
                        'factory', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksExcept('aServiceProviderFactory', 'mockableServiceA')
                        .build();

                    inject(function(aServiceProviderFactory) {
                        expect(aServiceProviderFactory).toBeDefined();
                        assertMockableDepenciesWereMocked($getProviderFactory, false, true);
                    });
                });

            });
        });


        describe('serviceAsIs method', function() {

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.serviceAsIs('aServiceFactory');

                expect(result).toBe(moduleBuilderInstance);
            });

            describe('when build() and then inject(...) is invoked', function() {

                it('should include the filter as is', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceAsIs('aServiceFactory')
                        .build();

                    inject(function(aServiceFactory) {
                        expect(aServiceFactory).toBeDefined();
                        assertMockableDepenciesWereMocked(aServiceFactoryFactory, false, false);
                    });
                });
            });
        });



        describe('filterWithMocks method', function() {

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.filterWithMocks('aFilter');

                expect(result).toBe(moduleBuilderInstance);
            });

            describe('when build() and then inject(...) is invoked', function() {

                it('should mock all mockable dependencies', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .filterWithMocks('aFilter')
                        .build();

                    inject(function(aFilterFilter) {
                        expect(aFilterFilter).toBeDefined();
                        assertMockableDepenciesWereMocked(aFilterFactory, true, true);
                    });
                });
            });
        });


        describe('filterWithMocksFor method', function() {

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.filterWithMocksFor('aFilter', 'mockableServiceB');

                expect(result).toBe(moduleBuilderInstance);
            });

            describe('when build() and then inject(...) is invoked', function() {

                it('only a explicitly specified dependency should be mocked when its mockable', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .filterWithMocksFor('aFilter', 'mockableServiceB')
                        .build();

                    inject(function(aFilterFilter) {
                        expect(aFilterFilter).toBeDefined();
                        assertMockableDepenciesWereMocked(aFilterFactory, false, true);
                    });
                });

                it('should throw exception when you explicitly want to mock a non-mockable service', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .filterWithMocksFor('aFilter', 'nonMockableService')
                        .build();

                    expect(function() {
                        inject();
                    }).toThrowModuleError('Could not mock the dependency explicitly asked to mock: nonMockableService');
                });
            });
        });


        describe('filterWithMocksExcept method', function() {

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.filterWithMocksExcept('aFilter', 'mockableServiceA');

                expect(result).toBe(moduleBuilderInstance);
            });

            describe('when build() and then inject(...) is invoked', function() {

                it('should mock all mockable dependencies except when provided to be excluded', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .filterWithMocksExcept('aFilter', 'mockableServiceA')
                        .build();

                    inject(function(aFilterFilter) {
                        expect(aFilterFilter).toBeDefined();
                        assertMockableDepenciesWereMocked(aFilterFactory, false, true);
                    });
                });

                it('should ignore (not throw an exception) any non-mockable dependencies when provided to be ' +
                    'excluded', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .filterWithMocksExcept('aFilter', 'mockableServiceA', 'nonMockableService')
                        .build();

                    inject(function(aFilterFilter) {
                        expect(aFilterFilter).toBeDefined();
                        assertMockableDepenciesWereMocked(aFilterFactory, false, true);
                    });
                });
            });
        });


        describe('filterAsIs method', function() {

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.filterAsIs('aFilter');

                expect(result).toBe(moduleBuilderInstance);
            });

            describe('when build() and then inject(...) is invoked', function() {

                it('should include the filter as is', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .filterAsIs('aFilter')
                        .build();

                    inject(function(aFilterFilter) {
                        expect(aFilterFilter).toBe(aFilter);
                        assertMockableDepenciesWereMocked(aFilterFactory, false, false);
                    });
                });
            });
        });



        describe('controllerWithMocks method', function() {

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.controllerWithMocks('aController');

                expect(result).toBe(moduleBuilderInstance);
            });

            describe('when build() and then inject(...) is invoked', function() {

                it('should mock all mockable dependencies', function() {
                    var expectedScopeProperty = {};

                    AControllerConstructor.andCallFake(function($scope) {
                        $scope.aProperty = expectedScopeProperty;
                    });

                    moduleBuilder.forModule(originalModuleInstance.name)
                        .controllerWithMocks('aController')
                        .build();

                    inject(function($rootScope, $controller) {
                        var $scope = $rootScope.$new();
                        $controller('aController', {$scope: $scope});

                        assertMockableDepenciesWereMocked(AControllerConstructor, true, true, 1);
                        expect(AControllerConstructor.mostRecentCall.args[0]).toBe($scope);

                        expect($scope.aProperty).toBe(expectedScopeProperty);
                    });
                });
            });
        });


        describe('controllerWithMocksFor method', function() {

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.controllerWithMocksFor('aController', 'mockableServiceB');

                expect(result).toBe(moduleBuilderInstance);
            });

            describe('when build() and then inject(...) is invoked', function() {

                it('only a explicitly specified dependency should be mocked when its mockable', function() {
                    var expectedScopeProperty = {};

                    AControllerConstructor.andCallFake(function($scope) {
                        $scope.aProperty = expectedScopeProperty;
                    });

                    moduleBuilder.forModule(originalModuleInstance.name)
                        .controllerWithMocksFor('aController', 'mockableServiceB')
                        .build();

                    inject(function($rootScope, $controller) {
                        var $scope = $rootScope.$new();
                        $controller('aController', {$scope: $scope});

                        assertMockableDepenciesWereMocked(AControllerConstructor, false, true, 1);
                        expect(AControllerConstructor.mostRecentCall.args[0]).toBe($scope);

                        expect($scope.aProperty).toBe(expectedScopeProperty);
                    });
                });

                it('should throw exception when you explicitly want to mock a non-mockable service', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .controllerWithMocksFor('aController', 'nonMockableService')
                        .build();

                    expect(function() {
                        inject();
                    }).toThrowModuleError('Could not mock the dependency explicitly asked to mock: nonMockableService');
                });
            });
        });


        describe('controllerWithMocksExcept method', function() {

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.controllerWithMocksExcept('aController', 'mockableServiceB');

                expect(result).toBe(moduleBuilderInstance);
            });

            describe('when build() and then inject(...) is invoked', function() {

                it('only a explicitly specified dependency should be mocked when its mockable', function() {
                    var expectedScopeProperty = {};

                    AControllerConstructor.andCallFake(function($scope) {
                        $scope.aProperty = expectedScopeProperty;
                    });

                    moduleBuilder.forModule(originalModuleInstance.name)
                        .controllerWithMocksExcept('aController', 'mockableServiceA', 'nonMockableService')
                        .build();

                    inject(function($rootScope, $controller) {
                        var $scope = $rootScope.$new();
                        $controller('aController', {$scope: $scope});

                        assertMockableDepenciesWereMocked(AControllerConstructor, false, true, 1);
                        expect(AControllerConstructor.mostRecentCall.args[0]).toBe($scope);

                        expect($scope.aProperty).toBe(expectedScopeProperty);
                    });
                });
            });
        });


        describe('controllerAsIs method', function() {

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.controllerAsIs('aController');

                expect(result).toBe(moduleBuilderInstance);
            });

            describe('when build() and then inject(...) is invoked', function() {

                it('should include the controller as is', function() {
                    var expectedScopeProperty = {};

                    AControllerConstructor.andCallFake(function($scope) {
                        $scope.aProperty = expectedScopeProperty;
                    });

                    moduleBuilder.forModule(originalModuleInstance.name)
                        .controllerAsIs('aController')
                        .build();

                    inject(function($rootScope, $controller) {
                        var $scope = $rootScope.$new();
                        $controller('aController', {$scope: $scope});

                        assertMockableDepenciesWereMocked(AControllerConstructor, false, false, 1);
                        expect(AControllerConstructor.mostRecentCall.args[0]).toBe($scope);

                        expect($scope.aProperty).toBe(expectedScopeProperty);
                    });
                });
            });
        });



        describe('directiveWithMocks method', function() {

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.directiveWithMocks('aDirective');

                expect(result).toBe(moduleBuilderInstance);
            });

            describe('when build() and then inject(...) is invoked', function() {

                it('should mock all mockable dependencies', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .directiveWithMocks('aDirective')
                        .build();

                    inject(function($compile) {
                        $compile('<div data-a-directive></div>');

                        assertMockableDepenciesWereMocked(aDirectiveFactory, true, true);
                    });
                });
            });
        });


        describe('directiveWithMocksFor method', function() {

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.directiveWithMocksFor('aDirective', 'mockableServiceB');

                expect(result).toBe(moduleBuilderInstance);
            });

            describe('when build() and then inject(...) is invoked', function() {

                it('only a explicitly specified dependency should be mocked when its mockable', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .directiveWithMocksFor('aDirective', 'mockableServiceB')
                        .build();

                    inject(function($compile) {
                        $compile('<div data-a-directive></div>');

                        assertMockableDepenciesWereMocked(aDirectiveFactory, false, true);
                    });
                });

                it('should throw exception when you explicitly want to mock a non-mockable service', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .directiveWithMocksFor('aDirective', 'nonMockableService')
                        .build();

                    expect(function() {
                        inject();
                    }).toThrowModuleError('Could not mock the dependency explicitly asked to mock: nonMockableService');
                });
            });
        });


        describe('directiveWithMocksExcept method', function() {

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.directiveWithMocksExcept('aDirective', 'mockableServiceB');

                expect(result).toBe(moduleBuilderInstance);
            });

            describe('when build() and then inject(...) is invoked', function() {

                it('only a explicitly specified dependency should be mocked when its mockable', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .directiveWithMocksExcept('aDirective', 'mockableServiceA', 'nonMockableService')
                        .build();

                    inject(function($compile) {
                        $compile('<div data-a-directive></div>');

                        assertMockableDepenciesWereMocked(aDirectiveFactory, false, true);
                    });
                });
            });
        });


        describe('directiveAsIs method', function() {

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.directiveAsIs('aDirective');

                expect(result).toBe(moduleBuilderInstance);
            });

            describe('when build() and then inject(...) is invoked', function() {

                it('should include the directive as is', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .directiveAsIs('aDirective')
                        .build();

                    inject(function($compile) {
                        $compile('<div data-a-directive></div>');

                        assertMockableDepenciesWereMocked(aDirectiveFactory, false, false);
                    });
                });
            });
        });


        describe('animationWithMocks method', function() {

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.animationWithMocks('.anAnimation');

                expect(result).toBe(moduleBuilderInstance);
            });

            describe('when build() and then inject(...) is invoked', function() {

                it('should mock all mockable dependencies', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .animationWithMocks('.anAnimation')
                        .build();

                    testAnimationWithMocks(true, true);
                });
            });
        });



        describe('animationWithMocksFor method', function() {

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.animationWithMocksFor('.anAnimation', 'mockableServiceB');

                expect(result).toBe(moduleBuilderInstance);
            });

            describe('when build() and then inject(...) is invoked', function() {

                it('only a explicitly specified dependency should be mocked when its mockable', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .animationWithMocksFor('.anAnimation', 'mockableServiceB')
                        .build();

                    testAnimationWithMocks(false, true);
                });

                it('should throw exception when you explicitly want to mock a non-mockable service', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .animationWithMocksFor('.anAnimation', 'nonMockableService')
                        .build();

                    expect(function() {
                        inject();
                    }).toThrowModuleError('Could not mock the dependency explicitly asked to mock: nonMockableService');
                });
            });
        });


        describe('animationWithMocksExcept method', function() {

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.animationWithMocksExcept('.anAnimation', 'mockableServiceB');

                expect(result).toBe(moduleBuilderInstance);
            });

            describe('when build() and then inject(...) is invoked', function() {

                it('only a explicitly specified dependency should be mocked when its mockable', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .animationWithMocksExcept('.anAnimation', 'mockableServiceA', 'nonMockableService')
                        .build();

                    inject(function($compile) {
                        $compile('<div data-a-directive></div>');

                        testAnimationWithMocks(false, true);
                    });
                });
            });
        });


        describe('animationAsIs method', function() {

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule(originalModuleInstance.name);

                var result = moduleBuilderInstance.animationAsIs('.anAnimation');

                expect(result).toBe(moduleBuilderInstance);
            });

            describe('when build() and then inject(...) is invoked', function() {

                it('should include the directive as is', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .animationAsIs('.anAnimation')
                        .build();

                    testAnimationWithMocks(false, false);
                });
            });
        });


        describe('when build() and then inject(...) is invoked', function() {
            it('should throw some exception when an angular module does not exist', function() {
                moduleBuilder.forModule('nonExistingModule').build();

                expect(function() {
                    inject();
                }).toThrowModuleError('Error: [$injector:nomod] Module \'nonExistingModule\' is not available! ' +
                        'You either misspelled the module name or forgot to load it. If registering a module ensure ' +
                        'that you specify the dependencies as the second argument.');
            });

            it('should create an angular injector for ["ng", "ngMock", <module-name>]', function() {
                moduleBuilder.forModule(originalModuleInstance.name).build();

                expect(createdInjector).toBe(null);
                expect(angular.injector).not.toHaveBeenCalledWith(['ng', 'ngMock', originalModuleInstance.name]);

                inject();
                expect(createdInjector).toBeDefined();
                expect(angular.injector).toHaveBeenCalledWith(['ng', 'ngMock', originalModuleInstance.name]);
            });

            it('should create a module introspector', function() {
                moduleBuilder.forModule(originalModuleInstance.name).build();

                expect(moduleIntrospectorInstance).toBe(null);

                inject();
                expect(moduleIntrospectorInstance).toBeDefined();
            });
        });

    });


    it('should support circular module dependencies', function() {
        angular.module('appFilters', ['appResources'])
            .value('mockableServiceA', mockableServiceA);

        angular.module('appResources', ['appFilters']);

        var appModule = angular.module('myApp', [
            'appResources'
        ]);

        appModule.controller('AppController', ['$scope', 'mockableServiceA', function() {}]);


        moduleBuilder.forModule(appModule.name)
            .controllerWithMocks('AppController')
            .build();

        inject(function(mockableServiceAMock) {
            expect(mockableServiceAMock).not.toBeNull();
        });
    });

    describe('should allow mocking dependencies which are added during AngularJS bootstrapping', function() {

        it('like the $log service', function() {
            var $logUsingServiceFactoryFactory = jasmine.createSpy().andCallFake(function($log) {
                return {
                    writeToLog: function(message) {
                        return $log.log(message);
                    }
                };
            });

            var appModule = angular.module('$logUsingServiceModule', []);

            appModule.factory('$logUsingService', ['$log', $logUsingServiceFactoryFactory]);


            moduleBuilder.forModule(appModule.name)
                .serviceWithMocks('$logUsingService')
                .build();

            inject(function($logUsingService, $logMock) {
                $logUsingService.writeToLog('loggedMessage');

                expect($logMock.log).toHaveBeenCalledWith('loggedMessage');
            });
        });

        it('like the $location service (not provided by "ngMock" module of angular 1.0)', function() {


            var $locationUsingServiceFactoryFactory = jasmine.createSpy().andCallFake(function($location) {
                return {
                    completeUrl: function() {
                        return $location.absUrl();
                    }
                };
            });

            var appModule = angular.module('$locationUsingServiceModule', []);

            appModule.factory('$locationUsingService', ['$location', $locationUsingServiceFactoryFactory]);


            moduleBuilder.forModule(appModule.name)
                .serviceWithMocks('$locationUsingService')
                .build();

            inject(function($locationUsingService, $locationMock) {
                expect($locationMock).not.toBeNull();

                $locationMock.absUrl.andReturn('http://aComplete/url');

                expect($locationUsingService.completeUrl()).toBe('http://aComplete/url');
            });
        });

    });

    describe('when using the ModuleBuilder for a module that is declared after the spec is loaded', function() {
        //NOTE: in this particular case use the exported "ModuleBuilder" since the "moduleBuilder" isn't available a the
        //  time that the `ModuleBuilder.forModule(..)...` from the statement below is executed.
        beforeEach(ModuleBuilder.forModule('aModuleDeclaredAfterLoadingAllSpecs') // jshint ignore:line
            .serviceWithMocksFor('serviceUsingMockableService', 'someMockableService')
            .build());

        it('should also correctly support', function() {
            inject(function(serviceUsingMockableService, someMockableServiceMock) {
                serviceUsingMockableService.aMethod();

                expect(someMockableServiceMock.someMethod).toHaveBeenCalledWith();
            });
        });
    });

});