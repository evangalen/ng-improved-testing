/* global afterEach:true */
'use strict';

var ngImprovedTestingConfigFlags = {
    $qTick: false
};

var ngImprovedTestingConfig = {
    $setQTickDefault: function (isEnableAtDefault) {
        beforeEach(function() {
            console.log('ngImprovedTestingConfig.$qTickDefault', ngImprovedTestingConfig.$qTickDefault);
            ngImprovedTestingConfigFlags.$qTick = isEnableAtDefault;
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
