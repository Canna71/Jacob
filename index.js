/**
 * Created by gcannata on 18/08/2014.
 */

var lexer = require('./lib/lexer');
var parser = require('./lib/parser');

exports.lexer = lexer;
exports.parser = parser;
exports.StringReader =  require('./lib/stringreader');
console.log('JACOB 1.0.0');

function generateLexerSource(jacoblex){

    var tokenspecs;
    if(typeof jacoblex === 'string'){
        tokenspecs = require('./lib/parser/JacobLex')(jacoblex);
        console.log(tokenspecs.moduleName);
    } else {
        tokenspecs = jacoblex;
    }

    return lexer.generateLexer(tokenspecs);
}

exports.generateLexerSource = generateLexerSource;

function generateParserSource(jacobgram){
    var parserspecs;
    if(typeof  jacobgram === 'string'){
        parserspecs = require('./lib/parser/JacobGram')(jacobgram);
    } else {
        parserspecs = jacobgram;
    }

    return parser.generateParser(parserspecs);
}

exports.generateParserSource = generateParserSource;