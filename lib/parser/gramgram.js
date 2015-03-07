/**
 * Created by gcannata on 26/08/2014.
 */
//node ./cmd/cmd.js -t ./lib/parser/gramlex.jacoblex -g ./lib/parser/gramgram.js -l ./lib/parser/jacobgramlexer.js -p ./lib/parser/JacobGramInterpreter.js


(function() {
    var jacobGramGram = {
        tokens: ['=','|','id',';','Terminal','NonTerminal','(',')','[',']','{','}',',','function', 'Op','Directive'],
        operators:[
            [';','left',100],
            ['|','left',200],
            [',','left',300]
        ],
        productions: [
            ['Grammar', [parser.Repeat(parser.Group(['OperatorDecl'],['DirectiveDecl'])), parser.Repeat('Rule')],
            function(operators, prods){
                this.productions = [].concat.apply([],prods);
                return prods;
            }],
            ['OperatorDecl',['Op','Terminal', parser.Repeat('Terminal')], function(assoc, symbol, symbols){

                var symbols = [symbol].concat(symbols);
                this.operators = this.operators || [];
                var max = 0;
                if(this.operators.length>0){
                    max = this.operators[this.operators.length-1][2];
                }
                max = max + 100;
                for(var i=0;i<symbols.length;i++){
                    this.operators.push([symbols[i],assoc,max]);
                }
                return this.operators;
            }],
            ['DirectiveDecl',['Directive', 'id'], function(directive, id){
                this[directive] = id;
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
            ['Alternatives',['RHS',parser.Repeat('|', 'RHS')],function(rhs1, list){
                //AlternativesWithoutActions
                return [rhs1].concat(list);
            }],
            ['RHSAtom', ['id'],function(id){
                //id
                return id;
            }],
            ['RHSAtom', ['Terminal'],function(terminal){
                //terminal

                this.tokens = (this.tokens || []).concat(terminal);
                return terminal;
            }],
            ['RHSAtom', ['[','RHS',']'],function(_,rhs){
                return env.parser.Optional.apply(null,rhs);
            }],
            ['RHSAtom', ['(','Alternatives',')'],function(_,rhs){
                return env.parser.Group.apply(null,env.junq(rhs).odd().toArray());
            }],
            ['RHSAtom', ['{','RHS','}'],function(_,rhs){

                return env.parser.Repeat(rhs);
            }],

            ['RHS', parser.Repeat('RHSAtom'),function(atoms){

                    return atoms;
            }],
            /*
            ['RHS', ['RHS', parser.Optional('Action'),'|', 'RHS'],function(rhs1,_,rhs2){

            }],
            */
            ['Action',[parser.Optional('function')],function(action){
                var f;
                if(typeof action !== 'undefined') {
                    f = eval('(' + action + ')');
                }
                return f;
            }]
        ],
        moduleName: 'JacobGramInterpreter'
    };

    return jacobGramGram;
})();