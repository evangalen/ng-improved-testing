'use strict';

if (!angular.mock.inject) {
    throw new Error('The "ng-improved-testing" JS-file should be loaded after "angular-mocks"');
}

var emptyInjector = angular.injector([]);

var originalInjectFn = angular.mock.inject;

window.inject = angular.mock.inject = function() {
    var originalBlockFns = Array.prototype.slice.call(arguments, 0);

    var wrappedBlockFns = [];

    angular.forEach(originalBlockFns, function(originalBlockFn) {
        var injectedServices = emptyInjector.annotate(originalBlockFn);

        var wrappedBlockFn = function($injector) {
            if ($injector.has('ngImprovedTestingMockedServices')) {
                var mockedServices = $injector.get('ngImprovedTestingMockedServices');

                angular.forEach(injectedServices, function(injectedService) {
                    if (mockedServices.hasOwnProperty(injectedService)) {
                        throw 'Service has a mock and therefore is not allowed to be injected: ' + injectedService;
                    }
                });
            }

            return $injector.invoke(originalBlockFn, this);
        };

        wrappedBlockFns.push(wrappedBlockFn);
    });


    return originalInjectFn.apply(this, wrappedBlockFns);
};