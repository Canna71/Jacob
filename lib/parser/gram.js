/**
 * Created by gcannata on 22/08/2014.
 */
var parser = parser || require('../lib/parser');
(function() {
    var JacobLexGrammar = {
        tokens: ['SEPARATOR', 'directive','lexstring', '=','state'],

        productions: [
            ['LexPec', [parser.Repeat('Directive'),'SEPARATOR',
                        parser.Repeat('Definition'),'SEPARATOR',
                        parser.Repeat('TokenRule')],
                function (directives,_) {

                }
            ],
            ['Directive', ['directive', '=', 'lexstring'],
                function (d, _, id) {
                    this[d] = id;
                }
            ],

                ['Definition', ['lexstring', 'lexstring'],
                    function (def, re) {
                        this.definitions = this.definitions || {};
                        this.definitions[def] = re;
                    }
                    ],
            ['Tokenrule', [parser.Optional('state'),'lexstring', 'lexstring'],
                function (def, re) {
                    this.definitions = this.definitions || {};
                    this.definitions[def] = re;
                }
            ]

        ],
        moduleName: 'JacobLexInterpreter'

    };
    return JacobLexGrammar;
})();