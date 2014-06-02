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
                    'dist/<%= pkg.name %>.js': ['src/module.js', 'src/*.js']
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
            unit: {
                configFile: 'karma.conf.js',
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