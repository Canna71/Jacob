/**
 * Created by gcannata on 22/08/2014.
 */

var astclasses = astclasses || require('./ExpAstClasses');

astclasses.Program.prototype.eval = function(cxt){
    cxt = cxt || {};
    for(var i=0;i<this.statements.length;i++){
        this.statements[i].eval(cxt);
    }
};

astclasses.Assignment.prototype.eval = function(cxt){
    cxt[this.id] = this.exp.eval(cxt);
};

astclasses.Print.prototype.eval = function(cxt){
    console.log(this.exp.eval(cxt));
};

astclasses.AddExp.prototype.eval = function(cxt){
    return this.e1.eval(cxt)+this.e2.eval(cxt);
};

astclasses.SubtractExp.prototype.eval = function(cxt){
    return this.e1.eval(cxt)-this.e2.eval(cxt);
};

astclasses.MultiplyExp.prototype.eval = function(cxt){
    return this.e1.eval(cxt)*this.e2.eval(cxt);
};

astclasses.DivideExp.prototype.eval = function(cxt){
    return this.e1.eval(cxt)/this.e2.eval(cxt);
};

astclasses.Integer.prototype.eval = function(cxt){
    return this.value;
};

astclasses.Identifier.prototype.eval = function(cxt){
    return cxt[this.name];
};

if (typeof(module) !== 'undefined') { module.exports = astclasses; }