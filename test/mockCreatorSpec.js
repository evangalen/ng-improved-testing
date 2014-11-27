'use strict';

describe('mockCreator service', function() {

    beforeEach(module('ngImprovedTesting.internal.mockCreator'));

    var mockCreator;

    beforeEach(inject(function(_mockCreator_) {
        mockCreator = _mockCreator_;
    }));



    describe('canInstanceBeMocked method', function() {

        describe('should return true for', function() {

            it('a function', function() {
                expect(mockCreator.canInstanceBeMocked(function() {})).toBe(true);
            });

            it('an object with at least one method', function() {
                expect(mockCreator.canInstanceBeMocked({aMethod: function() {}})).toBe(true);
            });

            it('an object with an inherited property', function() {
                var ParentConstructor = function() {};
                ParentConstructor.prototype.anInheritedMethod = function() {};

                var Constructor = function() {};
                Constructor.prototype = Object.create(ParentConstructor.prototype);
                Constructor.prototype.constructor = Constructor;
                Constructor.prototype.anInstanceMethod = function() {};

                expect(mockCreator.canInstanceBeMocked(new Constructor())).toBe(true);
            });
        });


        describe('should return false for', function() {

            it('an object without any (enumerable) properties', function() {
                expect(mockCreator.canInstanceBeMocked({})).toBe(false);
            });

            it('an object with properties but no methods', function() {
                expect(mockCreator.canInstanceBeMocked({aProperty: 'aValue'})).toBe(false);
            });

            it('an object with inherited properties but no method', function() {
                var ParentConstructor = function() {};
                ParentConstructor.aStaticMethodOfParent = function() {};
                ParentConstructor.prototype.anInheritedConstant = 'anInheritedValue';

                var Constructor = function() {};
                Constructor.aStaticMethod = function() {};
                Constructor.prototype = Object.create(ParentConstructor.prototype);
                Constructor.prototype.constructor = Constructor;
                Constructor.prototype.aPrototypeConstant = 'aPrototypeConstant';

                expect(mockCreator.canInstanceBeMocked(new Constructor())).toBe(false);
            });

            it('anything other than a function or an object', function() {
                expect(mockCreator.canInstanceBeMocked(undefined)).toBe(false);
                expect(mockCreator.canInstanceBeMocked(null)).toBe(false);
                expect(mockCreator.canInstanceBeMocked(NaN)).toBe(false);
                expect(mockCreator.canInstanceBeMocked(Infinity)).toBe(false);
                expect(mockCreator.canInstanceBeMocked(0)).toBe(false);
                expect(mockCreator.canInstanceBeMocked(1)).toBe(false);
                expect(mockCreator.canInstanceBeMocked(true)).toBe(false);
                expect(mockCreator.canInstanceBeMocked(false)).toBe(false);
                expect(mockCreator.canInstanceBeMocked([])).toBe(false);
            });
        });

    });



    describe('mockInstance method', function() {

        var originalJasmineCreateSpyFn = jasmine.createSpy;
        var createdSpies;

        beforeEach(function() {
            createdSpies = [];

            jasmine.createSpy = function() {
                var result = originalJasmineCreateSpyFn.apply(this, arguments);

                createdSpies.push(result);

                return result;
            };
        });

        afterEach(function() {
            jasmine.createSpy = originalJasmineCreateSpyFn;
        });


        describe('for a function', function() {
            var Constructor;

            beforeEach(function() {
                Constructor = function() {};
            });

            describe('without any static methods or instance methods (on its prototype)', function() {
                it('should return a new jasmine spy', function() {
                    var result = mockCreator.mockInstance(function() {});

                    expect(createdSpies.length).toBe(1);
                    expect(createdSpies[0]).toBe(result);
                });
            });

            describe('with a static method', function() {
                describe('but no methods in its prototype', function() {
                    it('should return a new jasmine spy with jasmine spy for the static method', function() {
                        Constructor.aStaticMethod = function() {};

                        var result = mockCreator.mockInstance(Constructor);

                        expect(createdSpies.length).toBe(2);
                        assertFirstCreatedSpyIsContructor(result);
                        expect(createdSpies[1]).toBe(result.aStaticMethod);
                    });
                });

                describe('and also a method in its prototype', function() {
                    it('should return a new jasmine spy with jasmine spy for both the static and prototype ' +
                            'method', function() {
                        Constructor.aStaticMethod = function() {};
                        Constructor.prototype.anInstanceMethod = function() {};

                        var result = mockCreator.mockInstance(Constructor);

                        expect(createdSpies.length).toBe(3);
                        assertFirstCreatedSpyIsContructor(result);
                        expect(createdSpies[1]).toBe(result.aStaticMethod);
                        expect(createdSpies[2]).toBe(result.prototype.anInstanceMethod);
                    });
                });
            });

            describe('with an instance method bot no static methods', function() {
                it('should return a new jasmine spy with jasmine spy for the instance method', function() {
                    Constructor.prototype.anInstanceMethod = function() {};

                    var result = mockCreator.mockInstance(Constructor);

                    expect(createdSpies.length).toBe(2);
                    assertFirstCreatedSpyIsContructor(result);
                    expect(createdSpies[1]).toBe(result.prototype.anInstanceMethod);
                });
            });

            it('should ignore inherited properties', function() {
                var ParentConstructor = function() {};
                ParentConstructor.aStaticMethodOfParent = function() {};
                ParentConstructor.prototype.anInheritedConstant = 'anInheritedValue';
                ParentConstructor.prototype.anInheritedMethod = function() {};

                Constructor.aStaticMethod = function() {};
                Constructor.prototype = Object.create(ParentConstructor.prototype);
                Constructor.prototype.constructor = Constructor;
                Constructor.prototype.anInstanceMethod = function() {};

                var SpyConstructor = mockCreator.mockInstance(Constructor);

                expect(createdSpies.length).toBe(3);
                assertFirstCreatedSpyIsContructor(SpyConstructor);
                expect(new SpyConstructor() instanceof ParentConstructor).toBe(true);
                expect(createdSpies[1]).toBe(SpyConstructor.aStaticMethod);
                expect(SpyConstructor.aStaticMethodOfParent).toBeUndefined();
                expect(createdSpies[2]).toBe(SpyConstructor.prototype.anInstanceMethod);
                expect(SpyConstructor.prototype.anInheritedConstant)
                    .toBe(ParentConstructor.prototype.anInheritedConstant);
                expect(SpyConstructor.prototype.anInheritedMethod).toBe(ParentConstructor.prototype.anInheritedMethod);
            });


            function assertFirstCreatedSpyIsContructor(SpyConstructor) {
                expect(createdSpies.length > 0).toBe(true);
                expect(createdSpies[0]).toBe(SpyConstructor);
                expect(SpyConstructor.prototype.constructor).toBe(Constructor);
                expect(new SpyConstructor() instanceof Constructor).toBe(true);
            }

        });


        describe('for an object with (instance) methods', function() {

            /** @const */
            var obj = Object.freeze({
                aConstant: 'aValue',
                anotherConstant: 'anotherValue',
                aMethod: function() {},
                anotherMethod: function() {}
            });


            it('should consist of the same properties', function() {
                var result = mockCreator.mockInstance(obj);

                expect(Object.getOwnPropertyNames(result))
                    .toEqual(['aConstant', 'anotherConstant', 'aMethod', 'anotherMethod']);
            });

            it('should have their non-methods properties copied', function() {
                var result = mockCreator.mockInstance(obj);

                expect(result.aConstant).toBe(obj.aConstant);
                expect(result.anotherConstant).toBe(obj.anotherConstant);
            });

            it('should have a new jasmine spy for each method', function() {
                var result = mockCreator.mockInstance(obj);

                expect(createdSpies.length).toBe(2);
                expect(createdSpies[0]).toBe(result.aMethod);
                expect(createdSpies[1]).toBe(result.anotherMethod);
            });

            it('should also contains all inherited properties with a jasmine spy for each method', function() {
                var ParentConstructor = function() {};
                ParentConstructor.aStaticMethodOfParent = function() {};
                ParentConstructor.prototype.anInheritedConstant = 'anInheritedValue';
                ParentConstructor.prototype.anInheritedMethod = function() {};

                var Constructor = function() {};
                Constructor.aStaticMethod = function() {};
                Constructor.prototype = Object.create(ParentConstructor.prototype);
                Constructor.prototype.constructor = Constructor;
                Constructor.prototype.anInstanceMethod = function() {};
                Constructor.prototype.aPrototypeConstant = 'aPrototypeConstant';

                var result = mockCreator.mockInstance(new Constructor());

                expect(Object.getOwnPropertyNames(result))
                    .toEqual(['anInstanceMethod', 'aPrototypeConstant', 'anInheritedConstant', 'anInheritedMethod']);

                expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
                expect(result.anInheritedConstant).toBe(ParentConstructor.prototype.anInheritedConstant);
                expect(result.aPrototypeConstant).toBe(Constructor.prototype.aPrototypeConstant);

                expect(createdSpies.length).toBe(2);
                expect(createdSpies[0]).toBe(result.anInstanceMethod);
                expect(createdSpies[1]).toBe(result.anInheritedMethod);
            });

        });


        describe('should throw an exception for', function() {

            it('an object without any (enumerable) properties', function() {
                doTestCreateMockThrowsException({});
            });

            it('an object with properties but no methods', function() {
                doTestCreateMockThrowsException({aProperty: 'aValue'});
            });

            it('an object with inherited properties but no methods', function() {
                doTestCreateMockThrowsException({aProperty: 'aValue'});
            });

            it('anything other than a function or an object', function() {
                doTestCreateMockThrowsException(undefined);
                doTestCreateMockThrowsException(null);
                doTestCreateMockThrowsException(NaN);
                doTestCreateMockThrowsException(Infinity);
                doTestCreateMockThrowsException(0);
                doTestCreateMockThrowsException(1);
                doTestCreateMockThrowsException(true);
                doTestCreateMockThrowsException(false);
                doTestCreateMockThrowsException([]);
            });


            function doTestCreateMockThrowsException(value) {
                expect(function() {
                    mockCreator.mockInstance(value);
                }).toThrow('Could not mock provided value: ' + value);
            }
        });

    });
});
