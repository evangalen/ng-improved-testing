'use strict';

describe('window', function() {

    describe('should contain a ngImprovedTesting object', function() {
        it('with a mockInstance method', function() {
            expect(angular.isFunction(window.ngImprovedTesting.mockInstance)).toBe(true);
        });

        it('with a config object with a $qTickEnable method', function() {
            expect(angular.isObject(window.ngImprovedTesting.config)).toBe(true);
            expect(angular.isFunction(window.ngImprovedTesting.config.$qTickEnable)).toBe(true);
        });
    });

    it('should contain a mockInstance method with the same instance as from window.ngImprovedTesting.mockInstance', function() {
        expect(angular.isFunction(window.mockInstance)).toBe(true);
        expect(window.mockInstance).toBe(window.ngImprovedTesting.mockInstance);
    });

    it('should contain an exported "moduleBuilder" service', function() {
        expect(angular.isObject(window.ModuleBuilder)).toBe(true);
        expect(angular.isFunction(window.ModuleBuilder.forModule)).toBe(true);
    });

});
