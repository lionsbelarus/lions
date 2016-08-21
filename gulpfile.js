'use strict';

//common
const del = require('del');
const path = require('path')
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const gulplog = require('gulplog');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
// const streamqueue = require('streamqueue');
// const merge = require('merge-stream'); return merge(copyImgs, makeSvgSprite)

//helpers
const newer = require('gulp-newer');
const debug = require('gulp-debug');
const plumber = require('gulp-plumber');
const notifier = require('node-notifier');


//html
const fileinclude = require('gulp-file-include');

const browserSync = require('browser-sync').create();

//styles
const postcss = require('gulp-postcss');
const cssImport= require('postcss-easy-import');
const cssNext  = require('postcss-cssnext');
const cssNano = require('cssnano');
const mqPacker = require('css-mqpacker');
const inlineSvg = require('postcss-inline-svg')({path:'./src/'});

//images
const imagemin = require('gulp-imagemin')
const svgSprite = require('gulp-svg-sprite');


//js
const webpackStream = require('webpack-stream')
const webpack = webpackStream.webpack;
const named = require('vinyl-named');



const paths = {
  html: {
    src: ['src/*.html'],
    dest: 'dist'
  },

  styles: {
    vendor: 'src/styles/vendor/**/*.css',
    vendorBase:'',

    src: [
          'src/styles/app.css'
          ],
    base:'',

    concat: 'all.css',
    dest: 'dist/css'
  },

  images: {
    src: 'src/img/**/*.{jpg,jpeg,png,svg,gif}',
    base:'',

    dest: 'dist/img',

    sprites: {
      img: '',
      svg: 'src/img/sprites/svg/**/*.svg',

      imgConcat: '',
      svgConcat: 'icons.svg',

      imgDest: '',//relative to dist
      svgDest: ''//relative to dist
    }
    
  },

  js: {
    src: [
          'src/js/*.*',
          ],
    concat: 'main.js',
    dest: 'dist/js',

    vendor: {
      src: 'src/js/vendor/**/*.*',
      concat: 'vendor.js',
      dest: 'dist/js'
    }
  },

  misc: {
    src: [
          'src/*.*',
         '!src/*.html'
         ],
    dest: 'dist'
  },


  watch: {
    html: ['src/**/*.html','!src/html_partials/**/*.html'],
    html_partials: 'src/html_partials/**/*.html',//^^^ you need to duplicate it in watch.html!!!! ^^^
    styles: 'src/styles/**/*.*',
    js: 'src/js/**/*.*',
    images: 'src/img/**/*.*'
  }
}
var isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
// для запуска сборки production, делаем  " NODE_ENV=production gulp " build OR " gulp prod "

function setProduction() {
  console.log(isDevelopment)
  if (!isDevelopment) {
    paths.html.dest   = 'prod';
    paths.styles.dest = 'prod/css';
    paths.images.dest = 'prod/img';
    paths.js.dest     = 'prod/js';
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
      prefix: '@@',
      basepath: '@file'
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
      prefix: '@@',
      basepath: '@file'
    }))
  .pipe(gulp.dest(paths.html.dest))
  .on("end", browserSync.reload)//we should reload only when all html files processed
})


gulp.task('styles', function () {
  return gulp.src(paths.styles.src)
  .pipe(plumber({errorHandler: function (error) {
    console.log(error)
    notifier.notify({
      title: 'Styles error',
      message: error.message,
      icon: path.join(__dirname, 'other/styles.png'),
      sound: true,
      // wait:true
    });
    this.emit('end');
  }}))
  .pipe(debug({title:'styles'}))

  .pipe(gulpIf(isDevelopment, sourcemaps.init()))
  .pipe(postcss([
                cssImport,
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
  .pipe(concat(paths.styles.concat))
  .pipe(gulpIf(isDevelopment, sourcemaps.write()))
  .pipe(gulp.dest(paths.styles.dest))
  .pipe(gulpIf(isDevelopment, browserSync.stream()))
})


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
                          dest: paths.images.sprites.svgDest,   
                          sprite: paths.images.sprites.svgConcat    
                        }   
                    }
                  }

  return gulp .src(paths.images.sprites.svg)
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




gulp.task('js:vendors', function (callback) {
  return gulp .src(paths.js.vendor.src)
              .pipe(concat(paths.js.vendor.concat))
              .pipe(gulp.dest(paths.js.vendor.dest))
})
gulp.task('js:common', function (callback) {
  let firstBuildReady = false;

  function done(err, stats) {//callback when js compiled
    firstBuildReady = true;

    if(err) {//hard error
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
  // .on("end", browserSync.reload) //do it in done callback
})
gulp.task('js', gulp.parallel('js:common', 'js:vendors'))




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









gulp.task('build', gulp.parallel('html', 'styles', 'js', 'images', 'misc'))

gulp.task('watch', function () {
  gulp.watch(paths.watch.html, gulp.series('html'));
  gulp.watch(paths.watch.html_partials, gulp.series('html_partials'));

  gulp.watch(paths.watch.styles, gulp.series('styles')); 
  // gulp.watch(paths.watch.js, gulp.series('js')); 
  gulp.watch(paths.watch.images, gulp.series('images'));
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
}, gulp.series('clean', gulp.series('build'))))

gulp.task('default', gulp.series('build', gulp.parallel('serve','watch')))