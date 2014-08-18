/**
 * Copyright by Gabriele Cannata
 * Date: 31/08/13
 * Time: 17.37
 */

var junq = junq || require('junq');
var sets = sets || require('junq/sets');
var automata = automata || require('./automata');

var parser;
(function (parser, dfa,  undefined) {


    /* Production */
    function Production(head, body) {
        "use strict";

        this.head = head;
        this.body = body;
    }

    Production.prototype.toString = function () {
        var str = [];

        str.push(this.head.toString());
        str.push(' ::= ');
        for (var i = 0; i < this.body.length; i++) {
            if (i === this.dot) str.push('.');
            str.push(this.body[i].toString());
            str.push(' ');
        }
        return str.join('');
    };

    Production.prototype.getItems = function () {
        "use strict";
        if (this.items === undefined) {
            var self = this;
            self.items = junq.range(self.body.length + 1, 0).map(function (i) {
                return new GItem(self, i);
            }).toArray();
        }
        return this.items;

    };

    parser.Production = Production;


    function Grammar(prod) {
        "use strict";

    }

    /* Non Terminals */


    var eps = parser.eps = dfa.eps;

    function NT(name) {
        "use strict";
        this.name = name;

    }


    NT.prototype.toString = function () {
        "use strict";
        return '<<' + this.name + '>>';
    };

    NT.prototype.match = function (other) {
        "use strict";
        return other.matchNonTerminal(this);
    };

    NT.prototype.matchTerminal = function (terminal) {
        "use strict";
        return false;
    };

    NT.prototype.matchNonTerminal = function (other) {
        "use strict";
        return other.name === this.name;
    };

    NT.prototype.clone = function () {
        "use strict";
        return new NT(this.name);
    };

    parser.NT = NT;

    function T(ob) {
        "use strict";
        this.name = ob;
    }

    T.prototype.match = function (other) {
        "use strict";
        return other.matchTerminal(this);
    };

    T.prototype.matchTerminal = function (terminal) {
        "use strict";
        return terminal.name === (this.name);
    };

    T.prototype.matchNonTerminal = function (nonterm) {
        "use strict";
        return false;
    };

    T.prototype.toString = function () {
        "use strict";
        return this.name.toString();
    };

    parser.T = T;

    var eof = new T('<<EOF>>');
    var EOFNUM = 0;
    //parser.eof = eof;

    function GItem(production, num) {
        "use strict";
        this.production = production;
        this.dot = num || 0;
    }


    GItem.prototype.toString = function () {
        "use strict";
        var str = [];
        var head = this.production.head;
        var body = this.production.body;
        str.push(head.toString());
        str.push(' ::= ');
        for (var i = 0; i < body.length; i++) {
            if (i === this.dot) str.push('.');
            str.push(body[i].toString());
            str.push(' ');
        }
        if (i === this.dot) str.push('.');
        return str.join('');
    };

    GItem.prototype.isAtStart = function () {
        "use strict";
        return this.dot === 0;
    };

    GItem.prototype.isAtEnd = function () {
        "use strict";
        return this.dot >= this.production.body.length;
    };

    GItem.prototype.symbolAhead = function () {
        "use strict";
        return this.production.body[this.dot];
    };

    GItem.prototype.tail = function () {
        "use strict";
        return this.production.body.slice(this.dot + 1, this.production.body.length);
    };

    GItem.prototype.nextItem = function () {
        "use strict";
        return this.production.getItems()[this.dot + 1];
    };
/*
    GItem.prototype.getNextTransition = function () {
        "use strict";
        //returns a transition from this item to the next on the next Symbol
        var rule = new dfa.Rule(this, this.nextItem(), this.production.getItems()[this.dot + 1]);
        return rule;
    };
*/
    GItem.prototype.equals = function (other) {
        "use strict";
        return other.production === this.production && other.dot === this.dot;
    };

    function LR1Item(item, lookahead) {
        "use strict";
        this.item = item;
        this.lookahead = lookahead;
    }

    LR1Item.prototype.toString = function () {
        "use strict";
        return '[' + this.item.toString() + ', ' + this.lookahead.toString() + ']';
    };

    LR1Item.prototype.equals = function (other) {
        "use strict";
        return this.item.equals(other.item) && this.lookahead === other.lookahead;
    };

    //TODO: find safest way to distinguish
    function isTerminal(e) {
        "use strict";
        return e instanceof T;
    }

    function isNonTerminal(e) {
        "use strict";
        return e instanceof NT;
    }

    function PG(grammar, options) {
        "use strict";
        var self = this;
        //this.grammar = grammar;
        this.tokens = grammar.tokens;
        this.nonTerminals = [];
        this.terminals = [];


        this.symbols = [eof];
        this.symbolsTable = {};
        this.symbolsTable[eof.name]=0;
        //eof will have index 0
        this.terminals.push(eof);
        this.processProductions(grammar.productions);

        self.operators={};
        if(grammar.operators !== undefined){
            junq(grammar.operators).forEach(function(oplist){
               self.operators[oplist[0].toString()] = oplist.slice(1,3);
            });
        }
//        this.actions = grammar.actions;

/*        this.symbols = *//*junq(eof).*//*junq(this.terminals).append(this.nonTerminals).toArray();
        this.symbolsTable = {};

        var i = 0;
        junq(this.symbols).forEach(function (s) {
            self.symbolsTable[s.name] = i++;
        });*/
        this.start = this.productions[0].head;
        //process2 will compute FIRST and FOLLOW sets
        this.process2();
        //this is version LR0 (I guess, must check)
        //this.computeLR0();
        //this.filterKernel();

        //This is version using DFA
        //this.computeLR1();
        //this.computeActionTableLR1();
        var mode = options.mode.toUpperCase();
        if(mode==='LALR1'){
            this.computeLALR1();
        } else if (mode==='SLR'){
            this.computeSLR();
        } else {
            this.computeLR1();
        }


    }

    PG.prototype.processProductions = function(productions){
        //here we split productions and actions, create internal productions and validate them
        var self = this;
        this.productions=[];
        this.actions=[];
        junq(productions).forEach(function(production){
            var head = production[0];
            var body = production[1];
            var action = production[2];
            //determine if it's a terminal or nonterminal
            var p = new Production(
                self.addGrammarElement(head),
                body.map(function(element){return self.addGrammarElement(element);})
            );
            self.productions.push(p);
            self.actions.push(action);
        });
    };

    PG.prototype.addGrammarElement = function (element){

        if(this.symbolsTable[element]==undefined){
            var el=undefined;
            if(this.tokens.indexOf(element)>-1){
            //it's a terminal
                el = new T(element);
                this.terminals.push(el);
            }else{
                el = new NT(element);
                this.nonTerminals.push(el);
            }
            var index = this.symbols.push(el)-1;
            this.symbolsTable[element]=index;
        }
        return this.symbols[this.symbolsTable[element]];
    };

/*    PG.prototype.getElements = function () {
        "use strict";
        var en = junq(this.productions).flatmap(
            function (prod) {
                return junq(prod.head).append(prod.body);
            }
        );
        return en;
    };


    PG.prototype.getNonTerminals = function () {
        var self = this;
        var nts = new sets.Set(
            this.getElements().where(function (e) {
                return  isNonTerminal(e);
            })
        );

        return nts;
    };

    PG.prototype.getTerminals = function () {
        var self = this;
        var nts = new sets.Set(
            this.getElements().where(function (e) {
                return (isTerminal(e));
            })
        );

        return nts;
    };*/
    //Computes FIRST and FOLLOW sets
    PG.prototype.process2 = function () {
        "use strict";

        var first = {};
        var nullable = {};
        var follow = {};
        junq(this.terminals).forEach(function (t) {
            first[t] = new sets.Set(t);
        });

        var done = false;
        var self = this;
        //compute FIRST
        do {
            done = false;
            junq(this.productions).forEach(function (p) {
                var lhs = p.head;
                var rhs = p.body;
                first[lhs] = first[lhs] || new sets.Set();
                if (rhs.length == 0) {
                    done = done || first[lhs].add(eps);
                    nullable[lhs] = true;
                } else {
                    var fne = junq(rhs).first(function (e) {
                        first[e] = first[e] || new sets.Set();
                        return !first[e].contains(eps);
                    });
                    if (fne === undefined) {//all contains eps
                        done = first[lhs].add(eps) || done;
                        nullable[lhs] = true;
                    } else {
                        done = first[lhs].addSet(first[fne]) || done;
                    }
                }
            });

        } while (done);

        //compute FOLLOW
        follow[this.start] = follow[this.start] || new sets.Set();
        follow[this.start].add(eof);
        do {
            done = false;
            junq(this.productions).forEach(function (p) {
                var rhs = p.body;
                var lhs = p.head;
                for (var i = 0; i < rhs.length; i++) {

                    if (isNonTerminal(rhs[i])) {
                        follow[rhs[i]] = follow[rhs[i]] || new sets.Set();
                        if (i < rhs.length - 1) {

                            var f = first[rhs[i + 1]].clone();
                            var epsfound = f.remove(eps);
                            done = follow[rhs[i]].addSet(f) || done;
                            if (epsfound) {
                                follow[lhs] = follow[lhs] || new sets.Set();
                                done = follow[rhs[i]].addSet(follow[lhs]) || done;
                            }
                        } else {

                            follow[lhs] = follow[lhs] || new sets.Set();
                            done = follow[rhs[i]].addSet(follow[lhs]) || done;
                        }


                    }


                }
            });

        } while (done);
        this.first = first;
        this.follow = follow;
    };

    PG.prototype.getProdutionsByHead = function (head) {
        "use strict";
        return junq(this.productions).where(function (p) {
            return p.head === head;
        });
    };
    PG.prototype.computeFirst = function (list) {
        var ret = new sets.Set();
        var self = this;

        for (var i = 0; i < list.length; i++) {
            var epsfound = false;
            var f = this.first[list[i]];
            junq(f).forEach(function (e) {
                "use strict";
                if (e === eps) {
                    epsfound = true;
                } else {
                    ret.add(e);
                }
            });
            if (!epsfound) break;

        }
        if (i == list.length) {
            ret.add(eps);
        }
        return ret;
    }


    PG.prototype.computeLR0 = function () {
        "use strict";
        this.S1 = new NT('S\'');
        var states = [];
        var self = this;
        this.startproduction = new Production(this.S1, [this.start]);
        this.startitem = this.startproduction.getItems()[0];
        var rules = [];
        states.push(this.startitem);
        var i = 0;
        while (i < states.length) {
            var s = states[i];


            if (!s.isAtEnd()) {
                var b = s.symbolAhead();
                var next = s.nextItem();
                var rule = new dfa.Rule(s, b, next);

                rules.push(rule);
                if (states.indexOf(next) < 0) {
                    states.push(next);
                }


                if (isNonTerminal(b)) {
                    this.getProdutionsByHead(b).forEach(function (p) {
                        //add a transition to the start of a production that reduces to non terminal b
                        next = p.getItems()[0];
                        var rule = new dfa.Rule(s, dfa.eps, next);
                        rules.push(rule);
                        if (states.indexOf(next) < 0) {
                            states.push(next);
                        }

                    })
                }
            }

            i = i + 1;
        }

        //The inputs of the NFA (and DFA) are the symbols of the grammar
        var ab = junq(this.terminals).append(this.nonTerminals).toArray();

        var specs = {
            rulebook: new LRRuleBook(rules),
            acceptstates: states,
            startstate: this.startitem,
            alphabet: ab
        };

        this.nfa = new dfa.NFA(specs);
        var sp = this.nfa.toDFA();
        sp.alphabet = ab;
        this.dfa = new dfa.DFA(sp);
        this.statesTable = sp.statesTable;
    };

    PG.prototype.isKernel = function (item) {
        "use strict";
        return  (!item.isAtStart() || item === this.startitem);
    };

    PG.prototype.filterKernel = function () {
        "use strict";
        //TODO: remove non kernels from statesTable
        var self = this;
        this.kernelStatesTable = [];
        for (var i = 0; i < this.statesTable.length; i++) {
            var state = this.statesTable[i];
            var kernels = junq(state).filter(function (item) {
                item.isKernel = self.isKernel(item);
                return item.isKernel;
            });
            this.kernelStatesTable[i] = new sets.Set(kernels);
        }

    };

    PG.prototype.computeLookAheads = function () {
        "use strict";
        //todo: find an unique symbol
        var sharp = new T('#');
        this.first[sharp] = new sets.Set(sharp);
        for (var i = 1; i < this.statesTable.length; i++) {
            this.determineLookAheadsForSet(i, sharp);
        }
    };

    //k is a set of kernel items of a LR0 set
    //i is the corresponding state
    //x is a grammar symbol
    PG.prototype.determineLookAheadsForSet = function (i, sharp) {
        "use strict";
        var self = this;

        var iset = self.statesTable[i];

        var k = junq(iset).filter(function (item) {
            return self.isKernel(item);
        });

        junq(k).forEach(function (item) {
            if (item === self.startitem) {
                iset.spont = iset.spont || [];
                var index = iset.toArray().indexOf(item);
                (iset.spont[index] = iset.spont[index] || []).push(eof);
            }
            var j = self.closureLR1([new LR1Item(item, sharp)]);
            junq(j)
                .filter(function (jtem) {
                    return !jtem.item.isAtEnd();
                })
                .forEach(function (jtem) {

                    console.log(jtem.toString());
                    var x = jtem.item.symbolAhead();
                    var a = jtem.lookahead;
                    var gotoix = self.statesTable[self.dfa.nextState(i, x)];
                    var nextitem = jtem.item.nextItem();
                    var gix = junq(gotoix).first(function (gitem) {
                        return gitem.equals(nextitem);
                    });
                    //ig is the index of the item in goto(i,x)
                    var ig = gotoix.toArray().indexOf(gix);
                    if (a !== sharp) {
                        //a is generated spontaneously for item jtem in goto(i,x)


                        var spont = (gotoix.spont = gotoix.spont || []);
                        (spont[ig] = spont[ig] || []).push(a);


                    } else {
                        //lookahead propagates from item to jitem in goto(i,x)
                        var propagates = (iset.propa = iset.propa || []);
                        propagates.push([item, gotoix, ig]);
                    }

                });

        });
    };

    PG.prototype.propagateLookAheads = function () {
        "use strict";
        var done = true;
        var self = this;

        for (var i = 1; i < this.statesTable.length; i++) {
            var s = this.statesTable[i];
            var items = s.toArray();
            for (var k = 0; k < items.length; k++) {
                var item = items[k];
                if (self.isKernel(item)) {
                    s.lookaheads = s.lookaheads || [];
                    s.spont = s.spont || [];
                    s.lookaheads[k] = s.lookaheads[k] || new sets.Set(s.spont[k] || []);
                }
            }
        }


        while (done) {


            done = false;
            for (i = 1; i < this.statesTable.length; i++) {
                s = this.statesTable[i];
                if (s.propa) {
                    junq(s.propa).forEach(function (propagate) {
                        item = propagate[0];
                        k = s.toArray().indexOf(item);
                        var gotoix = propagate[1];
                        var ig = propagate[2];

                        if (s.lookaheads && s.lookaheads[k]) {
                            done = done || gotoix.lookaheads[ig].addSet(s.lookaheads[k]);
                        }
                    });
                }
            }
        }

    };

    PG.prototype.closure = function (items) {
        "use strict";
        var self = this;
        var stack = items;//.toArray();
        var p = 0;
        while (p < stack.length) {
            var item = stack[p];
            var B = item.symbolAhead();
            if (isNonTerminal(B)) {
                junq(self.getProdutionsByHead(B)).forEach(function (prod) {
                var ni = prod.getItems()[0];

                            if (!junq(stack).any(function (i) {
                                return ni.equals(i);
                            })) {
                                stack.push(ni);
                            }

                });
            }
            p = p + 1;
        }
        return stack;
    };

    PG.prototype.closureLR1 = function (items) {
        "use strict";
        var self = this;
        var stack = items;//.toArray();
        var p = 0;
        while (p < stack.length) {
            var item = stack[p].item;
            var lookahead = stack[p].lookahead;
            var B = item.symbolAhead();
            if (isNonTerminal(B)) {
                junq(self.getProdutionsByHead(B)).forEach(function (prod) {
                    var suffix = item.tail();
                    suffix.push(lookahead);
                    var first = self.computeFirst(suffix);
                    junq(first).filter(function (symbol) {
                        return isTerminal(symbol);
                    })
                        .forEach(function (b) {
                            var ni = new LR1Item(prod.getItems()[0], b);
                            if (!junq(stack).any(function (item) {
                                return ni.equals(item);
                            })) {
                                stack.push(ni);
                            }
                        });
                });
            }
            p = p + 1;
        }
        return stack;
    };

    PG.prototype.gotoLR0 = function (i, x) {
        "use strict";
        var j = [];
        junq(i).forEach(function (item) {
            if (!item.isAtEnd()) {
                if(item.symbolAhead()===x) {
                    j.push(item.nextItem());
                }
            }
        });
        //Nota: potrebbero esserci ripetizioni.
        return this.closure(j);
    };

    PG.prototype.gotoLR1 = function (i, x) {
        "use strict";
        var j = [];
        junq(i).forEach(function (lr1item) {
            var gitem = lr1item.item;
            if (!gitem.isAtEnd()) {
                var a = lr1item.lookahead;
                if (gitem.symbolAhead() === x) {
                    j.push(new LR1Item(gitem.nextItem(), a));
                }
            }
        });
        //Nota: potrebbero esserci ripetizioni.
        return this.closureLR1(j);
    };

    PG.prototype.computeSLR = function () {
        this.S1 = new NT('S\'');
        var states = [];
        var self = this;
        var newAction;
        self.action = {};
        self.goto = {};
        this.startproduction = new Production(this.S1, [this.start]);
        //Inizia da I0 (stato 0): closure({[S'::=S,§]}) sullo stack da elaborare
        this.startitem = self.closure([this.startproduction.getItems()[0]]);

        states.push(this.startitem);
        var i = 0;
        while (i < states.length) {
            //prendi lo stato Ii da elaborare in cima allo stack
            var Ii = states[i];
            var act = (self.action[i] = self.action[i] || {});
            junq(Ii).forEach(
                function (gitem) {
                    //per ogni item
                    if (gitem.isAtEnd()) {
                        //se A non è S' aggiungi ACTION(i,a) = reduce (A-> X)
                        var p = gitem.production;
                        var pindex = self.productions.indexOf(p);

                        if (p.head !== self.S1) {
                            var follow = self.follow[p.head];
                            junq(follow).forEach(function(a)
                            {
                                newAction = ['reduce', [self.symbolsTable[gitem.production.head.name], gitem.production.body.length, pindex]];
                                self.tryAddAction(act, gitem, a, newAction);
                            });
                        }
                        else { //A == S'
                            act[EOFNUM] = ['accept', []];
                        }
                    }
                    else //not at end
                    {
                        var a = gitem.symbolAhead();
                        //Calcola Ij=gotoLR1(Ii,X)
                        var Ij = self.gotoLR0(Ii,a);
                        //check if IJ is on the stack
                        var j = self.findState(states, Ij);
                        if (j < 0) {
                            //Se Ij non è sullo stack, fare push
                            j = states.push(Ij)-1;
                        }
                        else{
                            //console.log("state already found");
                        }
                        var an = self.symbolsTable[a.name];
                        if (isNonTerminal(a)) {
                            //Se X è non terminale: aggiungi a tabella GOTO(i,X)=j
                            (self.goto[i] = self.goto[i] || {})[an] = j;
                        }else{
                            //Se X è terminale: aggiungi a ACTION(i,X) = shift j
                            newAction = ['shift', [j]];
                            self.tryAddAction(act,gitem,a,newAction);
                        }
                    }
                }
            );
            i = i+1;
        }
        this.statesTable = states;
        this.startState = 0;
    };

    PG.prototype.computeLR1 = function () {
        this.S1 = new NT('S\'');
        var states = [];
        var self = this;
        var newAction;
        self.action = {};
        self.goto = {};
        this.startproduction = new Production(this.S1, [this.start]);
        //Inizia da I0 (stato 0): closureLR1({[S'::=S,§]}) sullo stack da elaborare
        this.startitem = self.closureLR1([new LR1Item(this.startproduction.getItems()[0], eof)]);

        states.push(this.startitem);
        var i = 0;
        while (i < states.length) {
            //prendi lo stato Ii da elaborare in cima allo stack
            var Ii = states[i];
            var act = (self.action[i] = self.action[i] || {});
            junq(Ii).forEach(
                function (lr1item) {
                    //per ogni LR1item
                    var gitem = lr1item.item;

                    var lookahead = lr1item.lookahead;
                    if (gitem.isAtEnd()) {
                        //se A non è S' aggiungi ACTION(i,a) = reduce (A-> X)
                        var p = gitem.production;
                        var pindex = self.productions.indexOf(p);
                        if (p.head !== self.S1) {

                            newAction = ['reduce', [self.symbolsTable[gitem.production.head.name], gitem.production.body.length, pindex]];
                            self.tryAddAction(act,gitem,lookahead,newAction);
                        }
                        else { //A == S'
                            act[EOFNUM] = ['accept', []];
                        }
                    }
                    else //not at end
                    {
                        var a = gitem.symbolAhead();
                        //Calcola Ij=gotoLR1(Ii,X)
                        var Ij = self.gotoLR1(Ii, a);
                        //check if IJ is on the stack
                        var j = self.findState(states, Ij);
                        if (j < 0) {
                            //Se Ij non è sullo stack, fare push
                            j = states.push(Ij)-1;
                        }
                        else{
                            //console.log("state already found");
                        }
                        //altrimenti j = posizione di Ij sullo stack
                        var an = self.symbolsTable[a.name];
                        if (isNonTerminal(a)) {
                            //Se X è non terminale: aggiungi a tabella GOTO(i,X)=j
                            (self.goto[i] = self.goto[i] || {})[an] = j;
                        }else{
                            //Se X è terminale: aggiungi a ACTION(i,X) = shift j
                            newAction = ['shift', [j]];
                            self.tryAddAction(act,gitem,a,newAction);
                        }
                    }
                }
            );
            i = i+1;
        }
        this.statesTable = states;
        this.startState = 0;
    };

    PG.prototype.computeLALR1 = function () {
        this.S1 = new NT('S\'');
        var states = [];
        var self = this;
        var newAction;
        self.action = {};
        self.goto = {};
        this.startproduction = new Production(this.S1, [this.start]);
        //Inizia da I0 (stato 0): closureLR1({[S'::=S,§]}) sullo stack da elaborare
        this.startitem = self.closureLR1([new LR1Item(this.startproduction.getItems()[0], eof)]);

        states.push(this.startitem);
        var i = 0;
        while (i < states.length) {
            //prendi lo stato Ii da elaborare in cima allo stack
            var Ii = states[i];
            var act = (self.action[i] = self.action[i] || {});
            junq(Ii).forEach(
                function (lr1item) {
                    //per ogni LR1item
                    var gitem = lr1item.item;

                    var lookahead = lr1item.lookahead;
                    if (gitem.isAtEnd()) {
                        //se A non è S' aggiungi ACTION(i,a) = reduce (A-> X)
                        var p = gitem.production;
                        var pindex = self.productions.indexOf(p);
                        if (p.head !== self.S1) {
                            newAction = ['reduce', [self.symbolsTable[gitem.production.head.name], gitem.production.body.length, pindex]];
                            self.tryAddAction(act,gitem,lookahead,newAction);
                        }
                        else { //A == S'
                            act[EOFNUM] = ['accept', []];
                        }
                    }
                    else //not at end
                    {
                        var a = gitem.symbolAhead();
                        //Calcola Ij=gotoLR1(Ii,X)
                        var Ij = self.gotoLR1(Ii, a);
                        //check if IJ is on the stack
                        var j = self.findSimilarState(states, Ij);
                        if (j < 0) {
                            //Se Ij non è sullo stack, fare push
                            j = states.push(Ij)-1;
                        }
                        else{
                            self.mergeStates(j,states[j],Ij)
                        }
                        //altrimenti j = posizione di Ij sullo stack
                        var an = self.symbolsTable[a.name];
                        if (isNonTerminal(a)) {
                            //Se X è non terminale: aggiungi a tabella GOTO(i,X)=j
                            (self.goto[i] = self.goto[i] || {})[an] = j;
                        }else{
                            //Se X è terminale: aggiungi a ACTION(i,X) = shift j

                            newAction = ['shift', [j]];
                            self.tryAddAction(act,gitem,a,newAction);
                        }
                    }
                }
            );
            i = i+1;
        }
        this.statesTable = states;
        this.startState = 0;
    };

    PG.prototype.findState = function (list, state) {
        var self = this;
        for (var i = 0; i < list.length; i++) {
            var s = list[i];
            if (s.length != state.length) continue;
            //check if every item in s is also in state
            var equals = true;
            for (var i1 = 0; i1 < s.length; i1++) {
                var item1 = s[i1];

                var found = junq(state).any(
                    function (item2) {
                        return item2.equals(item1);
                    }
                );
                if (!found) {
                    equals = false;
                    break;
                }
            }
            if (equals) return i;
        }
        //we exited the loop, the state was not found
        return -1;
    };

    PG.prototype.findSimilarState = function (list, state) {
        var self = this;
        for (var i = 0; i < list.length; i++) {
            var s = list[i];
            if (s.length != state.length) continue;
            //check if every item in s is also in state
            var equals = true;
            for (var i1 = 0; i1 < s.length; i1++) {
                var item1 = s[i1];

                var found = junq(state).any(
                    function (item2) {
                        return item2.item.equals(item1.item);
                    }
                );
                if (!found) {
                    equals = false;
                    break;
                }
            }
            if (equals) return i;
        }
        //we exited the loop, the state was not found
        return -1;
    };

    PG.prototype.mergeStates = function(j,state, other){
        var self=this;
        junq(state).forEach(function(lr1item){
            if(lr1item.item.isAtEnd()) {
                var otherLR1item = junq(other).first(function (oLR1item) {
                    return oLR1item.item.equals(lr1item.item);
                });
                //merge the lookahead of otherLR1item into the ones of lr1item
                var gitem = otherLR1item.item;
                var p = gitem.production;
                var lookahead = otherLR1item.lookahead;
                var pindex = self.productions.indexOf(p);
                var act = (self.action[j] = self.action[j] || {});
                if (p.head !== self.S1) {
                    var newAction = ['reduce', [self.symbolsTable[gitem.production.head.name], gitem.production.body.length, pindex]];
                    self.tryAddAction(act,gitem,lookahead,newAction);
                }
                else { //A == S'
                    act[EOFNUM] = ['accept', []];
                }
            }

        });
    };

    PG.prototype.tryAddAction = function(act, gitem, lookahead, newAction){
        var self = this;
        var an = self.symbolsTable[lookahead] || 0;

        if (act[an] === undefined) {
            act[an] = newAction;
        } else {
            //check if prod contains an operator and compare it to a
            act[an] = self.resolveConflict(act[an], newAction, lookahead, gitem);
        }
    }

    PG.prototype.computeLR1_old = function () {
        "use strict";
        this.S1 = new NT('S\'');
        var states = [];
        var self = this;
        this.startproduction = new Production(this.S1, [this.start]);
        this.startitem = new LR1Item(this.startproduction.getItems()[0], eof);

        var rules = [];
        states.push(this.startitem);
        var i = 0;
        while (i < states.length) {
            var s = states[i].item;
            var a = states[i].lookahead;

            if (!s.isAtEnd()) {
                var b = s.symbolAhead();
                var ni = s.nextItem();
                var next = junq(states).first(function (st) {
                    return st.item === ni && st.lookahead === a;
                });
                if (next === undefined) {
                    next = new LR1Item(s.nextItem(), a);
                    states.push(next);
                }

                //create rule
                var rule = new dfa.Rule(states[i], b, next);

                rules.push(rule);


                if (isNonTerminal(b)) {
                    var suffix = s.tail();
                    suffix.push(a);
                    this.getProdutionsByHead(b).forEach(function (p) {
                        //add a transition to the start of a production that reduces to non terminal b
                        var pi = p.getItems()[0];
                        var f = self.computeFirst(suffix);
                        junq(f).filter(function (sy) {
                            return isTerminal(sy);
                        })
                            .forEach(function (t) {

                                next = junq(states).first(function (st) {
                                    return st.item === pi && st.lookahead === t;
                                });
                                if (next === undefined) {
                                    next = new LR1Item(pi, t);
                                    states.push(next);
                                }

                                var rule = new dfa.Rule(states[i], dfa.eps, next);
                                rules.push(rule);

                            });


                    })
                }
            }

            i = i + 1;
        }

        //The inputs of the NFA (and DFA) are the symbols of the grammar
        var ab = junq(this.terminals).append(this.nonTerminals).toArray();

        var specs = {
            rulebook: new LRRuleBook(rules),
            acceptstates: states,
            startstate: this.startitem,
            alphabet: ab
        };

        this.nfa = new dfa.NFA(specs);
        var sp = this.nfa.toDFA();
        sp.alphabet = ab;
        this.dfa = new dfa.DFA(sp);
        //TODO: shouldn't we call this.dfa.minimize() ?
        this.statesTable = sp.statesTable;
        this.startState=1;
    };

    //computes nullable, FIRST and FOLLOW sets
    PG.prototype.process = function () {
        "use strict";
        var first = {};
        var nullable = {};
        var follow = {};
        var done = false;
        var self = this;


        junq(this.nonTerminals).forEach(function (nt) {
            nullable[nt] = false;
        });
        junq(this.terminals).forEach(function (t) {
            first[t] = new sets.Set(t);
        });
        do {
            done = false;
            junq(this.productions).forEach(function (p) {
                var c1;
                var lhs = p.head;
                var rhs = p.body;
                follow[lhs] = follow[lhs] || new sets.Set();
                first[lhs] = first[lhs] || new sets.Set();
                //Update nullable
                var k = rhs.length;
                if (!nullable[lhs]) {
                    if (k === 0) {
                        nullable[lhs] = true;
                        done = true;
                    } else if (junq(rhs).all(function (e) {
                        return nullable[e];
                    })) {
                        //if all body elements are nullable
                        nullable[lhs] = true;
                        done = true;
                    }
                }
                var allnullable = true;
                for (var i = 0; i < k; i++) {
                    follow[rhs[i]] = follow[rhs[i]] || new sets.Set();
                    first[rhs[i]] = first[rhs[i]] || new sets.Set();
                    if (i == 0 || allnullable) {
                        c1 = first[lhs].cardinality();
                        if (first[rhs[i]].contains(undefined)) {
                            debugger;
                        }
                        first[lhs] = first[lhs].union(first[rhs[i]]);
                        if (first[lhs].cardinality() > c1) done = true;
                    }
                    if (!self.isNullable(rhs[i])) {
                        allnullable = false;
                    }
                    //from i+1 to k-1
                    if (i === k - 1 || junq.range(k - (i + 1), i + 1).map(function (n) {
                        return rhs[n];
                    }).all(function (e) {
                        return nullable[e];
                    })) {
                        //if the subsequent are all nullable
                        c1 = follow[rhs[i]].cardinality();
                        if (follow[lhs].contains(undefined)) {
                            debugger;
                        }
                        follow[rhs[i]] = follow[rhs[i]].union(follow[lhs]);
                        if (follow[rhs[i]].cardinality() > c1) done = true;
                    }
                    for (var j = i + 1; j < k; j++) {
                        follow[rhs[j]] = follow[rhs[j]] || new sets.Set();
                        first[rhs[j]] = first[rhs[j]] || new sets.Set();
                        //from i+1 to j-1
                        if (i + 1 === j || junq.range(j - 1 - (i + 1), i + 1).map(function (n) {
                            return rhs[n];
                        }).all(function (e) {
                            return nullable[e];
                        })) {
                            c1 = follow[rhs[i]].cardinality();
                            var r = rhs[j];
                            if (first[rhs[j]].contains(undefined)) {
                                debugger;
                            }
                            follow[rhs[i]] = follow[rhs[i]].union(first[rhs[j]]);
                            if (follow[rhs[i]].cardinality() > c1) done = true;
                        }
                    }
                }
            });
        } while (done);


        this.first = first;
        this.follow = follow;
        this.nullable = nullable;
    };

    PG.prototype.getSymbols = function () {
        return junq(this.getNonTerminals()).append(this.getTerminals()).toArray();
    }

    PG.prototype.computeActionTable = function () {
        /*
         for each state i, if A --> .....ab in Ii e Ii->a->Ij e a is terminal shift j

         */
        var self = this;
        var states = this.dfa.getStates();
        self.action = [];
        self.goto = [];
        junq(states).forEach(function (i) {
            "use strict";
            junq(self.statesTable[i]).forEach(function (gitem) {

                var act = (self.action[i] = self.action[i] || []);
                //compute action
                if (gitem.isAtEnd()) {
                    //reduce for all a in follow(head) head !== start1
                    var p = gitem.production;
                    if (p.head !== self.S1) {
                        var followA = self.follow[p.head];
                        junq(followA).forEach(function (a) {

                            //set the action(i,a) to reduce
                            //(self.action[i] = self.action[i] || {})[a] = ['reduce',[self.productions.indexOf(gitem.production)]];


                            var an = self.symbolsTable[a];
                            if (act[an] === undefined) {
                                act[ an] = ['reduce', [self.symbolsTable[gitem.production.head.name], gitem.production.body.length]];
                            } else {
                                throw new Error('Shift / reduce conflict in ' + gitem + ' on ' + a);
                            }
                        });
                    } else {

                        act[EOFNUM] = ['accept', []];
                    }

                } else {
                    var a = gitem.symbolAhead();
                    if (a !== undefined && isTerminal(a)) {
                        var j = self.dfa.nextState(i, a);
                        if (j !== undefined) {

                            var n = self.symbolsTable[a.name];
                            if (act[n] === undefined) {
                                act[ n] = ['shift', [j]];
                            } else {
                                throw new Error('Shift / reduce conflict in ' + gitem + ' on ' + a);
                            }

                        }
                    }
                }


            });
            //compute goto
            junq(self.nonTerminals).forEach(function (nt) {
                var j = self.dfa.nextState(i, nt);
                if (j !== undefined) {
                    (self.goto[i] = self.goto[i] || [])[self.symbolsTable[nt.name]] = j;
                }
            });
        });

    };

    PG.prototype.computeActionTableLR1 = function () {
        /*
         for each state i, if A --> .....ab in Ii e Ii->a->Ij e a is terminal shift j

         */
        var self = this;
        var states = this.dfa.getStates();
        var newAction;
        self.action = [];
        self.goto = [];
        junq(states).forEach(function (i) {
            "use strict";
            junq(self.statesTable[i]).forEach(function (lr1item) {

                var act = (self.action[i] = self.action[i] || []);
                var gitem = lr1item.item;
                var lookahead = lr1item.lookahead;

                //compute action
                if (gitem.isAtEnd()) {

                    var p = gitem.production;
                    var pindex = self.productions.indexOf(p);
                    if (p.head !== self.S1) {

                        var an = self.symbolsTable[lookahead];
                        newAction = ['reduce', [self.symbolsTable[gitem.production.head.name], gitem.production.body.length, pindex]];
                        if (act[an] === undefined) {
                            act[an] = newAction;
                        } else {
                            //check if prod contains an operator and comparit to a
                            act[an] = self.resolveConflict(act[an], newAction, a, gitem);
                            //throw new Error('Shift / reduce conflict in ' + gitem + ' on ' + a);
                        }

                    } else {

                        act[EOFNUM] = ['accept', []];
                    }

                } else {
                    var a = gitem.symbolAhead();
                    if (a !== undefined && isTerminal(a)) {
                        var j = self.dfa.nextState(i, a);
                        if (j !== undefined) {

                            var n = self.symbolsTable[a.name];
                            newAction = ['shift', [j]];
                            if (act[n] === undefined) {
                                act[ n] = newAction;
                            } else {
                                if (act[n][0] !== 'shift' || act[n][1][0] !== j) {
                                    //check if prod contains an operator and compare it to a
                                    act[n] = self.resolveConflict(act[n], newAction, a, gitem);
                                    //throw new Error('Shift / reduce conflict in ' + gitem + ' on ' + a);
                                }


                            }

                        }
                    }
                }


            });
            //compute goto
            junq(self.nonTerminals).forEach(function (nt) {
                var j = self.dfa.nextState(i, nt);
                if (j !== undefined) {
                    (self.goto[i] = self.goto[i] || [])[self.symbolsTable[nt.name]] = j;
                }
            });
        });

    };


    PG.prototype.resolveConflict = function (currentAction, newAction, a, gitem) {
        "use strict";
        //if current action is reduce we have a prod, otherwise?
        var shiftAction, reduceAction;
        var curtype = currentAction[0];
        var prod;
        if (curtype === 'reduce') {
            reduceAction = currentAction;

            if (newAction[0] == 'reduce') {
                if(newAction[1][0]!=currentAction[1][0] || newAction[1][1]!=currentAction[1][1]
                    || newAction[1][2]!=currentAction[1][2]){
                    throw new Error('Reduce/Reduce conflict in ' + gitem + ' on ' + a);
                }
                else{
                    return currentAction;
                }
            } else {
                shiftAction = newAction;
            }
        } else { //current is shift
            shiftAction = currentAction;
            if (newAction[0] === 'shift') {
                if(newAction[1][0] != currentAction[1][0]) {
                    throw new Error('Shift/Shift conflict in ' + gitem + ' ob ' + a);
                } else {
                    return currentAction;
                }
            } else {
                //new Action is Reduce
                reduceAction = newAction;
            }
        }

        prod = this.productions[reduceAction[1][2]];

        //check if a is an operator

        var operators = this.operators;
        if (operators && operators[a.name]) {
            var aassoc = operators[a.name][0];
            var aprio = operators[a.name][1];
            //check if prod contains an operator
            var op = junq(prod.body).first(function (t) {
                return isTerminal(t) && operators[t.name];
            });
            if (op) {
                var redassoc = operators[op.name][0];
                var redprio = operators[op.name][1];
                //first check if it is the same priority
                if (aprio === redprio) {
                    //check associativity
                    if (redassoc === 'left') {
                        //prefer reduce
                        return reduceAction;
                    } else {
                        //prefer shift
                        return shiftAction;
                    }
                } else if (aprio > redprio) {
                    return shiftAction;
                } else { //aprio < redprio
                    return reduceAction;
                }
            }
            else {

            }

        } else {
            //a is not an operator
        }
        throw new Error('Shift / Reduce conflict on ' + gitem + ' on ' + a)
    };


    PG.prototype.printActionTable = function () {
        var str;
        for (var i = 1; i < this.action.length; i++) {
            str = [];
            str.push(i);
            str.push(': ');
            for (var p in this.action[i]) {
                str.push(p);
                str.push('->');
                str.push(this.action[i][p][0]);
                str.push(this.action[i][p][1][0]);
                str.push('\t');
            }

            console.log(str.join(''));
        }
    };

    PG.prototype.generateParser = function(specs) {
        var self=this;
        specs.parserName = specs.parserName || 'Parser';
        var str = [];
        str.push('var '+specs.parserName+' = (function (undefined) {');
        //Constructor
        //str.push('var eof='+JSON.stringify(eof)+';');
        str.push('function Parser(){');
        str.push('this.action='+JSON.stringify(this.action)+';');
        str.push('this.goto='+JSON.stringify(this.goto)+';');
        if(this.actions !== undefined){
            str.push('this.actions=['+this.actions.toString()+'];');
        }
        str.push('this.startstate='+this.startState+';');
        str.push('this.symbolsTable='+JSON.stringify(this.symbolsTable)+';');


        if(specs.debug){
            str.push('this.symbols='+JSON.stringify(this.symbols)+';');
        }

        str.push('}');

        junq(['identity','parse','shift','reduce','accept','error']).forEach(function(mname){
            str.push('Parser.prototype.'+mname+'=' + Parser.prototype[mname].toString()+';');
        });

        str.push(this.constructor.LexerAdapter.toString());

        junq(['currentToken','next']).forEach(function(mname){
            str.push('LexerAdapter.prototype.'+mname+'=' + self.constructor.LexerAdapter.prototype[mname].toString()+';');
        });




        str.push('return Parser;');
        str.push('})();');
        return str.join('\r\n');
    };


    function LRRuleBook(rules) {
        "use strict";
        this.rules = rules;
    }

    LRRuleBook.prototype = new dfa.NDRuleBook();

    //TODO: move the getSymbol function out of rulebook
    LRRuleBook.prototype.getSymbols = function () {
        "use strict";
        var symbols = [];
        junq(this.rules)
            .filter(function (rule) {
                return ((rule.input !== dfa.eps) /* && !(rule.input.negate)*/);
            })
            .map(function (rule) {
                return rule.input;
            })
            .forEach(function (i) {
                if (!junq(symbols).any(function (s) {
                    return s.match(i);
                })) {
                    symbols.push(i);
                }
            });

        return symbols;
    }

    //This will be compiled
    function Parser(specs) {
        "use strict";

        this.action = specs.action;
        this.goto = specs.goto;
        this.actions = specs.actions;
        this.startstate = specs.startState;
        //This is needed to translate from lexer names to parser numbers
        this.symbolsTable = specs.symbolsTable;
        //do we need this?
        //this.productions = specs.productions;

        //TODO: this should become just string in the compiled-debug version
        this.symbols = specs.symbols;
    }

    Parser.prototype.identity = function (x) {
        "use strict";
        return x;
    };

    //Note: this only actually needs:
    //* symbolsTable
    //* action
    //* actions
    //* startstate
    Parser.prototype.parse = function (lexer) {
        this.stack = [];
        this.lexer = new LexerAdapter(lexer);
        this.stack.push({s: this.startstate, i: 0});
        this.accepted = false;
        this.inerror = false;
        while (!this.accepted && !this.inerror) {
            var top = this.stack[this.stack.length - 1];
            var s = top.s;
            this.a = this.lexer.currentToken();
            if(this.a != undefined)
                this.an = this.symbolsTable[this.a.name];
            else
                this.an = 0;
            var action = this.action[s][this.an];
            if (action !== undefined) {
                this[action[0]].apply(this, action[1]);
            } else {
                this.inerror = true;
                this.error(this.a,this);
            }
        }
        console.log('accepted: ' + this.accepted + ' in error: ' + this.inerror);
        console.log('$$: '+top.i.value);
        return top.i.value;
    };

    Parser.prototype.shift = function (state) {
        "use strict";
        this.stack.push({s: state, i: this.a});
        this.lexer.next();
        console.log('shift ' + state);
    };

    Parser.prototype.reduce = function (head, length, prodindex) {
        "use strict";
        //var prod = this.productions[prodnumber];
        var self = this;
        var rhs = this.stack.splice(-length, length);
        var t = this.stack[this.stack.length - 1];
        var ns = this.goto[t.s][head];
        var value;
        if (this.actions) {
            var action = this.actions[prodindex] || this.identity;
            var values = rhs.map(function (si) {
                return si.i.value;
            });

            value = action.apply(this, values);
        }
        //If we are debugging

        if(this.symbols) {
            console.log('reduced ' + this.symbols[head].name + ' -> ' + rhs.map(function (s) {
                return s.i.name;
            }).toString());

            var nt = {name: this.symbols[head].name, value:value};
            this.stack.push({s: ns, i: nt});
        }
        else
        {
            
            this.stack.push({s: ns,i:{value: value}});
        }

    };

    Parser.prototype.accept = function () {
        "use strict";
        console.log('accept');
        this.accepted = true;
    };

    Parser.prototype.error = function(token){
        throw Error('Unexpected token "'+token.lexeme+'" at ('+token.pos.line+':'+token.pos.col+')');
    };



    function TestLexer(list) {
        "use strict";
        this.list = list;
        this.pos = 0;
        this.current = this.list[this.pos];
    }

    TestLexer.prototype.currentToken = function () {
        "use strict";
        return this.current;
    };

    TestLexer.prototype.next = function () {
        "use strict";
        this.pos++;
        if (this.pos < this.list.length)
            this.current = this.list[this.pos];
        else
            this.current = eof;
    };
    parser.TestLexer = TestLexer;
    function LexerAdapter(lexer) {
        "use strict";
        this.lexer = lexer;
        this.initialized = false;
        this.current = undefined;

    }

    LexerAdapter.prototype.currentToken = function () {
        "use strict";
        if (!this.initialized) {
            this.next();
            this.initialized = true;
        }
        return this.current;
    };

    LexerAdapter.prototype.next = function () {

        "use strict";
        //TODO: create a T with all info from current token taken from lexer.
        var name = this.lexer.nextToken();
        if (name === "EOF" || (typeof name === 'undefined')) {
            this.current = undefined;
        } else {
            this.current = (/*this.current ||*/ {});
            this.current.name = name;
            this.current.value = this.lexer.jjval;
            this.current.lexeme = this.lexer.jjtext;
            this.current.position = this.lexer.jjpos;
            this.current.pos = {col: this.lexer.jjcol, line: this.lexer.jjline};
        }

    };

    parser.Parser = Parser;
    parser.ParserGenerator = PG;
    PG.LexerAdapter = LexerAdapter;

})(parser || (parser = {}), automata);

if (typeof(module) !== 'undefined') { module.exports = parser; }
