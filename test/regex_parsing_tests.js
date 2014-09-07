var chai = chai || require('chai');
var regex = regex || require('../lib/regex');
var expect = chai.expect;


describe("regex.RegExParser",function() {

        it('parses single characters', function(){
            var res = regex.parseRegExp('ab3');
            expect(res).to.be.a('object');
            expect(res).to.be.instanceof(regex.Concat);
            var lengths = res.getMinMaxLength();
            expect(lengths).to.have.property('min',3);
            expect(lengths).to.have.property('max',3);
        });

    it('parses character escapes', function(){
        var res = regex.parseRegExp('\\/\\*');

        expect(res).to.be.a('object');
        expect(res.matches('/*')).to.be.true;

    });

        it('parses character class', function(){
            var res = regex.parseRegExp('\\w');
            var res2 = regex.parseRegExp('[a-zA-Z0-9_]');
            expect(res).to.be.a('object');
            expect(res.second).to.be.eql(res2);
            expect(res.matches('F')).to.be.true;
            expect(res.matches('%')).to.be.false;
            var lengths = res.getMinMaxLength();
            expect(lengths).to.have.property('min',1);
            expect(lengths).to.have.property('max',1);
        });

    it('parses negation', function(){
        var re = regex.parseRegExp('[^\\}]*');
        expect(re.matches('hello()')).to.be.true;
    });

        it('parses simple range', function(){
            var res = regex.parseRegExp('[a-z]');
            expect(res).to.be.a('object');
            expect(res).to.be.instanceof(regex.Concat);
            expect(res).to.have.deep.property('second.from','a');
            expect(res).to.have.deep.property('second.to','z');
            expect(res).to.have.deep.property('second.negate',false);
            expect(res).to.have.deep.property('second.character',res.second);
            var lengths = res.getMinMaxLength();
            expect(lengths).to.have.property('min',1);
            expect(lengths).to.have.property('max',1);
        });

        it('parses negated range', function(){
            var res = regex.parseRegExp('[^a-z]');
            expect(res).to.be.a('object');
            expect(res).to.be.instanceof(regex.Concat);
            expect(res).to.have.deep.property('second.from','a');
            expect(res).to.have.deep.property('second.to','z');
            expect(res).to.have.deep.property('second.negate',true);
            expect(res).to.have.deep.property('second.character',res.second);
            var lengths = res.getMinMaxLength();
            expect(lengths).to.have.property('min',1);
            expect(lengths).to.have.property('max',1);
        });

        it('parses range with astclasses', function(){
            var res = regex.parseRegExp('[\\w\\s]');
            expect(res).to.be.a('object');
            expect(res.second).to.be.instanceof(regex.CharactersRange);
            expect(res.second).to.have.deep.property('from','a');
            expect(res.second).to.have.deep.property('to','z');
            expect(res.second).to.have.deep.property('negate',false);
            expect(res.second).to.have.deep.property('character',res.second);

            expect(res.second.next).to.have.deep.property('from','A');
            expect(res.second.next).to.have.deep.property('to','Z');
            expect(res.second.next).to.have.deep.property('negate',false);
            expect(res.second.next).to.have.deep.property('character',res.second.next);
            expect(res.matches('$')).to.be.false;
            expect(res.matches('o')).to.be.true;
        });

        it('parses negated complex range', function(){
            var res = regex.parseRegExp('[^a-cf-hn-p]');
            expect(res).to.be.a('object');
            expect(res.second).to.be.instanceof(regex.CharactersRange);
            expect(res.second).to.have.deep.property('from','a');
            expect(res.second).to.have.deep.property('to','c');
            expect(res.second).to.have.deep.property('negate',true);
            expect(res.second).to.have.deep.property('character',res.second);

            expect(res.second.next).to.have.deep.property('from','f');
            expect(res.second.next).to.have.deep.property('to','h');
            expect(res.second.next).to.have.deep.property('negate',true);
            expect(res.second.next).to.have.deep.property('character',res.second.next);

            expect(res.second.next.next).to.have.deep.property('from','n');
            expect(res.second.next.next).to.have.deep.property('to','p');
            expect(res.second.next.next).to.have.deep.property('negate',true);
            expect(res.second.next.next).to.have.deep.property('character',res.second.next.next);

            expect(res.matches('l')).to.be.true;
            expect(res.matches('o')).to.be.false;
        });

        it('parses negated range with astclasses', function(){
            var res = regex.parseRegExp('[^\\w\\s]');
            res = regex.parseRegExp('[^\\w\\s]');
            expect(res).to.be.a('object');
            expect(res.second).to.be.instanceof(regex.CharactersRange);
            expect(res.second).to.have.deep.property('from','a');
            expect(res.second).to.have.deep.property('to','z');
            expect(res.second).to.have.deep.property('negate',true);
            expect(res.second).to.have.deep.property('character',res.second);

            expect(res.second.next).to.have.deep.property('from','A');
            expect(res.second.next).to.have.deep.property('to','Z');
            expect(res.second.next).to.have.deep.property('negate',true);
            expect(res.second.next).to.have.deep.property('character',res.second.next);

            expect(res.second.next.next).to.have.deep.property('from','0');
            expect(res.second.next.next).to.have.deep.property('to','9');
            expect(res.second.next.next).to.have.deep.property('negate',true);
            expect(res.second.next.next).to.have.deep.property('character',res.second.next.next);
            expect(res.matches('$')).to.be.true;
            expect(res.matches(' ')).to.be.false;
        });

    it('parses alternatives', function(){
        var res = regex.parseRegExp('a|b|c');

        expect(res).to.be.a('object');
       

        expect(res.matches('a')).to.be.true;
        expect(res.matches('b')).to.be.true;
        expect(res.matches('c')).to.be.true;
        expect(res.matches('d')).to.be.false;
        var lengths = res.getMinMaxLength();
        expect(lengths).to.have.property('min',1);
        expect(lengths).to.have.property('max',1);
    });

    it('parses alternatives - 2', function(){
        var res = regex.parseRegExp('a|bcd|ca');

        expect(res).to.be.a('object');


        expect(res.matches('a')).to.be.true;
        expect(res.matches('b')).to.be.false;
        expect(res.matches('c')).to.be.false;
        expect(res.matches('bcd')).to.be.true;
        var lengths = res.getMinMaxLength();
        expect(lengths).to.have.property('min',1);
        expect(lengths).to.have.property('max',3);
    });

    it('parses repetitions (*)', function(){
        var res = regex.parseRegExp('a*b');

        expect(res).to.be.a('object');


        expect(res.matches('a')).to.be.false;
        expect(res.matches('b')).to.be.true;
        expect(res.matches('ab')).to.be.true;
        expect(res.matches('aba')).to.be.false;
        var lengths = res.getMinMaxLength();
        expect(lengths).to.have.property('min',1);
        expect(lengths).to.have.property('max',Infinity);

        res = regex.parseRegExp('(ab)*cb*');
        expect(res.matches('abbbcbbb')).to.be.false;
        expect(res.matches('abababcbbb')).to.be.true;
    });

    it('parses repetitions - (+)', function(){
        var res = regex.parseRegExp('a+b');

        expect(res).to.be.a('object');


        expect(res.matches('a')).to.be.false;
        expect(res.matches('b')).to.be.false;
        expect(res.matches('ab')).to.be.true;
        expect(res.matches('aba')).to.be.false;
        var lengths = res.getMinMaxLength();
        expect(lengths).to.have.property('min',2);
        expect(lengths).to.have.property('max',Infinity);
    });

    it('parses repetitions - (?)', function(){
        var res = regex.parseRegExp('a?b');

        expect(res).to.be.a('object');


        expect(res.matches('a')).to.be.false;
        expect(res.matches('b')).to.be.true;
        expect(res.matches('ab')).to.be.true;
        expect(res.matches('aba')).to.be.false;
        var lengths = res.getMinMaxLength();
        expect(lengths).to.have.property('min',1);
        expect(lengths).to.have.property('max',2);
    });

    it('parses lookahead', function(){
        var res = regex.parseRegExp('a*/ba');
        expect(res.isLookAhead()).to.be.true;

    });

    it('parses BOL', function(){
        var res = regex.parseRegExp('^aa');
        expect(res.bol).to.be.true;
        expect(res.matches('aa')).to.be.true;
        res = regex.parseRegExp('aa');
        expect(res.bol).to.be.undefined;
        expect(res.matches('aa')).to.be.true;
    });

        it('parses EOL', function(){
        var res = regex.parseRegExp('aa$');

    });

    it('parses Intervals', function(){
        var res = regex.parseRegExp('(ab){2,3}');
        expect(res.matches('ab')).to.be.false;
        expect(res.matches('abab')).to.be.true;
        expect(res.matches('ababab')).to.be.true;
        expect(res.matches('abababab')).to.be.false;
        res = regex.parseRegExp('ac{,2}a');
        expect(res.matches('aa')).to.be.true;
        expect(res.matches('acca')).to.be.true;
        expect(res.matches('accca')).to.be.false;
        res = regex.parseRegExp('ac{2,}a');
        expect(res.matches('aa')).to.be.false;
        expect(res.matches('aca')).to.be.false;
        expect(res.matches('acca')).to.be.true;
        expect(res.matches('accca')).to.be.true;
        expect(res.matches('acccccccca')).to.be.true;
        res = regex.parseRegExp('ac{2}a');
        expect(res.matches('aca')).to.be.false;
        expect(res.matches('acca')).to.be.true;
        expect(res.matches('accca')).to.be.false;
    });

});