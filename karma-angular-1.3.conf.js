var sharedConfig = require('./karma-shared.conf');

module.exports = function(config) {
    sharedConfig(config, {testName: 'ngImprovedTesting: AngularJS 1.3.x', logFile: 'karma-angular-1.3.log'});

    config.set({

        // list of files / patterns to load in the browser
        files: [
            'bower_components/angular-1.3/angular.js',
            'bower_components/ng-module-introspector/ng-module-introspector.js',
            'bower_components/angular-mocks-1.3/angular-mocks.js',
            'src/module.js',
            'src/config.js',
            'src/mockCreator.js',
            'src/moduleBuilder.js',
            'src/mockInject.js',
            'src/$q.js',
            'src/exports.js',
            'bower_components/angular-animation-1.3/angular-animate.js',
            'test/!(moduleDeclaredAfterLoadedAllSpecs).js',
            'test/moduleDeclaredAfterLoadedAllSpecs.js'
        ]

    });
};
