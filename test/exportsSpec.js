describe('window', function() {
    'use strict';

    it('should contain a mockInstance method', function() {
        expect(angular.isFunction(window.mockInstance)).toBe(true);
    });

    it('should contain an exported "moduleBuilder" service', function() {
        expect(angular.isObject(window.ModuleBuilder)).toBe(true);
        expect(angular.isFunction(window.ModuleBuilder.forModule)).toBe(true);
    });
});
