module.exports = function(grunt) {
    //grunt plugins
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ngAnnotate: {
            options: {
                ngAnnotateOptions: {}
            },
            default: {
                files: {
                    'dist/<%= pkg.name %>.js':
                        ['src/module.js', 'src/mockCreator.js', 'src/moduleBuilder.js', 'src/exports.js']
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
            angular_1_0: {
                configFile: 'karma-angular-1.0.conf.js',
                singleRun: true
            },
            angular_1_2: {
                configFile: 'karma-angular-1.2.conf.js',
                singleRun: true
            },
            angular_1_3_nightly: {
                configFile: 'karma-angular-1.3-nightly.conf.js',
                singleRun: true
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
        }
    });

    grunt.registerTask('test', ['jshint', 'karma']);

    grunt.registerTask('default', ['jshint', 'karma', 'ngAnnotate', 'uglify']);
};