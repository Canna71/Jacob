/**
 * Created by gcannata on 22/08/2014.
 */

(function() {
    var JacobLexGrammar = {
        tokens: ['SEPARATOR', 'directive','regex', '=','state','id','actionblock','<','>',','],

        productions: [
            ['LexPec', [parser.Repeat('Directive'),'SEPARATOR',
                        parser.Repeat('Definition'),'SEPARATOR',
                        parser.Repeat('TokenRule')],
                function (directives,_1, definitions,_2, rules) {

                }
            ],
            ['Directive', ['directive', 'id'],
                function (d, id) {
                    this[d] = id;
                }
            ],

                ['Definition', ['id','=', 'regex'],
                    function (def, _, re) {
                        this.definitions = this.definitions || {};
                        this.definitions[def] = re;
                    }
                    ],
            ['TokenRule', ['StatesList',parser.Group(['regex'],['id']), parser.Optional('actionblock')],
                function (state, re, action) {
                    if((typeof state != 'undefined') && state.length===0){
                        state = undefined;
                    }
                    this.tokens = this.tokens || [];
                    var rule = {};
                    rule.regexp = re;
                    rule.state = state;
                    rule.action = undefined;
                    if( (typeof action != 'undefined') && action.length>0){
                        try {
                            rule.action = new Function(action)
                        }catch(e){
                            throw Error(e.toString() + ' in rule ' + this.tokens.length+1);
                        }
                    }
                    this.tokens.push(rule);
                }
            ],
            ['StatesList',['<',parser.Optional('id',parser.Repeat(',','id')),'>'],function(_,list){
                //StatesList
                return env.junq(list).flatmap().odd().toArray();
            }]

        ],
        moduleName: 'JacobLexInterpreter'

    };
    return JacobLexGrammar;
})();