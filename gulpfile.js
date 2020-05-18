var gulp = require('gulp'), // Подключаем Gulp
    sass = require('gulp-sass'),
    cssmin = require("gulp-cssmin"), // Минимизация CSS
    autoprefixer = require('gulp-autoprefixer'), // Проставлет вендорные префиксы в CSS для поддержки старых браузеров
    imagemin = require('gulp-imagemin'), // Сжатие изображений
    concat = require("gulp-concat"), // Объединение файлов - конкатенация
    uglify = require("gulp-uglify"), // Минимизация javascript
    rename = require("gulp-rename"), // Переименование файлов
    pug = require('gulp-pug'), // плагин Pug
    htmlbeautify = require('gulp-html-beautify'), // форматирование html кода после pug     
    browserSync = require('browser-sync');// Создаю сервер на браузере

gulp.task("html", function() {
    return gulp.src("src/*.html")
    .pipe(gulp.dest("dist"));
});

gulp.task('htmlbeautify', function() {
    var options = {
        indentSize: 4,
        unformatted: [
            // https://www.w3.org/TR/html5/dom.html#phrasing-content
             'abbr', 'area', 'b', 'bdi', 'bdo', 'br', 'cite',
            'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'ins', 'kbd', 'keygen', 'map', 'mark', 'math', 'meter', 'noscript',
            'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', 'small',
             'strong', 'sub', 'sup', 'template', 'time', 'u', 'var', 'wbr', 'text',
            'acronym', 'address', 'big', 'dt', 'ins', 'strike', 'tt'
        ]
    };
return gulp.src('src/pug/index.html')
    .pipe(htmlbeautify(options))
    .pipe(gulp.dest('src'))   
});

gulp.task('pug', function() {
  return gulp.src("src/pug/pages/*.pug")
      .pipe(pug())
      .pipe(gulp.dest("src/pug"))
      .pipe(browserSync.stream());
});

gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'dist'
    },
    port: 8080,
    open: true,
    notify: false
  });
  gulp.watch("dist/*.html").on('change', browserSync.reload);
  gulp.watch("dist/css/*.css").on('change', browserSync.reload);
  gulp.watch("dist/images/*.+(jpg|jpeg|png|gif|svg)").on('change', browserSync.reload);
  gulp.watch("dist/js/*.js").on('change', browserSync.reload);
});


gulp.task('sass', function() { // Создаем таск "sass"
  return gulp.src(['src/scss/**/*.scss']) // Берем источник
    .pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
    .pipe(autoprefixer({
       browsers: ['last 2 versions'],
       cascade: false
     }))
    .pipe(cssmin())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist/css')) // Выгружаем результата в папку css
    .pipe(browserSync.stream());
  });

gulp.task("scripts", function() {
    return gulp.src("src/js/*.js") // директория откуда брать исходники
        .pipe(concat('scripts.js')) // объеденим все js-файлы в один 
        .pipe(uglify()) // вызов плагина uglify - сжатие кода
        .pipe(rename({ suffix: '.min' })) // вызов плагина rename - переименование файла с приставкой .min
        .pipe(gulp.dest("dist/js")); // директория продакшена, т.е. куда сложить готовый файл
});

gulp.task('imgs', function() {
    return gulp.src("src/images/**/*.+(jpg|jpeg|png|gif|svg)")
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            interlaced: true
        }))
        .pipe(gulp.dest("dist/images"))
});

gulp.task('watch', function() {
    gulp.watch('src/scss/**/*.scss', gulp.parallel('sass'));
    gulp.watch("src/*.html", gulp.parallel('html'));
    gulp.watch("src/js/*.js", gulp.parallel('scripts'));
    gulp.watch("src/images/*.+(jpg|jpeg|png|gif|svg)", gulp.parallel('imgs'));
    gulp.watch("src/pug/pages/*.pug", gulp.parallel('pug'));
    gulp.watch("src/pug/*.html", gulp.parallel('htmlbeautify'));
});

gulp.task("default", gulp.parallel("pug", "htmlbeautify", "html", "sass", "scripts", "imgs","browserSync", "watch"));