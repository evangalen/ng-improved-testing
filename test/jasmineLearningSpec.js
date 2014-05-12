/* global angular, inject, describe, beforeEach, it, spyOn, expect, module */

describe('jasmine', function() {
    'use strict';

    describe('spy', function() {

        describe('created with jasmine.createSpy()', function() {

            it('should allow instantiation using new', function() {
                var Constructor = jasmine.createSpy();
                Constructor.prototype.anInstanceMethod = function() {};

                var instance = new Constructor();

                expect(instance instanceof Constructor).toBe(true);
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
