/**
 * Created by gcannata on 18/08/2014.
 */

var lexer = require('./lib/lexer');
var parser = require('./lib/parser');

exports.lexer = lexer;
exports.parser = parser;
exports.StringReader =  require('./lib/stringreader');

function generateLexerSource(jacoblex){

    var tokenspecs;
    if(typeof jacoblex === 'string'){
        tokenspecs = require('./lib/parser/JacobLex')(jacoblex);
    } else {
        tokenspecs = jacoblex;
    }

    return lexer.generateLexer(tokenspecs);
}
exports.generateLexerSource = generateLexerSource;

function elaborateLexFile(tokenfile, outfile) {
    var fs = fs || require('fs');
    var path = require('path');
    var tokensrc = fs.readFileSync(tokenfile).toString();
    var tokenspecs;
    if (tokenfile.indexOf('.js', tokenfile.length - 3) !== -1) {
        tokenspecs = eval(tokensrc);
    } else {
        tokenspecs = tokensrc;
    }

    var lexersrc = generateLexerSource(tokenspecs);
    var lexerout = outfile || path.join(path.dirname(tokenfile), (tokenspecs.moduleName || path.basename(tokenfile)+'.out') + '.js');
    console.log('Generated file '+lexerout);
    fs.writeFileSync(lexerout, lexersrc);
}
exports.elaborateLexFile = elaborateLexFile;



function generateParserSource(jacobgram){
    var parserspecs;
    if(typeof  jacobgram === 'string'){
        parserspecs = require('./lib/parser/JacobGram')(jacobgram);
    } else {
        parserspecs = jacobgram;
    }

    return parser.generateParser(parserspecs);
}

exports.generateParserSource = generateParserSource;

function elaborateGramFile(grammarfile, outfile) {
    var fs = fs || require('fs');
    var path = require('path');
    var grammarsrc = fs.readFileSync(grammarfile).toString();
    var grammar;
    if (grammarfile.indexOf('.js', grammarfile.length - 3) !== -1) {
        grammar = eval(grammarsrc);
    } else {
        grammar = grammarsrc;
    }

    var parsersrc = generateParserSource(grammar);
    var parserout = outfile || path.join(path.dirname(grammarfile), ( grammar.moduleName || path.basename(grammarfile)+'.out') + '.js');
    console.log('Generated file '+parserout);
    fs.writeFileSync(parserout, parsersrc);
}

exports.elaborateGramFile = elaborateGramFile;