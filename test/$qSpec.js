/*global ngImprovedTesting:false */
'use strict';

describe('$q service', function() {

    beforeEach(module('ngImprovedTesting.$q'));


    var $rootScope;

    beforeEach(inject(function(_$rootScope_) {
        $rootScope = _$rootScope_;
    }));


    describe('when $q.tick() is enabled', function() {
        beforeEach(ngImprovedTesting.config.$qTickEnable());

        var $q;

        beforeEach(inject(function(_$q_) {
            $q = _$q_;
        }));


        it('should do nothing on $rootScope.$digest()', function() {
            var deferred = $q.defer();
            var thenSuccessCallback = jasmine.createSpy();

            deferred.promise.then(thenSuccessCallback);

            deferred.resolve('someValue');
            $rootScope.$digest();

            expect(thenSuccessCallback).not.toHaveBeenCalled();
        });

        describe('$q.tick method', function() {
            it('should have been added to the $q service', function() {
                expect(angular.isFunction($q.tick)).toBe(true);
            });

            it('should execute all callbacks (that normally a $rootScope.$digest() would do)', function() {
                var deferred1 = $q.defer();
                var deferred2 = $q.defer();
                var thenSuccessCallback1 = jasmine.createSpy();
                var thenSuccessCallback2 = jasmine.createSpy();

                deferred1.promise.then(thenSuccessCallback1);
                deferred2.promise.then(thenSuccessCallback2);

                deferred1.resolve('aValue');
                deferred2.resolve('anotherValue');
                $q.tick();

                expect(thenSuccessCallback1).toHaveBeenCalledWith('aValue');
                expect(thenSuccessCallback2).toHaveBeenCalledWith('anotherValue');
            });
        });
    });

    describe('when $q.tick() is not enabled', function() {
        var $q;

        beforeEach(inject(function(_$q_) {
            $q = _$q_;
        }));


        it('should execute callback on $rootScope.$digest()', function() {
            var deferred = $q.defer();
            var thenSuccessCallback = jasmine.createSpy();

            deferred.promise.then(thenSuccessCallback);

            deferred.resolve('aValue');
            $rootScope.$digest();

            expect(thenSuccessCallback).toHaveBeenCalled(); //With('aValue');
        });

        describe('$q.tick method', function() {
            it('should not have been added to the $q service', function () {
                expect($q.tick).toBeUndefined();
            });
        });
    });
});
