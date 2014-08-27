/**
 * Created by gcannata on 26/08/2014.
 */
//node ./cmd/cmd.js -t ./lib/parser/gramlex.jacoblex -g ./lib/parser/gramgram.js -l ./lib/parser/jacobgramlexer.js -p ./lib/parser/jacobgraminterpreter.js

var parser = parser || require('../lib/parser');
(function() {
    var jacobGramGram = {
        tokens: ['=','|','id',';','Terminal','NonTerminal','(',')','[',']','{','}',','],
        operators:[
            [';','left',100],
            [',','left',200],
            ['|','left',200]
        ],
        productions: [
            ['Grammar', [parser.Repeat('Rule')],
            function(prods){
                return prods;
            }],
            ['Rule', ['id', '=', 'RHS', ';'],
                function(head,_1,rhs){
                return [head, rhs];
            }],
            ['RHS', ['id'],function(id){
                //id
                return id;
            }],
            ['RHS', ['Terminal'],function(terminal){
                //terminal
                return terminal;
            }],
            ['RHS', ['[','RHS',']'],function(_,rhs){

            }],
            ['RHS', ['(','RHS',')'],function(_,rhs){

            }],
            ['RHS', ['{','RHS','}'],function(_,rhs){
                //repeat
                console.log('{'+rhs+'}');
                return this._p.Repeat(rhs);
            }],

            ['RHS', ['RHS',',', 'RHS'],function(rhs1,_,rhs2){

                    return [].concat(rhs1).concat(rhs2);
            }],
            ['RHS', ['RHS','|', 'RHS'],function(rhs1,_,rhs2){

            }]
        ]
    };

    return jacobGramGram;
})();