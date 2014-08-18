var StringReader=
    (function (sr,undefined) {
	var StringReader = function StringReader(str){
        if(!(this instanceof StringReader)) return new StringReader(str);
		this.str = str;
		this.pos = 0;
        this.line = 0;
        this.col = 0;
	};

    StringReader.prototype.getPos = function(){
        return this.pos;
    };

	StringReader.prototype.peek = function()
	{
		//TODO: handle EOF
		return this.str.charAt(this.pos);
	};

	StringReader.prototype.eat = function(str)
	{
		var istr = this.str.substring(this.pos,this.pos+str.length);
		if(istr===str){
			this.pos+=str.length;
            this.updatePos(str,1);
		} else {
			throw new Error('Expected "'+str+'", got "'+istr+'"!');
		}
	};

    StringReader.prototype.updatePos = function(str,delta){
        for(var i=0;i<str.length;i++){
            if(str[i]=='\n'){
                this.col=0;
                this.line+=delta;
            }else{
                this.col+=delta;
            }
        }
    };

    StringReader.prototype.rollback = function(str)
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

	StringReader.prototype.next = function()
	{
		var s = this.str.charAt(this.pos);
		this.pos=this.pos+1;
		this.updatePos(s,1);
		return s;
	};

	StringReader.prototype.more = function()
	{
		return this.pos<this.str.length;
	};

    StringReader.prototype.reset = function(){
        this.pos=0;
    };

	return StringReader;
})( );

if (typeof(module) !== 'undefined') { module.exports = StringReader; }