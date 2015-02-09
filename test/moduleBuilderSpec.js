'use strict';

describe('moduleBuilder service', function() {

    //TODO: add spec to test that:
    // - "ngImprovedTesting" is added to the modules requires of the generated / created module


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
    var aServiceFactoryFactory = jasmine.createSpy().and.callFake(function() {
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
    var aDirectiveFactory = jasmine.createSpy().and.callFake(function() {
        return aDirectiveLinkFn;
    });

    /** @const */
    var $getProviderFactory = jasmine.createSpy().and.callFake(function() {
        return {};
    });

    /** @const */
    var aFilter = function(input) {
        return input;
    };

    /** @const */
    var aFilterFactory = jasmine.createSpy().and.callFake(function() {
        return aFilter;
    });

    /** @const */
    var anAnimationEnterMethod = jasmine.createSpy();

    /** @const */
    var anAnimationFactory = jasmine.createSpy().and.callFake(function() {
        return {
            enter: anAnimationEnterMethod
        };
    });

    var aServiceProviderConstructor = function() {
        this.$get = ['nonMockableService', 'mockableServiceA', 'mockableServiceB', $getProviderFactory];
    };

    var aServiceProviderConstructorAnnotated = ['$logProvider', function($logProvider) {
        expect($logProvider.debugEnabled()).toBe(true);
        return aServiceProviderConstructor.apply(this, arguments);
    }];

    var aServiceProviderConstructorWith$Inject = function($logProvider) {
        expect($logProvider.debugEnabled()).toBe(true);
        return aServiceProviderConstructor.apply(this, arguments);
    };
    aServiceProviderConstructorWith$Inject.$inject = ['$logProvider'];


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
        .provider('aServiceProviderConstructor', aServiceProviderConstructor)
        .provider('aServiceProviderConstructorAnnotated', aServiceProviderConstructorAnnotated)
        .provider('aServiceProviderConstructorWith$Inject', aServiceProviderConstructorWith$Inject)
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
        jasmine.addMatchers({
            toThrowModuleError: function (util, customEqualityTesters) {
                return {
                    compare: function(actual, expectedWrappedMessage) {
                        var result = {};

                        if (typeof actual !== 'function') {
                            throw new Error('Actual is not a function');
                        }

                        var exception;

                        try {
                            actual();
                        } catch (e) {
                            exception = e;

                            var isError = Object.prototype.toString.call(e) === '[object Error]';
                            if (!isError) {
                                result.pass = false;
                                result.message = 'Excepted an exception of type Error:' + e;
                            }

                            var actualErrorMessage = e.message;

                            var errorMessageRegExp =
                                /^\[\$injector:modulerr\]\ Failed to instantiate module .* due to:\n(.*)\n.*/;

                            var regExpExecResult = errorMessageRegExp.exec(actualErrorMessage);

                            result.pass = regExpExecResult &&
                                    util.equals(regExpExecResult[1], expectedWrappedMessage, customEqualityTesters);
                            result.message = 'Expected function to throw ' + expectedWrappedMessage + ', but it threw ' +
                                    (regExpExecResult ? regExpExecResult[1] : (exception && exception.message));
                        }


                        return result;
                    }
                };
            }
        });


    });


    beforeEach(function() {
        var ngModuleIntrospectorInjector = angular.injector(['ngModuleIntrospector']);
        var originalModuleIntrospector = ngModuleIntrospectorInjector.get('moduleIntrospector');

        var ngImprovedTestingInjector = angular.injector(['ng', 'ngImprovedTesting.internal.moduleBuilder', function($provide) {
            var spiedModuleIntrospector = jasmine.createSpy().and.callFake(function() {
                var result = originalModuleIntrospector.apply(this, arguments);

                moduleIntrospectorInstance = result;

                for (var propertyName in result) {
                    if (result.hasOwnProperty(propertyName) && angular.isFunction(result[propertyName])) {
                        spyOn(result, propertyName).and.callThrough();
                    }
                }

                return result;
            });

            $provide.value('moduleIntrospector', spiedModuleIntrospector);
        }]);

        moduleBuilder = ngImprovedTestingInjector.get('moduleBuilder');

        var originalInjectorFn = angular.injector;
        spyOn(angular, 'injector').and.callFake(function() {
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



    describe('forModules method', function() {

        it('should create a builder object', function() {
            angular.module('anAdditionalModule', []);

            var result = moduleBuilder.forModules(originalModuleInstance.name, 'anAdditionalModule');

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

        function assertMockableDependenciesWereMocked(
                declaration, expectMockableServiceAMocked, expectMockableServiceBMocked, prependedDependenciesCount) {
            prependedDependenciesCount = prependedDependenciesCount || 0;

            expect(declaration).toHaveBeenCalled();
            expect(declaration.calls.mostRecent().args.length).toBe(3 + prependedDependenciesCount);
            expect(declaration.calls.mostRecent().args[prependedDependenciesCount + 0]).toBe(nonMockableService);

            if (expectMockableServiceAMocked) {
                expect(declaration.calls.mostRecent().args[prependedDependenciesCount + 1]).not.toBe(mockableServiceA);
                expect(jasmine.isSpy(declaration.calls.mostRecent().args[prependedDependenciesCount + 1].aMethod))
                    .toBe(true);
            } else {
                expect(declaration.calls.mostRecent().args[prependedDependenciesCount + 1]).toBe(mockableServiceA);
            }

            if (expectMockableServiceBMocked) {
                expect(declaration.calls.mostRecent().args[prependedDependenciesCount + 2]).not.toBe(mockableServiceB);
                expect(jasmine.isSpy(declaration.calls.mostRecent().args[prependedDependenciesCount + 2].aMethod))
                    .toBe(true);
            } else {
                expect(declaration.calls.mostRecent().args[prependedDependenciesCount + 2]).toBe(mockableServiceB);
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

                assertMockableDependenciesWereMocked(
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

                it('should throw exception when mocking dependencies of a built-in service', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocks('$http')
                        .build();

                    expect(function() {
                        inject();
                    }).toThrowModuleError('Built-in components are not allowed to be overridden: $http');
                });

                it('should mock all mockable dependencies', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocks('aServiceFactory')
                        .build();

                    inject(function(aServiceFactory) {
                        expect(aServiceFactory).toBeDefined();
                        assertMockableDependenciesWereMocked(aServiceFactoryFactory, true, true);
                    });
                });

                it('should support mocking dependencies of a "service" registered service', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocks('aServiceService')
                        .build();

                    inject(function(aServiceService) {
                        assertMockableDependenciesWereMocked(AServiceConstructor, true, true);
                        expect(aServiceService instanceof AServiceConstructor).toBe(true);
                    });
                });

                it('should support mocking dependencies of a "provider" registered service with an object', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocks('aServiceProviderObject')
                        .build();

                    inject(function(aServiceProviderObject) {
                        expect(aServiceProviderObject).toBeDefined();
                        assertMockableDependenciesWereMocked($getProviderFactory, true, true);
                    });
                });

                it('should support mocking dependencies of a "provider" registered service with an constructor', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocks('aServiceProviderConstructor')
                        .build();

                    inject(function(aServiceProviderConstructor) {
                        expect(aServiceProviderConstructor).toBeDefined();
                        assertMockableDependenciesWereMocked($getProviderFactory, true, true);
                    });
                });

                it('should support mocking dependencies of a "provider" registered service with an constructor that is ' +
                        'annotated', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocks('aServiceProviderConstructorAnnotated')
                        .build();

                    inject(function(aServiceProviderConstructorAnnotated) {
                        expect(aServiceProviderConstructorAnnotated).toBeDefined();
                        assertMockableDependenciesWereMocked($getProviderFactory, true, true);
                    });
                });

                it('should support mocking dependencies of a "provider" registered service with an constructor that has a $inject ' +
                        'property', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocks('aServiceProviderConstructorWith$Inject')
                        .build();

                    inject(function(aServiceProviderConstructorWith$Inject) {
                        expect(aServiceProviderConstructorWith$Inject).toBeDefined();
                        assertMockableDependenciesWereMocked($getProviderFactory, true, true);
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

                it('should throw exception when mocking dependencies of a built-in service', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksFor('$http', '$cacheFactory')
                        .build();

                    expect(function() {
                        inject();
                    }).toThrowModuleError('Built-in components are not allowed to be overridden: $http');
                });

                it('only a explicitly specified dependency should be mocked when its mockable', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksFor('aServiceFactory', 'mockableServiceB')
                        .build();

                    inject(function(aServiceFactory) {
                        expect(aServiceFactory).toBeDefined();
                        assertMockableDependenciesWereMocked(aServiceFactoryFactory, false, true);
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
                        assertMockableDependenciesWereMocked(AServiceConstructor, false, true);
                        expect(aServiceService instanceof AServiceConstructor).toBe(true);
                    });
                });

                it('should support mocking dependencies of a "provider" registered service with an object', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksFor('aServiceProviderObject', 'mockableServiceB')
                        .build();

                    inject(function(aServiceProviderObject) {
                        expect(aServiceProviderObject).toBeDefined();
                        assertMockableDependenciesWereMocked($getProviderFactory, false, true);
                    });
                });

                it('should support mocking dependencies of a "provider" registered service with an ' +
                        'constructor', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksFor('aServiceProviderConstructor', 'mockableServiceB')
                        .build();

                    inject(function(aServiceProviderConstructor) {
                        expect(aServiceProviderConstructor).toBeDefined();
                        assertMockableDependenciesWereMocked($getProviderFactory, false, true);
                    });
                });

                it('should support mocking dependencies of a "provider" registered service with an ' +
                        'constructor that is annotated', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksFor('aServiceProviderConstructorAnnotated', 'mockableServiceB')
                        .build();

                    inject(function(aServiceProviderConstructorAnnotated) {
                        expect(aServiceProviderConstructorAnnotated).toBeDefined();
                        assertMockableDependenciesWereMocked($getProviderFactory, false, true);
                    });
                });

                it('should support mocking dependencies of a "provider" registered service with an ' +
                        'constructor that has a $inject property', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksFor('aServiceProviderConstructorWith$Inject', 'mockableServiceB')
                        .build();

                    inject(function(aServiceProviderConstructorWith$Inject) {
                        expect(aServiceProviderConstructorWith$Inject).toBeDefined();
                        assertMockableDependenciesWereMocked($getProviderFactory, false, true);
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

                it('should throw exception when mocking dependencies of a built-in service', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksExcept('$http', '$q')
                        .build();

                    expect(function() {
                        inject();
                    }).toThrowModuleError('Built-in components are not allowed to be overridden: $http');
                });

                it('should mock all mockable dependencies except when provided to be excluded', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksExcept('aServiceFactory', 'mockableServiceA')
                        .build();

                    inject(function(aServiceFactory) {
                        expect(aServiceFactory).toBeDefined();
                        assertMockableDependenciesWereMocked(aServiceFactoryFactory, false, true);
                    });
                });

                it('should ignore (not throw an exception) any non-mockable dependencies when provided to be excluded', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksExcept('aServiceFactory', 'mockableServiceA', 'nonMockableService')
                        .build();

                    inject(function(aServiceFactory) {
                        expect(aServiceFactory).toBeDefined();
                        assertMockableDependenciesWereMocked(aServiceFactoryFactory, false, true);
                    });
                });

                it('should support mocking dependencies of a "service" registered service', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksExcept('aServiceService', 'mockableServiceA')
                        .build();

                    inject(function(aServiceService) {
                        assertMockableDependenciesWereMocked(AServiceConstructor, false, true);
                        expect(aServiceService instanceof AServiceConstructor).toBe(true);
                    });
                });

                it('should support mocking dependencies of a "provider" registered service with an object', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksExcept('aServiceProviderObject', 'mockableServiceA')
                        .build();

                    inject(function(aServiceProviderObject) {
                        expect(aServiceProviderObject).toBeDefined();
                        assertMockableDependenciesWereMocked($getProviderFactory, false, true);
                    });
                });

                it('should support mocking dependencies of a "provider" registered service with an constructor', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksExcept('aServiceProviderConstructor', 'mockableServiceA')
                        .build();

                    inject(function(aServiceProviderConstructor) {
                        expect(aServiceProviderConstructor).toBeDefined();
                        assertMockableDependenciesWereMocked($getProviderFactory, false, true);
                    });
                });

                it('should support mocking dependencies of a "provider" registered service with an constructor that is ' +
                        'annotated', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksExcept('aServiceProviderConstructorAnnotated', 'mockableServiceA')
                        .build();

                    inject(function(aServiceProviderConstructorAnnotated) {
                        expect(aServiceProviderConstructorAnnotated).toBeDefined();
                        assertMockableDependenciesWereMocked($getProviderFactory, false, true);
                    });
                });

                it('should support mocking dependencies of a "provider" registered service with an constructor that has a $inject ' +
                        'property', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .serviceWithMocksExcept('aServiceProviderConstructorWith$Inject', 'mockableServiceA')
                        .build();

                    inject(function(aServiceProviderConstructorWith$Inject) {
                        expect(aServiceProviderConstructorWith$Inject).toBeDefined();
                        assertMockableDependenciesWereMocked($getProviderFactory, false, true);
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

                it('should throw exception when mocking dependencies of a built-in filter', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .filterWithMocks('orderBy')
                        .build();

                    expect(function() {
                        inject();
                    }).toThrowModuleError('Built-in components are not allowed to be overridden: orderBy');
                });

                it('should mock all mockable dependencies', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .filterWithMocks('aFilter')
                        .build();

                    inject(function(aFilterFilter) {
                        expect(aFilterFilter).toBeDefined();
                        assertMockableDependenciesWereMocked(aFilterFactory, true, true);
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

                it('should throw exception when mocking dependencies of a built-in filter', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .filterWithMocksFor('orderBy', '$parse')
                        .build();

                    expect(function() {
                        inject();
                    }).toThrowModuleError('Built-in components are not allowed to be overridden: orderBy');
                });

                it('only a explicitly specified dependency should be mocked when its mockable', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .filterWithMocksFor('aFilter', 'mockableServiceB')
                        .build();

                    inject(function(aFilterFilter) {
                        expect(aFilterFilter).toBeDefined();
                        assertMockableDependenciesWereMocked(aFilterFactory, false, true);
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

                it('should throw exception when mocking dependencies of a built-in filter', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .filterWithMocksExcept('orderBy', '$parse')
                        .build();

                    expect(function() {
                        inject();
                    }).toThrowModuleError('Built-in components are not allowed to be overridden: orderBy');
                });

                it('should mock all mockable dependencies except when provided to be excluded', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .filterWithMocksExcept('aFilter', 'mockableServiceA')
                        .build();

                    inject(function(aFilterFilter) {
                        expect(aFilterFilter).toBeDefined();
                        assertMockableDependenciesWereMocked(aFilterFactory, false, true);
                    });
                });

                it('should ignore (not throw an exception) any non-mockable dependencies when provided to be excluded', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .filterWithMocksExcept('aFilter', 'mockableServiceA', 'nonMockableService')
                        .build();

                    inject(function(aFilterFilter) {
                        expect(aFilterFilter).toBeDefined();
                        assertMockableDependenciesWereMocked(aFilterFactory, false, true);
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

                    AControllerConstructor.and.callFake(function($scope) {
                        $scope.aProperty = expectedScopeProperty;
                    });

                    moduleBuilder.forModule(originalModuleInstance.name)
                        .controllerWithMocks('aController')
                        .build();

                    inject(function($rootScope, $controller) {
                        var $scope = $rootScope.$new();
                        $controller('aController', {$scope: $scope});

                        assertMockableDependenciesWereMocked(AControllerConstructor, true, true, 1);
                        expect(AControllerConstructor.calls.mostRecent().args[0]).toBe($scope);

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

                    AControllerConstructor.and.callFake(function($scope) {
                        $scope.aProperty = expectedScopeProperty;
                    });

                    moduleBuilder.forModule(originalModuleInstance.name)
                        .controllerWithMocksFor('aController', 'mockableServiceB')
                        .build();

                    inject(function($rootScope, $controller) {
                        var $scope = $rootScope.$new();
                        $controller('aController', {$scope: $scope});

                        assertMockableDependenciesWereMocked(AControllerConstructor, false, true, 1);
                        expect(AControllerConstructor.calls.mostRecent().args[0]).toBe($scope);

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

                    AControllerConstructor.and.callFake(function($scope) {
                        $scope.aProperty = expectedScopeProperty;
                    });

                    moduleBuilder.forModule(originalModuleInstance.name)
                        .controllerWithMocksExcept('aController', 'mockableServiceA', 'nonMockableService')
                        .build();

                    inject(function($rootScope, $controller) {
                        var $scope = $rootScope.$new();
                        $controller('aController', {$scope: $scope});

                        assertMockableDependenciesWereMocked(AControllerConstructor, false, true, 1);
                        expect(AControllerConstructor.calls.mostRecent().args[0]).toBe($scope);

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

                it('should throw exception when mocking dependencies of a built-in directive', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .directiveWithMocks('input')
                        .build();

                    expect(function() {
                        inject();
                    }).toThrowModuleError('Built-in components are not allowed to be overridden: input');
                });

                it('should mock all mockable dependencies', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .directiveWithMocks('aDirective')
                        .build();

                    inject(function($compile) {
                        $compile('<div data-a-directive></div>');

                        assertMockableDependenciesWereMocked(aDirectiveFactory, true, true);
                    });
                });

                it('should mock directive with a link function as its declaration', function() {
                    originalModuleInstance.directive('aDirectiveWithLinkFnAsDeclaration', [
                                'nonMockableService', 'mockableServiceA', 'mockableServiceB',
                                function(nonMockableService, mockableServiceA, mockableServiceB) {
                                    return function() {
                                        mockableServiceA.aMethod();
                                        mockableServiceB.aMethod();
                                    };
                                }]);

                    moduleBuilder.forModule(originalModuleInstance.name)
                        .directiveWithMocks('aDirectiveWithLinkFnAsDeclaration')
                        .build();

                    inject(function($compile, $rootScope, mockableServiceAMock, mockableServiceBMock) {
                        $compile('<div data-a-directive-with-link-fn-as-declaration></div>')($rootScope.$new());

                        expect(mockableServiceAMock.aMethod).toHaveBeenCalledWith();
                        expect(mockableServiceBMock.aMethod).toHaveBeenCalledWith();
                    });
                });

                it('should mock directive with a link function in the ddo', function() {
                    originalModuleInstance.directive('aDirectiveWithLinkFnInDdo', [
                                'nonMockableService', 'mockableServiceA', 'mockableServiceB',
                                function(nonMockableService, mockableServiceA, mockableServiceB) {
                                    return {
                                        link: function() {
                                            mockableServiceA.aMethod();
                                            mockableServiceB.aMethod();
                                        }
                                    };
                                }]);

                    moduleBuilder.forModule(originalModuleInstance.name)
                        .directiveWithMocks('aDirectiveWithLinkFnInDdo')
                        .build();

                    inject(function($compile, $rootScope, mockableServiceAMock, mockableServiceBMock) {
                        $compile('<div data-a-directive-with-link-fn-in-ddo></div>')($rootScope.$new());

                        expect(mockableServiceAMock.aMethod).toHaveBeenCalledWith();
                        expect(mockableServiceBMock.aMethod).toHaveBeenCalledWith();
                    });
                });

                it('should mock directive with a compile function in the ddo', function() {
                    originalModuleInstance.directive('aDirectiveWithCompileFnInDdo', [
                                'nonMockableService', 'mockableServiceA', 'mockableServiceB',
                                function(nonMockableService, mockableServiceA, mockableServiceB) {
                                    return {
                                        compile: function() {
                                            mockableServiceA.aMethod();
                                            mockableServiceB.aMethod();
                                        }
                                    };
                                }]);

                    moduleBuilder.forModule(originalModuleInstance.name)
                        .directiveWithMocks('aDirectiveWithCompileFnInDdo')
                        .build();

                    inject(function($compile, $rootScope, mockableServiceAMock, mockableServiceBMock) {
                        $compile('<div data-a-directive-with-compile-fn-in-ddo></div>')($rootScope.$new());

                        expect(mockableServiceAMock.aMethod).toHaveBeenCalledWith();
                        expect(mockableServiceBMock.aMethod).toHaveBeenCalledWith();
                    });
                });

                it('should mock directive with a controller function', function() {
                    originalModuleInstance.directive('aDirectiveWithController', [
                            'nonMockableService', 'mockableServiceA', 'mockableServiceB',
                            function(nonMockableService, mockableServiceA, mockableServiceB) {
                                return {
                                    controller: function () {
                                        mockableServiceA.aMethod();
                                        mockableServiceB.aMethod();
                                    }
                                };
                            }]);

                    moduleBuilder.forModule(originalModuleInstance.name)
                        .directiveWithMocks('aDirectiveWithController')
                        .build();

                    inject(function($compile, $rootScope, mockableServiceAMock, mockableServiceBMock) {
                        $compile('<div data-a-directive-with-controller></div>')($rootScope.$new());

                        expect(mockableServiceAMock.aMethod).toHaveBeenCalledWith();
                        expect(mockableServiceBMock.aMethod).toHaveBeenCalledWith();
                    });
                });

                it('should mock directive an overridden html anchor directive with a link function as its declaration', function() {
                    originalModuleInstance.directive('a', [
                                'nonMockableService', 'mockableServiceA', 'mockableServiceB',
                                function(nonMockableService, mockableServiceA, mockableServiceB) {
                                    return {
                                        restrict: 'EA',
                                        link: function() {
                                            mockableServiceA.aMethod();
                                            mockableServiceB.aMethod();
                                        }
                                    };
                                }]);

                    moduleBuilder.forModule(originalModuleInstance.name)
                        .directiveWithMocks('a')
                        .build();

                    inject(function($compile, $rootScope, mockableServiceAMock, mockableServiceBMock) {
                        $compile('<a></a>')($rootScope.$new());

                        expect(mockableServiceAMock.aMethod).toHaveBeenCalledWith();
                        expect(mockableServiceBMock.aMethod).toHaveBeenCalledWith();
                    });
                });

                it('should throw an exception when an directive is declared more than twice', function() {
                    originalModuleInstance
                        .directive('moreThanTwice',
                            function() {
                                return angular.noop;
                            })
                        .directive('moreThanTwice',
                            function() {
                                return angular.noop;
                            })
                        .directive('moreThanTwice',
                            function() {
                                return angular.noop;
                            });

                    moduleBuilder.forModule(originalModuleInstance.name)
                        .directiveWithMocks('moreThanTwice')
                        .build();

                    expect(function() {
                        inject();
                    }).toThrowModuleError(
                            'Error: Could not determine unique component declaration for provider "$compileProvider": moreThanTwice');
                });

                it('should throw an exception when an directive is declared twice and none of them are built-in', function() {
                    originalModuleInstance
                        .directive('twice',
                            function() {
                                return angular.noop;
                            })
                        .directive('twice',
                            function() {
                                return angular.noop;
                            });

                    moduleBuilder.forModule(originalModuleInstance.name)
                        .directiveWithMocks('twice')
                        .build();

                    expect(function() {
                        inject();
                    }).toThrowModuleError(
                        'Error: Could not determine unique component declaration for provider "$compileProvider": twice');
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

                it('should throw exception when mocking dependencies of a built-in directive', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .directiveWithMocksFor('input', '$browser')
                        .build();

                    expect(function() {
                        inject();
                    }).toThrowModuleError('Built-in components are not allowed to be overridden: input');
                });

                it('only a explicitly specified dependency should be mocked when its mockable', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .directiveWithMocksFor('aDirective', 'mockableServiceB')
                        .build();

                    inject(function($compile) {
                        $compile('<div data-a-directive></div>');

                        assertMockableDependenciesWereMocked(aDirectiveFactory, false, true);
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

                it('should throw exception when mocking dependencies of a built-in directive', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .directiveWithMocksExcept('input', '$sniffer')
                        .build();

                    expect(function() {
                        inject();
                    }).toThrowModuleError('Built-in components are not allowed to be overridden: input');
                });

                it('only a explicitly specified dependency should be mocked when its mockable', function() {
                    moduleBuilder.forModule(originalModuleInstance.name)
                        .directiveWithMocksExcept('aDirective', 'mockableServiceA', 'nonMockableService')
                        .build();

                    inject(function($compile) {
                        $compile('<div data-a-directive></div>');

                        assertMockableDependenciesWereMocked(aDirectiveFactory, false, true);
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



        describe('when build() and then inject(...) is invoked', function() {
            it('should throw some exception when an angular module does not exist', function() {
                moduleBuilder.forModule('nonExistingModule').build();

                expect(function() {
                    inject();
                }).toThrowModuleError('Error: [$injector:nomod] Module \'nonExistingModule\' is not available! ' +
                        'You either misspelled the module name or forgot to load it. If registering a module ensure that you specify the ' +
                        'dependencies as the second argument.');
            });

            it('should create an angular injector for ["ng", "ngMock", Function, <module-name>, Function]', function() {
                moduleBuilder.forModule(originalModuleInstance.name).build();

                expect(createdInjector).toBe(null);
                expect(angular.injector).not.toHaveBeenCalled();

                inject();
                expect(createdInjector).toBeDefined();

                expect(angular.injector).toHaveBeenCalled();
                expect(angular.injector.calls.mostRecent().args.length).toBe(1);
                expect(angular.isArray(angular.injector.calls.mostRecent().args[0])).toBe(true);
                expect(angular.injector.calls.mostRecent().args[0].length).toBe(3);
                expect(angular.injector.calls.mostRecent().args[0][0]).toBe('ng');
                expect(angular.injector.calls.mostRecent().args[0][1]).toBe('ngMock');
                expect(angular.injector.calls.mostRecent().args[0][2]).toBe(originalModuleInstance.name);
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
            var $logUsingServiceFactoryFactory = jasmine.createSpy().and.callFake(function($log) {
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


            var $locationUsingServiceFactoryFactory = jasmine.createSpy().and.callFake(function($location) {
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

                $locationMock.absUrl.and.returnValue('http://aComplete/url');

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

    it('should correctly components inherited from module in requires of parent module', function() {
        angular.module('aModule', [])
            .factory('someMockableService', function() {
                return {
                    someMethod: function() {}
                };
            })
            .factory('serviceUsingMockableService', function(someMockableService) {
                return {
                    aMethod: function() {
                        return someMockableService.someMethod();
                    }
                };
            });

        angular.module('anotherModule', ['aModule']);

        moduleBuilder.forModule('anotherModule')
            .serviceWithMocksFor('serviceUsingMockableService', 'someMockableService')
            .build();

        inject(function(serviceUsingMockableService, someMockableServiceMock) {
            someMockableServiceMock.someMethod.and.returnValue('someValue');

            expect(serviceUsingMockableService.aMethod()).toBe('someValue');
        });
    });

    it('should support an additional module', function() {
        var serviceInstance = {};

        angular.module('aModule', []);
        angular.module('anAdditionalModule', [])
            .value('serviceFromAdditionalModule', serviceInstance);

        moduleBuilder.forModules('aModule', 'anAdditionalModule').build();

        inject(function(serviceFromAdditionalModule) {
            expect(serviceFromAdditionalModule).toBe(serviceInstance);
        });
    });

    it('should include key - value pairs provided as an object', function() {
        angular.module('aModule', []);
        moduleBuilder.forModules('aModule', {aKey1: 'aValue1', aKey2: 'aValue2'}).build();

        inject(function(aKey1, aKey2) {
            expect(aKey1).toBe('aValue1');
            expect(aKey2).toBe('aValue2');
        });
    });

    it('should include provider registered in config fn', function() {
        var serviceInstance = {};

        angular.module('aModule', []);
        moduleBuilder.forModules('aModule', function($provide) {
                    $provide.provider('aProviderRegisteredInConfigFn', function() {
                        this.$get = function() {
                            return serviceInstance;
                        };
                    });
                }).build();

        inject(function(aProviderRegisteredInConfigFn) {
            expect(aProviderRegisteredInConfigFn).toBe(serviceInstance);
        });
    });

});