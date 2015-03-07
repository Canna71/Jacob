var JacobGramInterpreter = (function (undefined) {
function Parser(environment){
if(!(this instanceof Parser)) return new Parser(environment);
var env = environment;
this.action={"0":{"0":["reduce",[2,0,15]],"5":["reduce",[2,0,15]],"9":["reduce",[2,0,15]],"10":["reduce",[2,0,15]]},"1":{"0":["accept",[]]},"2":{"0":["reduce",[3,0,17]],"5":["shift",[7]],"9":["shift",[8]],"10":["reduce",[3,0,17]]},"3":{"0":["reduce",[1,2,0]],"10":["shift",[10]]},"4":{"0":["reduce",[2,2,16]],"5":["reduce",[2,2,16]],"9":["reduce",[2,2,16]],"10":["reduce",[2,2,16]]},"5":{"0":["reduce",[30,1,27]],"5":["reduce",[30,1,27]],"9":["reduce",[30,1,27]],"10":["reduce",[30,1,27]]},"6":{"0":["reduce",[30,1,28]],"5":["reduce",[30,1,28]],"9":["reduce",[30,1,28]],"10":["reduce",[30,1,28]]},"7":{"6":["shift",[11]]},"8":{"10":["shift",[12]]},"9":{"0":["reduce",[3,2,18]],"10":["reduce",[3,2,18]]},"10":{"12":["shift",[13]]},"11":{"0":["reduce",[7,0,19]],"5":["reduce",[7,0,19]],"6":["reduce",[7,0,19]],"9":["reduce",[7,0,19]],"10":["reduce",[7,0,19]]},"12":{"0":["reduce",[8,2,2]],"5":["reduce",[8,2,2]],"9":["reduce",[8,2,2]],"10":["reduce",[8,2,2]]},"13":{"6":["reduce",[28,0,23]],"10":["reduce",[28,0,23]],"14":["reduce",[28,0,23]],"18":["reduce",[28,0,23]],"22":["reduce",[28,0,23]],"23":["reduce",[28,0,23]],"24":["reduce",[28,0,23]],"25":["reduce",[28,0,23]],"26":["reduce",[28,0,23]],"27":["reduce",[28,0,23]],"31":["reduce",[28,0,23]]},"14":{"0":["reduce",[4,3,1]],"5":["reduce",[4,3,1]],"6":["shift",[18]],"9":["reduce",[4,3,1]],"10":["reduce",[4,3,1]]},"15":{"14":["shift",[19]]},"16":{"14":["reduce",[29,0,25]],"18":["reduce",[29,0,25]],"31":["shift",[22]]},"17":{"6":["shift",[25]],"10":["shift",[24]],"14":["reduce",[15,1,13]],"18":["reduce",[15,1,13]],"22":["shift",[26]],"23":["reduce",[15,1,13]],"24":["shift",[27]],"25":["reduce",[15,1,13]],"26":["shift",[28]],"27":["reduce",[15,1,13]],"31":["reduce",[15,1,13]]},"18":{"0":["reduce",[7,2,20]],"5":["reduce",[7,2,20]],"6":["reduce",[7,2,20]],"9":["reduce",[7,2,20]],"10":["reduce",[7,2,20]]},"19":{"0":["reduce",[11,4,3]],"10":["reduce",[11,4,3]]},"20":{"14":["reduce",[17,0,6]],"18":["reduce",[17,0,6]]},"21":{"14":["reduce",[16,1,14]],"18":["reduce",[16,1,14]]},"22":{"14":["reduce",[29,1,26]],"18":["reduce",[29,1,26]]},"23":{"6":["reduce",[28,2,24]],"10":["reduce",[28,2,24]],"14":["reduce",[28,2,24]],"18":["reduce",[28,2,24]],"22":["reduce",[28,2,24]],"23":["reduce",[28,2,24]],"24":["reduce",[28,2,24]],"25":["reduce",[28,2,24]],"26":["reduce",[28,2,24]],"27":["reduce",[28,2,24]],"31":["reduce",[28,2,24]]},"24":{"6":["reduce",[21,1,8]],"10":["reduce",[21,1,8]],"14":["reduce",[21,1,8]],"18":["reduce",[21,1,8]],"22":["reduce",[21,1,8]],"23":["reduce",[21,1,8]],"24":["reduce",[21,1,8]],"25":["reduce",[21,1,8]],"26":["reduce",[21,1,8]],"27":["reduce",[21,1,8]],"31":["reduce",[21,1,8]]},"25":{"6":["reduce",[21,1,9]],"10":["reduce",[21,1,9]],"14":["reduce",[21,1,9]],"18":["reduce",[21,1,9]],"22":["reduce",[21,1,9]],"23":["reduce",[21,1,9]],"24":["reduce",[21,1,9]],"25":["reduce",[21,1,9]],"26":["reduce",[21,1,9]],"27":["reduce",[21,1,9]],"31":["reduce",[21,1,9]]},"26":{"6":["reduce",[28,0,23]],"10":["reduce",[28,0,23]],"14":["reduce",[28,0,23]],"18":["reduce",[28,0,23]],"22":["reduce",[28,0,23]],"23":["reduce",[28,0,23]],"24":["reduce",[28,0,23]],"25":["reduce",[28,0,23]],"26":["reduce",[28,0,23]],"27":["reduce",[28,0,23]],"31":["reduce",[28,0,23]]},"27":{"6":["reduce",[28,0,23]],"10":["reduce",[28,0,23]],"14":["reduce",[28,0,23]],"18":["reduce",[28,0,23]],"22":["reduce",[28,0,23]],"23":["reduce",[28,0,23]],"24":["reduce",[28,0,23]],"25":["reduce",[28,0,23]],"26":["reduce",[28,0,23]],"27":["reduce",[28,0,23]],"31":["reduce",[28,0,23]]},"28":{"6":["reduce",[28,0,23]],"10":["reduce",[28,0,23]],"14":["reduce",[28,0,23]],"18":["reduce",[28,0,23]],"22":["reduce",[28,0,23]],"23":["reduce",[28,0,23]],"24":["reduce",[28,0,23]],"25":["reduce",[28,0,23]],"26":["reduce",[28,0,23]],"27":["reduce",[28,0,23]],"31":["reduce",[28,0,23]]},"29":{"14":["reduce",[13,3,4]],"18":["shift",[34]]},"30":{"23":["shift",[35]]},"31":{"25":["shift",[36]]},"32":{"18":["reduce",[20,0,21]],"25":["reduce",[20,0,21]]},"33":{"27":["shift",[38]]},"34":{"6":["reduce",[28,0,23]],"10":["reduce",[28,0,23]],"14":["reduce",[28,0,23]],"18":["reduce",[28,0,23]],"22":["reduce",[28,0,23]],"23":["reduce",[28,0,23]],"24":["reduce",[28,0,23]],"25":["reduce",[28,0,23]],"26":["reduce",[28,0,23]],"27":["reduce",[28,0,23]],"31":["reduce",[28,0,23]]},"35":{"6":["reduce",[21,3,10]],"10":["reduce",[21,3,10]],"14":["reduce",[21,3,10]],"18":["reduce",[21,3,10]],"22":["reduce",[21,3,10]],"23":["reduce",[21,3,10]],"24":["reduce",[21,3,10]],"25":["reduce",[21,3,10]],"26":["reduce",[21,3,10]],"27":["reduce",[21,3,10]],"31":["reduce",[21,3,10]]},"36":{"6":["reduce",[21,3,11]],"10":["reduce",[21,3,11]],"14":["reduce",[21,3,11]],"18":["reduce",[21,3,11]],"22":["reduce",[21,3,11]],"23":["reduce",[21,3,11]],"24":["reduce",[21,3,11]],"25":["reduce",[21,3,11]],"26":["reduce",[21,3,11]],"27":["reduce",[21,3,11]],"31":["reduce",[21,3,11]]},"37":{"18":["shift",[40]],"25":["reduce",[19,2,7]]},"38":{"6":["reduce",[21,3,12]],"10":["reduce",[21,3,12]],"14":["reduce",[21,3,12]],"18":["reduce",[21,3,12]],"22":["reduce",[21,3,12]],"23":["reduce",[21,3,12]],"24":["reduce",[21,3,12]],"25":["reduce",[21,3,12]],"26":["reduce",[21,3,12]],"27":["reduce",[21,3,12]],"31":["reduce",[21,3,12]]},"39":{"14":["reduce",[29,0,25]],"18":["reduce",[29,0,25]],"31":["shift",[22]]},"40":{"6":["reduce",[28,0,23]],"10":["reduce",[28,0,23]],"14":["reduce",[28,0,23]],"18":["reduce",[28,0,23]],"22":["reduce",[28,0,23]],"23":["reduce",[28,0,23]],"24":["reduce",[28,0,23]],"25":["reduce",[28,0,23]],"26":["reduce",[28,0,23]],"27":["reduce",[28,0,23]],"31":["reduce",[28,0,23]]},"41":{"14":["reduce",[17,4,5]],"18":["reduce",[17,4,5]]},"42":{"18":["reduce",[20,3,22]],"25":["reduce",[20,3,22]]}};
this.goto={"0":{"1":1,"2":2},"2":{"3":3,"4":5,"8":6,"30":4},"3":{"11":9},"11":{"7":14},"13":{"13":15,"15":16,"28":17},"16":{"16":20,"29":21},"17":{"21":23},"20":{"17":29},"26":{"15":30,"28":17},"27":{"15":32,"19":31,"28":17},"28":{"15":33,"28":17},"32":{"20":37},"34":{"15":39,"28":17},"39":{"16":41,"29":21},"40":{"15":42,"28":17}};
this.actions=[function (operators, prods){
                this.productions = [].concat.apply([],prods);
                return prods;
            },function (assoc, symbol, symbols){

                var symbols = [symbol].concat(symbols);
                this.operators = this.operators || [];
                var max = 0;
                if(this.operators.length>0){
                    max = this.operators[this.operators.length-1][2];
                }
                max = max + 100;
                for(var i=0;i<symbols.length;i++){
                    this.operators.push([symbols[i],assoc,max]);
                }
                return this.operators;
            },function (directive, id){
                this[directive] = id;
            },function (head,_1,rhs){
                    var ret = environment.junq(rhs).map(function(pa){
                        return [head].concat(pa);
                    });
                return ret.toArray();
            },function (rhs1, act1, list){
                //AlternativesWithActions
                var ret = [[rhs1, act1]];

                return ret.concat(list);

            },function (acc, _, rhs, act){
                //AlternativesWithActions
                acc.push([rhs,act]);
                return acc;

            },function (_){
                //RHSRepeat empty
                return ([]);

            },function (rhs1, list){
                //AlternativesWithoutActions
                return [rhs1].concat(list);
            },function (id){
                //id
                return id;
            },function (terminal){
                //terminal

                this.tokens = (this.tokens || []).concat(terminal);
                return terminal;
            },function (_,rhs){
                return env.parser.Optional.apply(null,rhs);
            },function (_,rhs){
                return env.parser.Group.apply(null,env.junq(rhs).odd().toArray());
            },function (_,rhs){

                return env.parser.Repeat(rhs);
            },function (atoms){

                    return atoms;
            },function (action){
                var f;
                if(typeof action !== 'undefined') {
                    f = eval('(' + action + ')');
                }
                return f;
            },function (){return [];},function (){
                return arguments[0].concat(Array.prototype.slice.call(arguments,1));
            },function (){return [];},function (){
                return arguments[0].concat(Array.prototype.slice.call(arguments,1));
            },function (){return [];},function (){
                return arguments[0].concat(Array.prototype.slice.call(arguments,1));
            },function (){return [];},function (){
                return arguments[0].concat(Array.prototype.slice.call(arguments,1));
            },function (){return [];},function (){
                return arguments[0].concat(Array.prototype.slice.call(arguments,1));
            },function () {
                return undefined;
            },function () {
                return arguments[0];
            },function () {
                    return arguments[0];
                },function () {
                    return arguments[0];
                }];
this.startstate=0;
this.symbolsTable={"<<EOF>>":0,"Grammar":1,"Repeat_0_0":2,"Repeat_0_2":3,"OperatorDecl":4,"Op":5,"Terminal":6,"Repeat_1_4":7,"DirectiveDecl":8,"Directive":9,"id":10,"Rule":11,"=":12,"AlternativesWithActions":13,";":14,"RHS":15,"Action":16,"RHSRepeat":17,"|":18,"Alternatives":19,"Repeat_7_6":20,"RHSAtom":21,"[":22,"]":23,"(":24,")":25,"{":26,"}":27,"Repeat_13_8":28,"Optional_14_10":29,"Group16_0":30,"function":31};
this.actionMode='function';
}
Parser.prototype.identity=function (x) {
        "use strict";
        return x;
    };
Parser.prototype.parse=function (lexer, context) {
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
Parser.prototype.shift=function (state) {
        "use strict";
        this.stack.push({s: state, i: this.a});
        this.a = this.lexer.nextToken();

    };
Parser.prototype.reduce=function (head, length, prodindex) {
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
Parser.prototype.accept=function () {
        "use strict";
        this.accepted = true;
    };
Parser.prototype.error=function (token){
        if(this.lexer.isEOF(token)){
            throw Error("Unexpected EOF at "+this.lexer.jjline+':'+this.lexer.jjcol);
        } else
        throw Error('Unexpected token '+token.name+' "'+token.lexeme+'" at ('+token.pos.line+':'+token.pos.col+')');
    };
Parser.prototype.create=function (ctor,args){
        var args = [this.context].concat(args);
        var factory = ctor.bind.apply(ctor,args);
        return new factory();
    };
if (typeof(module) !== 'undefined') { module.exports = Parser; }
return Parser;
})();