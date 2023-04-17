import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from "gulp-svgstore";
import {deleteAsync} from 'del';

// Styles

export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML

const html = () => {
  return gulp.src('source/*.html')
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest('build'));
}

//Scripts

const scripts = () => {
  return gulp.src('source/js/script.js')
  .pipe(terser())
  .pipe(gulp.dest('build/js'));
}

//Images

const optimizeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(squoosh())
  .pipe(gulp.dest('build/img'));
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(gulp.dest('build/img'));
}

//WebP

const createWebp = () => {
  return gulp.src(['source/img/**/*.{jpg,png}', '!source/img/favicons/*'])
  .pipe(squoosh({
    webp: {}
  }))
  .pipe(gulp.dest('build/img'));
}

//SVG

const svg = () => {
  return gulp.src(['source/img/**/*.svg', '!source/img/sprite-icons/*.svg', '!source/img/sprite.svg'])
  .pipe(svgo())
  .pipe(gulp.dest('build/img'));
}

const createSprite = () => {
  return gulp.src('source/img/sprite-icons/*.svg')
  .pipe(svgo())
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('build/img'));
}

//Copy

const copy = (done) => {
  return gulp.src([
    'source/fonts/*.{woff,woff2}',
    'source/*ico',
    'source/manifest.webmanifest'
  ], {
    base: 'source'
  })
  .pipe(gulp.dest('build'));
}

//Clean
const clean = () => {
  return deleteAsync('build')
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

//Reload

const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/js/*.js', gulp.series(scripts));
  gulp.watch('source/*.html').on('change', browser.reload);
}

//Build

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    html,
    styles,
    scripts,
    createWebp,
    svg,
    createSprite
  )
);

//Default

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    html,
    styles,
    scripts,
    createWebp,
    svg,
    createSprite
  ),
  gulp.series(
    server,
    watcher
  )
);
