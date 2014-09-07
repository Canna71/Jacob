var JacobGramLexer = (function (undefined) {
function CDFA_base(){
	this.ss=undefined;
	this.as=undefined;
	this.tt=undefined;
this.stt={};
}
CDFA_base.prototype.reset = function (state) {
	this.cs = state || 	this.ss;
this.bol=false;
};
CDFA_base.prototype.readSymbol = function (c) {
	this.cs = this.nextState(this.cs, c);
};
CDFA_base.prototype.isAccepting = function () {
	var acc = this.as.indexOf(this.cs)>=0;
if((this.stt[this.cs]===-1)&&!this.bol){
acc=false;}
return acc;};
CDFA_base.prototype.isInDeadState = function () {
	return this.cs === undefined || this.cs === 0;
};
CDFA_base.prototype.getCurrentToken = function(){
	var t= this.tt[this.cs];
var s=this.stt[this.cs];
if(s!==undefined){return this.bol?t:s;}
return t;};

function CDFA_DEFAULT(){
	this.ss=1;
	this.as=[2,3,4,5,6,7,8,9,10,11,12,13,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39];
	this.tt=[null,null,15,14,14,15,15,15,13,13,7,7,7,7,null,0,3,13,13,7,7,7,8,13,7,7,7,13,6,7,7,13,7,6,13,7,13,7,9,6];
this.stt={};
}
CDFA_DEFAULT.prototype= new CDFA_base();
CDFA_DEFAULT.prototype.nextState = function(state, c){
    var next = 0;
    switch(state){
case 1:
if((c < "\t" || "\n" < c)  && (c < "\r" || "\r" < c)  && (c < " " || " " < c)  && (c < "%" || "%" < c)  && (c < "'" || "'" < c)  && (c < "/" || "9" < c)  && (c < "A" || "Z" < c)  && (c < "_" || "_" < c)  && (c < "a" || "z" < c) ){
next = 2;
} else if(("\t" === c ) || (" " === c )){
next = 3;
} else if(("\n" === c ) || ("\r" === c )){
next = 3;
} else if(("%" === c )){
next = 5;
} else if(("'" === c )){
next = 6;
} else if(("/" === c )){
next = 7;
} else if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "e")  || ("g" <= c && c <= "z") ){
next = 8;
} else if(("f" === c )){
next = 9;
}
break;
case 5:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "k")  || ("m" === c ) || ("o" <= c && c <= "q")  || ("s" <= c && c <= "z") ){
next = 10;
} else if(("l" === c )){
next = 11;
} else if(("n" === c )){
next = 12;
} else if(("r" === c )){
next = 13;
}
break;
case 6:
if((c < "'" || "'" < c)  && (c < "|" || "|" < c) ){
next = 14;
}
break;
case 7:
if(("*" === c )){
next = 15;
} else if(("/" === c )){
next = 16;
}
break;
case 8:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "z") ){
next = 8;
}
break;
case 9:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "t")  || ("v" <= c && c <= "z") ){
next = 8;
} else if(("u" === c )){
next = 18;
}
break;
case 10:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "z") ){
next = 10;
}
break;
case 11:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "d")  || ("f" <= c && c <= "z") ){
next = 10;
} else if(("e" === c )){
next = 19;
}
break;
case 12:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "n")  || ("p" <= c && c <= "z") ){
next = 10;
} else if(("o" === c )){
next = 20;
}
break;
case 13:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "h")  || ("j" <= c && c <= "z") ){
next = 10;
} else if(("i" === c )){
next = 21;
}
break;
case 14:
if((c < "'" || "'" < c)  && (c < "|" || "|" < c) ){
next = 14;
} else if(("'" === c )){
next = 22;
}
break;
case 18:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "m")  || ("o" <= c && c <= "z") ){
next = 8;
} else if(("n" === c )){
next = 23;
}
break;
case 19:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "e")  || ("g" <= c && c <= "z") ){
next = 10;
} else if(("f" === c )){
next = 24;
}
break;
case 20:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "m")  || ("o" <= c && c <= "z") ){
next = 10;
} else if(("n" === c )){
next = 25;
}
break;
case 21:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "f")  || ("h" <= c && c <= "z") ){
next = 10;
} else if(("g" === c )){
next = 26;
}
break;
case 23:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "b")  || ("d" <= c && c <= "z") ){
next = 8;
} else if(("c" === c )){
next = 27;
}
break;
case 24:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "s")  || ("u" <= c && c <= "z") ){
next = 10;
} else if(("t" === c )){
next = 28;
}
break;
case 25:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("b" <= c && c <= "z") ){
next = 10;
} else if(("a" === c )){
next = 29;
}
break;
case 26:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "g")  || ("i" <= c && c <= "z") ){
next = 10;
} else if(("h" === c )){
next = 24;
}
break;
case 27:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "s")  || ("u" <= c && c <= "z") ){
next = 8;
} else if(("t" === c )){
next = 31;
}
break;
case 28:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "z") ){
next = 10;
}
break;
case 29:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "r")  || ("t" <= c && c <= "z") ){
next = 10;
} else if(("s" === c )){
next = 32;
}
break;
case 31:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "h")  || ("j" <= c && c <= "z") ){
next = 8;
} else if(("i" === c )){
next = 34;
}
break;
case 32:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "r")  || ("t" <= c && c <= "z") ){
next = 10;
} else if(("s" === c )){
next = 35;
}
break;
case 34:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "n")  || ("p" <= c && c <= "z") ){
next = 8;
} else if(("o" === c )){
next = 36;
}
break;
case 35:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "n")  || ("p" <= c && c <= "z") ){
next = 10;
} else if(("o" === c )){
next = 37;
}
break;
case 36:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "m")  || ("o" <= c && c <= "z") ){
next = 8;
} else if(("n" === c )){
next = 38;
}
break;
case 37:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "b")  || ("d" <= c && c <= "z") ){
next = 10;
} else if(("c" === c )){
next = 28;
}
break;
case 38:
if(("0" <= c && c <= "9")  || ("A" <= c && c <= "Z")  || ("_" === c ) || ("a" <= c && c <= "z") ){
next = 8;
}
break;
	}
	return next;
};

