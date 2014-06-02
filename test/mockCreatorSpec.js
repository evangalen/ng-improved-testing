describe('mockCreator service', function() {
    'use strict';

    beforeEach(module('ngImprovedTesting'));

    var mockCreator;

    beforeEach(inject(function(_mockCreator_) {
        mockCreator = _mockCreator_;
    }));



    describe('canBeMocked method', function() {

        describe('should return true for', function() {

            it('a function', function() {
                expect(mockCreator.canBeMocked(function() {})).toBe(true);
            });

            it('an object with at least one method', function() {
                expect(mockCreator.canBeMocked({aMethod: function() {}})).toBe(true);
            });
        });


        describe('should return false for', function() {

            it('an object without any (enumerable) properties', function() {
                expect(mockCreator.canBeMocked({})).toBe(false);
            });

            it('an object with properties but no methods', function() {
                expect(mockCreator.canBeMocked({aProperty: 'aValue'})).toBe(false);
            });

            it('anything other than a function or an object', function() {
                expect(mockCreator.canBeMocked(undefined)).toBe(false);
                expect(mockCreator.canBeMocked(null)).toBe(false);
                expect(mockCreator.canBeMocked(NaN)).toBe(false);
                expect(mockCreator.canBeMocked(Infinity)).toBe(false);
                expect(mockCreator.canBeMocked(0)).toBe(false);
                expect(mockCreator.canBeMocked(1)).toBe(false);
                expect(mockCreator.canBeMocked(true)).toBe(false);
                expect(mockCreator.canBeMocked(false)).toBe(false);
                expect(mockCreator.canBeMocked([])).toBe(false);
            });
        });

    });



    describe('createMock method', function() {

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
                    var result = mockCreator.createMock(function() {});

                    expect(createdSpies.length).toBe(1);
                    expect(createdSpies[0]).toBe(result);
                });
            });

            describe('with a static method', function() {
                describe('but no methods in its prototype', function() {
                    it('should return a new jasmine spy with jasmine spy for the static method', function() {
                        Constructor.aStaticMethod = function() {};

                        var result = mockCreator.createMock(Constructor);

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

                        var result = mockCreator.createMock(Constructor);

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

                    var result = mockCreator.createMock(Constructor);

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

                var SpyConstructor = mockCreator.createMock(Constructor);

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
                var result = mockCreator.createMock(obj);

                var ownEnumerablePropertyNames = getOwnEnumerablePropertyNames(result);
                expect(ownEnumerablePropertyNames.length).toBe(4);
                expect(ownEnumerablePropertyNames.indexOf('aConstant') !== -1).toBe(true);
                expect(ownEnumerablePropertyNames.indexOf('anotherConstant') !== -1).toBe(true);
                expect(ownEnumerablePropertyNames.indexOf('aMethod') !== -1).toBe(true);
                expect(ownEnumerablePropertyNames.indexOf('anotherMethod') !== -1).toBe(true);
            });

            it('should have their non-methods properties copied', function() {
                var result = mockCreator.createMock(obj);

                expect(result.aConstant).toBe(obj.aConstant);
                expect(result.anotherConstant).toBe(obj.anotherConstant);
            });

            it('should have a new jasmine spy for each method', function() {
                var result = mockCreator.createMock(obj);

                expect(createdSpies.length).toBe(2);
                expect(createdSpies[0]).toBe(result.aMethod);
                expect(createdSpies[1]).toBe(result.anotherMethod);
            });

        });


        describe('should throw an exception for', function() {

            it('an object without any (enumerable) properties', function() {
                doTestCreateMockThrowsException({});
            });

            it('an object with properties but no methods', function() {
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
                    mockCreator.createMock(value);
                }).toThrow('Could not mock provided value: ' + value);
            }
        });


        function getOwnEnumerablePropertyNames(obj) {
            var result = [];

            for (var propertyName in obj) {
                if (obj.hasOwnProperty(propertyName)) {
                    result.push(propertyName);
                }
            }

            return result;
        }

    });
});
