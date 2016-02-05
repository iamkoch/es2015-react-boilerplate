var fs = require('fs'),
    pkg = require('./package'),
    minor_version = pkg.version.replace(/\.(\d)*$/, ''),
    major_version = pkg.version.replace(/\.(\d)*\.(\d)*$/, ''),
    path = require('path');

function rename_release(v) {
  return function (d, f) {
    var dest = path.join(d, f.replace(/(\.min)?\.js$/, '-' + v + '$1.js').replace('workmates-app-', ''));
    return dest;
  };
}

module.exports = function (grunt) {
  grunt.initConfig({
    bower_concat: {
      all: {
        dest: 'public/js/vendor/vendor.js',
        cssDest: 'public/css/vendor/vendor.css',
        dependencies: {},
        exclude: [],
        mainFiles: {
          "react": ['react-with-addons.js']
        }
      }
    },
    env: {
      options: {
        //Shared Options Hash
      },
      dev: {
        src: 'env-dev.json'
      }
    },
    express: {
      options: {},
      dev: {
        options: {
          script: 'server.js',
          nospawn: true,
          delay: 5
        }
      }
    },
    eslint: {
      target: [
        'lib/**/*.js',
        'index.js',
      ]
    },
    browserify: {
      release: {
        files: {
          'build/application.js': ['lib/app.js']
        },
        options: {
          transform: [['babelify', {'presets': ['es2015', 'react', 'stage-0']}], 'brfs', 'packageify', 'browserify-shim']
        }
      },
      dist: {
        options: {
          "transform": [ ["babelify", { "presets": ["es2015", "stage-0", "react"] } ], 'browserify-shim' ],
          watch: true
        },
        files: {
          'build/application.js': ['lib/app.js']
        }
      },
      debug: {
        options: {
          "transform": [["babelify", {"presets": ["es2015", "stage-0", "react"]}], 'browserify-shim']
        },
        files: {
          'build/application.js': ['lib/app.js']
        }
      }
    },
    less: {
      dist: {
        options: {
          paths: ['lib/client/css']
        },
        files: {
          'lib/client/css/main.css': 'lib/client/css/main.less'
        }
      }
    },
    cssmin: {
      minify: {
        options: {
          keepSpecialComments: 0
        },
        files: {
          'public/css/main.min.css': ['lib/client/css/main.css']
        }
      }
    },
    copy: {
      dev: {
        files: {
          'public/js/application.min.js': 'build/application.min.js',
          'public/js/application.js': 'build/application.js'
        }
      },
      release: {
        files: [
          {expand: true, flatten: true, src: 'build/*', dest: 'release/', rename: rename_release(pkg.version)},
          {expand: true, flatten: true, src: 'build/*', dest: 'release/', rename: rename_release(minor_version)},
          {expand: true, flatten: true, src: 'build/*', dest: 'release/', rename: rename_release(major_version)}
        ]
      }
    },
    exec: {
      'uglify': {
        cmd: path.relative('', 'node_modules/.bin/uglifyjs') + ' build/application.js  -b beautify=false,ascii_only=true > build/application.min.js',
        stdout: true,
        stderr: true
      }
    },
    clean: {
      css: ['lib/client/css/main.css', 'public/css/main.min.css'],
      js: ['release/', 'build/', 'public/js/application.js', 'public/js/application.min.js']
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        autoWatch: true
      }
    },
    watch: {
      js: {
        files: ['build/application.js', 'build/application.min.js' ],
        tasks: ['copy:dev'],
        options: {
          livereload: true
        }
      },
      karma: {
        files: [
          'lib/**/__tests__/**/*.js'
        ],
        tasks: ['karma']
      },
      less: {
        files: [
          'lib/**/*.less'
        ],
        tasks: ['build-css'],
        options: {
          livereload: true
        }
      },
      css: {
        files: [
          'public/css/*.css'
        ],
        tasks: [],
        options: {
          nospawn: true,
          livereload: true
        }
      },
      express: {
        files: ['server.js', 'views/**/*.jade', 'lib/server/**/*.js', 'lib/common/**/*.js'],
        tasks: ['express:dev'],
        options: {
          nospawn: true
        }
      }
    },
    compress: {
      main: {
        options: {
          mode: 'gzip'
        },
        expand: true,
        cwd: 'release/',
        src: ['**/*'],
        dest: 'release-gzip/'
      }
    }
  });

  for (var key in grunt.file.readJSON('package.json').devDependencies) {
    if (key !== 'grunt' && key !== 'grunt-cli' && key.indexOf('grunt') === 0) {
      grunt.loadNpmTasks(key);
    }
  }

  grunt.registerTask('css', ['clean:css', 'less:dist', 'cssmin:minify']);
  grunt.registerTask('js', ['clean:js', 'eslint', 'karma', 'bower_concat', 'browserify:dist', 'exec:uglify', 'copy:dev']);
  grunt.registerTask('js-release', ['clean:js', 'eslint', 'karma', 'bower_concat', 'browserify:release', 'exec:uglify', 'copy:dev']);

  grunt.registerTask('build', ['css', 'js']);
  grunt.registerTask('build-css', ['css']);
  grunt.registerTask('build-release', ['css', 'js-release']);

  grunt.registerTask('dev', ['env:dev', 'express:dev', 'build', 'watch']);
  grunt.registerTask('release', ['build-release']);
};
