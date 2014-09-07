/**
 * Copyright by Gabriele Cannata 2013-2014
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

    function PG(grammar) {
        "use strict";
        var self = this;
        //this.grammar = grammar;
        this.tokens = grammar.tokens;
        this.nonTerminals = [];
        this.terminals = [];
        this.moduleName = grammar.moduleName;
        this.actionMode = grammar.actionMode || 'function';
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

        this.start = this.productions[0].head;

        this.computeFirstAndFollow();

        var mode = (grammar.mode || '').toUpperCase();
        if(mode==='LALR1'){
            this.computeLALR1();
        } else if (mode==='SLR'){
            this.computeSLR();
        } else if (mode === 'LR1'){
            this.computeLR1();
        } else {
            this.computeAuto();
        }
    }

    PG.prototype.computeAuto = function () {
        try{
            this.computeSLR();
        }catch(e)
        {
            try{
                this.computeLALR1();
            }
            catch(e)
            {
                    this.computeLR1();
            }
        }
    };

    PG.prototype.processProductions = function(productions){
        //here we split productions and actions, create internal productions and validate them
        var self = this;
        this.productions=[];
        this.actions=[];
        var additionalProductions = [];
        var head;
        while(productions.length>0){
            junq(productions).forEach(function(production){
                head = production[0] || head;
                var body = production[1];
                var action = production[2];

                body = junq(body).map(function(el){
                    return self.parseProduction(head, el,additionalProductions);
                }).toArray();

                var p = new Production(
                    self.addGrammarElement(head),
                    body.map(function(element){return self.addGrammarElement(element);})
                );
                self.productions.push(p);
                self.actions.push(action);

            });
            productions = additionalProductions;
            additionalProductions = [];
        }

    };

    var prodRE = /[\(\)\[\]\*\+\?\{\}]|(\\[\(\)\[\]\*\+\?\{\}]|[^\s()])*/g

    PG.prototype.parseProduction = function (head, element, additional) {
        if(element.isEBNF)
        {
            var id = this.productions.length;
            var ret = element.toBNF(head, id, additional);
            return ret;
        }
        else return element;

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

    //Computes FIRST and FOLLOW sets
    PG.prototype.computeFirstAndFollow = function () {
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
                    done = first[lhs].add(eps) || done;
                    nullable[lhs] = true;
                } else {
                    var i;
                    for(i = 0;i<rhs.length;i++){
                        var e = rhs[i];
                        first[e] = first[e] || new sets.Set();
                        var fwe = first[e].clone();
                        fwe.remove(eps);
                        done = first[lhs].addSet(fwe) || done;
                        if(!first[e].contains(eps))  break;
                    }
                    //let's check if all rhs elements were nullable
                    if((i === rhs.length) && (first[rhs[i-1]].contains(eps))){
                        done = first[lhs].add(eps) || done;
                    }

                }
            });

        } while (done);

        //this is needed for computeFirst
        this.first = first;

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
                            //BUG: here we need to compute first(rhs[i+1]...rhs[n])
                            var tail = rhs.slice(i+1);
                            //var f = first[rhs[i + 1]].clone();
                            var f = self.computeFirst(tail);
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
            if(typeof f === 'undefined'){
                throw Error('Unexpected element "'+list[i]+'"');
            }
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
    };





    PG.prototype.getSymbols = function () {
        return junq(this.getNonTerminals()).append(this.getTerminals()).toArray();
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
                    if(redassoc === 'nonassoc') {
                        return ['error',['operator "'+op+'" is non associative']]
                    } else if (redassoc === 'left') {
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

    PG.prototype.generateParser = function() {
        var self=this;
        this.moduleName =  this.moduleName  || 'Parser';
        var str = [];
        str.push('var '+this.moduleName +' = (function (undefined) {');
        //Constructor
        //str.push('var eof='+JSON.stringify(eof)+';');
        str.push('function Parser(environment){');
        str.push('if(!(this instanceof Parser)) return new Parser(environment);');
        str.push('var env,modules,imports;')
        str.push('env=modules=imports=environment;');
        str.push('this.action='+JSON.stringify(this.action)+';');
        str.push('this.goto='+JSON.stringify(this.goto)+';');
        if(this.actions !== undefined){
            str.push('this.actions=['+this.actions.toString()+'];');
        }
        str.push('this.startstate='+this.startState+';');
        str.push('this.symbolsTable='+JSON.stringify(this.symbolsTable)+';');
        str.push('this.actionMode=\''+this.actionMode+'\';');
/*
        if(specs.debug){
            str.push('this.symbols='+JSON.stringify(this.symbols)+';');
        }
*/
        str.push('}');

        junq(['identity','parse','shift','reduce','accept','error','create']).forEach(function(mname){
            str.push('Parser.prototype.'+mname+'=' + Parser.prototype[mname].toString()+';');
        });


        str.push('if (typeof(module) !== \'undefined\') { module.exports = Parser; }');
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
    };

    //This will be compiled
    function Parser(grammar) {
        "use strict";
        if(!(this instanceof Parser)) return new Parser(grammar);
        var specs = new PG(grammar);
        this.action = specs.action;
        this.goto = specs.goto;
        this.actions = specs.actions;
        this.startstate = specs.startState;
        //This is needed to translate from lexer names to parser numbers
        this.symbolsTable = specs.symbolsTable;
        this.actionMode = specs.actionMode;
        this.symbols = specs.symbols;
    }

    Parser.prototype.identity = function (x) {
        "use strict";
        return x;
    };

    Parser.prototype.create = function(ctor,args){
        var args = [this.context].concat(args);
        var factory = ctor.bind.apply(ctor,args);
        return new factory();
    }

    //Note: this only actually needs:
    //* symbolsTable
    //* action
    //* actions
    //* startstate
    Parser.prototype.parse = function (lexer, context) {
        this.stack = [];
        this.context =  context || {};

        this.lexer = lexer;
        this.a = this.lexer.nextToken();
        this.stack.push({s: this.startstate, i: 0});
        this.accepted = false;
        this.inerror = false;
        while (!this.accepted && !this.inerror) {
            var top = this.stack[this.stack.length - 1];
            var s = top.s;
            //this.a = this.currentToken;
            if(lexer.isEOF(this.a))
                this.an = 0;
            else
                this.an = this.symbolsTable[this.a.name];
            var action = this.action[s][this.an];
            if (action !== undefined) {
                this[action[0]].apply(this, action[1]);
            } else {
                this.inerror = true;
                this.error(this.a,this);
            }
        }
        return top.i.value;
    };

    Parser.prototype.shift = function (state) {
        "use strict";
        this.stack.push({s: state, i: this.a});
        this.a = this.lexer.nextToken();

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

            if(self.actionMode==='constructor')
                value =  this.create(action,values);
            else
                value =  action.apply(this.context, values);
        }
        //If we are debugging

        if(this.symbols) {
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
        this.accepted = true;
    };

    Parser.prototype.error = function(token){
        if(typeof token === 'string')
        {
            throw Error(token);
        }
        if(this.lexer.isEOF(token)){
            throw Error("Unexpected EOF at "+this.lexer.jjline+':'+this.lexer.jjcol);
        } else
        throw Error('Unexpected token '+token.name+' "'+token.lexeme+'" at ('+token.pos.line+':'+token.pos.col+')');
    };


    function Optional(){
        if(!(this instanceof Optional)) return new Optional(Array.prototype.slice.apply(arguments));
        this.productionlist = arguments[0];
        this.isEBNF = true;
    }

    Optional.prototype.toBNF = function(_,id, additional){
        //arrange an unique name
        var prod2;
        var prod1;
        var name = 'Optional_'+id+'_'+additional.length;
        if(this.productionlist.length > 1){
            prod1 = [name, [], function () {
                return [];
            }];
            prod2 = [name, this.productionlist, function () {
                return [].slice.apply(arguments);
            }];
        } else {
            prod1 = [name, [], function () {
                return undefined;
            }];
            prod2 = [name, this.productionlist, function () {
                return arguments[0];
            }];
        }

        additional.push(prod1);
        additional.push(prod2);
        return name;
    };

    function Repeat(){
        if(!(this instanceof Repeat)) return new Repeat(Array.prototype.slice.apply(arguments));
        this.productionlist = arguments[0];
        this.isEBNF = true;
    }

    Repeat.prototype.toBNF = function(_,id, additional){
        //arrange an unique name
        var name = 'Repeat_'+id+'_'+additional.length;

        var prod1 = [name, [], function(){return [];}];
        var prod2 = [name, [name].concat(this.productionlist),
            function(){
                return arguments[0].concat(Array.prototype.slice.call(arguments,1));
            }
        ];
        additional.push(prod1);
        additional.push(prod2);
        return name;
    };

    function Group(){
        if(!(this instanceof Group)) return new Group(Array.prototype.slice.apply(arguments));
        this.productionlist = arguments[0];
        this.isEBNF = true;
    }

    Group.prototype.toBNF = function(_,id,additional){
        var name = 'Group'+id+'_'+additional.length;
        //we must determine if we have alternatives
        var alternatives = [this.productionlist];
        if(this.productionlist.length>1 && Array.isArray(this.productionlist[0])){
            alternatives = this.productionlist;
        }
        junq(alternatives).forEach(function(e){
            var prod;
            if(!Array.isArray(e)) e = [e];
            if(e.length>1){
                prod = [name, e, function () {
                    return Array.prototype.slice.call(arguments);
                }];
            } else {
                prod = [name, e, function () {
                    return arguments[0];
                }];
            }

            additional.push(prod);
        });
        return name;
    };

    function generateParser(grammar){
        var pg = new PG(grammar);
        return pg.generateParser();
    }

    function log(){
        console.log(arguments);
    }

    parser.Parser = Parser;
    parser.generateParser = generateParser;
    parser.Optional = Optional;
    parser.Repeat = Repeat;
    parser.Group = Group;
    //parser.ParserGenerator = PG;
    //PG.LexerAdapter = LexerAdapter;

})(parser || (parser = {}), automata);

if (typeof(module) !== 'undefined') { module.exports = parser; }
