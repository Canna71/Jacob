/**
 * Created by gcannata on 27/08/2014.
 */

//node ./cmd/cmd.js -t ./lib/parser/gramlex.jacoblex -g ./lib/parser/gramgram.js -l ./lib/parser/jacobgramlexer.js -p ./lib/parser/JacobGramInterpreter.js



function parseJacobGrammar(str){
    var Lexer = require('./JacobGramLexer');
    var Parser = require('./JacobGramInterpreter');
    var junq = require('junq');
    var _p = require('../parser');
    var l = new Lexer().setInput(str);
    var p = new Parser({junq: junq, parser:_p});
    var grammar = {};
    var ret = p.parse(l,grammar);
    return grammar;
}

module.exports = parseJacobGrammar;