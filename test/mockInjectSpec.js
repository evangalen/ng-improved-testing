/*global ModuleBuilder:false */
'use strict';

describe('angular.mock.inject function', function() {

    angular.module('aModule', [])
        .factory('mockableService', function() {
            return {
                aMethod: angular.noop
            };
        })
        .factory('nonMockableService', function() {
            return {
            };
        })
        .factory('aService', function(mockableService, nonMockableService) { // jshint ignore:line
            return {};
        });


    describe('when a ModuleBuilder is used', function() {

        describe('should show error when injecting a service that has a mock counterpart', function() {
            beforeEach(function() {
                ModuleBuilder.forModules('aModule').serviceWithMocksFor('aService', 'mockableService').build();
            });


            it('when used in a non-annotated block fn', function() {
                expect(function() {
                    inject(function(mockableService) { // jshint ignore:line
                    });
                }).toThrow('Service has a mock and therefore is not allowed to be injected: mockableService');
            });

            it('when used in a second non-annotated block fn', function() {
                expect(function() {
                    inject(angular.noop, function(mockableService) { // jshint ignore:line
                    });
                }).toThrow('Service has a mock and therefore is not allowed to be injected: mockableService');
            });

            it('when used in a annotated block fn', function() {
                expect(function() {
                    inject(['mockableService', function(_mockableService) { // jshint ignore:line
                    }]);
                }).toThrow('Service has a mock and therefore is not allowed to be injected: mockableService');
            });

            it('when used in a second annotated block fn', function() {
                expect(function() {
                    inject([angular.noop], ['mockableService', function(_mockableService) { // jshint ignore:line
                    }]);
                }).toThrow('Service has a mock and therefore is not allowed to be injected: mockableService');
            });
        });


        it('should inject a non-mocked service', function() {
            ModuleBuilder.forModules('aModule').serviceWithMocksFor('aService', 'mockableService').build();


            inject(['nonMockableService', function(_nonMockableService) {
                expect(angular.isObject(_nonMockableService)).toBe(true);
            }]);
        });


        it('should inject a service with a mock counterpart when injected service was mocked for one component but not for another ' +
                'one', function() {
            angular.module('anotherModule', ['aModule'])
                .factory('anotherMockableService', function() {
                    return {
                        aMethod: angular.noop
                    };
                })
                .factory('anotherService', function(anotherMockableService, mockableService, nonMockableService) { // jshint ignore:line
                    return {};
                });


            ModuleBuilder.forModules('anotherModule')
                .serviceWithMocksFor('aService', 'mockableService')
                .serviceWithMocksFor('anotherService', 'anotherMockableService')
                .build();

            inject(function(mockableService) {
                expect(angular.isObject(mockableService)).toBe(true);
            });
        });


        describe('should inject a mocked service', function() {
            beforeEach(function() {
                ModuleBuilder.forModules('aModule').serviceWithMocksFor('aService', 'mockableService').build();
            });


            it('when used in a non-annotated block fn', function() {
                inject(function(mockableServiceMock) {
                    expect(angular.isObject(mockableServiceMock)).toBe(true);
                });
            });

            it('when used in a second non-annotated block fn', function() {
                inject(angular.noop, function(mockableServiceMock) {
                    expect(angular.isObject(mockableServiceMock)).toBe(true);
                });
            });

            it('when used in a annotated block fn', function() {
                inject(['mockableServiceMock', function(_mockableServiceMock) {
                    expect(angular.isObject(_mockableServiceMock)).toBe(true);
                }]);
            });

            it('when used in a second annotated block fn', function() {
                inject([angular.noop], ['mockableServiceMock', function(_mockableServiceMock) {
                    expect(angular.isObject(_mockableServiceMock)).toBe(true);
                }]);
            });
        });

    });



    describe('should remain working in case ngImprovedTesting is not used and', function() {
        beforeEach(module('aModule'));


        it('when used in a non-annotated block fn', function() {
            inject(function(mockableService) {
                expect(angular.isObject(mockableService)).toBe(true);
            });
        });

        it('when used in a second non-annotated block fn', function() {
            inject(angular.noop, function(mockableService) {
                expect(angular.isObject(mockableService)).toBe(true);
            });
        });

        it('when used in a annotated block fn', function() {
            inject(['mockableService', function(_mockableService) {
                expect(angular.isObject(_mockableService)).toBe(true);
            }]);
        });

        it('when used in a second annotated block fn', function() {
            inject([angular.noop], ['mockableService', function(_mockableService) {
                expect(angular.isObject(_mockableService)).toBe(true);
            }]);
        });
    });
});
