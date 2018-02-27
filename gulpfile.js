var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');
//icon-sprite
var spritesmith = require("gulp.spritesmith");  //sprite合并
var buffer = require('vinyl-buffer');  //stream转buffer
var csso = require('gulp-csso'); //css压缩
var imagemin = require('gulp-imagemin');  //图片压缩
var merge = require('merge-stream');  //工具插件,stream流合并
var webpack = require('webpack');
var autoprefixer = require('gulp-autoprefixer');
var skinPath = '/skin/frontend/PlumTree/ba_pc_v1';
//编译SCSS，用于开发环境
gulp.task('sass', function () {
    gulp.src('./scss/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            compress: true
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0','safari >=5','ie 8','ie 9','opera >=12.1','ios >=6',],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:false //是否去掉不必要的前缀 默认：true 
        }))
        .pipe(sourcemaps.write('../scss-maps'))
        .pipe(gulp.dest('./css'))
        .pipe(livereload());
});

//发布CSS，用于生成环境
gulp.task('publish', function () {
    gulp.src('./scss/*.scss')
        .pipe(sass({
            compress: true
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0','safari >=5','ie 8','ie 9','opera >=12.1','ios >=6',],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:false //是否去掉不必要的前缀 默认：true 
        }))
        .pipe(gulp.dest('./css'));
});

//自动监视LESS文件并LiveReload页面
gulp.task('scss-watch', function () {
    livereload.listen();
    gulp.watch('./scss/*.scss', ['sass']);
});
/* 图片处理 */

gulp.task('sprite', function () {
    var imgData = gulp.src("images/customer/icon/icon-*.png")
        .pipe(spritesmith({
            imgName:"sprite.png",
            cssName:"_sprite.scss",
            cssFormat:"scss",
            imgPath:skinPath+"/images/customer/sprite.png?t=" + Date.now() //添加时间戳防止缓存
        }));
    var imgStream = imgData.img
        .pipe(buffer())
        .pipe(imagemin())
        .pipe(gulp.dest('./images/customer'));
    var cssStream = imgData.css
        .pipe(gulp.dest('./scss/customer/'));
    return merge(imgStream, cssStream);
});
/* 图片处理 end */