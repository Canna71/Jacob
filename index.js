/**
 * Created by gcannata on 18/08/2014.
 */

var sr = require('./stringreader');
console.log('JACOB 1.0.0');
var regex = require('./regex');
var lexer = lexer || require('./lexer');
var parser = parser || require('./parser');
var StringReader = StringReader || require('./stringreader');

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
//        { "regexp": '\\(', action: function(){return 'LPAR';}},//12
//        { "regexp": '\\(\\d+\\)', action: function(){return 'EXPR';}},//13
        { 'regexp': '\\w+', action: function(){return 'ident';}},//14
        { 'regexp': '\\s*', action: function(){}},//15
//        { 'regexp': '[^\\w\\s/]+', action: function(){return 'notword_or_space';}},//16
        { 'regexp': '.', action: function(){return this.jjtext;}},//17
        {'regexp': '(\\n|\\r|.)', action: function(){}, state:'COMMENT'},//18
        { 'regexp': '$', action: function(){console.log('end of file');}}//19
    ]
};

/*
L := '(' IntList ')'

IntList := eps
IntList := IntList int

 */

var TestGrammar = {
    tokens: ['integer','+',',','(',')'],
    operators:[
        ['+','left',100],
        ['*','left',200]
    ],
    productions:[
        ['L',['(',parser.Optional('integer','integer'),')'],function(_,list){
            return list;
        }],
        ['Opt0',[],function(){
            return [];
        }],

        ['Opt0'     ,['Repeat0'],function(a0){
            return a0;
        }],
        ['Repeat0',['integer'],function(a0){
            return [a0];
        }],
        ['Repeat0'  ,['Repeat0','Group0','integer'],function(a0,a1,a2){
            a0=a0.concat(Array.prototype.slice.call(arguments,1));
            return a0;
        }],
        ['Group0'     ,[','],function(a0){
            return a0;
        }],
        ['Group0'     ,['+'],function(a0){
            return a0;
        }]

    ]

};
/*
var TestGrammar2 = {
    tokens: ['integer','+','*','(',')'],
    operators:[
        ['+','left',100],
        ['*','left',200]
    ],
    productions:[
        ['L',['(',lexer.Optional('integer', lexer.Repeat(',' ['integer']) ),')'],function(_,list){
            return list;
        }],
        ['IntList',[],function(){
            return [];
        }],
        [          ,['IntList','integer'],function(list,i){
            list.push(i);
            return list;
        }]

    ]

};
*/


var l = new lexer.Lexer(basicTokens).setInput(new StringReader('(1, 2 + 3, 4 + 5)'));
var p = new parser.Parser(TestGrammar,{mode: 'LALR'});
var ret = p.parse(l);
console.log(ret);

l.setInput(new StringReader('()'));
ret = p.parse(l);
console.log(ret);