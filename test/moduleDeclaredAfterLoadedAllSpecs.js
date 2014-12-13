'use strict';

angular.module('aModuleDeclaredAfterLoadingAllSpecs', [])
    .factory('someMockableService', function() {
        return {
            someMethod: function() {}
        };
    })
    .factory('serviceUsingMockableService', function(someMockableService) {
        return {
            aMethod: function() {
                someMockableService.someMethod();
            }
        };
    });
