module.exports = function (grunt) {
  grunt.registerTask('build', [
    'clean:dev',
    'sass:dev',
    'browserify:vendor',
    'browserify:dev',
    'sails-linker:devJs',
    'sails-linker:devCss',
    'copy:dev'
  ]);
};
