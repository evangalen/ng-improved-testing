'use strict';

describe('decorated directive learning spec', function() {

    var ngModelControllerSpy;

    beforeEach(module('ng', function($provide) {
        $provide.decorator('ngModelDirective', function($delegate) {
            var annotatedOriginalNgModelController = $delegate[0].controller;

            ngModelControllerSpy = jasmine.createSpy();
            annotatedOriginalNgModelController[annotatedOriginalNgModelController.length - 1] = ngModelControllerSpy;

            $delegate[0].restrict = 'EA';
            $delegate[0].link = angular.noop;
            $delegate[0].compile = angular.noop;

            return $delegate;
        });
    }));


    //TODO: add tests to check if:
    //  - restrict can be set to '' to disabled a directive declaration
    //  - link can be set to an angular.noop (or spy in the test) to disable its link logic
    //  - compile can be set to an angular.noop (or spy in the test) to disable its compile logic

    it('should allow overriding the controller', inject(function($rootScope, $compile) {
        var $scope = $rootScope.$new();

        $compile('<div data-ng-model="aModel"></div>')($scope);
        expect(ngModelControllerSpy).toHaveBeenCalled();
    }));
});
