/**
 * Created by gcannata on 30/08/2014.
 */
module.exports = function(grunt) {
    grunt.registerTask('default', ['jacoblex','jacobgram']);

    grunt.registerTask('jacoblex', 'Build JacobLex.js', function() {
           var jacob = require('./index');
        jacob.elaborateLexFile('./lib/parser/lexlex.js','./lib/parser/jacoblexerlexer.js');
        jacob.elaborateGramFile('./lib/parser/lexgram.js','./lib/parser/jacoblexinterpreter.js');
    });

    grunt.registerTask('jacobgram', 'Build JacobLex.js', function() {
        var jacob = require('./index');
        jacob.elaborateLexFile('./lib/parser/gramlex.jacoblex','./lib/parser/jacobgramlexer.js');
        jacob.elaborateGramFile('./lib/parser/gramgram.js','./lib/parser/jacobgraminterpreter.js');
    });

};