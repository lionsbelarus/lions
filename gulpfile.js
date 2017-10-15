'use strict';

//common
const del = require('del');
const path = require('path')
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const gulplog = require('gulplog');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');

//helpers
const newer = require('gulp-newer');
const debug = require('gulp-debug');
const plumber = require('gulp-plumber');
const notifier = require('node-notifier');


//html
const fileinclude = require('gulp-file-include');

const browserSync = require('browser-sync').create();

//css
const postcss = require('gulp-postcss');
// const cssImport= require('postcss-easy-import');
const cssImport= require('postcss-import');
const cssNext  = require('postcss-cssnext');
const cssNano = require('cssnano');
const mqPacker = require('css-mqpacker');
const inlineSvg = require('postcss-inline-svg')({path:'./src/'});
// in css we can use: svg-load('./img/sprites/svg/arrow-right--short.svg')

//images
const imagemin = require('gulp-imagemin')
const svgSprite = require('gulp-svg-sprite');


//js
const webpackStream = require('webpack-stream')
const webpack = webpackStream.webpack;
const named = require('vinyl-named');



const paths = {
  html: {
    src: ['src/**/*.html','!src/components/**/*.html'],
    dest: 'dist',

    watch: ['src/**/*.html','!src/components/**/*.html'],
    watch_partials: 'src/components/**/*.html'//^^^ you need to negatively duplicate it in watch.html!!!! ^^^
  },


  css: {
    src: 'src/css/app.css',

    concat: 'styles.css',
    dest: 'dist/css',

    // node_modules exists in resolve paths by default and we don't need to place it here
    resolve: [
            'src/',
            'src/components',
            'src/css/common',
            'src/css/vendor'
            ],

    watch: ['src/css/**/*.css','src/components/**/*.css']
  },
  cssVendor: {
      src: 'src/css/vendor/**/*.css',

      concat: 'vendor.css',
      dest: 'dist/css'
  },



  images: {
    src: 'src/img/**/*.{jpg,jpeg,png,svg,gif,webp}',

    dest: 'dist/img',

    watch: 'src/img/**/*.{jpg,jpeg,png,svg,gif,webp}'
  },
  imagesSpritesSvg: {
    src: 'src/img/sprites/svg/**/*.svg',
    concat: 'icons.svg',

    dest: ''//relative to dist
  },
  imagesSpritesRastr: {
    src: '',
    concat: 'sprite.png',

    dest: ''//relative to dist
  },



  js: {
    src: [
          'src/js/*.js',
          'src/components/**/*.js',
          '!src/js/vendor/jquery-*.js'
          ],
    concat: 'main.js',
    dest: 'dist/js',

    resolve: ['node_modules', 'src/components'],

    vendor: {
      src: [
            'src/js/vendor/**/*.*',
            '!src/js/vendor/jquery-*.js'
            ],
      concat: 'vendor.js',
      dest: 'dist/js'
    },

    //we copy jquery separately because of html5 boilerplate snippet
    jquery: {
      'src':'src/js/vendor/jquery-*.js',
      'dest':'dist/js'
    },

    watch: ['src/js/**/*.js', 'src/components/**/*.js']
  },



  misc: {
    src: [
          'src/*.*',
         '!src/*.html'
         ],
    dest: 'dist'
  }
}
var isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
// для запуска сборки production, делаем  " NODE_ENV=production gulp " build OR " gulp prod "

function setProduction() {
  console.log(isDevelopment)
  if (!isDevelopment) {
    paths.html.dest   = 'prod';
    paths.css.dest = 'prod/css';
    paths.cssVendor.dest = 'prod/css';
    paths.images.dest = 'prod/img';
    paths.js.dest     = 'prod/js';
    paths.js.vendor.dest     = 'prod/js';
    paths.misc.dest   = 'prod';
  }
}
setProduction();

gulp.task('clean', function () {
  return del(['dist','prod'])
})

