/**
 * Created by gcannata on 18/08/2014.
 */

var sr = require('./stringreader');
console.log('JACOB 1.0.0');
var regex = require('./regex');

var basicTokens = {
    definitions:  {
        "digits": "[0-9]"
    },
    tokens: [
        {'regexp': '\\/\\*', action: function(){this.pushState('COMMENT');}},//0
        {'regexp': '\\*\\/', action: function(){this.popState();}, state:'COMMENT'},//1

        {'regexp': '{digits}*\\.{digits}+', action: function(){this.jjval=parseFloat(this.jjtext); return 'float';}},//2
        { "regexp": '{digits}+', action: function(){this.jjval=parseInt(this.jjtext); return 'integer';}},//3
        { 'regexp': 'if', action: function(){return 'IF';}},//4
        { "regexp": 'zx*/xy*', action: function(){return 'zx*='+this.jjtext;}},//5,6,7
        { 'regexp': '(a|ab)/ba', action: function(){return '(a|ab)='+this.jjtext;}},//8
        { "regexp": 'ac/b*', action: function(){return 'ac='+this.jjtext;}},//9
        { "regexp": '^foo', action: function(){return 'at BOL '+this.jjtext;}},//10
        { "regexp": 'foo$', action: function(){return 'at EOL '+this.jjtext;}},//11
        { "regexp": '\\(', action: function(){return 'LPAR';}},//12
        { "regexp": '\\(\\d+\\)', action: function(){return 'EXPR';}},//13
        { 'regexp': '\\w+', action: function(){return 'ident';}},//14
        { 'regexp': '\\s*', action: function(){}},//15
        { 'regexp': '[^\\w\\s/]+', action: function(){return 'notword_or_space';}},//16
        { 'regexp': '.', action: function(){return this.jjtext;}},//17
        {'regexp': '(\\n|\\r|.)', action: function(){}, state:'COMMENT'},//18
        { 'regexp': '$', action: function(){console.log('end of file');}}//19
    ]
};

var lexer = lexer || require('./lexer');
var StringReader = StringReader || require('./stringreader');
var lexer1 = new lexer.Lexer(basicTokens).setInput(new StringReader('  foo  \r\n foo\r\n'));
