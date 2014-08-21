/**
 * Created by gcannata on 17/08/2014.
 */
var chai = chai || require('chai');
var lexer = lexer || require('../lib/lexer');
var parser = parser || require('../lib/parser');
var StringReader = StringReader || require('../lib/stringreader');
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
    ],
    moduleName: 'MyLexer'
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

    ],
    moduleName: 'MyParser'

};

/*
 NON SLR1
 S -> L=R | R
 L -> *R | id
 R -> L

 es: *id=**id
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
            return '('+'*'+r+')';
        }],
        ['L',['integer'],function(i){
            return i.toString();
        }],
        ['R',['L'],function(l){
            return l;
        }]

    ],
    moduleName: 'MyParser'

};

/* NON LALR1
 S -> aEa | bEb | aFb | bFa
 E -> e
 F -> e
 */
var NonLALR1Grammar = {
    tokens: ['!','?','*'],

    productions:[
        ['S',['!','E','!'],function(_,E){
            return '(!'+E+'!)';
        }],
        ['S',['?','E','?'],function(_,E){
            return '(?'+E+'?)';
        }],
        ['S',['!','F','?'],function(_,F){
            return '(!'+F+'?)';
        }],
        ['S',['?','F','!'],function(_,F){
            return '(?'+F+'!)';
        }],
        ['E',['*'],function(_,F){
            return 'e*';
        }],
        ['F',['*'],function(_,F){
            return 'f*';
        }]
    ],
    moduleName: 'MyParser'

};

var AmbiguousGrammar = {
    tokens: ['integer','+','*','(',')'],
    operators:[
        ['+','left',100],
        ['*','left',200]
    ],
    productions:[
        ['E',['E','+','E'],function(e,_,t){
            return '('+e+'+'+t+')';
        }],
        ['E',['E','*','E'],function(e,_,t){
            return '('+e+'*'+t+')';
        }],
        ['E',['(','E',')'],function(_,e){
            return '{'+e+'}';
        }],
        ['E',['integer'],function(i){
            return i.toString();
        }]

    ],
    moduleName: 'MyParser'

};

function compileLexer(str){
    var lexersrc = lexer.generateLexer(tokenspecs);
    eval(lexersrc);
    var lexer1 = new MyLexer().setInput(str);
    return lexer1;
}

function compileParser(grammar, mode){
    grammar.mode = mode;
    var parsersrc = parser.generateParser(grammar);
    eval(parsersrc);
    return new MyParser();
}

describe("parser.Parser",function() {

    describe("SLR mode", function() {
        it('parses SLR grammar', function () {
            var lexer1 = compileLexer('2+3*4+5');
            var p = compileParser(ExpGrammar, 'SLR');
            var ret = p.parse(lexer1);
            expect(ret).to.be.equal('((2+(3*4))+5)');
        });

        it('fails on Non-SLR(1) grammar', function () {
            var lexer1 = compileLexer('*23=18');
            var p;
            expect(function() {
                    p = compileParser(NonSLR1Grammar, 'SLR')
                }
            ).to.throw(/Shift \/ Reduce conflict/);

        });

        it('fails on Non-LALR(1) grammar', function () {
            var p;
            expect(function() {
                    p = compileParser(NonLALR1Grammar, 'SLR');
                }
            ).to.throw(/Reduce\/Reduce conflict/);

        });

        it('parses Ambiguous grammar', function () {
            var lexer1 = compileLexer('2+3*4+5');
            var p = compileParser(AmbiguousGrammar, 'SLR');
            var ret = p.parse(lexer1);
            expect(ret).to.be.equal('((2+(3*4))+5)');
        });
    });

    describe("LALR1 mode", function() {
        it('parses SLR grammar', function () {
            var lexer1 = compileLexer('2+3*4+5');
            var p =compileParser(ExpGrammar, 'LALR1');
            var ret = p.parse(lexer1);
            expect(ret).to.be.equal('((2+(3*4))+5)');
        });

        it('parses Non-SLR(1) grammar', function () {
            var lexer1 = compileLexer('*23=18');
            var p = compileParser(NonSLR1Grammar, 'LALR1');
            var ret = p.parse(lexer1);
            expect(ret).to.be.equal('((*23)=18)');

        });

        it('fails on Non-LALR(1) grammar', function () {
            var p;
            expect(function() {
                    p = compileParser(NonLALR1Grammar, 'LALR1');
                }
            ).to.throw(/Reduce\/Reduce conflict/);

        });

        it('parses Ambiguous grammar', function () {
            var lexer1 = compileLexer('2+3*4+5');
            var p = compileParser(AmbiguousGrammar, 'LALR1');
            var ret = p.parse(lexer1);
            expect(ret).to.be.equal('((2+(3*4))+5)');
        });
    });

    describe("LR1 mode", function() {
        it('parses SLR grammar', function () {
            var lexer1 = new lexer.Lexer(tokenspecs).setInput(new StringReader('2+3*4+5'));
            var p = compileParser(ExpGrammar,  'LR1');
            var ret = p.parse(lexer1);
            expect(ret).to.be.equal('((2+(3*4))+5)');
        });

        it('parses Non-SLR(1) grammar', function () {
            var lexer1 = new lexer.Lexer(tokenspecs).setInput(new StringReader('*23=18'));
            var p = compileParser(NonSLR1Grammar,  'LR1')
            var ret = p.parse(lexer1);
            expect(ret).to.be.equal('((*23)=18)');

        });

        it('parses Non-LALR(1) grammar', function () {
            var lexer1 = new lexer.Lexer(tokenspecs).setInput(new StringReader('!*?'));
            var p = compileParser(NonLALR1Grammar,  'LR1')
            var ret = p.parse(lexer1);
            expect(ret).to.be.equal('(!f*?)');

        });

        it('parses Ambiguous grammar', function () {
            var lexer1 = compileLexer('2+3*4+5');
            var p = compileParser(AmbiguousGrammar, 'LR1');
            var ret = p.parse(lexer1);
            expect(ret).to.be.equal('((2+(3*4))+5)');
        });
        
        it('select the correct mode for the grammar', function () {
            var lexer1 = compileLexer('!*?');
            var p = compileParser(NonLALR1Grammar,undefined);
            var ret = p.parse(lexer1);
            expect(ret).to.be.equal('(!f*?)');

        });
    });

});