/**
 * Created by gcannata on 30/08/2014.
 */
module.exports = function(grunt) {
    grunt.registerTask('default', 'Log some stuff.', function() {
        grunt.log.write('Logging some stuff...').ok();
    });

    grunt.registerTask('jacoblex', 'Build JacobLex.js', function() {

    });

};