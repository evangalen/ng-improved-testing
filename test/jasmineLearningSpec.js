'use strict';

describe('jasmine', function() {

    describe('spy', function() {

        describe('created with jasmine.createSpy()', function() {

            it('should support usage as a constructor', function() {
                var Constructor = jasmine.createSpy();

                Constructor.and.callFake(function(value) {
                    expect(this instanceof Constructor).toBe(true);

                    angular.extend(this, value || {});
                });

                Constructor.prototype.anInstanceMethod = function() {};

                var source = {aProperty: 'value'};

                var instance = new Constructor(source);

                expect(instance instanceof Constructor).toBe(true);
                expect(Constructor).toHaveBeenCalledWith(source);
                expect(instance.aProperty).toBe('value');
                expect(instance.hasOwnProperty('anInstanceMethod')).toBe(false);
                expect(instance.anInstanceMethod).toBe(Constructor.prototype.anInstanceMethod);
            });

            it('should return undefined when invoked', function() {
                var spy = jasmine.createSpy();

                expect(spy()).toBeUndefined();
            });

        });


        describe('created with spyOn', function() {

            it('should return undefined when invoked', function() {
                var obj = {
                    aMethod: function() {
                        throw 'Method should not have be executed!';
                    }
                };

                spyOn(obj, 'aMethod');

                expect(obj.aMethod()).toBeUndefined();
            });

        });

    });

});
