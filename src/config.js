'use strict';

var ngImprovedTestingConfig = {
    $qTick: false
};

angular.module('ngImprovedTesting.internal.config', [])
    .constant('ngImprovedTestingConfig', ngImprovedTestingConfig);
