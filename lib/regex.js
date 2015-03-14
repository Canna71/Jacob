var junq = junq || require('junq');
var sets = sets || require('junq/sets');
var StringReader = StringReader || require('./stringreader');
var automata = automata || require('./automata');
//TODO: negation in ranges
//TODO: multiple ranges inside squares

var regex;
(function (regex,dfa, StringReader, undefined) {


    function RegPart() {

    }

    RegPart.prototype.getPrecedence = function () {
        throw new Error('Should not evaluate this!');
    };
    RegPart.prototype.toNFA = function () {
        throw new Error('Should not evaluate this!');
    };
    RegPart.prototype.matches = function (str) {
        return this.toNFA().matches(str);
    };
    RegPart.prototype.isEmpty = function () {
        return false;
    };
    RegPart.prototype.isLookAhead = function () {
        return false;
    };

    RegPart.prototype.getMinMaxLength = function () {
        return {min:0, max:Infinity};
    };



    function Empty() {

    }

    Empty.prototype = new RegPart();
    Empty.prototype.getPrecedence = function () {
        return 3;
    };
    Empty.prototype.isEmpty = function () {
        return true;
    };
    Empty.prototype.toNFA = function () {
        var start = new dfa.State(undefined, 'EmptyStart');
        var accept = new dfa.State(undefined, 'EmptyAceppt');

        var rb = new dfa.NDRuleBook([new dfa.Rule(start, dfa.eps, accept)]);
        
        var specs = {rulebook: rb, acceptstates: [accept], startstate: start};
        
        return new dfa.NFA(specs);
    };

    Empty.prototype.toString = function () {
        return '';
    };

    Empty.prototype.getMinMaxLength = function () {
        return {min:0, max:0};
    };

    regex.Empty = Empty;



    function Character(character) {
        this.character = character;
    }

    Character.prototype = new RegPart();
    Character.prototype.getPrecedence = function () {
        return 3;
    };

    Character.prototype.toString = function () {
        return this.character.toString();
    };
    Character.prototype.toNFA = function () {
        var newStart = new dfa.State(undefined, 'start  \'' + this.character + '\'');
        var newEnd = new dfa.State(undefined, 'stop \'' + this.character + '\'');
        var accepting = [newEnd];
        //var rb = new dfa.NDRuleBook([new dfa.Rule(newStart, new dfa.InputChar(this.character), newEnd)]);
        var rb = new dfa.NDRuleBook(
            [new dfa.Rule(newStart, new dfa.InputRange(this.character,this.character), newEnd)]
        );
        var specs = {rulebook:rb, acceptstates:accepting, startstate:newStart};
        return new dfa.NFA(specs);
    };

    Character.prototype.getMinMaxLength = function () {
        return {min:1, max:1};
    };

    regex.Character = Character;

    function CharactersRange(from,to) {
        this.from=from;
        this.to = to;
        //note: it will put itself as input!
        this.character = this;
    }



    CharactersRange.prototype = new Character();

    CharactersRange.prototype.setNegate = function(negate){
        this.negate = negate;
        if(this.next)
        {
            this.next.setNegate(negate);
        }
    };

    CharactersRange.prototype.getPrecedence = function () {
        return 3;
    };

    CharactersRange.prototype.append = function (range) {
        if(!this.next) this.next = range;
        else this.next.append(range);
    };


    CharactersRange.prototype.toString = function () {
        return '[' + this.toStringInternal()
            + ']';
    };
    CharactersRange.prototype.toStringInternal = function () {
        var str = this.negate ? '^' : '';
        str = str + ((this.from < this.to) ? this.from + '-' + this.to : this.from);
        if(this.next) return str+this.next.toStringInternal();
        return str;
    };

    CharactersRange.prototype.toNFA = function () {
        var newStart = new dfa.State(undefined, 'start reading\'' + this.character + '\'');
        var newEnd = new dfa.State(undefined, 'read\'' + this.character + '\'');
        var accepting = [newEnd];
        var base;
        var cr = this, ir = base = {}, negate = this.negate;
        while(cr){
            if(!negate){
                ir.next = new dfa.InputRange(cr.from,cr.to);
            } else {
                //it's a complement range, we split into its two positive ones
                //TODO: guard aginst going over range
                /*
                var lower = new dfa.InputRange(dfa.FIRSTCHAR,String.fromCharCode((cr.from.charCodeAt(0)-1)),negate);
                var upper = new dfa.InputRange(String.fromCharCode((cr.to.charCodeAt(0)+1)),dfa.LASTCHAR,negate);
                ir.next = lower;
                lower.next = upper;
                ir = lower;
                */
                ir.next = new dfa.InputRange(cr.from,cr.to,negate);
            }
            cr = cr.next;
            ir=ir.next
        }

        var rb = new dfa.NDRuleBook([new dfa.Rule(newStart, base.next, newEnd)]);
        var specs = {rulebook:rb, acceptstates:accepting, startstate:newStart};
        return new dfa.NFA(specs);
    };

    regex.CharactersRange = CharactersRange;

    function Composite() {

    }

    Composite.prototype = new RegPart();
    Composite.prototype.printSubExp = function (subexp) {
        if (this.getPrecedence() > subexp.getPrecedence()) {
            return '(' + subexp.toString() + ')';
        } else {
            return subexp.toString();
        }
    };

    function Concat(first, second) {
        this.first = first;
        this.second = second;
    }

    Concat.prototype = new Composite();


    Concat.prototype.getPrecedence = function () {
        return 1;
    };
    Concat.prototype.toString = function () {
        return this.printSubExp(this.first) + this.printSubExp(this.second);
    };


    Concat.prototype.toNFA = function () {

        var firstNFA = this.first.toNFA();
        if(this.second.toNFA == undefined){
            debugger;
        }

        var secondNFA = this.second.toNFA();

        if (this.first.isEmpty()) return secondNFA;
        if (this.second.isEmpty()) return firstNFA;
        var startstate = firstNFA.startstate;
        var acceptstates = secondNFA.acceptstates;
        var newRules = junq(firstNFA.acceptstates).map(function (state) {
            return new dfa.Rule(state, dfa.eps, secondNFA.startstate);
        }); //no need to have an array here


        var rules = junq(firstNFA.getRules()).append(newRules).append(secondNFA.getRules()).toArray();
        var rb = new dfa.NDRuleBook(rules);
        var specs = {rulebook:rb, acceptstates:acceptstates, startstate:startstate};
        var nfa = new dfa.NFA(specs);
        return nfa;
    };

    Concat.prototype.getMinMaxLength = function () {
        var firstMinMax = this.first.getMinMaxLength();
        var secondMinMax = this.second.getMinMaxLength();
        return {min:firstMinMax.min+secondMinMax.min, max:firstMinMax.max+secondMinMax.max};
    };

    regex.Concat = Concat;

    function Choice(either, or) {
        this.either = either;
        this.or = or;
    }

    Choice.prototype = new Composite();

    Choice.prototype.getPrecedence = function () {
        return 0;
    };
    Choice.prototype.toString = function () {
        return this.printSubExp(this.either) + '|' + this.printSubExp(this.or);
    };

    //TODO: check for empty to optimize
    Choice.prototype.toNFA = function () {
        var eitherNFA = this.either.toNFA();
        var orNFA = this.or.toNFA();
        var start = new dfa.State(undefined, 'Choice start');
        //var accept = new dfa.State(undefined, 'Choice accept');
        var newRules = junq([
            new dfa.Rule(start, dfa.eps, eitherNFA.startstate),
            new dfa.Rule(start, dfa.eps, orNFA.startstate)
        ])
            .append(eitherNFA.getRules())
            .append(orNFA.getRules())

            .toArray();
        var acceptstates = eitherNFA.acceptstates.union(orNFA.acceptstates);
        var specs = {rulebook:new dfa.NDRuleBook(newRules), acceptstates:acceptstates, startstate:start};
        var nfa = new dfa.NFA(specs);
        return nfa;
    };

    Choice.prototype.getMinMaxLength = function () {
        var eitherMinMax = this.either.getMinMaxLength();
        var orMinMax = this.or.getMinMaxLength();
        return {min:(eitherMinMax.min<orMinMax.min?eitherMinMax.min:orMinMax.min),
                max:(eitherMinMax.max>orMinMax.max?eitherMinMax.max:orMinMax.max)};
    };

    regex.Choice = Choice;

    function Repeat(exp, pattern) {
        this.exp = exp;
        this.pattern = pattern || '*';
    }

    Repeat.prototype = new Composite();
    Repeat.prototype.getPrecedence = function () {
        return 2;
    };

    Repeat.prototype.toString = function () {
        return this.printSubExp(this.exp) + this.pattern;
    };

    Repeat.prototype.toNFA = function () {
        var expNFA = this.exp.toNFA();


        var start = new dfa.State();
        var accept = expNFA.acceptstates;
        if(this.pattern==='*') accept=accept.union(start);
        var rules =
            junq(expNFA.getRules())
                .append(

                    new dfa.Rule(start, dfa.eps, expNFA.startstate)
                )
                .append(junq(expNFA.acceptstates).map(function(as){
                    return new dfa.Rule(as,dfa.eps,expNFA.startstate);
                }))
                .toArray();
        var rb = new dfa.NDRuleBook(rules);
        var specs = {rulebook:rb, acceptstates:accept, startstate:start};
        var nfa = new dfa.NFA(specs);
        return nfa;
    };

    Repeat.prototype.getMinMaxLength = function () {

        return {min:(this.pattern==='+'?this.exp.getMinMaxLength().min:0), max:Infinity};
    };

    regex.Repeat = Repeat;

    function ZeroOrOne(exp) {
        this.pattern = '?';
        this.exp = exp;


    }

    ZeroOrOne.prototype = new Repeat();

    ZeroOrOne.prototype.toNFA = function () {

        var expNFA = this.exp.toNFA();
        var start = expNFA.startstate;

        var accept = expNFA.acceptstates;

        var newRules = junq(expNFA.getRules())
            .append(junq(expNFA.acceptstates).map(function (state) {
                return new dfa.Rule(start, dfa.eps, state);
            })
            )
            .toArray();
        var specs = {rulebook:new dfa.NDRuleBook(newRules), acceptstates:accept, startstate:start};
        var nfa = new dfa.NFA(specs);
        return nfa;
    };

    ZeroOrOne.prototype.getMinMaxLength = function () {
        return {min:0, max:this.exp.getMinMaxLength().max};
    };

    function Interval(base, from, to) {
        this.exp = base;
        this.from = from<to?from:to;
        this.to = from<to?to:from;
    }

    Interval.prototype = new Repeat();
    Interval.prototype.toString = function () {
        return this.printSubExp(this.exp) + '{'+this.from+','+this.to+'}';
    };

    Interval.prototype.toNFA = function () {

        if(this.from===0 && this.to===0){
            return new Empty().toNFA();
        }
        if((this.from===0)&&(this.to===Infinity)){
            return new Repeat(this.exp,'*');
        }

        var n = this.from;
        if(this.to<Infinity){
            n = this.to;
        }

        var rules=[];

        var start ;
        var accept = new sets.Set();

        var previous = new sets.Set();
        for(var i=1;i<=n;i++){
            var expNFA = this.exp.toNFA();
            if(i===1){
                start = expNFA.startstate;
                if(this.from===0){
                    accept = accept.union(start);
                }
            }
            if(i>=this.from){
                accept = accept.union(expNFA.acceptstates);
            }

            rules = rules.concat(expNFA.getRules());
            rules = rules.concat(junq(previous).map(
                function(prevState){
                    return new dfa.Rule(prevState, dfa.eps, expNFA.startstate);
                }
            ).toArray());

            if(i===this.from && this.to===Infinity){
                rules = rules.concat(junq(expNFA.acceptstates).map(
                    function(as){
                        return new dfa.Rule(as, dfa.eps, expNFA.startstate);
                    }
                ).toArray());
            }

            previous = expNFA.acceptstates;

        }



        var rb = new dfa.NDRuleBook(rules);
        var specs = {rulebook:rb, acceptstates:accept, startstate:start};
        var nfa = new dfa.NFA(specs);
        return nfa;
    };

    Interval.prototype.getMinMaxLength = function () {
        var explength = this.exp.getMinMaxLength();
        return {min: this.from*explength.min, max:this.to*explength.max};
    };


    function LookAhead(head,tail){
        this.first = head;
        this.second = tail;
    }

    LookAhead.prototype = new Concat();
    LookAhead.prototype.toString = function () {
        return this.first.toString() + '/' + this.second.toString();
    };
    LookAhead.prototype.isLookAhead = function () {
        return true;
    };

    function parseRegExp(str) {
        if(str==='$') return regex.EOF;
        var sr = new StringReader(str);
        var bol = false;
        if(sr.peek()=='^'){
            sr.eat('^');
            bol=true;
        }
        var ret = parseLookAhead(sr);
        if(bol) ret.bol = bol;
        return ret;
    }

    function parseLookAhead(input){
        var head = parseRE(input);
        var c = input.peek();
        var tail;
        if (input.more() && c === '/' || c==='$') {
            switch(c){
                case '/':
                    input.eat('/');
                    tail = parseRE(input);
                break;
                case '$':
                    input.eat('$');
                    tail = parseRegExp('\r|\n');
                break;
                }
            return new LookAhead(head, tail);
        } else {
            return head;
        }

    }

    function parseRE(input) {

        var term = parseTerm(input);

        if (input.more() && input.peek() === '|') {
            input.eat('|');
            var term2 = parseRE(input);
            return new Choice(term, term2);
        } else {
            return term;
        }
    }

    function parseTerm(input) {
        var factor = new Empty();

        while (input.more() && input.peek() !== ')' && input.peek() !== '|' && input.peek() !== '/'  && input.peek() !== '$') {
            var nextFactor = parseFactor(input);
            factor = new Concat(factor, nextFactor);
        }

        return factor;
    }

    function parseFactor(input) {
        var base = parseAtom(input);

        while (input.more() &&
            (input.peek() === '*' || input.peek() == '+' || input.peek() == '?' || input.peek()=='{')) {
            var pattern = input.next();
            if (pattern === '?') {
                base = new ZeroOrOne(base);
            } else if (pattern === '{'){
                base = parseInterval(base,input);
            } else {
                base = new Repeat(base, pattern);
            }

        }

        return base;
    }

    function parseAtom(input) {
        var range;
        switch (input.peek()) {
            case '(':
                input.eat('(');
                var r = parseRE(input);
                input.eat(')');
                return r;
            case '[':
               return parseCharacterClass(input);
            case '.':
                input.eat('.');
                return DOT();
            case '\\':
                return parseAtomEscape(input);

            default:
                return parseCharacter(input);
        }
    }

    function parseCharacterClass(input){
        "use strict";
        input.eat('[');
        var negate = false;
        var range;
        if(input.peek() === '^') {
            input.eat('^');
            negate = true;
        }

        do{
            var r = parseRange(input);
            if(!(r instanceof(CharactersRange))){
                r = r.second;    
            }
            r.setNegate(negate);
            if(!range){
                range = r;
            }
            else {
                range.append(r);
            }
        }
        while(input.peek()!=']');
        input.eat(']');
        return range;
    }

    function parseAtomEscape(input){
        input.eat('\\');
        var c = input.next();
        "use strict";
        switch(c){
            case 'd':
                return  DIGIT();
                break;
            case 'D':
                return  NOTDIGIT();
                break;
            case 's':
                return  SPACE();
                break;
            case 'S':
                return  NOTSPACE();
                break;
            case 'w':
                return  WORD();
                break;
            case 'W':
                return  NOTWORD();
                break;
            default:
                return new Character(parseCharacterEscape(c, input));
        }
        return new Character(c);
    }

    function parseCharacterEscape(i,input){
        "use strict";
        var c;
        switch(i){
            case 'r':
                c = '\r';
                break;
            case 'n':
                c = '\n';
                break;
            case 'f':
                c = '\f';
                break;
            case 't':
                c = '\t';
                break;
            case 'x':
                var hex = input.next()+input.next();
                c = String.fromCharCode(parseInt(hex,16));
                break;
            case 'u':
                hex = input.next()+input.next()+input.next()+input.next();
                c = String.fromCharCode(parseInt(hex,16));
                break;
            default:
                c = i;
                break;
        }
        return c;
    }

    function parseInterval(base, input){
        var nstr = '';

        while(input.peek()!==','&&input.peek()!=='}'){
            nstr+=input.peek();
            input.next();
        }
        var n1 = parseInt(nstr) || 0;
        nstr='';
        if(input.peek() === ','){
            input.next();

            while(input.peek()!=='}'){
                nstr+=input.peek();
                input.next();
            }

            var n2 = parseInt(nstr) || Infinity;
            input.next();
            return new Interval(base, n1, n2);
        }
        else {
            input.next();
            return new Interval(base,n1,n1);
        }
    }

    var DIGIT = function(){return new CharactersRange('0', '9')};
    var NOTDIGIT = function(){return parseRegExp("[^0-9]")};
    var SPACE = function(){return parseRegExp("[ \\t\\r\\n\xA0]")};
    var NOTSPACE = function(){return parseRegExp("[^ \\t\\r\\n\xA0]")};
    var WORD = function(){return parseRegExp('[a-zA-Z0-9_]')};
    var NOTWORD = function(){return parseRegExp('[^a-zA-Z0-9_]')};
    //TODO: dot is not working right
    var DOT = function(){return parseRegExp('[^\\r\\n]')};

    function parseCharacter(input){
        var c = input.next();
        return new Character(c);
    }

    function parseClassCharacter(input){
        var c = input.peek();
        if(c!='\\'){
            input.eat(c);
            return c;
        }
        input.eat('\\');
        //c = input.next();
        return parseAtomEscape(input);
    }

    function parseClassAtom(input){
        switch (input.peek()) {
                case '\\':
                return parseAtomEscape(input);
            default:
                return parseCharacter(input);
        }
    }

    function parseRange(input){

        var range;

        var from = parseClassAtom(input);
        if(!from.character)//is this a range?
            return from;
        from = from.character;
        if(input.peek()==='-')
        {
            input.eat('-');
            var to = parseClassCharacter(input);
            range = new CharactersRange(from,to);
        }

        else{
            range = new CharactersRange(from,from)
        }
        //range.negate = negate;
        return range;
    }



    regex.parseRegExp = parseRegExp;
    regex.EOF = new RegPart();

})(regex || (regex = {}), automata,StringReader);

if (typeof(module) !== 'undefined') { module.exports = regex; }
