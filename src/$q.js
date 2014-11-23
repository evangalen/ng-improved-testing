;(function() {
'use strict';

var ngModuleIntrospectorInjector = angular.injector(['ng', 'ngModuleIntrospector']);
var moduleIntrospectorFactory = ngModuleIntrospectorInjector.get('moduleIntrospector');
var moduleIntrospector = moduleIntrospectorFactory('ng');

var original$QProviderConstructor = moduleIntrospector.getProviderDeclaration('$qProvider').rawDeclaration;
var ngInjector = angular.injector(['ng']);
var original$QProviderInstance = ngInjector.instantiate(original$QProviderConstructor, {});

angular.module('ngImprovedTesting.$q', [])

    /**
     * @ngdoc service
     * @name $q
     * @module ngImprovedTesting
     * @description
     * TODO: add description
     */
    .provider('$q', {
        $get: ['$exceptionHandler', function($exceptionHandler) {
            /** @type {Array.<function()>} */
            var executeOnNextTick = [];

            var $rootScope = {
                $evalAsync: function(callback) {
                    executeOnNextTick.push(callback);
                }
            };

            var result = original$QProviderInstance.$get($rootScope, $exceptionHandler);

            /**
             * @ngdoc method
             * @name $q#tick
             * @description
             * TODO: add description
             */
            result.tick = function() {
                angular.forEach(executeOnNextTick, function(callback) {
                    callback();
                });
                executeOnNextTick.length = 0;
            };

            return result;
        }]
    });

}());
