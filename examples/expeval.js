/**
 * Created by gcannata on 22/08/2014.
 */
var ast = ast || require('./expastclasses');

ast.Program.prototype.eval = function(cxt){
    cxt = cxt || {};
    for(var i=0;i<this.statements.length;i++){
        this.statements[i].eval(cxt);
    }
};

ast.Assignment.prototype.eval = function(cxt){
    cxt[this.id] = this.exp.eval(cxt);
};

ast.Print.prototype.eval = function(cxt){
    console.log(this.exp.eval(cxt));
};

ast.AddExp.prototype.eval = function(cxt){
    return this.e1.eval(cxt)+this.e2.eval(cxt);
};

ast.SubtractExp.prototype.eval = function(cxt){
    return this.e1.eval(cxt)-this.e2.eval(cxt);
};

ast.MultiplyExp.prototype.eval = function(cxt){
    return this.e1.eval(cxt)*this.e2.eval(cxt);
};

ast.DivideExp.prototype.eval = function(cxt){
    return this.e1.eval(cxt)/this.e2.eval(cxt);
};

ast.Integer.prototype.eval = function(cxt){
    return this.value;
};

ast.Identifier.prototype.eval = function(cxt){
    return cxt[this.name];
};