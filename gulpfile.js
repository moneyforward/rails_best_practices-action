const del = require('del');
const gulp = require('gulp');
const Command = require('@moneyforward/command').default;

exports.postversion = async function postversion () {
  const revision = await Command.substitute('git', ['rev-list', '--tags', '--max-count=1']);
  const latest = await Command.substitute('git', ['describe', '--tags', revision]);
  if (!/^v\d+\.\d+\.\d+$/.test(latest)) return;
  await Command.execute('git', ['tag', '-f',latest.substring(0, 2), revision]);
  await Command.execute('git', ['tag', '-f', latest.substring(0, 4), revision]);
}

exports['transpile:tsc'] = function tsc() {
  return Command.execute('tsc');
}

exports['transpile:ncc'] = function ncc() {
  return Command.execute('ncc', ['build', './src/action.ts', '-o', 'dist/action', '-mt']);
}

exports['lint:eslint'] = function eslint() {
  return Command.execute('eslint', ['.', '--ext', '.js,.jsx,.ts,.tsx']);
}

exports['test:mocha'] = function mocha() {
  return Command.execute('mocha', ['-c']);
}

exports['watch:typescript'] = function watchTypeScript() {
  const task = gulp.parallel(exports['transpile:tsc'], exports['lint:eslint']);
  return gulp.watch('./src/**/*.ts{,x}', task);
}

exports.clean = function clean() {
  return del('dist');
};
exports.transpile = gulp.parallel(exports['transpile:tsc'], exports['transpile:ncc']);
exports.lint = gulp.parallel(exports['lint:eslint']);
exports.build = gulp.parallel(exports.lint, exports.transpile);
exports.test = gulp.series(exports['test:mocha']);
exports.watch = gulp.parallel(exports['watch:typescript']);
exports.default = exports.build;
