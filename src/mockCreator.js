/* global ngImprovedTestingModule */
(function() {
'use strict';

/**
 * @ngdoc service
 * @constructor
 */
function MockCreator() {

    /**
     * @param {*} value
     * @returns {boolean}
     */
    this.canBeMocked = function (value) {
        return angular.isFunction(value) || isObjectWithMethods(value);
    };

    /**
     * @param {(Function|Object)} value
     * @returns {(Function|Object)}
     */
    this.createMock = function (value) {
        if (angular.isFunction(value)) {
            return jasmine.createSpy();
        } else if (angular.isObject(value)) {
            return createMockObject(value);
        } else {
            throw 'Could not mock provided value: ' + value;
        }
    };

    function isObjectWithMethods(value) {
        if (!angular.isObject(value)) {
            return false;
        }

        for (var propertyName in value) {
            if (!value.hasOwnProperty(propertyName)) {
                continue;
            }

            var property = value[propertyName];
            if (angular.isFunction(property)) {
                return true;
            }
        }

        return false;
    }

    function createMockObject(obj) {
        var result = {};

        for (var propertyName in obj) {
            if (!obj.hasOwnProperty(propertyName)) {
                continue;
            }

            var property = obj[propertyName];
            if (angular.isFunction(property)) {
                result[propertyName] = jasmine.createSpy();
            } else {
                result[propertyName] = property;
            }
        }

        return result;
    }
}

angular.module('ngImprovedTesting')
    .service('mockCreator', MockCreator);

}());