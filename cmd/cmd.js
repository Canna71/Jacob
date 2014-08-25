/**
 * Created by gcannata on 20/08/2014.
 */
var argv = require('minimist')(process.argv.slice(2));

if(!argv.t || !argv.g){
    printUsage();
}
var tokenfile = argv.t;
var grammarfile = argv.g;
var fs = require('fs');

//Generate Lexer

var tokensrc = fs.readFileSync(tokenfile).toString();
var tokenspecs
if(tokenfile.indexOf('.js', tokenfile.length - 3) !== -1){
    tokenspecs= eval(tokensrc);
} else {
    tokenspecs=require('../lib/parser/JacobLex')(tokensrc);
}

var lexersrc = require('../lib/lexer').generateLexer(tokenspecs);
var lexerout = argv.l || tokenspecs.moduleName+'.js';
fs.writeFileSync(lexerout,lexersrc);

//Generate Parser

var grammarsrc = fs.readFileSync(grammarfile).toString();

var grammar = eval(grammarsrc);
var parsersrc = require('../lib/parser').generateParser(grammar);
var parserout = argv.p || grammar.moduleName+'.js';
fs.writeFileSync(parserout,parsersrc);


function printUsage(){
    console.log('Usage: jacob -t <tokens file> -g <grammar file> -l lexerfile -p parserfile')
}