'use strict';

var gulp = require('gulp'),
		watch = require('gulp-watch'),
		pug = require('gulp-pug'),
		plumber = require('gulp-plumber'),
		prefixer = require('gulp-autoprefixer'),
		uglify = require('gulp-uglify'),
		sass = require('gulp-sass'),
		sourcemaps = require('gulp-sourcemaps'),
		rigger = require('gulp-rigger'),
		cssmin = require('gulp-minify-css'),
		imagemin = require('gulp-imagemin'),
		pngquant = require('imagemin-pngquant'),
		spritesmith = require('gulp.spritesmith'),
		rimraf = require('rimraf'),
        fonts = require('gulp-font'),
		browserSync = require("browser-sync"),
		reload = browserSync.reload;


var path = {
    build: {
        html: 'build/',
        pug: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/css/fonts/',
        //fonts: 'build/fonts/',
        //sprite:'build/img/sprites'
    },
    src: {
        html: 'src/*.html',
        pug: 'src/pug/**/*.pug',
        js: 'src/js/main.js',
        style: 'src/style/style.scss',
        img: 'src/img/**/*.*',
        //sprite: 'src/img/icons/**/*.png',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        pug: 'src/pug/**/*.pug',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        //sprite: 'src/img/**/*.png'
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },

    tunnel: false,
    host: 'localhost',
    port: 8080,
    // logPrefix: "xoxo"
};

gulp.task('sprite', function () {
  var spriteData = gulp.src('src/img/icons/**/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.scss',
    padding: 40
  }));
    return spriteData.pipe(gulp.dest('src/img/sprites/'));
});

// gulp.task('sprite:build', function () {
//   gulp.src('src/img/icons/**/*.png').pipe(spritesmith({
//     imgName: 'sprite.png',
//     cssName: 'sprite.scss',
//     padding: 40
//   }))
//     .pipe(gulp.dest('build/img/sprites'));
// });

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('pug:build', function() {
  gulp.src(path.src.pug)
    .pipe(plumber())
    .pipe(pug({pretty:true}))
    .pipe(gulp.dest(path.build.html))
    .pipe(browserSync.stream());
});

gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['src/style/'],
            outputStyle: 'compressed',
            sourceMap: true,
            errLogToConsole: true
        }))
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});


gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});


// gulp.task('fonts:build', function() {
//     gulp.src(path.src.fonts)
//         .pipe(gulp.dest(path.build.fonts))
// });


gulp.task('build', [
    'html:build',
    'pug:build',
    'js:build',
    'style:build',
    //'fonts:build',
    'image:build',
    //'sprite:build',
]);


gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.pug], function(event, cb) {
        gulp.start('pug:build');
    });
    watch([path.watch.style], function(event, cb) {
        setTimeout(function(){
            gulp.start('style:build');
        }, 5000);
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    // watch([path.watch.sprite], function(event, cb) {
    //     gulp.start('sprite:build');
    // });
    // watch([path.watch.fonts], function(event, cb) {
    //     gulp.start('fonts:build');
    // });
});


gulp.task('default', ['build', 'webserver', 'watch']);
