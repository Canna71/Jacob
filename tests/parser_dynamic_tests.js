/**
 * Created by gcannata on 17/08/2014.
 */
var chai = chai || require('chai');
var lexer = lexer || require('../lexer');
var parser = parser || require('../parser');
var StringReader = StringReader || require('../stringreader');
var expect = chai.expect;

var tokenspecs = {
    definitions:  {
        "digits": "[0-9]"
    },
    tokens: [
        {'regexp': '{digits}*\\.{digits}+', action: function(){this.jjval=parseFloat(this.jjtext); return 'float';}},
        { "regexp": '{digits}+', action: function(){this.jjval=parseInt(this.jjtext); return 'integer';}},
        { 'regexp': 'if', action: function(){return 'IF';}},
        { 'regexp': '\\w+', action: function(){return this.jjtext;}}, //or return 'ident'
        { 'regexp': '\\s*', action: function(){console.log('ignore spaces');}},
        { 'regexp': '.', action: function(){return this.jjtext;}},
        { 'regexp': '<<EOF>>', action: function(){console.log('end of file');return 'EOF';}}
    ]
};

/*
 E->E+T | T
 T->T*F | F
 F->( E ) | id
 */
var ExpGrammar = {
    tokens: ['integer','+','*','(',')'],

    productions:[
        ['E',['E','+','T'],function(e,_,t){
            return '('+e+'+'+t+')';
        }],
        ['E',['T'],function(t){
            return t;
        }],
        ['T',['T','*','F'],function(t,_,f){
            return '('+t+'*'+f+')';
        }],
        ['T',['F'],function(f){
            return f;
        }],
        ['F',['(','E',')'],function(e){
            return '('+e+')';
        }],
        ['F',['integer'],function(i){
            return i.toString();
        }]

    ]

};

/*
 NON SLR1
 S -> L=R | R
 L -> *R | id
 R -> L
 */
var NonSLR1Grammar = {
    tokens: ['integer','=','*'],

    productions:[
        ['S',['L','=','R'],function(s,_,r){
            return '('+s+'='+r+')';
        }],
        ['S',['R'],function(r){
            return r;
        }],
        ['L',['*','R'],function(_,r){
            return '*'+r;
        }],
        ['L',['integer'],function(i){
            return i.toString();
        }],
        ['R',['L'],function(l){
            return l;
        }]

    ]

};

/* NON LALR1
 S -> aEa | bEb | aFb | bFa
 E -> e
 F -> e
 */

describe("parser.Parser",function() {

    describe("SLR mode", function() {
        it('parses SLR grammar', function () {
            var lexer1 = new lexer.Lexer(tokenspecs).setInput(new StringReader('2+3*4+5'));
            var pg = new parser.ParserGenerator(ExpGrammar, {mode: 'SLR'});
            var p = new parser.Parser(pg);
            var ret = p.parse(lexer1);
            expect(ret).to.be.equal('((2+(3*4))+5)');
        });

        it('fails on Non-SLR(1) grammar', function () {
            //var lexer1 = new lexer.Lexer(tokenspecs).setInput(new StringReader('2+3*4+5'));
            var pg;
            expect(function() {
                    pg = new parser.ParserGenerator(NonSLR1Grammar, {mode: 'SLR'})
                }
            ).to.throw(/Shift \/ Reduce conflict/);

        });
    });

});