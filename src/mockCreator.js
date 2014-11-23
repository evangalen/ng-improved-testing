'use strict';

/**
 * @ngdoc service
 * @constructor
 */
function MockCreator() {

    function isObjectWithMethods(value) {
        if (!angular.isObject(value)) {
            return false;
        }

        for (var propertyName in value) { // jshint ignore:line
            var propertyValue = value[propertyName];

            if (angular.isFunction(propertyValue) && propertyName !== 'constructor' &&
                propertyValue !== Object.prototype[propertyName]) {
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

        copyPropertiesAndReplaceWithSpies(value, Constructor, true);

        Constructor.prototype = Object.create(value.prototype);
        copyPropertiesAndReplaceWithSpies(value.prototype, Constructor.prototype, true, 'constructor');
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

    function objectCreate(proto) {
        function F() {}
        F.prototype = proto;
        return new F();
    }

    function createObjectMock(obj) {
        /** @constructor */
        function Mock() {
            var self = this;

            for (var propertyName in obj) {
                var propertyValue = obj[propertyName]; //jshint forin:false

                if (!angular.isFunction(propertyValue)) {
                    self[propertyName] = angular.copy(propertyValue);
                } else if (obj.hasOwnProperty(propertyName)) {
                    spyOn(self, propertyName);
                }
            }
        }

        Mock.prototype = objectCreate(obj);
        Mock.prototype.constructor = Mock;

        for (var propertyName in obj) {
            var propertyValue = obj[propertyName]; //jshint forin:false
            if (angular.isFunction(propertyValue) && !obj.hasOwnProperty(propertyName) &&
                    propertyName !== 'constructor') {
                spyOn(Mock.prototype, propertyName);
            }
        }

        return new Mock();
    }

    /**
     * @param {Object} source
     * @param {Object} target
     * @param {boolean} onlyOwnProperties
     * @param {...string} ignoreProperties
     */
    function copyPropertiesAndReplaceWithSpies(source, target, onlyOwnProperties, ignoreProperties) {
        ignoreProperties = Array.prototype.slice.call(arguments, 3);

        for (var propertyName in source) { // jshint ignore:line
            if (onlyOwnProperties && !source.hasOwnProperty(propertyName)) {
                continue;
            }

            var propertyValue = source[propertyName];

            if ((onlyOwnProperties || (!onlyOwnProperties && propertyValue !== Object.prototype[propertyName])) &&
                (!ignoreProperties || ignoreProperties.indexOf(propertyName) === -1)) {
                if (angular.isFunction(propertyValue)) {
                    target[propertyName] = jasmine.createSpy(propertyName);
                } else {
                    target[propertyName] = propertyValue;
                }
            }
        }
    }


    /**
     * @param {*} value
     * @returns {boolean}
     */
    this.canInstanceBeMocked = function (value) {
        return angular.isFunction(value) || isObjectWithMethods(value);
    };

    /**
     * @param {(Function|Object)} value
     * @returns {(Function|Object)}
     */
    this.mockInstance = function (value) {
        if (angular.isFunction(value)) {
            return createFunctionMock(value);
        } else if (isObjectWithMethods(value)) {
            return createObjectMock(value);
        } else {
            throw 'Could not mock provided value: ' + value;
        }
    };

}

angular.module('ngImprovedTesting.internal.mockCreator', [])
    .service('mockCreator', MockCreator);
