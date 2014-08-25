var JacobLexInterpreter = (function (undefined) {
function Parser(){
if(!(this instanceof Parser)) return new Parser();
this.action={"0":{"3":["reduce",[2,0,4]],"7":["reduce",[2,0,4]]},"1":{"0":["accept",[]]},"2":{"3":["shift",[3]],"7":["shift",[5]]},"3":{"3":["reduce",[4,0,6]],"9":["reduce",[4,0,6]]},"4":{"3":["reduce",[2,2,5]],"7":["reduce",[2,2,5]]},"5":{"8":["shift",[7]]},"6":{"3":["shift",[8]],"9":["shift",[10]]},"7":{"9":["shift",[11]]},"8":{"0":["reduce",[5,0,8]],"9":["reduce",[5,0,8]],"11":["reduce",[5,0,8]],"16":["reduce",[5,0,8]]},"9":{"3":["reduce",[4,2,7]],"9":["reduce",[4,2,7]]},"10":{"11":["shift",[13]]},"11":{"3":["reduce",[6,3,1]],"7":["reduce",[6,3,1]]},"12":{"0":["reduce",[1,5,0]],"9":["reduce",[13,0,10]],"11":["reduce",[13,0,10]],"16":["shift",[16]]},"13":{"3":["reduce",[10,2,2]],"9":["reduce",[10,2,2]]},"14":{"0":["reduce",[5,2,9]],"9":["reduce",[5,2,9]],"11":["reduce",[5,2,9]],"16":["reduce",[5,2,9]]},"15":{"9":["shift",[19]],"11":["shift",[18]]},"16":{"9":["reduce",[13,1,11]],"11":["reduce",[13,1,11]]},"17":{"0":["reduce",[15,0,14]],"9":["reduce",[15,0,14]],"11":["reduce",[15,0,14]],"16":["reduce",[15,0,14]],"17":["shift",[21]]},"18":{"0":["reduce",[14,1,12]],"9":["reduce",[14,1,12]],"11":["reduce",[14,1,12]],"16":["reduce",[14,1,12]],"17":["reduce",[14,1,12]]},"19":{"0":["reduce",[14,1,13]],"9":["reduce",[14,1,13]],"11":["reduce",[14,1,13]],"16":["reduce",[14,1,13]],"17":["reduce",[14,1,13]]},"20":{"0":["reduce",[12,3,3]],"9":["reduce",[12,3,3]],"11":["reduce",[12,3,3]],"16":["reduce",[12,3,3]]},"21":{"0":["reduce",[15,1,15]],"9":["reduce",[15,1,15]],"11":["reduce",[15,1,15]],"16":["reduce",[15,1,15]]}};
this.goto={"0":{"1":1,"2":2},"2":{"6":4},"3":{"4":6},"6":{"10":9},"8":{"5":12},"12":{"12":14,"13":15},"15":{"14":17},"17":{"15":20}};
this.actions=[function (directives,_1, definitions,_2, rules) {

                },function (d, _, id) {
                    this[d] = id;
                },function (def, re) {
                        this.definitions = this.definitions || {};
                        this.definitions[def] = re;
                    },function (state, re, action) {

                    this.tokens = this.tokens || [];
                    var rule = {};
                    rule.regexp = re;
                    rule.state = state;
                    if( (typeof action != 'undefined') && action.length>0){
                        rule.action = new Function(action);
                    }
                    this.tokens.push(rule);
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
                },function () {
                return undefined;
            },function () {
                return arguments[0];
            }];
this.startstate=0;
this.symbolsTable={"<<EOF>>":0,"LexPec":1,"Repeat_0_0":2,"SEPARATOR":3,"Repeat_0_2":4,"Repeat_0_4":5,"Directive":6,"directive":7,"=":8,"id":9,"Definition":10,"regex":11,"TokenRule":12,"Optional_3_6":13,"Group3_8":14,"Optional_3_10":15,"state":16,"actionblock":17};
this.actionMode='function';
}
Parser.prototype.identity=function (x) {
        "use strict";
        return x;
    };
Parser.prototype.parse=function (lexer, context) {
        this.stack = [];
        this.context =  context || {};
        //TODO: maybe introduce a facade literal
        /*
        this.context.__parser__ = this;
        this.context.__lexer__ = lexer;
        */
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
        throw Error('Unexpected token "'+token.lexeme+'" at ('+token.pos.line+':'+token.pos.col+')');
    };
Parser.prototype.create=function (ctor,args){
        var args = [this.context].concat(args);
        var factory = ctor.bind.apply(ctor,args);
        return new factory();
    };
if (typeof(module) !== 'undefined') { module.exports = Parser; }
return Parser;
})();