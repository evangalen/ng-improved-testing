'use strict';

/**
 * @ngdoc service
 * @constructor
 */
function MockCreator() {

    /** @const */
    var getPrototypeOfMethodExists = Object.getPrototypeOf;


    function isObjectWithMethods(value) {
        // if not an object or an internal object
        if (!angular.isObject(value) || Object.prototype.toString.call(value) !== '[object Object]') {
            return false;
        }

        return iteratePropertiesOnPrototypeChain(false, value, function(currentProto, propertyName) {
            var propertyValue = currentProto[propertyName];

            return angular.isFunction(propertyValue) && propertyName !== 'constructor' &&
                    propertyValue !== Object.prototype[propertyName];
        });
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

        Constructor.prototype = createObject(value.prototype);
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

    function createObjectMock(obj) {
        /** @constructor */
        function Mock() {
            var self = this;

            angular.forEach(getNonInheritedPropertyNames(obj), function(propertyName) {
                var propertyValue = obj[propertyName];

                if (!angular.isFunction(propertyValue)) {
                    shadowDataProperty(obj, propertyName, self);
                } else {
                    shadowMethod(obj, propertyName, self);
                }
            });
        }

        Mock.prototype = createObject(obj);
        if (getPrototypeOfMethodExists) {
            Object.defineProperty(Mock.prototype, 'constructor', {value: Mock});
        } else {
            Mock.prototype.constructor = Mock;
        }

        iteratePropertiesOnPrototypeChain(true, obj, function(currentProto, propertyName) {
            shadowMethod(currentProto, propertyName, Mock.prototype);
        });

        if (Object.seal) {
            Object.seal(Mock.prototype);
        }

        return new Mock();
    }

    function createObject(proto) {
        if (Object.create) {
            return Object.create(proto);
        } else {
            var F = function() {};
            F.prototype = proto;
            return new F();
        }
    }

    function shadowDataProperty(source, propertyName, target) {
        assureOwnProperty(source, propertyName);

        if (getPrototypeOfMethodExists) {
            var propertyDescriptor = Object.getOwnPropertyDescriptor(source, propertyName);
            Object.defineProperty(
                    target, propertyName, angular.extend(propertyDescriptor, {value: source[propertyName]}));
        } else {
            target[propertyName] = source[propertyName];
        }
    }

    function shadowMethod(source, propertyName, target) {
        assureOwnProperty(source, propertyName);

        spyOn(target, propertyName);

        if (getPrototypeOfMethodExists) {
            var createdSpy = target[propertyName];

            Object.defineProperty(target, propertyName,
                   {value: createdSpy, enumerable: source.propertyIsEnumerable(propertyName)});
        }
    }

    function assureOwnProperty(obj, propertyName) {
        if (!obj.hasOwnProperty(propertyName)) {
            throw 'Property name is not an own property: ' + propertyName;
        }
    }

    function iteratePropertiesOnPrototypeChain(startWithPrototype, obj, callback) {
        if (getPrototypeOfMethodExists) {
            return iteratePropertiesOnPrototypeChainUsingGetPrototypeOf(startWithPrototype, obj, callback);
        } else {
            var propertyName;

            for (propertyName in obj) {
                //noinspection JSUnfilteredForInLoop
                if (!startWithPrototype || (startWithPrototype && !obj.hasOwnProperty(propertyName))) {
                    //noinspection JSUnfilteredForInLoop
                    var result = callback(obj, propertyName);
                    if (result) {
                        return result;
                    }
                }
            }
        }

        return false;
    }

    function iteratePropertiesOnPrototypeChainUsingGetPrototypeOf(startWithPrototype, obj, callback) {
        var earlierVisitedPropertyNames = [];

        var currentProto = startWithPrototype ? Object.getPrototypeOf(obj) : obj;

        while (currentProto !== Object.prototype && currentProto !== null) {
            var nonInheritedPropertyNames = getNonInheritedPropertyNames(currentProto);

            for (var i = 0; i < nonInheritedPropertyNames.length; i += 1) {
                var propertyName = nonInheritedPropertyNames[i];

                if (!angular.isFunction(obj[propertyName]) || propertyName === 'constructor' ||
                    earlierVisitedPropertyNames.indexOf(propertyName) !== -1) {
                    continue;
                }

                var result = callback(currentProto, propertyName);
                if (result) {
                    return result;
                }

                earlierVisitedPropertyNames.push(propertyName);
            }

            currentProto = Object.getPrototypeOf(currentProto);
        }

        return false;
    }

    /**
     * @param {object} obj
     * @returns {string[]}
     */
    function getNonInheritedPropertyNames(obj) {
        if (getPrototypeOfMethodExists) {
            return Object.getOwnPropertyNames(obj);
        } else {
            var result = [];

            for (var propertyName in obj) {
                if (obj.hasOwnProperty(propertyName)) {
                    result.push(propertyName);
                }
            }

            return result;
        }
    }

    /**
     * @param {Object} source
     * @param {Object} target
     * @param {boolean} onlyOwnProperties
     * @param {...string} ignoreProperties
     */
    function copyPropertiesAndReplaceWithSpies(source, target, onlyOwnProperties, ignoreProperties) {
        ignoreProperties = Array.prototype.slice.call(arguments, 3);

        for (var propertyName in source) { // jshint forin:false
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
