;(function() {
'use strict';

var ngImprovedTestingConfig = {
    $qTick: true
};

angular.module('ngImprovedTesting.internal.config', [])
    .constant('ngImprovedTestingConfig', ngImprovedTestingConfig);

}());