gulp.task('html', function () {
  return gulp .src(paths.html.src, {since: gulp.lastRun('html')})
  .pipe(plumber({errorHandler: function (error) {
    console.log(error)
    notifier.notify({
      title: 'Html error',
      message: error.message,
      icon: path.join(__dirname, 'other/html.png'),
      sound: true,
      // wait:true
    });
  }}))
  .pipe(newer(paths.html.dest))
  .pipe(debug({title:'html'}))
  .pipe(fileinclude({
      basepath: 'src/components/'
    }))
  .pipe(gulp.dest(paths.html.dest))
  .on("end", browserSync.reload)//we should reload only when all html files processed
})
gulp.task('html_partials', function () {
  return gulp .src(paths.html.src)
  .pipe(plumber({errorHandler: function (error) {
    console.log(error)
    notifier.notify({
      title: 'Html error',
      message: error.message,
      icon: path.join(__dirname, 'other/html.png'),
      sound: true,
      // wait:true
    });
  }}))
  .pipe(debug({title:'html'}))
  .pipe(fileinclude({
      basepath: 'src/components/'
    }))
  .pipe(gulp.dest(paths.html.dest))
  .on("end", browserSync.reload)//we should reload only when all html files processed
})



gulp.task('css:vendor', function () {
  return gulp .src(paths.cssVendor.src)
              .pipe(gulpIf(!isDevelopment, postcss([cssNano({
                             safe:true,
                             autoprefixer:false//autoprefixer in cssNano works in delete mode, while in cssNext in add mode. Disable delete mode.
                            })])))
              .pipe(concat(paths.cssVendor.concat))
              .pipe(gulp.dest(paths.cssVendor.dest))
})
gulp.task('css:common', function () {
  return gulp.src(paths.css.src)
  .pipe(plumber({errorHandler: function (error) {
    console.log(error)
    notifier.notify({
      title: 'css error',
      message: error.message,
      icon: path.join(__dirname, 'other/styles.png'),
      sound: true,
      // wait:true
    });
    this.emit('end');
  }}))
  .pipe(debug({title:'css'}))

  .pipe(gulpIf(isDevelopment, sourcemaps.init()))
  .pipe(postcss([
                cssImport({
                  path:paths.css.resolve
                }),
                cssNext,
                inlineSvg,
                mqPacker({
                  sort: true
                })
                ]))
  .pipe(gulpIf(!isDevelopment, postcss([cssNano({
                 safe:true,
                 autoprefixer:false//autoprefixer in cssNano works in delete mode, while in cssNext in add mode. Disable delete mode.
                })])))
  .pipe(concat(paths.css.concat))
  .pipe(gulpIf(isDevelopment, sourcemaps.write()))
  .pipe(gulp.dest(paths.css.dest))
  .pipe(gulpIf(isDevelopment, browserSync.stream()))
})
gulp.task('css', gulp.parallel('css:common', 'css:vendor'))




gulp.task('images:copy', function () {
  return gulp .src(paths.images.src)
              .pipe(plumber({errorHandler: function (error) {
                console.log(error)
                notifier.notify({
                  title: 'Images copy error',
                  message: error.message,
                  sound: true,
                  // wait:true
                });
              }}))
              .pipe(newer(paths.images.dest))
              .pipe(imagemin())
              // .pipe(debug({title:'images'}))
              .pipe(gulp.dest(paths.images.dest))
})
gulp.task('images:svg', function () {
  let config = {    
                    mode : {    
                        symbol: {   
                          sprite: paths.imagesSpritesSvg.concat,
                          dest: paths.imagesSpritesSvg.dest
                        }   
                    }   
                  }

  return gulp .src(paths.imagesSpritesSvg.src)
              .pipe(plumber({errorHandler: function (error) {
                console.log(error)
                notifier.notify({
                  title: 'Images svg sprite error',
                  message: error.message,
                  sound: true,
                  // wait:true
                });
                this.emit('end');
              }}))
              .pipe(svgSprite(config))
              .pipe(gulp.dest(paths.images.dest))
})
gulp.task('images', gulp.parallel('images:copy', 'images:svg'))



