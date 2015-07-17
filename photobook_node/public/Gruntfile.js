module.exports = function (grunt) {

	grunt.initConfig({

		package: grunt.file.readJSON('package.json'),

		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: 'src',
					dest: 'dist',
					src: [
                        '{,*/}*.html', 
						'fonts/*.*'
                    ]
                }]
			}
		},
		useminPrepare: {
			html: 'src/index.html',
			options: {
				dest: 'dist'
			}
		},
		usemin: {
			options: {
				assetsDirs: ['dist']
			},
			html: ['dist/{,*/}*.html'],
			css: ['dist/{,*/}*.css']
		}, 
		watch: {
            js: {
                files: ['src/js/{,*/}*.js'],                
                options: {
                    livereload: true
                }
            },
			css: {
                files: ['src/css/{,*/}*.css'],                
                options: {
                    livereload: true
                }
            }
        },
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('default', ['copy', 'useminPrepare', 'concat', 'cssmin', 'uglify', 'usemin']);
};