/**
 * Created by gcannata on 22/08/2014.
 */

//node ./cmd/cmd.js -t ./lib/parser/lexlex.js -g ./lib/parser/lexgram.js -l ./lib/parser/jacoblexerlexer.js -p ./lib/parser/jacoblexinterpreter.js

function parseJacobLex(str){
    var Lexer = require('./JacobLexerLexer');
    var Parser = require('./JacobLexInterpreter');
    var junq = require('junq');
    var l = new Lexer().setInput(str);
    var lexerspec = {};
    var ret = (new Parser({junq: junq})).parse(l,lexerspec);
    return lexerspec;
}

module.exports = parseJacobLex;


