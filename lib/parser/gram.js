/**
 * Created by gcannata on 22/08/2014.
 */
var parser = parser || require('../lib/parser');
(function() {
    var JacobLexGrammar = {
        tokens: ['SEPARATOR', 'directive','regex', '=','state','id','actionblock'],

        productions: [
            ['LexPec', [parser.Repeat('Directive'),'SEPARATOR',
                        parser.Repeat('Definition'),'SEPARATOR',
                        parser.Repeat('TokenRule')],
                function (directives,_1, definitions,_2, rules) {

                }
            ],
            ['Directive', ['directive', '=', 'id'],
                function (d, _, id) {
                    this[d] = id;
                }
            ],

                ['Definition', ['id', 'regex'],
                    function (def, re) {
                        this.definitions = this.definitions || {};
                        this.definitions[def] = re;
                    }
                    ],
            ['TokenRule', [parser.Optional('state'),parser.Group(['regex'],['id']), parser.Optional('actionblock')],
                function (state, re, action) {

                    this.tokens = this.tokens || [];
                    var rule = {};
                    rule.regexp = re;
                    rule.state = state;
                    if( (typeof action != 'undefined') && action.length>0){
                        rule.action = new Function(action);
                    }
                    this.tokens.push(rule);
                }
            ]

        ],
        moduleName: 'JacobLexInterpreter'

    };
    return JacobLexGrammar;
})();