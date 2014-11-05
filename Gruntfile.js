module.exports = function( grunt ){
  var pkg = grunt.file.readJSON('package.json');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');

  var config = {
    pkg: pkg

  , watch: {
      jshint: {
        // Concat jshint.all
        files: [],
        tasks: ['jshint'],
        options: { spawn: false }
      }
    }

  , jshint: {
      // define the files to lint
      all: ['*.js', 'lib/*.js', 'lib/**/*.js'],
      options: {
        ignores: ['node_modules'],
        laxcomma: true,
        sub: true,
        globals: {
          console: true,
          module: true
        }
      }
    }

  , shell: {
      build: {
        options: { stdout: true }
      , command: './node_modules/.bin/browserify -e browser-index.js > dist/loglog-browser.js'
      }
    }
  };

  config.watch.jshint.files = config.watch.jshint.files.concat(
    config.jshint.all
  );

  grunt.initConfig( config );

  grunt.registerTask( 'default', [
    'jshint'
  , 'watch'
  ]);

  grunt.registerTask( 'browser', [
    'jshint'
  , 'shell:build'
  ]);
};