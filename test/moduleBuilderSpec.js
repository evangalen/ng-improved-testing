/* global angular, inject, describe, beforeEach, it, spyOn, expect, module */
describe('moduleBuilder service', function() {
    'use strict';

    /** @const */
    var originalMockableService = Object.freeze({
        propertyFromMockableService: 'aValue',
        methodFromMockableService: angular.noop
    });

    /** @const */
    var originalNonMockableService = Object.freeze({
        propertyFromNonMockableService: 'aValue'
    });

    /** @const */
    var originalModuleInstance = angular.module('aModule', ['ngResource'])
        .value('mockableService', originalMockableService)
        .value('nonMockableService', originalNonMockableService)
        .factory('MyResource', function($resource) {
            return $resource('/rest/resource');
        })
        .factory('aService', function($http, nonMockableService, mockableService, MyResource) {
            return {
                queryList: function() {
                    return MyResource.query();
                }
            };
        });

    /** @const */
    var emptyInjector = angular.injector([]);


    var moduleBuilder;

    var createdInjector = null;
    var moduleIntrospectorInstance = null;


    beforeEach(function() {
        var ngImprovedModulesInjector = angular.injector(['ngImprovedModules']);
        var originalModuleIntrospector = ngImprovedModulesInjector.get('moduleIntrospector');

        var ngImprovedTestingInjector = angular.injector(['ngImprovedTesting', function($provide) {
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

        it('should throw some exception when an angular module doesn not exist', function() {
            expect(function() {
                moduleBuilder.forModule('nonExistingModule');
            }).toThrow();
        });

        it('should create a builder object', function() {
            var result = moduleBuilder.forModule('aModule');

            expect(angular.isObject(result)).toBe(true);
            expect(angular.isFunction(result.build)).toBe(true);
        });

        it('should create an angular injector for ["ng", "aModule"]', function() {
            moduleBuilder.forModule('aModule');

            expect(createdInjector).toBeDefined();
            expect(angular.injector).toHaveBeenCalledWith(['ng', 'aModule']);
        });

        it('should create a module introspector', function() {
            moduleBuilder.forModule('aModule');

            expect(moduleIntrospectorInstance).toBeDefined();
        });

    });



    describe('ngDirectiveTesting.ModuleBuilder', function() {

        describe('withServiceUsingMocks method', function() {

            it('should throw an exception when invoke for "constant" as well as "value" service', function() {
                originalModuleInstance.constant('aConstant', 'aConstantValue');
                originalModuleInstance.constant('aValue', 'aValueValue');

                var moduleBuilderInstance = moduleBuilder.forModule('aModule');

                expect(function() {
                    moduleBuilderInstance.withServiceUsingMocks('aConstant');
                }).toThrow('Services declares with "contact" or "value" are not supported');

                expect(function() {
                    moduleBuilderInstance.withServiceUsingMocks('aValue');
                }).toThrow('Services declares with "contact" or "value" are not supported');
            });

            it('should return the module builder instance', function() {
                var moduleBuilderInstance = moduleBuilder.forModule('aModule');

                var result = moduleBuilderInstance.withServiceUsingMocks('aService');

                expect(result).toBe(moduleBuilderInstance);
            });

        });


        describe('build method', function() {

            it('should create a service with mocked dependencies', function() {
                var moduleBuilderInstance = moduleBuilder.forModule('aModule');

                spyOn(angular.mock, 'module').andCallThrough();

                moduleBuilderInstance.withServiceUsingMocks('aService').build();

                var mockModuleArgs = angular.mock.module.mostRecentCall.args;
                expect(mockModuleArgs.length).toBe(2);

                expect(mockModuleArgs[0] instanceof Function).toBe(true);
                expect(emptyInjector.annotate(mockModuleArgs[0])).toEqual(['$provide']);

                var generatedModuleName = mockModuleArgs[1];
                expect(generatedModuleName).toBe('generatedByNgImprovedTesting#1');
                expect(angular.module(generatedModuleName)).toBeDefined();

                inject(function($injector, aService, mockableServiceMock, MyResourceMock) {
                    expect(angular.isObject(aService)).toBe(true);
                    expect($injector.has('$http')).toBe(true);
                    expect($injector.has('nonMockableService')).toBe(true);
                    expect($injector.has('mockableService')).toBe(false);
                    expect($injector.has('MyResource')).toBe(false);

                    MyResourceMock.query.andReturn([new MyResourceMock({aProperty: 'aValue'})]);

                    expect(aService.queryList()).toEqual([new MyResourceMock({aProperty: 'aValue'})]);

                    expect(mockableServiceMock.propertyFromMockableService)
                        .toBe(originalMockableService.propertyFromMockableService);
                    expect(jasmine.isSpy(mockableServiceMock.methodFromMockableService)).toBe(true);
                });
            });

        });

    });

});