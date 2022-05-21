import g from 'gulp';
import gConcat from 'gulp-concat';
import gPostcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

const postcssPlugins = [autoprefixer(), cssnano()];
g.task('css', () => g.src('./src/css/*.css').pipe(gConcat('styles-min.css')).pipe(gPostcss(postcssPlugins)).pipe(g.dest('./')));

g.task('default', () => g.watch('./src/css/styles.css', g.series('css')));
