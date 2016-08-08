/* global afterEach:true */
'use strict';

var ngImprovedTestingConfigFlags = {
    $qTick: false
};

var ngImprovedTestingConfig = {
    $setQTickDefault: function (isEnabledByDefault) {
        beforeEach(function() {
            ngImprovedTestingConfigFlags.$qTick = isEnabledByDefault;
        });
    },
    $qTickEnable: function() {
        ngImprovedTestingConfigFlags.$qTick = true;
    },
    $qTickDisable: function() {
        ngImprovedTestingConfigFlags.$qTick = false;
    }
};

angular.module('ngImprovedTesting.internal.config', [])
    .constant('ngImprovedTestingConfigFlags', ngImprovedTestingConfigFlags)
    .constant('ngImprovedTestingConfig', ngImprovedTestingConfig);
