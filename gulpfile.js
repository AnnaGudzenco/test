let projectFolder = "dist";
let sourseFolder = "#src";

let path = {
  build: {
    html: projectFolder + "/",
    css: projectFolder + "/css/",
    js: projectFolder + "/js/",
    img: projectFolder + "/img/",
    fonts: projectFolder + "/fonts/",
  },
  src: {
    html: [sourseFolder + "/*.html", "!" + sourseFolder + "/_*.html"],
    css: sourseFolder + "/scss/style.scss",
    js: sourseFolder + "/js/script.js",
    img: sourseFolder + "/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}",
    fonts: sourseFolder + "/fonts/*.{ttf, woff,woff2}",
  },
  watch: {
    html: sourseFolder + "/**/*.html",
    css: sourseFolder + "/scss/**/*.scss",
    js: sourseFolder + "/js/**/*.js",
    img: sourseFolder + "/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}",
    fonts: sourseFolder + "/fonts/*.{ttf, woff,woff2}",
  },
  clean: "./" + projectFolder + "/",
};
let { src, dest, parallel, series } = require("gulp"),
  gulp = require("gulp"),
  browsersync = require("browser-sync").create(),
  fileinclude = require("gulp-file-include"),
  del = require("del"),
  scss = require("gulp-sass"),
  autoprefixer = require("gulp-autoprefixer"),
  groupMedia = require("gulp-group-css-media-queries"),
  cleanCss = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  uglify = require("gulp-uglify-es").default,
  imagemin = require("gulp-imagemin"),
  webp = require("gulp-webp");

function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: "./" + projectFolder + "/",
    },
    port: 3000,
    notify: false,
  });
}
function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}
function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: "expanded",
      })
    )
    .pipe(groupMedia())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true,
      })
    )
    .pipe(dest(path.build.css))
    .pipe(cleanCss())
    .pipe(rename({ extname: ".min.css" }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}
function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({ extname: ".min.js" }))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}
function images() {
  return src(path.src.img)
    .pipe(
      webp({
        quality: 70,
      })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        interlaced: true,
        progressive: true,
        optimizationLevel: 3,
        svgoPlugins: [{ removeViewBox: false }],
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
}
function fonts() {
  return src(path.src.fonts).pipe(dest(path.build.fonts));
}
function watchFiles(params) {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}
function clean(params) {
  return del(path.clean);
}

const build = series(clean, css, fonts, js, images);
const dev = parallel(
  browserSync,
  watchFiles,
  series(images, fonts, css, js, html)
);

exports.build = build;
exports.default = dev;
exports.dev = dev;
