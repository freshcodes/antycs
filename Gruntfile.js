module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        boss: true
      },
      src: ['src/**/*.js']
    },
    concat: {
      native: {
        src: ['src/antycs.js', 'src/dom/native.js', 'src/plugins/*.js'],
        dest: 'dist/antycs.<%= pkg.version %>.native.js'
      },
      jquery: {
        src: ['src/antycs.js', 'src/dom/jquery.js', 'src/plugins/*.js'],
        dest: 'dist/antycs.<%= pkg.version %>.jquery.js'
      }
    },
    uglify: {
      native: {
        src: ['dist/antycs.<%= pkg.version %>.native.js'],
        dest: 'dist/antycs.<%= pkg.version %>.native.min.js'
      },
      jquery: {
        src: ['dist/antycs.<%= pkg.version %>.jquery.js'],
        dest: 'dist/antycs.<%= pkg.version %>.jquery.min.js'
      }
    },
    connect: {
      server: {
        options: {
          port: 8000,
          hostname: '0.0.0.0',
          keepalive: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('build', ['jshint', 'concat', 'uglify']);

};
