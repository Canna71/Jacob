var Parser = (function (undefined) {
function Parser(environment){
if(!(this instanceof Parser)) return new Parser(environment);
var env,modules,imports;
env=modules=imports=environment;
this.action={"0":{"0":["reduce",[2,0,10]],"4":["reduce",[2,0,10]],"7":["reduce",[2,0,10]]},"1":{"0":["accept",[]]},"2":{"0":["reduce",[1,1,0]],"4":["shift",[4]],"7":["shift",[5]]},"3":{"0":["reduce",[2,2,11]],"4":["reduce",[2,2,11]],"7":["reduce",[2,2,11]]},"4":{"5":["shift",[6]]},"5":{"4":["shift",[9]],"12":["shift",[8]],"13":["shift",[10]]},"6":{"4":["shift",[9]],"12":["shift",[8]],"13":["shift",[10]]},"7":{"0":["reduce",[3,2,2]],"4":["reduce",[3,2,2]],"7":["reduce",[3,2,2]],"8":["shift",[12]],"9":["shift",[13]],"10":["shift",[14]],"11":["shift",[15]]},"8":{"0":["reduce",[6,1,7]],"4":["reduce",[6,1,7]],"7":["reduce",[6,1,7]],"8":["reduce",[6,1,7]],"9":["reduce",[6,1,7]],"10":["reduce",[6,1,7]],"11":["reduce",[6,1,7]],"14":["reduce",[6,1,7]]},"9":{"0":["reduce",[6,1,8]],"4":["reduce",[6,1,8]],"7":["reduce",[6,1,8]],"8":["reduce",[6,1,8]],"9":["reduce",[6,1,8]],"10":["reduce",[6,1,8]],"11":["reduce",[6,1,8]],"14":["reduce",[6,1,8]]},"10":{"4":["shift",[9]],"12":["shift",[8]],"13":["shift",[10]]},"11":{"0":["reduce",[3,3,1]],"4":["reduce",[3,3,1]],"7":["reduce",[3,3,1]],"8":["shift",[12]],"9":["shift",[13]],"10":["shift",[14]],"11":["shift",[15]]},"12":{"4":["shift",[9]],"12":["shift",[8]],"13":["shift",[10]]},"13":{"4":["shift",[9]],"12":["shift",[8]],"13":["shift",[10]]},"14":{"4":["shift",[9]],"12":["shift",[8]],"13":["shift",[10]]},"15":{"4":["shift",[9]],"12":["shift",[8]],"13":["shift",[10]]},"16":{"8":["shift",[12]],"9":["shift",[13]],"10":["shift",[14]],"11":["shift",[15]],"14":["shift",[21]]},"17":{"0":["reduce",[6,3,3]],"4":["reduce",[6,3,3]],"7":["reduce",[6,3,3]],"8":["reduce",[6,3,3]],"9":["reduce",[6,3,3]],"10":["shift",[14]],"11":["shift",[15]],"14":["reduce",[6,3,3]]},"18":{"0":["reduce",[6,3,4]],"4":["reduce",[6,3,4]],"7":["reduce",[6,3,4]],"8":["reduce",[6,3,4]],"9":["reduce",[6,3,4]],"10":["shift",[14]],"11":["shift",[15]],"14":["reduce",[6,3,4]]},"19":{"0":["reduce",[6,3,5]],"4":["reduce",[6,3,5]],"7":["reduce",[6,3,5]],"8":["reduce",[6,3,5]],"9":["reduce",[6,3,5]],"10":["reduce",[6,3,5]],"11":["reduce",[6,3,5]],"14":["reduce",[6,3,5]]},"20":{"0":["reduce",[6,3,6]],"4":["reduce",[6,3,6]],"7":["reduce",[6,3,6]],"8":["reduce",[6,3,6]],"9":["reduce",[6,3,6]],"10":["reduce",[6,3,6]],"11":["reduce",[6,3,6]],"14":["reduce",[6,3,6]]},"21":{"0":["reduce",[6,3,9]],"4":["reduce",[6,3,9]],"7":["reduce",[6,3,9]],"8":["reduce",[6,3,9]],"9":["reduce",[6,3,9]],"10":["reduce",[6,3,9]],"11":["reduce",[6,3,9]],"14":["reduce",[6,3,9]]}};
this.goto={"0":{"1":1,"2":2},"2":{"3":3},"5":{"6":7},"6":{"6":11},"10":{"6":16},"12":{"6":17},"13":{"6":18},"14":{"6":19},"15":{"6":20}};
this.actions=[function (stmts){ return new imports.Program(stmts);},function (id,_, exp){return new imports.Assignment(id,exp);},function (_,exp){ return new imports.Print(exp);},function (e1, _, e2) {
                                                             return new imports.AddExp(e1,e2);
                                                         },function (e1, _, e2) {
                                                              return new imports.SubtractExp(e1,e2);
                                                          },function (e1, _, e2) {
                                                             return new imports.MultiplyExp(e1,e2);
                                                         },function (e1, _, e2) {
                                                               return new imports.DivideExp(e1,e2);
                                                           },function (i) {
                                             return new imports.Integer(i);
                                         },function (id) {
                                        return new imports.Identifier(id);
                                    },function (_, e) {
                                                         return e;
                                                     },function (){return [];},function (){
                return arguments[0].concat(Array.prototype.slice.call(arguments,1));
            }];
this.startstate=0;
this.symbolsTable={"<<EOF>>":0,"Program":1,"Repeat_0_0":2,"Statement":3,"id":4,"=":5,"Expression":6,"print":7,"PLUS":8,"-":9,"*":10,"/":11,"integer":12,"(":13,")":14};
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
        if(typeof token === 'string')
        {
            throw Error(token);
        }
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