function CDFA_BLOCKCOMMENT(){
	this.ss=1;
	this.as=[2,3,4,5,6];
	this.tt=[null,null,2,2,2,2,1];
this.stt={};
}
CDFA_BLOCKCOMMENT.prototype= new CDFA_base();
CDFA_BLOCKCOMMENT.prototype.nextState = function(state, c){
    var next = 0;
    switch(state){
case 1:
if((c < "\n" || "\n" < c)  && (c < "\r" || "\r" < c)  && (c < "*" || "*" < c) ){
next = 2;
} else if(("\n" === c )){
next = 2;
} else if(("\r" === c )){
next = 2;
} else if(("*" === c )){
next = 5;
}
break;
case 5:
if(("/" === c )){
next = 6;
}
break;
	}
	return next;
};

function CDFA_LINECOMMENT(){
	this.ss=1;
	this.as=[1,2,3];
	this.tt=[null,4,4,5];
this.stt={};
}
CDFA_LINECOMMENT.prototype= new CDFA_base();
CDFA_LINECOMMENT.prototype.nextState = function(state, c){
    var next = 0;
    switch(state){
case 1:
if((c < "\n" || "\n" < c) ){
next = 2;
} else if(("\n" === c )){
next = 3;
}
break;
case 2:
if((c < "\n" || "\n" < c) ){
next = 2;
}
break;
	}
	return next;
};

function CDFA_FUNCTION(){
	this.ss=1;
	this.as=[1,2,3,4];
	this.tt=[null,10,10,11,12];
this.stt={};
}
CDFA_FUNCTION.prototype= new CDFA_base();
CDFA_FUNCTION.prototype.nextState = function(state, c){
    var next = 0;
    switch(state){
case 1:
if((c < "{" || "{" < c)  && (c < "}" || "}" < c) ){
next = 2;
} else if(("{" === c )){
next = 3;
} else if(("}" === c )){
next = 4;
}
break;
case 2:
if((c < "{" || "{" < c)  && (c < "}" || "}" < c) ){
next = 2;
}
break;
	}
	return next;
};

