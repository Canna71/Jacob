/**
 * Created by gcannata on 21/08/2014.
 */
var ast = ast || require('../examples//expastclasses');

var parser = parser || require('../lib/parser');
(function() {
    var ExpGrammar = {
        tokens: ['integer', '+', '*', '-', '/', '=', '(', ')', 'id','print'],
        operators:[
            ['+','left',100],
            ['-','left',100],
            ['*','left',200],
            ['/','left',200]
        ],
        productions: [
            ['Program', [parser.Repeat('Statement')],
                function(stmts){return new this.Program(stmts);}
            ],
            ['Statement', ['id', '=', 'Expression'],
                function(id,_,exp){return new this.Assignment(id,exp);}
            ],
            [
                ,
                ['print', 'Expression'],
                function(_, exp){return new this.Print(exp);}
            ],
            ['Expression'
                ,
                ['Expression', '+', 'Expression'],
                function(e1,_, e2){return new this.AddExp(e1,e2);}
            ],
            [
                ,
                ['Expression', '-', 'Expression'],
                function(e1,_, e2){return new this.SubtractExp(e1,e2);}

            ],

            [
                ,
                ['Expression', '*', 'Expression'],
                function(e1,_, e2){return new this.MultiplyExp(e1,e2);}

            ],
            [
                ,
                ['Expression', '/', 'Expression'],
                function(e1,_, e2){return new this.DivideExp(e1,e2);}
            ],
            [
                ,
                ['integer'],
                function(i){return new this.Integer(i);}
            ],
            [
                ,
                ['(', 'Expression', ')'],
                function (_, e) {
                    //Note that we return the wrapped expression
                    return e;
                }
            ],
            [
                ,
                ['id'],
                function(id){return new this.Identifier(id);}
            ]


        ],
        actionMode: 'function',
        moduleName: 'expast'

    };
    return ExpGrammar;
})();