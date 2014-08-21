/**
 * Created by gcannata on 21/08/2014.
 */
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
                function (listOfStatement) {
                    console.log('Executed ' + listOfStatement.length + ' statements');
                }
            ],
            ['Statement', ['id', '=', 'Expression'],
                function (id, _, exp) {
                    this[id] = exp;
                }
            ],
            [
                ,
                ['print', 'Expression'],
                function (_, exp) {
                    console.log(exp);
                }
            ],
            ['Expression'
                ,
                ['Expression', '+', 'Expression'],
                function (e1, _, e2) {
                    return e1 + e2;
                }
            ],
            [
                ,
                ['Expression', '-', 'Expression'],
                function (e1, _, e2) {
                    return e1 - e2;
                }
            ],

            [
                ,
                ['Expression', '*', 'Expression'],
                function (e1, _, e2) {
                    return e1 * e2;
                }
            ],
            [
                ,
                ['Expression', '/', 'Expression'],
                function (e1, _, e2) {
                    return e1 / e2;
                }
            ],
            [
                ,
                ['integer'],
                function (i) {
                    return i;
                }
            ],
            [
                ,
                ['(', 'Expression', ')'],
                function (_, e) {
                    return e;
                }
            ],
            [
                ,
                ['id'],
                function (id) {
                    return this[id];
                }
            ],


        ],
        moduleName: 'expint'

    };
    return ExpGrammar;
})();