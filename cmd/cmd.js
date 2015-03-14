#!/usr/bin/env node
/**
 * Created by gcannata on 20/08/2014.
 */


var argv = require('minimist')(process.argv.slice(2));
var jacob = require('../index');

console.log('JACOB 1.0.5');

if(!argv.t && !argv.g){
    printUsage();
}
var tokenfile = argv.t;
var grammarfile = argv.g;
var fs = require('fs');





if(typeof tokenfile !== 'undefined') {
    //Generate Lexer
    jacob.elaborateLexFile(tokenfile, argv.l);
}


if(typeof grammarfile !== 'undefined') {
    //Generate Parser
    jacob.elaborateGramFile(grammarfile, argv.p);
}

function printUsage(){
    console.log('Usage: jacob -t <tokens file> -g <grammar file> [-l lexerfile] [-p parserfile]')
}