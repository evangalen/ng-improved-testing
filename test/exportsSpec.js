describe('window.ModuleBuilder', function() {
    'use strict';

    it('should contain an exported "moduleBuilder" service', function() {
        expect(angular.isObject(window.ModuleBuilder)).toBe(true);
        expect(angular.isFunction(window.ModuleBuilder.forModule)).toBe(true);
    });
});
