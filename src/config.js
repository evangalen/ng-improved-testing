'use strict';

var ngImprovedTestingConfigDefaults = {
    $qTick: false
};

var ngImprovedTestingConfig = angular.extend({}, ngImprovedTestingConfigDefaults);


angular.module('ngImprovedTesting.internal.config', [])
    .constant('ngImprovedTestingConfig', ngImprovedTestingConfig)

    .run(function() {
        angular.extend(ngImprovedTestingConfig, ngImprovedTestingConfigDefaults);
    });
