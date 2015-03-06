/**
 * Created by gcannata on 30/08/2014.
 */
    //to build: jacob - t basictokens.jacoblex -l ./examples/mylexer.js -g expression.jacobgram -p ./examples/expint.js
var chai = chai || require('chai');
var expect = chai.expect;

describe("jacob examples",function() {
    it('Expression Interpreter with inline actions', function(){

        var jacob = require('../index');

        jacob.elaborateLexFile('./examples/basictokens.jacoblex','./examples/basiclexer.js');
        jacob.elaborateGramFile('./examples/Expression/expression.jacobgram','./examples/Expression/expint.js');

        var Lexer = require('../examples/basiclexer');
        var Parser = require('../examples/Expression/expint');
        var l = new Lexer().setInput('a = 2+3*4\r\na = a / 2\r\nprint a');
        var p = new Parser();
        var cxt = {};
        var ret = p.parse(l,cxt);

        expect(cxt).to.have.property('a',7);
    });

    it('Expression Interpreter with Abstract Syntax Tree', function(){

        var jacob = require('../index');

        jacob.elaborateLexFile('./examples/basictokens.jacoblex','./examples/basiclexer.js');
        jacob.elaborateGramFile('./examples/Expression/expressionast.jacobgram','./examples/Expression/expast.js');

        var Lexer = require('../examples/basiclexer');
        var Parser = require('../examples/Expression/expast');
        var astclasses = require('../examples/Expression/ExpAstClasses');
        //we augment the ast with custom behaviour (who needs visitor pattern in javascript?)
        astclasses = require('../examples/Expression/expeval');
        var l = new Lexer().setInput('a = 2+3*4\r\na = a / 2\r\nprint a');
        var p = new Parser(astclasses);

        var program = p.parse(l,{});


        var cxt = {};
        program.eval(cxt);
        expect(cxt).to.have.property('a',7);
    });

});

