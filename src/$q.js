'use strict';

var ngModuleIntrospectorInjector = angular.injector(['ng', 'ngModuleIntrospector']);
var moduleIntrospectorFactory = ngModuleIntrospectorInjector.get('moduleIntrospector');
var moduleIntrospector = moduleIntrospectorFactory('ng');

var original$QProviderConstructor = moduleIntrospector.getProviderDeclaration('$qProvider').rawDeclaration;
var ngInjector = angular.injector(['ng']);
var original$QProviderInstance = ngInjector.instantiate(original$QProviderConstructor, {});


angular.module('ngImprovedTesting.$q', ['ngImprovedTesting.internal.config'])

    /**
     * @ngdoc service
     * @name $q
     * @module ngImprovedTesting
     * @description
     * TODO: add description
     */
    .provider('$q', function(ngImprovedTestingConfigFlags) {
        this.$get = function($rootScope, $exceptionHandler) {
            /** @type {?Array.<function()>} */
            var executeOnNextTick = null;

            if (ngImprovedTestingConfigFlags.$qTick) {
                executeOnNextTick = [];

                $rootScope = {
                    $evalAsync: function (callback) {
                        executeOnNextTick.push(callback);
                    }
                };
            }

            var result = original$QProviderInstance.$get[original$QProviderInstance.$get.length - 1](
                    $rootScope, $exceptionHandler);

            if (ngImprovedTestingConfigFlags.$qTick) {
                /**
                 * @ngdoc method
                 * @name $q#tick
                 * @description
                 * TODO: add description
                 */
                result.tick = function () {
                    angular.forEach(executeOnNextTick, function (callback) {
                        callback();
                    });
                    executeOnNextTick.length = 0;
                };
            }

            return result;
        };
    });
