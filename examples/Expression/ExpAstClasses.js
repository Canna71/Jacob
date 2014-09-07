/**
 * Created by gcannata on 22/08/2014.
 */

var ast = {




    Program: function Program(stmts) {
        this.statements = stmts;
    },

    Assignment: function Assignment(id, exp) {
        this.id = id;
        this.exp = exp;
    },

    Print: function Print( exp) {
        this.exp = exp;
    },

    AddExp: function AddExp(e1, e2) {
        this.e1 = e1;
        this.e2 = e2;
    },
    SubtractExp: function SubtractExp(e1, e2) {
        this.e1 = e1;
        this.e2 = e2;
    },
    MultiplyExp: function MultiplyExp(e1, e2) {
        this.e1 = e1;
        this.e2 = e2;
    },
    DivideExp: function DivideExp(e1, e2) {
        this.e1 = e1;
        this.e2 = e2;
    },
    Integer: function Integer(i) {
        this.value = i;
    },
    Identifier: function Identifier(id) {
        this.name = id;
    }

};
if (typeof(module) !== 'undefined') {
    module.exports = ast;
}
