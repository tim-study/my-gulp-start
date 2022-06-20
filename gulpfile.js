const {src, dest, watch, parallel, series} = require('gulp');
const sass = require ('gulp-sass') (require ('sass')) ;
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const pug = require('gulp-pug');
const imagemin = require('gulp-imagemin');
const del = require('del')

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'src/'
        }
    });
}

function images() {
    return src('src/assets/img/**/*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {
                        name: 'removeViewBox',
                        active: true
                    },
                    {
                        name: 'cleanupIDs',
                        active: false
                    }
                ]
            })
        ]))
        .pipe(dest('dist/assets/img/'));
}

function html() {
    return src('src/index.pug')
        .pipe(
            pug({
                pretty: true
            })
        )
        .pipe(dest('src/'));
    }
function scripts() {
    return src(
            //'',
            'src/js/main.js'
        )
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('src/js'))
        .pipe(browserSync.stream());
}

function styles() {
    return src('src/scss/style.sass')
        // .pipe(sass({outputStyle: 'compressed'})) - минификация CSS
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
			overrideBrowserslist: ['last 3 version'],
            grid: true
		}))
        .pipe(dest('src/css'))
        .pipe(browserSync.stream());
}

function build() {
        return src([
            'src/css/style.min.css',
            'src/assets/fonts/*',
            'src/js/main.min.js',
            'src/*.html'
        ], {base: 'src'}) 
        .pipe(dest('dist'))
}

function cleanDist() {
    return del('dist')
}

function watching() {
    watch(['src/scss/**/*.scss'], styles)
    watch(['src/js/**/main.min.js'], scripts)
    watch(['src/*.html']).on('change', browserSync.reload)
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.html = html;
exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build);
exports.default = parallel(images, styles, html, scripts, browsersync, watching);