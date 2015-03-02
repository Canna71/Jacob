var junq = junq || require('junq');
var sets = sets || require('junq/sets');
var StringReader = StringReader || require('./stringreader.js');
var automata = automata || require('./automata.js');
var regex = regex || require('./regex');

var lexer;
(function (lexer,dfa,regex, undefined) {
    "use strict";

    var EOF = {};

    var mergeNFAs = function (nfas) {
        var start = new dfa.State();
        var rules = junq(nfas)
            .flatmap(function (nfa) {
                return nfa.getRules();
            })

            .append(
                junq(nfas)
                    .map(function (nfa) {
                        return nfa.startstate;
                    })
                    .map(function (ss) {
                        return new dfa.Rule(start, dfa.eps, ss);
                    })
            ) //we append an empty move from the new start to each of the NFA start state

            .toArray();
        var acceptstates = junq(nfas)
            .flatmap(function (nfa) {
                return nfa.acceptstates;
            });

        var nrb = new dfa.NDRuleBook(rules);
        var specs = {rulebook:nrb, acceptstates:acceptstates, startstate:start,alphabet:nrb.getSymbols()};
        var compositeNFA = new dfa.NFA(specs);
        return compositeNFA;

    };

    function processRules(specs)
    {
        var res = {};
        res.rules=[];
        res.actions=[];
        res.states = {};
        //compile tokens
        var tokenid=0;
        junq(specs.tokens).map(function(tokenspec){
            var rule = {re: regex.parseRegExp(resolveDefinitions(specs, tokenspec.regexp)), state: tokenspec.state, action: tokenspec.action};
            return  rule;
        }) //here we have resolved definitions and parsed regexp
            .map(function(rule){
                return expandLookAheads(rule, tokenid++);
            })
            .flatmap(function(r){return r;})
            .forEach(function(tokenspec){
                res.rules.push(tokenspec);

                var actionid = res.actions.push(tokenspec.action)-1;
                var statesList = tokenspec.state ||['DEFAULT'];
                if(typeof statesList === 'string'){
                    if(statesList.length === 0){
                        statesList = 'DEFAULT';
                    }
                    statesList = [statesList];
                }
                junq(statesList).forEach(function(state){
                    res.states[state] = res.states[state] || {dfa:null};
                    if(tokenspec.re === dfa.EOF){
                        res.states[state].eofaction = actionid;
                    }
                });

            })
        ;
        return res;
    }

    function expandLookAheads(rule, tokenid){
        if(rule.re.isLookAhead()){
            
            var minmax=rule.re.second.getMinMaxLength();
            //nullable, we use just the head of the original RE
            if(minmax.min===0) {
                rule1 = {};
                rule1.re = rule.re.first;
                rule1.action = rule.action;
                rule1.state = rule.state;
                return rule1;
            }
            //non nullable and not fixed length, we have to find the shortest tail
            if(minmax.max===Infinity){
                var internalStateName = '_LA_'+tokenid;
                var rules = [];
                var rule1 = {};
                rule1.re = new regex.Concat(rule.re.first,rule.re.second);
                rule1.action = new Function("this.pushState('"+internalStateName+"');\nthis.lawhole=this.jjtext;");
                rule1.state = rule.state;
                rules.push(rule1);
                var rule2 = {state: internalStateName};
                rule2.re = rule.re.second;
                rule2.action = new Function("this.restoreLookAhead();\nreturn ("+rule.action.toString()+').apply(this);');
                rules.push(rule2);
                var rule3 = {state: internalStateName};
                rule3.re = regex.parseRegExp('\\n|\\r|.');
                rule3.action = new Function('this.less(2);\n');

                rules.push(rule3);
                return rules;
            }

            //fixed length, we use a simpler method
            if((minmax.min===minmax.max) && minmax.max<Infinity){
                rule1 = {};
                rule1.re = new regex.Concat(rule.re.first,rule.re.second);
                rule1.action = new Function("this.evictTail("+minmax.max+");\nreturn ("+rule.action.toString()+').apply(this);');
                rule1.state = rule.state;
                return rule1;
            }
        }else{
            return rule;
        }
    }


    function resolveDefinitions(specs, str) {
        for (var def in specs.definitions) {
            if(specs.definitions.hasOwnProperty(def)){
                var re = new RegExp('\\{' + def + '\\}', "g");
                str = str.replace(re, specs.definitions[def]);
            }
        }
        return str;
    }

    function buildAutomataInternal(rules, rulesforstate, nfas) {
        //resolveDefinitions(specs, tokenspecs);
        for (var i = 0; i < rulesforstate.length; i++) {
            var rule = rulesforstate[i];
            {
                if(rule.re != regex.EOF)
                {
                    //var tokenclass = tokenspec['class'];
                    var nfa = rule.re.toNFA();
                    junq(nfa.acceptstates).forEach(function (as) {
                        as.tokenid = rules.indexOf(rule);
                        if(rule.re.bol){
                            as.bol=true;
                        }
                    });
                    nfas.push(nfa);
                }
            }
        }
    }

    var buildAutomata = function (rules, state) {
        var nfas = [], rulesforstate = junq(rules).where(function(rule){
            if(typeof rule.state === 'undefined'){
                return state === 'DEFAULT';
            }
            return ( (rule.state === state) || (rule.state.indexOf(state)>=0));
        }).toArray();
        //var nfas = [], tokenspecs =specs.tokens;
        buildAutomataInternal(rules, rulesforstate, nfas);
        //TODO: check if nfas.length>1
        var composite = mergeNFAs(nfas);
        var dfaspecs = composite.toDFA();
        dfaspecs.alphabet = dfaspecs.rulebook.getSymbols();
        var compositeDFA = new dfa.DFA(dfaspecs);
        compositeDFA.minimize();
        return compositeDFA;
    };

    //lex.buildAutomata = buildAutomata;


    function generateLexer(specs){
        var lexerName ='Lexer';
        if(specs && specs.moduleName){
            lexerName = specs.moduleName;
        }

        var str = [];
        str.push('var '+lexerName+' = (function (undefined) {');

        var res = processRules(specs);


        str.push(new dfa.DFA().compileBase('CDFA_base'));

        for(var specialstate in res.states){
            if(res.states.hasOwnProperty(specialstate)){
                if(specialstate === 'undefined') specialstate='DEFAULT';

                str.push(buildAutomata(res.rules,specialstate).compile(
                    {   className:'CDFA_'+specialstate,
                        baseClass: 'CDFA_base'
                    }));
            }
        }
        str.push('var EOF={};');
        str.push('function Lexer(){\n');
        str.push('if(!(this instanceof Lexer)) return new Lexer();\n');
        str.push('this.pos={line:0,col:0};\n');
        str.push('this.states={};');
        str.push('this.state = [\'DEFAULT\'];');
        str.push('this.lastChar = \'\\n\';');

        str.push('this.actions = ['+res.actions+'];');


        for(specialstate in res.states){
            if(res.states.hasOwnProperty(specialstate)){
                //if(specialstate === 'undefined') specialstate=undefined;
                str.push('this.states["'+specialstate+'"] = {};');
                str.push('this.states["'+specialstate+'"].dfa = new '+ 'CDFA_'+specialstate+'();');
                if( res.states[specialstate].eofaction){
                    str.push('this.states["'+specialstate+'"].eofaction = '+res.states[specialstate].eofaction+';');
                }
            }

        }

        str.push('}');


        str.push(
            junq(['setInput','nextToken','resetToken','halt','more','less','getDFA','getAction',
                'pushState', 'popState','getState','restoreLookAhead','evictTail','isEOF']).map(function(mname){
                return 'Lexer.prototype.'+mname+'=' + Lexer.prototype[mname].toString();
            }).toArray().join(';\n')
        );
        str.push(';');

        str.push(StringReader.toString());
        for(var mname in StringReader.prototype){
            str.push('StringReader.prototype.'+mname+'=' + StringReader.prototype[mname].toString()+';' );
        }
        str.push('if (typeof(module) !== \'undefined\') { module.exports = Lexer; }');
        str.push('return Lexer;})();');

        return str.join('\r\n');
    }
    lexer.generateLexer = generateLexer;

/*********** LEXER *************/
    function Lexer(specs) {
        if(!(this instanceof Lexer)) return new Lexer(specs);
        this.input = undefined;
        this.actions = [];
        this.states = {};
        this.state = [undefined];
        this.lawhole=undefined;
        var res = processRules(specs);
        this.actions = res.actions;
        this.states = res.states;

        for(var specialstate in this.states){
            if(this.states.hasOwnProperty(specialstate)){
                if(specialstate === 'undefined') specialstate=undefined;
                this.states[specialstate].dfa = buildAutomata(res.rules,specialstate);
            }
        }

    }

    Lexer.prototype.setInput = function(input){
        this.pos={row:0, col:0};
        if(typeof input === 'string')
        {input = new StringReader(input);}
        this.input = input;
        this.state = ['DEFAULT'];
        this.lastChar='\n';
        this.getDFA().reset();
        return this;
    };

    Lexer.prototype.pushState = function(state){
        this.state.push(state);
        this.getDFA().reset();
    };

    Lexer.prototype.popState = function(){
        if(this.state.length>1) {
            this.state.pop();
            this.getDFA().reset();
        }
    };

    Lexer.prototype.restoreLookAhead = function(){
        this.tailLength = this.jjtext.length;
        this.popState();
        this.less(this.tailLength);
        this.jjtext = this.lawhole.substring(0,this.lawhole.length-this.tailLength);


    };

    Lexer.prototype.evictTail = function(length){
        this.less(length);
        this.jjtext = this.jjtext.substring(0,this.jjtext.length-length);
    };


    Lexer.prototype.getState = function(){
        return this.state[this.state.length-1];
    };

    Lexer.prototype.getDFA = function(){
        return this.states[this.getState()].dfa;
    };

    Lexer.prototype.getAction = function(i){
        return this.actions[i];
    };

    Lexer.prototype.nextToken = function () {


        var ret = undefined;
        while(ret === undefined){
            this.resetToken();
            ret = this.more();
        }


        if (ret === EOF) {
            this.current = EOF;
        } else {
            this.current = {};
            this.current.name = ret;
            this.current.value = this.jjval;
            this.current.lexeme = this.jjtext;
            this.current.position = this.jjpos;
            this.current.pos = {col: this.jjcol, line: this.jjline};
        }
        return this.current;
    };


    Lexer.prototype.more = function(){
        var ret;
        while (this.input.more()) {
            var c = this.input.peek();
            this.getDFA().readSymbol(c);
            if (this.getDFA().isInDeadState()) {

                ret = this.halt();
                return ret;

            } else {
                if (this.getDFA().isAccepting()) {
                    this.lastValid = this.getDFA().getCurrentToken();
                    this.lastValidPos = this.input.getPos();

                }
                this.buffer = this.buffer + c;
                this.lastChar = c;
                this.input.next();
            }

        }
        ret = this.halt();
        return ret;
    };

    Lexer.prototype.resetToken = function(){
        this.getDFA().reset();
        this.getDFA().bol = (this.lastChar === '\n');
        this.lastValid = undefined;
        this.lastValidPos = -1;
        this.jjtext = '';
        this.remains = '';
        this.buffer = '';
        this.startpos = this.input.getPos();
        this.jjline = this.input.line;
        this.jjcol = this.input.col;
    };

    Lexer.prototype.halt = function () {
        if (this.lastValidPos >= 0) {
            var lastValidLength = this.lastValidPos-this.startpos+1;
            this.jjtext = this.buffer.substring(0, lastValidLength);
            this.remains = this.buffer.substring(lastValidLength);
            this.jjval = this.jjtext;
            this.jjpos = this.lastValidPos + 1-this.jjtext.length;
            this.input.rollback(this.remains);
            var action = this.getAction(this.lastValid);
            if (typeof ( action) === 'function') {
                return action.call(this);
            }
            this.resetToken();
        }
        else if(!this.input.more()){//EOF
            var actionid = this.states[this.getState()].eofaction;
            if(actionid){
                action = this.getAction(actionid);
                if (typeof ( action) === 'function') {
                    //Note we don't care of returned token, must return 'EOF'
                    action.call(this);
                }
            }
            return EOF;
        } else {//Unexpected character
            throw new Error('Unexpected char \''+this.input.peek()+'\' at '+this.jjline +':'+this.jjcol);
        }
    };


    Lexer.prototype.less = function(length){
        this.input.rollback(length);
    };

    Lexer.prototype.isEOF = function(o){
        return o===EOF;
    };

    lexer.EOF = EOF;
    lexer.Lexer = Lexer;

})( lexer || (lexer={}),automata,regex);

if (typeof(module) !== 'undefined') { module.exports = lexer; }