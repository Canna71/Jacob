/**
 * Created by gcannata on 20/08/2014.
 */

var argv = require('minimist')(process.argv.slice(2));
var jacob = require('../index');

if(!argv.t && !argv.g){
    printUsage();
}
var tokenfile = argv.t;
var grammarfile = argv.g;
var fs = require('fs');
var path = require('path');


function elaborateLexFile(tokenfile, outfile) {
    var tokensrc = fs.readFileSync(tokenfile).toString();
    var tokenspecs;
    if (tokenfile.indexOf('.js', tokenfile.length - 3) !== -1) {
        tokenspecs = eval(tokensrc);
    } else {
        tokenspecs = tokensrc;
    }

    var lexersrc = jacob.generateLexerSource(tokenspecs);
    var lexerout = outfile || path.join(path.dirname(tokenfile), (tokenspecs.moduleName || path.basename(tokenfile)+'.out') + '.js');

    fs.writeFileSync(lexerout, lexersrc);
}

if(typeof tokenfile !== 'undefined') {
//Generate Lexer
    elaborateLexFile(tokenfile, argv.l);
}

function elaborateGramFile(grammarfile, outfile) {
    var grammarsrc = fs.readFileSync(grammarfile).toString();
    var grammar;
    if (grammarfile.indexOf('.js', grammarfile.length - 3) !== -1) {
        grammar = eval(grammarsrc);
    } else {
        grammar = grammarsrc;
    }

    var parsersrc = jacob.generateParserSource(grammar);
    var parserout = outfile || path.join(path.dirname(grammarfile), ( grammar.moduleName || path.basename(grammarfile)+'.out') + '.js');
    console.log(parserout);
    fs.writeFileSync(parserout, parsersrc);
}
if(typeof grammarfile !== 'undefined') {
    //Generate Parser
    elaborateGramFile(grammarfile, argv.p);
}

function printUsage(){
    console.log('Usage: jacob -t <tokens file> -g <grammar file> [-l lexerfile] [-p parserfile]')
}