/**
 * Created by gcannata on 22/08/2014.
 */
var Lexer = require('./JacobLexerLexer');
var Parser = require('./JacobLexInterpreter');
var fs = require('fs');
var jaclexsrc = fs.readFileSync('./lib/parser/test.jacoblex').toString();

var l = new Lexer().setInput(jaclexsrc);
var lexerspec = {};
var ret = (new Parser()).parse(l,lexerspec);
console.dir(lexerspec);