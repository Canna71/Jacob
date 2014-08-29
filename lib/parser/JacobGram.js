/**
 * Created by gcannata on 27/08/2014.
 */

//node ./cmd/cmd.js -t ./lib/parser/gramlex.jacoblex -g ./lib/parser/gramgram.js -l ./lib/parser/jacobgramlexer.js -p ./lib/parser/jacobgraminterpreter.js

var junq = junq || require('junq');

function parseJacobGrammar(str){
    var Lexer = require('./JacobGramLexer');
    var Parser = require('./JacobGramInterpreter');
    var _p = require('../parser');
    var l = new Lexer().setInput(str);
    var p = new Parser();
    var grammar = {_p:_p};
    var ret = p.parse(l,grammar);
    return grammar;
}

module.exports = parseJacobGrammar;