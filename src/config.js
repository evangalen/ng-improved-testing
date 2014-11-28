/* global afterEach:true */
'use strict';

var ngImprovedTestingConfigFlags = {
    $qTick: false
};

var ngImprovedTestingConfig = {
    $qTickEnable: function() {
        afterEach(function() {
            ngImprovedTestingConfigFlags.$qTick = false;
        });

        return function() {
            ngImprovedTestingConfigFlags.$qTick = true;
        };
    }
};

angular.module('ngImprovedTesting.internal.config', [])
    .constant('ngImprovedTestingConfigFlags', ngImprovedTestingConfigFlags)
    .constant('ngImprovedTestingConfig', ngImprovedTestingConfig);