gulp.task('js:jquery', function () {
  return gulp .src(paths.js.jquery.src)
              .pipe(gulp.dest(paths.js.jquery.dest))
})
gulp.task('js:vendor', function () {
  console.log('js:vendor')
  return gulp .src(paths.js.vendor.src)
              .pipe(concat(paths.js.vendor.concat))
              .pipe(gulp.dest(paths.js.vendor.dest))
})














gulp.task('js:common', function (callback) {
  let firstBuildReady = false;

  function done(err, stats) {//callback when js compiled
    firstBuildReady = true;

    if(err) {//hard error
      console.log('error789')
      return;//emit('error', err) in webpack-stream
    }

    gulplog[stats.hasErrors() ? 'error' : 'info'](stats.toString({
      colors:true
    }))


    browserSync.reload();
  }

  let options = {
    // entry: "./src/js/main.js",
    output: {
      // filename: 'main.js',
      publicPath: '/'//TODO, make right paths, needed for dynamic js loading (examples in Kantor's screencast)
    },
    watch: isDevelopment,
    cache: false,
    resolve: {
      modulesDirectories: paths.js.resolve
    },
    devtool: isDevelopment ? 'cheap-module-inline-source-map' : null,
    module: {
      loaders: [{
        test: /\.js$/,
        include: path.join(__dirname, 'src'),
        loader: 'babel?presets[]=es2015'
      }]
    },
    plugins: isDevelopment ? [//one set of plugins for development
      new webpack.NoErrorsPlugin(),
    ] : [//second set of plugins for production
      new webpack.NoErrorsPlugin(),
      new webpack.optimize.UglifyJsPlugin()
    ]
  }


  return gulp .src(paths.js.src)
  .pipe(plumber({errorHandler: function (error) {
    console.log(error.message)
    notifier.notify({
      title: 'JS error',
      message: error.message,
      icon: path.join(__dirname, 'other/js.png'),
      sound: true,
      // wait:true
    });
    this.emit('end');
  }}))
  .pipe(named())
  .pipe(webpackStream(options, null, done))
  .pipe(gulp.dest(paths.js.dest))
  .on('data', function () {
    if(firstBuildReady) {
      callback();
    }
  })
  // .on("end", browserSync.reload) //we do it in done callback
})


























gulp.task('js', gulp.parallel('js:common', 'js:vendor', 'js:jquery'))




gulp.task('misc', function () {
  return gulp.src(paths.misc.src, {since: gulp.lastRun('misc')})
  .pipe(plumber({errorHandler: function (error) {
    console.log(error)
    notifier.notify({
      title: 'Misc error',
      message: error.message,
      sound: true,
      // wait:true
    });
  }}))
  .pipe(newer(paths.misc.dest))
  // .pipe(debug({'title':'misc'}))
  .pipe(gulp.dest(paths.misc.dest))
})









gulp.task('build', gulp.parallel('html', 'css', 'js', 'images', 'misc'))

gulp.task('watch', function () {
  gulp.watch(paths.html.watch, gulp.series('html'));
  gulp.watch(paths.html.watch_partials, gulp.series('html_partials'));

  gulp.watch(paths.css.watch, gulp.series('css')); 
  // gulp.watch(paths.watch.js, gulp.series('js')); //js bundled by webpack and webpack has own watcher
  gulp.watch(paths.images.watch, gulp.series('images'));
})

gulp.task('serve', function () {
  browserSync.init({
  server: 'dist',
    // open: 'local'//will open browser tab automatically
    open: false,
    notify:false
  });

// browserSync.watch('dist/**/*.*').on('change', browserSync.reload)
})

gulp.task('prod', gulp.series(function (cb) {
  // set environment in production
  process.env.NODE_ENV = 'production';
  isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  setProduction();

  cb();
}, 'clean', 'build', function () {
  notifier.notify({
    message: 'Production build ready.',
    sound: true,
    // wait:true
  });
}))

gulp.task('default', gulp.series('build', gulp.parallel('serve','watch')))