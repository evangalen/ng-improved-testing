var fs = require('fs');

module.exports = function(grunt) {
    //grunt plugins
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            singleGlobalUseStrict: {
                options: {
                    // Replace all 'use strict' statements in the code with a single one at the top
                    banner: fs.readFileSync('src/module.prefix', 'utf8'),
                    process: function(src) {
                        return src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
                    },
                    footer: fs.readFileSync('src/module.suffix', 'utf8')
                },
                files: {
                    'dist/<%= pkg.name %>-nonAnnotated.js': ['src/module.js', 'src/config.js', 'src/mockCreator.js',
                            'src/moduleBuilder.js', 'src/$q.js', 'src/exports.js']
                }
            }
        },
        ngAnnotate: {
            options: {
                ngAnnotateOptions: {}
            },
            default: {
                files: {
                    'dist/<%= pkg.name %>.js': ['dist/<%= pkg.name %>-nonAnnotated.js']
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['dist/<%= pkg.name %>.js']
                }
            }
        },
        karma: {
            options: {
                singleRun: true,
                reporters: ['dots', 'coverage'],
                preprocessors: {
                    'src/**/*.js': ['coverage']
                }
            },
            angular_1_2: {
                configFile: 'karma-angular-1.2.conf.js',
                coverageReporter: {
                    type: 'lcov',
                    dir: 'coverage/angular-1.2'
                }
            },
            angular_1_3: {
                configFile: 'karma-angular-1.3.conf.js',
                coverageReporter: {
                    type: 'lcov',
                    dir: 'coverage/angular-1.3'
                }
            },
            angular_1_4: {
                configFile: 'karma-angular-1.4-nightly.conf.js',
                coverageReporter: {
                    type: 'lcov',
                    dir: 'coverage/karma-angular-1.4-nightly'
                }
            }
        },
        jshint: {
            files: ['*.js', 'src/**/*.js', 'test/**/*.js'],
            options: {
                jshintrc: true
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'karma']
        },
        coveralls: {
            'combined-lcov-info': {
                src: 'coverage/combined-lcov.info'
            }
        }
    });

    grunt.registerTask('upload-combined-coverage', ['coveralls:combined-lcov-info']);

    grunt.registerTask('test', ['jshint', 'karma']);

    grunt.registerTask('default', ['jshint', 'karma', 'concat:singleGlobalUseStrict', 'ngAnnotate', 'uglify']);
};