var EOF={};
function Lexer(){

if(!(this instanceof Lexer)) return new Lexer();

this.pos={line:0,col:0};

this.states={};
this.state = ['DEFAULT'];
this.lastChar = '\n';
this.actions = [function anonymous() {
this.pushState('BLOCKCOMMENT');
},function anonymous() {
this.popState();
},,function anonymous() {
this.pushState('LINECOMMENT');
},,function anonymous() {
this.popState();
},function anonymous() {
 this.jjval = this.jjtext.substring(1); return 'Op';
},function anonymous() {
this.jjval = this.jjtext.substring(1); return 'Directive'; 
},function anonymous() {
 this.jjval = this.jjtext.substring(1,this.jjtext.length-1); return 'Terminal'; 
},function anonymous() {
this.func=this.jjtext;this.blocklevel=0; this.pushState('FUNCTION');
},function anonymous() {
this.func+=this.jjtext;
},function anonymous() {
this.func+=this.jjtext; this.blocklevel++
},function anonymous() {
this.func+=this.jjtext; this.blocklevel--; if(this.blocklevel===0) {this.popState(); this.jjtext = this.jjval = this.func; return 'function'; }
},function anonymous() {
 return 'id'; 
},function anonymous() {
 //mah 
},function anonymous() {
 return this.jjtext; 
}];
this.states["DEFAULT"] = {};
this.states["DEFAULT"].dfa = new CDFA_DEFAULT();
this.states["BLOCKCOMMENT"] = {};
this.states["BLOCKCOMMENT"].dfa = new CDFA_BLOCKCOMMENT();
this.states["LINECOMMENT"] = {};
this.states["LINECOMMENT"].dfa = new CDFA_LINECOMMENT();
this.states["FUNCTION"] = {};
this.states["FUNCTION"].dfa = new CDFA_FUNCTION();
}
Lexer.prototype.setInput=function (input){
        this.pos={row:0, col:0};
        if(typeof input === 'string')
        {input = new StringReader(input);}
        this.input = input;
        this.state = ['DEFAULT'];
        this.lastChar='\n';
        this.getDFA().reset();
        return this;
    };
Lexer.prototype.nextToken=function () {


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
Lexer.prototype.resetToken=function (){
        this.getDFA().reset();
        this.getDFA().bol = (this.lastChar === '\n');
        this.lastValid = undefined;
        this.lastValidPos = -1;
        this.jjtext = '';
        this.remains = '';
        this.buffer = '';
        this.jjline = this.input.line;
        this.jjcol = this.input.col;
    };
Lexer.prototype.halt=function () {
        if (this.lastValidPos >= 0) {
            this.jjtext = this.buffer.substring(0, this.lastValidPos + 1);
            this.remains = this.buffer.substring(this.lastValidPos + 1);
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
Lexer.prototype.more=function (){
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
Lexer.prototype.less=function (length){
        this.input.rollback(length);
    };
Lexer.prototype.getDFA=function (){
        return this.states[this.getState()].dfa;
    };
Lexer.prototype.getAction=function (i){
        return this.actions[i];
    };
Lexer.prototype.pushState=function (state){
        this.state.push(state);
        this.getDFA().reset();
    };
Lexer.prototype.popState=function (){
        if(this.state.length>1) {
            this.state.pop();
            this.getDFA().reset();
        }
    };
Lexer.prototype.getState=function (){
        return this.state[this.state.length-1];
    };
Lexer.prototype.restoreLookAhead=function (){
        this.tailLength = this.jjtext.length;
        this.popState();
        this.less(this.tailLength);
        this.jjtext = this.lawhole.substring(0,this.lawhole.length-this.tailLength);


    };
Lexer.prototype.evictTail=function (length){
        this.less(length);
        this.jjtext = this.jjtext.substring(0,this.jjtext.length-length);
    };
Lexer.prototype.isEOF=function (o){
        return o===EOF;
    }
;
function StringReader(str){
        if(!(this instanceof StringReader)) return new StringReader(str);
		this.str = str;
		this.pos = 0;
        this.line = 0;
        this.col = 0;
	}
StringReader.prototype.getPos=function (){
        return this.pos;
    };
StringReader.prototype.peek=function ()
	{
		//TODO: handle EOF
		return this.str.charAt(this.pos);
	};
StringReader.prototype.eat=function (str)
	{
		var istr = this.str.substring(this.pos,this.pos+str.length);
		if(istr===str){
			this.pos+=str.length;
            this.updatePos(str,1);
		} else {
			throw new Error('Expected "'+str+'", got "'+istr+'"!');
		}
	};
StringReader.prototype.updatePos=function (str,delta){
        for(var i=0;i<str.length;i++){
            if(str[i]=='\n'){
                this.col=0;
                this.line+=delta;
            }else{
                this.col+=delta;
            }
        }
    };
StringReader.prototype.rollback=function (str)
    {
        if(typeof str === 'string')
        {
            var istr = this.str.substring(this.pos-str.length,this.pos);
            if(istr===str){
                this.pos-=str.length;
                this.updatePos(str,-1);
            } else {
                throw new Error('Expected "'+str+'", got "'+istr+'"!');
            }
        } else {
            this.pos-=str;
            this.updatePos(str,-1);
        }

    };
StringReader.prototype.next=function ()
	{
		var s = this.str.charAt(this.pos);
		this.pos=this.pos+1;
		this.updatePos(s,1);
		return s;
	};
StringReader.prototype.more=function ()
	{
		return this.pos<this.str.length;
	};
StringReader.prototype.reset=function (){
        this.pos=0;
    };
if (typeof(module) !== 'undefined') { module.exports = Lexer; }
return Lexer;})();