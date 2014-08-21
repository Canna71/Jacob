var chai = chai || require('chai');
var lexer = lexer || require('../lib/lexer');
var StringReader = StringReader || require('../lib/stringreader');
var expect = chai.expect;

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

describe("lex.Lexer",function() {
    describe('nextToken', function(){
        it('should resolve definitions', function(){
            var lexer1 = new lexer.Lexer(basicTokens).setInput(new StringReader('321.02'));
            var token = lexer1.nextToken();
            expect(token.name).to.equal('float');
            expect(token.value).to.equal(321.02);
        });
        it('should respect precedences', function(){
            var lexer1 = new lexer.Lexer(basicTokens).setInput(new StringReader('if iframe'));
            var token = lexer1.nextToken();
            expect(token.name).to.equal('IF');
            expect(token.value).to.equal('if');
            token = lexer1.nextToken();
            expect(token.name).to.equal('ident');
            expect(token.value).to.equal('iframe');
        });

        it('should rollback', function(){
            var lexer1 = new lexer.Lexer(basicTokens).setInput(new StringReader('(123456'));
            var token = lexer1.nextToken();
            expect(token.name).to.equal('LPAR');
            token = lexer1.nextToken();
            expect(token.name).to.equal('integer');
            expect(lexer1.jjval).to.equal(123456);
            lexer1.setInput(new StringReader('(23)'));
            token = lexer1.nextToken();
            expect(token.name).to.equal('EXPR');

        });

        it('should ignore tokens without returns', function(){
            var lexer1 = new lexer.Lexer(basicTokens).setInput(new StringReader('foo  \r\n  42'));
            var token = lexer1.nextToken();
            token = lexer1.nextToken();
            expect(token.name).to.equal('integer');
            expect(token.value).to.equal(42);
        });

        it('should return "EOF" at end of file', function(){
            var lexer1 = new lexer.Lexer(basicTokens).setInput(new StringReader('foo'));
            var token = lexer1.nextToken();
            token = lexer1.nextToken();
            expect(token).to.equal(lexer.EOF);
            //expect(lexer.jjtext).to.equal('42');
        });

        it('should implement negate ranges', function(){
            var lexer1 = new lexer.Lexer(basicTokens).setInput(new StringReader('<< 32'));
            var token = lexer1.nextToken();
            expect(token.name).to.equal('notword_or_space');
            expect(token.value).to.equal('<<');
        });

        it('should use states', function(){
            var lexer1 = new lexer.Lexer(basicTokens).setInput(new StringReader('foo  /* start comment *****\r\n** ecc ecc ***\r\n ecc ecc */  42'));
            var token = lexer1.nextToken();
            token = lexer1.nextToken();
            expect(token.name).to.equal('integer');
            expect(token.value).to.equal(42);
        });

        it('should use lookaheads', function(){
            var lexer1 = new lexer.Lexer(basicTokens).setInput(new StringReader('zxxxy aba ac'));
            var token = lexer1.nextToken();
            expect(token.name).to.equal('zx*=zxx');
            token = lexer1.nextToken();
            expect(token.name).to.equal('ident');
            token = lexer1.nextToken();
            expect(token.name).to.equal('(a|ab)=a');
            token = lexer1.nextToken();
            expect(token.name).to.equal('ident');
            token = lexer1.nextToken();
            expect(token.name).to.equal('ac=ac');
            token = lexer1.nextToken();
            expect(token).to.equal(lexer.EOF);
        });

         it('should suport EOL', function(){
            var lexer1 = new lexer.Lexer(basicTokens).setInput(new StringReader('  foo  \r\n foo\r\n'));
            var token = lexer1.nextToken();
            expect(token.name).to.equal('ident');
            token = lexer1.nextToken();
            expect(token.name).to.equal('at EOL foo');
            
        });

        it('should suport BOL', function(){
            var lexer1 = new lexer.Lexer(basicTokens).setInput('foo foo \r\nfoo foo\r\n');
            var token = lexer1.nextToken();
            expect(token.name).to.equal('at BOL foo');
            token = lexer1.nextToken();
            expect(token.name).to.equal('ident');
            token = lexer1.nextToken();
            expect(token.name).to.equal('at BOL foo');
            token = lexer1.nextToken();
            expect(token.name).to.equal('at EOL foo');

            
        });
    });


});