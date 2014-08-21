/*****************************************************/
/* test editing */
var junq = junq || require('junq');
var sets = sets || require('junq/sets');
//TODO: NFA-to-DFA  construction may  yield  several states  that  cannot reach  any  accepting  state (Dragon Book 195)

var automata;
(function (automata, undefined) {

    var NFA;
    var FIRSTCHAR = '\0';
    automata.FIRSTCHAR = FIRSTCHAR;
    var LASTCHAR = '\uFFFF';
    automata.LASTCHAR = LASTCHAR;

    var falseConstant = function () {
        return false;
    };

    var emptySet = new sets.Set();
    automata.emptySet = emptySet;

    var eps = {
        toString: function () {
            return 'ε'
        },
        match: function (c) {
            return c === this;
        },
        matchChar: falseConstant,
        matchRange: falseConstant,
        matchTerminal: falseConstant,
        matchNonTerminal: falseConstant,
        isRange: falseConstant,
        appendRange: function (r) {
            return r;
        }
    }; //
    automata.eps = eps;

    /*
     var InputChar = (function () {
     function InputChar(character) {
     this.character = character;
     }

     //when match is called the object is the Rule's definition
     InputChar.prototype.match = function (c) {

     if(typeof c === 'string'){
     return this.character === c;
     }
     return c.matchChar(this);
     //return this.character === c;
     };

     //when matchRange and matchChar are called, the object is an actual input
     //and the argument is the Rule we are trying to match
     InputChar.prototype.matchRange = function (range) {
     return  range.from <= this.character && this.character <= range.to;
     };

     InputChar.prototype.matchChar = function (c) {
     return this.character === c.character;
     };

     InputChar.prototype.toString = function () {
     return this.character.toString();
     };

     InputChar.prototype.isRange = function () {
     return false;
     };

     InputChar.prototype.appendRange = function (ranges) {
     ranges.push(new InputRange(this.character, this.character));
     return ranges;
     };
     return InputChar;

     })();
     automata.InputChar = InputChar;
     */

    var InputRange = (function () {
        function InputRange(from, to, negate) {
            if (from <= to) {
                this.from = from;
                this.to = to;
            } else {
                this.from = to;
                this.to = from;
            }
            if(negate !== undefined){
                this.negate = negate;
            } else {
                this.negate = false;
            }

        }

        InputRange.prototype.clone = function(){
            "use strict";
            var ret = new InputRange(this.from,this.to,this.negate);
            if(this.next){
                ret.next = this.next.clone();
            }
            return ret;
        };

        //when match is called the object is the Rule's definition
        InputRange.prototype.match = function (c) {

            if (typeof c === 'string') {
                c = new InputRange(c, c);
            }
            if (c == eps) return false;

            return c.matchRange(this);

        };
        //when matchRange and matchChar are called, the object is an actual input
        //and the argument is the Rule we are trying to match
        //TODO: multiple negation are not Working!!!
        InputRange.prototype.matchRange = function (range) {

            var result = false;
            if (range.from <= this.from && this.to <= range.to)
            {   //the input is comprised in the range
                //no need to check the other ranges
                return !range.negate;
            } else {
                //this input doesn't match the input
                //we must still check other ranges if available
                result = range.negate;
            }

            if (range.next)
                return this.matchRange(range.next);
            return result;
        };

        InputRange.prototype.matchChar = function (c) {
            if (this.from === c.character && this.to === c.character)
                return true;
            if (this.next)
                return this.next.matchChar(range);
            return false;
        };

        InputRange.prototype.toString = function () {
            return '[' + this.toStringInternal()
                + ']';
        };

        InputRange.prototype.toDebug = function () {
            var str = this.from.charCodeAt(0)+' - '+this.to.charCodeAt(0);
            if(this.next !== undefined){
                return str+', '+this.next.toDebug();
            } else return str;
        };

        //This toString is a bit complicated but helps debugging
        InputRange.prototype.toStringInternal = function () {
            var str  = '';
            if ( this.from === FIRSTCHAR)
            {
                var lower = this;
                var upper = lower.next;
                while(upper){
                    var a = String.fromCharCode(lower.to.charCodeAt(0)+1);
                    var b = String.fromCharCode(upper.from.charCodeAt(0)-1);
                    str = str + '^'+a+'-'+b;
                     lower = upper;
                     upper = lower.next;
                }

            }
            
            if(str.length===0) {
                str = str + ((this.from < this.to) ? this.from + '-' + this.to : this.from);
                if (this.next) return str + this.next.toStringInternal();
            }

            

            return str;
        };

        InputRange.prototype.compile = function () {
            var str = '';
            if (this.from === FIRSTCHAR) {
                var lower = this;
                var upper = lower.next;
                while (upper) {
/*                    var a = String.fromCharCode(lower.to.charCodeAt(0) + 1);
                    var b = String.fromCharCode(upper.from.charCodeAt(0) - 1);*/

                    var a = lower.to.charCodeAt(0)+1;
                    var b = upper.from.charCodeAt(0)-1;

                    a = String.fromCharCode(a);
                    b = String.fromCharCode(b);
                    //str = str + '^'+a+'-'+b;
                    //TODO: we could use char codes here.
                    //str = str + "(c < " + JSON.stringify(a) + " && " + JSON.stringify(b) + " < c) ";
                    if(str.length>0){
                        str = str+" && ";
                    }
                    //str = str + "(c.charCodeAt(0) < "+ a + " || "+ b + " < c.charCodeAt(0)) ";
                    str = str + "(c < "+ JSON.stringify(a) + " || "+ JSON.stringify(b) + " < c) ";
                        lower = upper;
                    upper = lower.next;
                }

            }


            if (str.length === 0) {
                //TODO: consider equals
                if (this.to === this.from) {
                    str = str + '(' + JSON.stringify(this.from) + ' === c )';
                } else {
                    str = str + "(" + JSON.stringify(this.from) + " <= c && c <= " + JSON.stringify(this.to) + ") ";
                }

                if (this.next) return str + ' || ' + this.next.compile();
            }


            return str;
        };

        InputRange.prototype.isRange = function () {
            return true;
        };

        InputRange.prototype.overlaps = function (other) {
            return this.to >= other.from && this.from <= other, to;
        };

        InputRange.prototype.append = function (range) {
            //The append method is actually trying to merge multiple ranges into one, if possible
            //First check if one set is inside the other:
            if(this.from <= range.from && range.to <= this.to){
                //the range to append is included in this, do nothing
                return;
            }
            if(range.from <= this.from && this.to <= range.to){
                //it's the other way around
                this.from = range.from;
                this.to = range.to;
                return;
            }
            //check if the two ranges are head-to-tail (there should be no overlapping but better safe than sorry)
            if ((this.to === range.from) || (this.to.charCodeAt(0) + 1 === range.from.charCodeAt(0))) {
                this.to = range.to;

            } else if ((range.to === this.from) || (range.to.charCodeAt(0) + 1 === this.from.charCodeAt(0))) {
                this.from = range.from;
            }
            else if (!this.next) {
                this.next = range;
            }
            else {
                this.next.append(range);
            }

        };

        /*        InputRange.prototype.getEnumerator = function (range) {
         var current = this;
         return {
         moveNext: function(){
         if(!current) return false;

         },
         getCurrent: function(){

         }

         }
         };*/

        InputRange.prototype.appendRange = function (ranges) {
            if(!this.negate) {
                ranges.push(this);
            } else {
                var lower = new automata.InputRange(automata.FIRSTCHAR,String.fromCharCode((this.from.charCodeAt(0)-1)),true);
                var upper = new automata.InputRange(String.fromCharCode((this.to.charCodeAt(0)+1)),automata.LASTCHAR,true);
                ranges.push(lower);
                ranges.push(upper);
            }
            if (this.next)
                return this.next.appendRange(ranges);
            return ranges;
        };


        return InputRange;
    })();
    automata.InputRange = InputRange;

    var State = (function () {

        var stateSeq = 1;

        function State(id, label) {
            if (id !== undefined) {
                this.id = id;
            } else {
                this.id = stateSeq++;
            }
            if (label !== undefined) {
                this.label = label;
            }
        }

        State.prototype.toString = function () {
            return this.id.toString();
        };
        return State;
    })();
    automata.State = State;

    var Target = (function () {
        function Target() {
            this.states = arguments;
        }

        return Target;
    })();
    automata.Target = Target;


    var Rule = (function () {
        function Rule(state, input, next) {
            this.state = state;
            this.input = input;
            this.next = next;
        }

        Rule.prototype.appliesTo = function (state, input) {
            //return this.state == state && this.input == input;


            return this.state === state && this.input.match(input);
        };

        Rule.prototype.toString = function () {
            return this.state.toString() + '\t\t->\t\t' + this.input.toString() + '\t\t->\t\t' + this.next.toString();
        };

        return Rule;
    })();
    automata.Rule = Rule;

    var RuleBook = (function () {
        function RuleBook(rules) {
            this.rules = rules;
        }

        function findElementalIntervals(ranges) {
            //computes a list of extremes
            if (ranges.length < 2) return ranges;
            var points = [];
            var intervals = [];
            var code;
            junq(ranges).forEach(function (r) {
                points.push({val: r.from, dir: +1});
                points.push({val: r.to, dir: -1});
            });
            //sort them
            points.sort(function (a, b) {
                if (a.val < b.val) {
                    return -1;
                }
                if (a.val > b.val) {
                    return +1;
                }
                return (b.dir - a.dir);
            });
            var np = points.length - 1;
            var ni = 0;
            for (var i = 0; i < np; i++) {
                var cur = points[i], fol = points[i + 1];
                var from, to;
                ni += cur.dir; //we count the intervals along

                //+1 -1: [ ]
                //+1 +1: [ [
                //-1 -1: ] ]
                //-1 +1: ] [ (*)

                //TODO: guard against going overboard!
                if (cur.dir > 0) {
                    from = cur.val;

                } else { //cur.dir<0
                    if(cur.val===LASTCHAR) continue;
                    //if(cur.val === LASTCHAR) cur.val = '\uFFFE'
                    from = String.fromCharCode(cur.val.charCodeAt(0) + 1);
                }

                if (fol.dir > 0) {
                    code = fol.val.charCodeAt(0);
                    if(code===0) continue;
                    //if(code === 1) code = 1;
                    to = String.fromCharCode(code - 1);
                } else { //fol.dir<0
                    to = fol.val;
                }
                if (from <= to && (ni > 0 || cur.dir > 0 || fol.dir < 0)) {
                    var newInt;

                    //if(from<to)
                    newInt = new InputRange(from, to);
                    //else
                    //    newInt= new InputChar(from);
                    intervals.push(newInt);
                }

            }

            return intervals;
        }

        automata.findElementalIntervals = findElementalIntervals;

        function splitRanges(ranges) {
            if (ranges.lenth < 2) return ranges;
            sortRanges(ranges);

            var i = 1;
            while (i < ranges.length) {
                if (ranges[i].from <= ranges[i - 1].to) {

                    //calculate itersection
                    var subs = intersectRanges(ranges[i - 1], ranges[i]);

                    //remove the overlapping ranges
                    ranges.splice(i - 1, 2);
                    for (var j = subs.length - 1; j >= 0; j--) {
                        ranges.splice(i - 1, 0, subs[j]);
                    }
                    sortRanges(ranges);


                } else {
                    i++;
                }

            }

            return ranges;
        }


        function intersectRanges(a, b) {
            res = [];
            var is = new InputRange(b.from, a.to < b.to ? a.to : b.to);
            res.push(is);
            var isless1 = String.fromCharCode(is.from.charCodeAt(0) - 1);
            if (a.from <= isless1) {
                res.push(new InputRange(a.from, isless1));
            }
            var isplus1 = String.fromCharCode(is.to.charCodeAt(0) + 1);

            var rx = a.to < b.to ? b.to : a.to;

            if (isplus1 <= rx) {
                res.push(new InputRange(isplus1, rx));
            }
            //sortRanges(res);
            return res;
        }

        function sortRanges(ranges) {
            ranges.sort(function (a, b) {
                if (a.from < b.from) {
                    return -1;
                }
                if (a.from > b.from) {
                    return 1;
                }
                //look right extreme
                if (a.to < b.to) {
                    return -1;
                }
                if (a.to > b.to) {
                    return 1;
                }
                return 0;
            });
        }

        RuleBook.prototype.match = function (state, input) {

            return junq(this.rules).first(function (rule) {
                return rule.appliesTo(state, input);
            });
        };


        RuleBook.prototype.nextState = function (state, input) {
            var rule = this.match(state, input);
            if (rule === undefined) {
                //throw new Error('No transition on state ' + state + ' on input ' + input);
                return undefined;
            }
            return rule.next;
        };

        RuleBook.prototype.toString = function () {
            return junq(this.rules).map(function (rule) {
                return rule.toString();
            }).toArray().join('\r\n');
        };

        RuleBook.prototype.getSymbols = function () {

            var ranges =
                junq(this.rules)
                    .filter(function (rule) {
                        return ((rule.input !== automata.eps) /* && !(rule.input.negate)*/);
                    })
                    .map(function (rule) {
                        return rule.input;
                    })
                    .aggregate(function (ranges, s) {
                        s.appendRange(ranges);
                        //s.push(ranges)
                        return ranges;
                    }, []);
            var elemental = findElementalIntervals(ranges);
            return elemental;
        };

        return RuleBook;
    })();
    automata.RuleBook = RuleBook;

    var NDRuleBook = (function () {
        function NDRuleBook(rules) {
            this.rules = rules;
        }

        NDRuleBook.prototype = new RuleBook();

        NDRuleBook.prototype.match = function (states, input) {
            var self = this;
            var rules = junq(states).map(
                function (state) {
                    return junq(self.rules).filter(function (rule) {
                        return rule.appliesTo(state, input);
                    })
                }
            ).flatmap();

            return rules;
        };


        NDRuleBook.prototype.nextState = function (states, input) {
            return this.match(states, input).map(
                function (rule) {
                    return rule.next;
                }
            );
        };


        return NDRuleBook;
    })();
    automata.NDRuleBook = NDRuleBook;

    var DFA = (function () {
        function DFA(specs) {
            if(specs !== undefined){
                this.rulebook = specs.rulebook;
                this.acceptstates = specs.acceptstates;
                this.currentstate = this.startstate = specs.startstate;
                this.alphabet = specs.alphabet;
                this.tokenTable = specs.tokenTable;
                this.secondaryTokenTable = specs.secondaryTokenTable;
            } else {
                //no specs, used as prototype?
            }

        }

        DFA.prototype.readSymbol = function (symbol) {
            this.currentstate = this.rulebook.nextState(this.currentstate, symbol);
            return this;
        };

        DFA.prototype.nextState = function (state,symbol) {
            return this.rulebook.nextState(state, symbol);
        };

        DFA.prototype.isAccepting = function () {
            var accepting = junq(this.acceptstates).contains(this.currentstate);
            if((this.secondaryTokenTable[this.currentstate] === -1)//means this rule is bol and no secondar available
                && !this.bol)
                accepting=false;
            return accepting;
        };

        DFA.prototype.isInDeadState = function () {
            return this.currentstate === undefined || this.currentstate === 0;
        };

        DFA.prototype.readString = function (str) {
            var self = this;
            if (str.length > 0) {
                /*junq(str).forEach(function (c) {
                 self.readSymbol(c);
                 });*/
                for (var i = 0, l = str.length; i < l; i++) {
                    if (this.isInDeadState()) return;
                    self.readSymbol(str.charAt(i));
                }
            }

        };

        DFA.prototype.getCurrentToken = function () {
            if (this.tokenTable !== undefined) {
                var token = this.tokenTable[this.currentstate];
                var secondary = this.secondaryTokenTable[this.currentstate];
                if(secondary !== undefined){
                    //means token is bol
                    if(this.bol) return token;
                    else return secondary;
                }
                return token;
            }
        };

        DFA.prototype.reset = function (state) {
            this.currentstate = state || this.startstate;
            this.bol = false;
            return this;
        };

        DFA.prototype.getRules = function () {
            return this.rulebook.rules;
        };

        DFA.prototype.getStatesWithTransisions = function () {
            return new sets.Set(junq(this.rulebook.rules)
                .map(function (rule) {
                    return rule.state;
                }));
        };

        DFA.prototype.getStates = function () {
            return new sets.Set(junq(this.rulebook.rules)
                .flatmap(function (rule) {
                    return [rule.state,rule.next];
                }));
        };

        DFA.prototype.matches = function (str) {
            this.reset();
            this.readString(str);
            return this.isAccepting();
        };

        DFA.prototype.toString = function () {
            return "startstate: " + this.startstate.toString() + '\t\t\t\t' +
                "acceptstates: " + this.acceptstates.toString() + '\r\n' +
                "currentstate: " + (this.currentstate ? this.currentstate.toString() : '∅') + '\t\t\t accepting: ' + this.isAccepting() + '\r\n' +
                '*************** Rules *********************\r\n' +
                'From\tinput\tTo\r\n' +
                this.rulebook.toString() +
                "\r\n********************************";
        };

        DFA.prototype.invert = function () {
            var start;
            var invertedRules = junq(this.getRules())
                .map(function (rule) {
                    return new Rule(rule.next, rule.input, rule.state);
                });
            /*if(this.acceptstates.length>1)*/
            {
                start = new State();
                invertedRules = invertedRules.append(junq(this.acceptstates).map(function (as) {
                        return new Rule(start, eps, as);
                    }))
                    .append(junq(this.acceptstates).map(function (as) {
                        return new Rule(as, eps, start);
                    }));
            }
            /*else {
             start = this.acceptstates;
             }*/
            invertedRules = invertedRules.toArray();
            var acceptstates = [this.startstate];
            var invNFA = new NFA(new NDRuleBook(invertedRules), acceptstates, start);
            if(this.logEnabled) {
                console.log(invNFA.toString());
            }
            return invNFA.toDFA();
        };

        DFA.prototype.minimize = function () {
            var self = this;
            //start with a partition accepting, non accepting
            var part = [];
            //group 0 is non final states
            part[0] = this.getStates().subtract(new sets.Set(this.acceptstates)).toArray();
            //we have to distinguish finals by their token id
            var tg = {};

            for(var i= 0;i< this.acceptstates.length;i++){
                var as = this.acceptstates[i];
                var tokenid = this.tokenTable[ as];
                (tg[tokenid] = tg[tokenid] || []).push(as);
            }
            for(var prop in tg){
                part.push(tg[prop]);
            }
            //part[1] = this.acceptstates;
            var ab = this.alphabet;
            //var ab = this.rulebook.getSymbols();
            var pm = new Partition(part, ab, this.rulebook);
            pm.partitionGroups();
            if (!pm.isMinimal()) {
                //gets the partitions and mess with the states
                junq(part).where(function (group) {
                    return group.length > 1;
                })
                    .forEach(function (group) {
                        self.identifyStates(group[0], group.slice(1))
                    });
            }
        };

        DFA.prototype.identifyStates = function (representative, others) {
            var self = this;
            //we can make all of s2’s
            //incoming edges point to s1 instead and delete s2
            //that is s -> input -> S2 becomes
            //        a -> input -> S1
            // and we delete all s2 -> *
            junq(others).forEach(function (s2) {
                junq(self.getRules()).where(function (rule) {
                    return rule.next === s2
                })
                    .forEach(function (rule) {
                        rule.next = representative;
                    });
                self.rulebook.rules = junq(self.getRules()).where(function (rule) {
                    return rule.state !== s2;
                }).toArray();
            });

        };

        DFA.prototype.compileBase = function(classname){
            this.source = [];
            var specs = {className: classname || 'CDFAbase'};
            this.compileCtor(specs);
            this.compilStdMethods(specs);
            //this.compileStateSwitch(specs);
            return this.source.join('');
        };

        DFA.prototype.compile = function(specs){
            this.source = [];

            //this.emit('function (){\r\n');

            specs = specs || {};
            specs.className = specs.className || 'CDFA';
            specs.baseClass = specs.baseClass || 'CDFAbase';
            this.compileCtor(specs);

            this.emit(specs.className+'.prototype= new '+specs.baseClass+'();\n')

            this.compileStateSwitch(specs);

            //this.emit('return new '+specs.className +'();\r\n');
            //this.emit('}');
            return this.source.join('');
        };

        DFA.prototype.emit = function(code){
            this.source.push(code);
        };

        DFA.prototype.compileCtor = function(specs){
            this.emit('function '+ specs.className+ '(){\n\tthis.ss=');
            this.emit(this.startstate + ';\n\tthis.as=');
            this.emit(JSON.stringify(this.acceptstates)+';\n\tthis.tt=');
            this.emit(JSON.stringify(this.tokenTable)+';\n');
            var stt={};
            if(this.secondaryTokenTable!==undefined){
                for(var i=0;i<this.secondaryTokenTable.length;i++){
                    if(this.secondaryTokenTable[i]!==undefined){
                        stt[i]=this.secondaryTokenTable[i];
                    }
                }
            }
            this.emit('this.stt='+JSON.stringify(stt)+';\n');

            this.emit('}\n');
        };

        DFA.prototype.compilStdMethods = function(specs){
            this.emit(specs.className+".prototype.reset = function (state) {\n\tthis.cs = state || \tthis.ss;\nthis.bol=false;\n};\n" +
                specs.className+".prototype.readSymbol = function (c) {\n\tthis.cs = this.nextState(this.cs, c);\n};\n" +
                specs.className+".prototype.isAccepting = function () {\n\tvar acc = this.as.indexOf(this.cs)\x3E=0;\nif((this.stt[this.cs]===-1)&&!this.bol){\nacc=false;}\nreturn acc;};\n" +
                specs.className+".prototype.isInDeadState = function () {\n\treturn this.cs === undefined || this.cs === 0;\n};\n" +
                specs.className+".prototype.getCurrentToken = function(){\n\tvar t= this.tt[this.cs];\nvar s=this.stt[this.cs];\nif(s!==undefined){return this.bol?t:s;}\nreturn t;};\n"

            );
        };

        DFA.prototype.compileStateSwitch = function(specs){
            this.emit(specs.className+'.prototype.nextState = function(state, c){\n    var next = 0;\n    switch(state){\n');
            var self=this,rules, i,rl;
            junq(this.getStatesWithTransisions()).forEach(function(state){
                self.emit('case '+state+':\n');
                rules = junq(self.rulebook.rules).where(function(rule){return rule.state===state;}).toArray();
                for(i=0,rl=rules.length;i<rl;i++){
                    self.emit('if(');
                    self.compileRule(rules[i]);

                    self.emit('){\n');

                    self.emit('next = '+rules[i].next);

                    self.emit(';\n}');
                    if(i<rl-1){
                        self.emit(' else ');
                    }
                }

                self.emit('\nbreak;\n')
            });
            this.emit('\t}\n\treturn next;\n};\n');
        };

        DFA.prototype.compileRule = function(rule){
            var str = rule.input.compile();
            this.emit(str);
        };


        function Partition(part, ab, rb) {
            this.part = part;
            this.ab = ab;
            this.rb = rb;
        }

        Partition.prototype.getGroup = function (state) {

            for (var i = 0; i < this.part.length; i++) {
                var j = this.part[i].indexOf(state);
                if (j >= 0) return i;
            }
        };

        Partition.prototype.partitionGroups = function () {
            var done = false;
            do {
                done = false;
                for (var i = 0, pl = this.part.length; i < pl; i++) {
                    done = done || this.partitionGroup(i);
                }
            } while (done)

        };

        Partition.prototype.partitionGroup = function (i) {
            var group = this.part[i];
            var dg;
            var self = this;
            var done = false;
            //debugger;
            for(var c = 0,abl=this.ab.length;c<abl;c++)
            {
                var inp = this.ab[c];
                dg = {};
                for (var j = 0; j < group.length; j++) {
                    var st = self.rb.nextState(group[j], inp);
                    //determine the group of this state st
                    var g = self.getGroup(st);
                    //we store in dg the group in which the current input directs the state
                    //dg[j] = g;
                    //if(typeof(g) !== 'undefined')
                    (dg[g] = dg[g] || []).push(group[j]);


                }
                //see if dg has more than one property
                var n = 0;
                for (var prop in dg) {
                    n++
                }

                if (n > 1) {//we can distinguish some states
                    //let's split group i:
                    self.part.splice(i, 1);
                    for (prop in dg) {
                        self.part.splice(i, 0, dg[prop]);
                    }
                    done = true;
                    break;
                }


            }
            return done;
        };

        Partition.prototype.isMinimal = function () {
            for (var i = 0, n = this.part.length; i < n; i++) {
                if (this.part[i].length > 1) return false;
            }
            return true;
        };


        return DFA;
    })();
    automata.DFA = DFA;

    NFA = (function () {
        function NFA(specs) {
            DFA.apply(this, arguments);
            //ensure acceptstates and startstatesì are set
            this.acceptstates = new sets.Set(specs.acceptstates);
            this.startstate = specs.startstate;
            this.currentstate = this.epsClosure(this.startstate);
        }

        NFA.prototype = new DFA();

        NFA.prototype.readSymbol = function (symbol) {

            //this.currentstate = new sets.Set(this.rulebook.nextState(this.currentstate, symbol));
            //this.currentstate = this.epsClosure(this.currentstate);
            this.currentstate = this.lexEdge(this.currentstate, symbol);
            return this;
        };

        NFA.prototype.lexEdge = function (state, symbol) {
            var states = new sets.Set(this.rulebook.nextState(state, symbol));
            state = this.epsClosure(states);
            return state;
        };

        NFA.prototype.isAccepting = function () {
            return !this.currentstate.intersect(this.acceptstates).isEmpty();
        };


        NFA.prototype.epsClosure2 = function (state) {
            //finds all state reached from current state(s) with epsilon moves
            var S = state;
            if (!sets.isSet(S)) S = new sets.Set(S);
            do {
                var S1 = S.clone();
                S = new sets.Set(this.rulebook.nextState(S1, automata.eps)).union(S1);
            }
            while (!S.equalTo(S1));


            return S;
        };

        NFA.prototype.epsClosure = function (state) {
            state = sets.isSet(state) ? state : new sets.Set(state);
            var states = state.toArray();
            var eps = state.clone();
            while (states.length > 0) {
                var t = states.pop();
                this.rulebook.nextState(t, automata.eps).forEach(function (u) {
                    if (!eps.contains(u)) {
                        eps.add(u);//TODO: avoid having to check twice for u being in the set
                        states.push(u);
                    }


                });
            }
            return eps;
        };

        NFA.prototype.reset = function (state) {
            this.currentstate = this.epsClosure(state || this.startstate);
            return this;
        };

        //junq(symbols2).forEach(function(s){console.log(s.from.charCodeAt(0)+'-'+s.to.charCodeAt(0));})


        NFA.prototype.toDFA = function () {
            var lex;
            var rb;
            var j, self, nstates;
            var startstate;
            var rules;
            var acceptstates;
            var states = [];
            var tokentable = [];
            var secondarytokentable = [];
            states[0] = emptySet;
            states[1] = this.epsClosure(this.startstate);
            rules = [];
            startstate = 1;
            acceptstates = [];
            j = 1;
            self = this;
                var ab = this.alphabet;
/*                junq(ab).forEach(function(s){console.log(s.from.charCodeAt(0)+'-'+s.to.charCodeAt(0));})
                ab = this.rulebook.getSymbols();
                junq(ab).forEach(function(s){console.log(s.from.charCodeAt(0)+'-'+s.to.charCodeAt(0));})*/
            while (j < states.length) {

                junq(ab).forEach(function (c) {
                    var next;
                    var e = self.lexEdge(states[j], c);

                    next = undefined;
                    for (var i = 0, sl = states.length; i < sl; i++) {
                        if (e.equalTo(states[i])) { // we must use sets equality
                            next = i;
                            break;
                        }
                    }
                    if (next === undefined) {
                        next = states.push(e) - 1;
                    }

                    //add transition if not to the empty state
                    if (next > 0) {
                        //clone input because merge rule will actually modify the ranges concatenating them.
                        //This could cause infinite loops if a range is reinserted in a different position
                        var cc = c.clone !== undefined ? c.clone() : c;
                        var rule = new Rule(j, cc, next);

                        mergeRule(rule, rules);
                        if(this.logEnabled)
                            console.log(rule.toString());
                    }
                });
                j++;
            }
            nstates = states.length;
            for (var i = 1; i < nstates; i++) {

                /*
                var final = junq(this.acceptstates).first(function(as){
                    "use strict";
                    return states[i].contains(as);
                });
                */
                var acceptStates = junq(this.acceptstates).where(function(as){
                    return states[i].contains(as);
                }).toArray();
                var final = acceptStates[0];

                var secondary = junq(acceptStates.slice(1)).first(function(as){
                    return !(as.bol);
                });
                //var finals = states[i].intersect(this.acceptstates);
                if (final !== undefined) {
                    //this state contains at least one accept state.
                    //Here we take the higher in rank
                    acceptstates.push(i);
                    tokentable[i] = final.tokenid;
                    if(final.bol ){//the corresponding rule is matched only at begginning-of-line
                        secondarytokentable[i] = secondary ? secondary.tokenid : -1;
                    }
                }
            }

            rb = new RuleBook(rules);
            var ret = {
                rulebook: rb,
                acceptstates: acceptstates,
                startstate: startstate,
                tokenTable: tokentable,
                secondaryTokenTable: secondarytokentable,
                statesTable: states
            };

            //automata = new DFA(specs);
            //automata.tokenTable = tokentable;
/*            if(this.logEnabled) {
                for (i = 0; i < states.length; i++) {
                    console.log('Dstate ' + i + ' corresponds to NFA states ' + states[i].toString());
                }
            }
            if(specs.savestates){
                automata.statesTable = states;
            }*/
            return ret;
        };

        var mergeRule = function (rule, rules) {
            "use strict";
            var existing = junq(rules).first(function (r) {
                return r.state === rule.state && r.next === rule.next;
            });
            if (existing) {
/*                console.log('merging existing '+existing.input.toDebug()
                    + ' with ' + rule.input.toDebug());*/
                
                existing.input.append(rule.input);
//                console.log('result: '+existing.input.toDebug());
            
            }
            else {
                rules.push(rule);
            }


        };


        return NFA;
    })();
    automata.NFA = NFA;



})(automata || (automata = {}));

if (typeof(module) !== 'undefined') { module.exports = automata; }


