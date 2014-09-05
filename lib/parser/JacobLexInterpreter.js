var JacobLexInterpreter = (function (undefined) {
function Parser(environment){
if(!(this instanceof Parser)) return new Parser(environment);
var env = environment;
this.action={"0":{"3":["reduce",[2,0,5]],"7":["reduce",[2,0,5]]},"1":{"0":["accept",[]]},"2":{"3":["shift",[3]],"7":["shift",[5]]},"3":{"3":["reduce",[4,0,7]],"8":["reduce",[4,0,7]]},"4":{"3":["reduce",[2,2,6]],"7":["reduce",[2,2,6]]},"5":{"8":["shift",[7]]},"6":{"3":["shift",[8]],"8":["shift",[10]]},"7":{"3":["reduce",[6,2,1]],"7":["reduce",[6,2,1]]},"8":{"0":["reduce",[5,0,9]],"16":["reduce",[5,0,9]]},"9":{"3":["reduce",[4,2,8]],"8":["reduce",[4,2,8]]},"10":{"10":["shift",[12]]},"11":{"0":["reduce",[1,5,0]],"16":["shift",[15]]},"12":{"11":["shift",[16]]},"13":{"0":["reduce",[5,2,10]],"16":["reduce",[5,2,10]]},"14":{"8":["shift",[19]],"11":["shift",[18]]},"15":{"8":["shift",[21]],"18":["reduce",[17,0,15]]},"16":{"3":["reduce",[9,3,2]],"8":["reduce",[9,3,2]]},"17":{"0":["reduce",[15,0,13]],"16":["reduce",[15,0,13]],"19":["shift",[23]]},"18":{"0":["reduce",[14,1,11]],"16":["reduce",[14,1,11]],"19":["reduce",[14,1,11]]},"19":{"0":["reduce",[14,1,12]],"16":["reduce",[14,1,12]],"19":["reduce",[14,1,12]]},"20":{"18":["shift",[24]]},"21":{"18":["reduce",[20,0,17]],"21":["reduce",[20,0,17]]},"22":{"0":["reduce",[12,3,3]],"16":["reduce",[12,3,3]]},"23":{"0":["reduce",[15,1,14]],"16":["reduce",[15,1,14]]},"24":{"8":["reduce",[13,3,4]],"11":["reduce",[13,3,4]]},"25":{"18":["reduce",[17,2,16]],"21":["shift",[26]]},"26":{"8":["shift",[27]]},"27":{"18":["reduce",[20,3,18]],"21":["reduce",[20,3,18]]}};
this.goto={"0":{"1":1,"2":2},"2":{"6":4},"3":{"4":6},"6":{"9":9},"8":{"5":11},"11":{"12":13,"13":14},"14":{"14":17},"15":{"17":20},"17":{"15":22},"21":{"20":25}};
this.actions=[function (directives,_1, definitions,_2, rules) {

                },function (d, id) {
                    this[d] = id;
                },function (def, _, re) {
                        this.definitions = this.definitions || {};
                        this.definitions[def] = re;
                    },function (state, re, action) {
                    if((typeof state != 'undefined') && state.length===0){
                        state = undefined;
                    }
                    this.tokens = this.tokens || [];
                    var rule = {};
                    rule.regexp = re;
                    rule.state = state;
                    rule.action = undefined;
                    if( (typeof action != 'undefined') && action.length>0){
                        try {
                            rule.action = new Function(action)
                        }catch(e){
                            throw Error(e.toString() + ' in rule ' + this.tokens.length+1);
                        }
                    }
                    this.tokens.push(rule);
                },function (_,list){
                //StatesList
                return env.junq(list).flatmap().odd().toArray();
            },function (){return [];},function (){
                return arguments[0].concat(Array.prototype.slice.call(arguments,1));
            },function (){return [];},function (){
                return arguments[0].concat(Array.prototype.slice.call(arguments,1));
            },function (){return [];},function (){
                return arguments[0].concat(Array.prototype.slice.call(arguments,1));
            },function () {
                    return arguments[0];
                },function () {
                    return arguments[0];
                },function () {
                return undefined;
            },function () {
                return arguments[0];
            },function () {
                return [];
            },function () {
                return [].slice.apply(arguments);
            },function (){return [];},function (){
                return arguments[0].concat(Array.prototype.slice.call(arguments,1));
            }];
this.startstate=0;
this.symbolsTable={"<<EOF>>":0,"LexPec":1,"Repeat_0_0":2,"SEPARATOR":3,"Repeat_0_2":4,"Repeat_0_4":5,"Directive":6,"directive":7,"id":8,"Definition":9,"=":10,"regex":11,"TokenRule":12,"StatesList":13,"Group3_6":14,"Optional_3_8":15,"<":16,"Optional_4_10":17,">":18,"actionblock":19,"Repeat_16_0":20,",":21};
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