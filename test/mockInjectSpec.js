/*global ModuleBuilder:false */
'use strict';

describe('angular.mock.inject function', function() {

    describe('should show error when injecting a service that has a mock counterpart', function() {
        angular.module('aModule', [])
            .factory('anotherService', function() {
                return {
                    aMethod: angular.noop
                };
            })
            .factory('aService', function(anotherService) { // jshint ignore:line
                return {};
            });


        beforeEach(function() {
            ModuleBuilder.forModules('aModule').serviceWithMocksFor('aService', 'anotherService').build();
        });


        it('when used in a non-annotated block fn', function() {
            expect(function() {
                inject(function(anotherService) { // jshint ignore:line
                });
            }).toThrow('Service has a mock and therefore is not allowed to be injected: anotherService');
        });

        it('when used in a second non-annotated block fn', function() {
            expect(function() {
                inject(angular.noop, function(anotherService) { // jshint ignore:line
                });
            }).toThrow('Service has a mock and therefore is not allowed to be injected: anotherService');
        });

        it('when used in a annotated block fn', function() {
            expect(function() {
                inject(['anotherService', function(_anotherService) { // jshint ignore:line
                }]);
            }).toThrow('Service has a mock and therefore is not allowed to be injected: anotherService');
        });

        it('when used in a second annotated block fn', function() {
            expect(function() {
                inject([angular.noop], ['anotherService', function(_anotherService) { // jshint ignore:line
                }]);
            }).toThrow('Service has a mock and therefore is not allowed to be injected: anotherService');
        });
    });
});
