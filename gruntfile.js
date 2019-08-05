'use strict';

module.exports = function (grunt) {

  // CONFIGURATION
  var globalConfig = {
    devBuild: "builds/dev",
    prodBuild: "builds/prod",
    // BRS
    // linkCheckerURL: "",
    // RLC
    linkCheckerURL: "osc-local.hul.harvard.edu",
    localSync: false,
    localSyncTo: ""
  };
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  grunt.initConfig({
    // load global config
    globalConfig: globalConfig,

    //////////
    // BASH
    /////////

    exec: {
      // jekyll
      jekyllBuild: {
        command: 'cd app; bundle exec jekyll build; cd ../',
        stderr: false,
        callback: function (error, stdout, stderr) {
          if (stderr) {
            grunt.warn(stderr)
          }
        }
      },
      jekyllClear: {
        command: 'cd app; rm .jekyll-metadata; cd ../'
      },
      // custom tests
      findRelics: {
        command: 'cd tests/find_relics; bash find_relics.sh; cd ../../',
        stderr: false,
        callback: function (error, stdout, stderr) {
          if (stderr) {
            grunt.warn("Relics found. (If intentional, add regex to tests/find_relics/exclude_TYPE.txt)\n\n" + stderr)
          }
        }
      },
      findNotes: {
        command: 'cd tests/find_notes; bash find_notes.sh; cd ../../',
        stderr: false,
        callback: function (error, stdout, stderr) {
          if (stderr) {
            grunt.warn("Notes found. (If intentional, add regex to tests/find_notes/exclude_TYPE.txt)\n\n" + stderr)
          }
        }
      },
      findCurlyQuotes: {
        command: 'cd tests/find_curly_quotes; bash find_curly_quotes.sh; cd ../../',
        stderr: false,
        callback: function (error, stdout, stderr) {
          if (stderr) {
            grunt.warn("Curly quotes found.\n\n" + stderr)
          }
        }
      },
      checkBaseurl: {
        command: 'cd tests/check_baseurl; bash check_baseurl.sh; cd ../../',
        stderr: false,
        callback: function (error, stdout, stderr) {
          if (stderr) {
            grunt.warn("Found relative links without {{site.baseurl}}. (If intentional, add lines to tests/check_baseurl/exclude_lines.txt)\n\n" + stderr)
          }
        }
      },
      countImageminOutput: {
        command: '[[ `ls <%= globalConfig.devBuild %>/assets/img/ | wc -l` = `ls <%= globalConfig.prodBuild %>/assets/img/ | wc -l` ]] && echo "Imagemin file count OK" || >&2 echo "file count not OK!"',
        stderr: false,
        callback: function (error, stdout, stderr) {
          if (stderr) {
            grunt.warn("Imagemin problem: " + stderr)
          }
        }

      }
    },

    //////////
    // HTML
    /////////

    htmlmin: {
      prod: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          conservativeCollapse: true
        },
        files: [{
          expand: true,
          cwd: '<%= globalConfig.devBuild %>',
          src: '**/*.html',
          dest: '<%= globalConfig.prodBuild %>/'
        }]
      }
    },

    //////////
    // Other Files to Move Around
    //////////
    copy: {
      bootstrapCustom: {
        src: 'app/_scss/_bootstrap-custom.scss',
        dest: 'vendor/bootstrap-sass/assets/stylesheets/_bootstrap-custom.scss'
      },
      fonts: {
        expand: true,
        cwd: '<%= globalConfig.devBuild %>/assets/fonts',
        src: '*',
        dest: '<%= globalConfig.prodBuild %>/assets/fonts/'
      },
      files: {
        expand: true,
        cwd: '<%= globalConfig.devBuild %>/assets/files',
        src: '*',
        dest: '<%= globalConfig.prodBuild %>/assets/files/'
      },
      serverconfig: {
        expand: true,
        cwd: '<%= globalConfig.devBuild %>',
        src: ['.htaccess', 'robots.txt', 'sitemap.xml'],
        dest: '<%= globalConfig.prodBuild %>/'
      },
      hopeAwards:{
        expand: true,
        cwd: '<%= globalConfig.devBuild %>/programs/hope/awards',
        src: '**',
        dest: '<%= globalConfig.prodBuild %>/programs/hope/awards'
      },
      hopeJs:{
        expand: false,
        src: 'app/assets/js/hope.js',
        dest: '<%= globalConfig.devBuild %>/assets/js/hope.js'
      }
    },

    imagemin: {
      dynamic: {
        expand: true,
        cwd: '<%= globalConfig.devBuild %>/assets/img/',
        src: ['**/*.{png,jpg,gif,jpeg,ico}'],
        dest: '<%= globalConfig.prodBuild %>/assets/img/',
      }
    },

    //////////
    // Javascript
    //////////

    // concat config
    concat: {
      options: {
        separator: ';',
      },
      dev: {
        src: [
          'vendor/jquery/dist/jquery.js',
          'vendor/bootstrap-sass/assets/javascripts/bootstrap/collapse.js',
          'vendor/bootstrap-sass/assets/javascripts/bootstrap/dropdown.js',
          'app/assets/js/osc-a11y.js'
        ],
        dest: '<%= globalConfig.devBuild %>/assets/js/main.js'
      }
    },

    // uglifier config
    uglify: {
      prod: {
        files: {
          '<%= globalConfig.prodBuild %>/assets/js/main.js': ['<%= globalConfig.devBuild %>/assets/js/main.js'],
          '<%= globalConfig.prodBuild %>/assets/js/hope.js': ['<%= globalConfig.devBuild %>/assets/js/hope.js']
        }
      }
    },

    //////////
    // CSS
    //////////

    // sass (libsass) config
    sass: {
      dev: {
        options: {
          style: "expanded"
        },
        files: [{
          src: 'app/_scss/main.scss',
          dest: '<%= globalConfig.devBuild %>/assets/css/main.css'
        }]
      }
    },

    // purify css
    purifycss: {
      options: {},
      target: {
        src: ['<%= globalConfig.devBuild %>/**/*.html', '<%= globalConfig.devBuild %>/assets/*.js'],
        css: ['<%= globalConfig.devBuild %>/assets/css/main.css'],
        dest: '<%= globalConfig.prodBuild %>/assets/css/main.css'
      }
    },

    // minify css
    cssmin: {
      target: {
        files: [{
          src: '<%= globalConfig.prodBuild %>/assets/css/main.css',
          dest: '<%= globalConfig.prodBuild %>/assets/css/main.css',
        }]
      }
    },

    //////////
    // Validation, etc.
    //////////

    // html validation
    htmllint: {
      all: ["<%= globalConfig.devBuild %>/**/*.html"]
    },

    // bootlint
    bootlint: {
      options: {
        stoponerror: false,
        relaxerror: ['W005', 'W001', 'W002', 'W003']
      },
      files: ['<%= globalConfig.devBuild %>/**/*.html']
    },

    // broken links
    linkChecker: {
      options: {
        initialProtocol: "https",
        ignoreInvalidSSL: true,
        maxConcurrency: 20,
        callback: function (crawler) {
          crawler.addFetchCondition(function(parsedURL) {
            // mailto links are obfuscated and confuse the crawler, exclude them
            return !parsedURL.path.match(/&$/i);
          });
          crawler.addFetchCondition(function(parsedURL) {
            // don't check the assets folder, causes error and doesn't make sense
            return !parsedURL.path.match(/assets/i);
          });
        }
      },
      dev: {
        site: '<%= globalConfig.linkCheckerURL %>',
      }
    },


    //////////
    // Deploying
    //////////

    // rsync
    rsync: {
      options: {
        args: ['-cavz'],
        exclude: ['.DS_Store']
      },
      local: {
        options: {
          src: '<%= globalConfig.devBuild %>/',
          dest: '<%= globalConfig.localSyncTo %>',
          delete: false
        }
      },
      eatondev: {
        options: {
          src: '<%= globalConfig.prodBuild %>/',
          dest: '/home/osc/osc-dev/htdocs',
          host: 'oscusr@eaton.hul.harvard.edu',
          delete: false // Careful this option could cause data loss, read the docs!
        }
      },
      eaton: {
        options: {
          src: '<%= globalConfig.prodBuild %>/',
          dest: '/home/osc/prod/htdocs',
          host: 'oscusr@eaton.hul.harvard.edu',
          delete: false // Careful this option could cause data loss, read the docs!
        }
      },
      qa: {
        options: {
          src: '<%= globalConfig.prodBuild %>/',
          dest: '/home/osc/prod/htdocs',
          host: 'oscusr@10.137.166.215',
          delete: false // Careful this option could cause data loss, read the docs!
        }
      },
      augusta: {
        options: {
          src: '<%= globalConfig.prodBuild %>/',
          dest: '/home/osc/prod/htdocs',
          host: 'oscusr@osc-prod.lib.harvard.edu',
          delete: false // Careful this option could cause data loss, read the docs!
        }
      }
    },

  });



  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-purifycss');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-html');
  grunt.loadNpmTasks('grunt-bootlint');
  grunt.loadNpmTasks('grunt-link-checker');
  grunt.loadNpmTasks('grunt-rsync');


  // Hack to stop contrib concat (and maybe other things) from failing silently
  // https://github.com/gruntjs/grunt-contrib-concat/issues/17
  grunt.registerTask('warn-fail', 'Fail on warning log', function() {
    var log = grunt.log;
    var _warn = log.warn;
    log.warn = function() {
      _warn.apply(log, arguments);
      grunt.fail.warn("Warning log has triggered failure");
    };
  });

  // Register the grunt tasks
  grunt.registerTask('build', [
    'warn-fail',
    'copy:bootstrapCustom',
    'exec:jekyllBuild',
    'concat',
    'copy:hopeJs',
    'sass',
  ]);
  grunt.registerTask('rebuild', [
    'exec:jekyllClear',
    'build'
  ]);


  grunt.registerTask('test', [
    'exec:findRelics',
    'exec:checkBaseurl',
    'htmllint',
    'bootlint',
    'linkChecker:dev'
  ]);
  grunt.registerTask('polish', [
    'exec:findNotes',
    'exec:findCurlyQuotes',
  ]);


  grunt.registerTask('stage', [
    'warn-fail',
    'newer:htmlmin',
    'newer:copy:fonts',
    'newer:copy:files',
    'newer:copy:serverconfig',
    'newer:imagemin',
    'exec:countImageminOutput',
    'purifycss',
    'cssmin',
    'newer:uglify',
    'newer:copy:hopeAwards'
  ]);

  // Register build as the default task fallback
  grunt.registerTask('default', 'build');

};
