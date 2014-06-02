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
            return createFunctionMock(value);
        } else if (isObjectWithMethods(value)) {
            return createObjectMock(value);
        } else {
            throw 'Could not mock provided value: ' + value;
        }
    };

    function isObjectWithMethods(value) {
        if (!angular.isObject(value)) {
            return false;
        }

        for (var propertyName in value) {
            if (value.hasOwnProperty(propertyName) && angular.isFunction(value[propertyName])) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param {Function} value
     * @returns {Function}
     */
    function createFunctionMock(value) {
        if (!hasProperties(value) && !hasProperties(value.prototype, 'constructor')) {
            return jasmine.createSpy();
        }

        var Constructor = jasmine.createSpy();

        copyPropertiesAndReplaceWithSpies(value, Constructor);

        Constructor.prototype = Object.create(value.prototype);
        copyPropertiesAndReplaceWithSpies(value.prototype, Constructor.prototype, 'constructor');
        Constructor.prototype.constructor = value.prototype.constructor;

        return Constructor;
    }

    /**
     * @param {Object} obj
     * @param {...string} ignoreProperties
     */
    function hasProperties(obj, ignoreProperties) {
        for (var propertyName in obj) {
            if (obj.hasOwnProperty(propertyName) &&
                    (!ignoreProperties || ignoreProperties.indexOf(propertyName) === -1)) {
                return true;
            }
        }

        return false;
    }

    function createObjectMock(obj) {
        var result = {};

        copyPropertiesAndReplaceWithSpies(obj, result);

        return result;
    }

    /**
     * @param {Object} source
     * @param {Object} target
     * @param {...string} ignoreProperties
     */
    function copyPropertiesAndReplaceWithSpies(source, target, ignoreProperties) {
        ignoreProperties = Array.prototype.slice.call(arguments, 2);

        for (var propertyName in source) {
            if (source.hasOwnProperty(propertyName) &&
                    (!ignoreProperties || ignoreProperties.indexOf(propertyName) === -1)) {
                var propertyValue = source[propertyName];
                if (angular.isFunction(propertyValue)) {
                    target[propertyName] = jasmine.createSpy();
                } else {
                    target[propertyName] = propertyValue;
                }
            }
        }
    }
}

angular.module('ngImprovedTesting')
    .service('mockCreator', MockCreator);

}());