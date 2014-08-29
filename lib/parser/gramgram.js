/**
 * Created by gcannata on 26/08/2014.
 */
//node ./cmd/cmd.js -t ./lib/parser/gramlex.jacoblex -g ./lib/parser/gramgram.js -l ./lib/parser/jacobgramlexer.js -p ./lib/parser/jacobgraminterpreter.js

var parser = parser || require('../lib/parser');
(function() {
    var jacobGramGram = {
        tokens: ['=','|','id',';','Terminal','NonTerminal','(',')','[',']','{','}',',','function'],
        operators:[
            [';','left',100],
            ['|','left',200],
            [',','left',300]
        ],
        productions: [
            ['Grammar', [ parser.Repeat('Rule')],
            function(prods){
                this.productions = prods;
                return prods;
            }],
            ['OperatorDecl',['Op','Terminal', parser.Repeat('Terminal')], function(assoc, symbol, symbols){

                this.operators = this.operators || [];

            }],
            ['Rule', ['id', '=', 'AlternativesWithActions',  ';'],
                function(head,_1,rhs){
                    var ret = environment.junq(rhs).map(function(pa){
                        return [head].concat(pa);
                    });
                return ret.toArray();
            }],
            /*
            ['AlternativesWithActions',['RHS','Action', parser.Repeat(['|', 'RHS', 'Action'])],function(rhs1, act1, list){
                //AlternativesWithActions
                return [rhs1, act1].concat(list);

            }],
            */
            ['AlternativesWithActions',['RHS','Action', 'RHSRepeat'],function(rhs1, act1, list){
                //AlternativesWithActions
                var ret = [[rhs1, act1]];

                return ret.concat(list);

            }],

            ['RHSRepeat',['RHSRepeat','|', 'RHS', 'Action'],function(acc, _, rhs, act){
                //AlternativesWithActions
                acc.push([rhs,act]);
                return acc;

            }],
            ['RHSRepeat',[],function(_){
                //RHSRepeat empty
                return ([]);

            }],
            ['Alternatives',['RHS',parser.Repeat(['|', 'RHS'])],function(rhs1, list){
                //AlternativesWithoutActions
                console.log('AlternativesWithoutActions');
            }],
            ['RHS', ['id'],function(id){
                //id
                console.log('id '+id);
                return id;
            }],
            ['RHS', ['Terminal'],function(terminal){
                //terminal
                console.log('terminal '+terminal);
                this.tokens = (this.tokens || []).concat(terminal);
                return terminal;
            }],
            ['RHS', ['[','RHS',']'],function(_,rhs){

            }],
            ['RHS', ['(','Alternatives',')'],function(_,rhs){

            }],
            ['RHS', ['{','RHS','}'],function(_,rhs){
                //repeat
                console.log('{'+rhs+'}');
                return this._p.Repeat(rhs);
            }],

            ['RHS', ['RHS',',', 'RHS'],function(rhs1,_,rhs2){
                    console.log('concat');
                    return [].concat(rhs1).concat(rhs2);
            }],
            /*
            ['RHS', ['RHS', parser.Optional('Action'),'|', 'RHS'],function(rhs1,_,rhs2){

            }],
            */
            ['Action',['function'],function(action){
                var f = eval('('+action+')');

                console.log('function');
                return f;
            }]
        ],
        moduleName: 'jacobgraminterpreter'
    };

    return jacobGramGram;
})();