/**
 * Created by gcannata on 30/08/2014.
 */
var Lexer = require('./MyLexer');
var Parser = require('./grammar1.jacobgram.out.js');

var l = new Lexer().setInput('a 4 +  d');
var p = new Parser();
var cxt = {};
var ret = p.parse(l,cxt);
return ret;