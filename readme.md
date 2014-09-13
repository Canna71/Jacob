# JACOB
 Possibly Acronym for: JAvascript COmpiler Bison-like
 Or maybe even Just Another Compiler to OBjects

Jacob is a tool like Flex and Bison to generate interpreters or compilers. This can be used for example to create a DSL (domain specific language) to be used in NodeJS or in the browser.
 
Generating a language interpreter (or compiler) involves two steps: 
 1. aggregate the input characters into a series of "tokens": this is done by a module called "lexer"
 2. interpreting the series of tokens as a language, according to a grammar, this is done by a module called "parser".
 
Also, you will define an actual behaviour which is the semantic of the language, that is, what the program should do according to a language statement.
 
Given appropiate instructions, Jacob will generate both the lexer and the parser. We'll see how to specify the actual behaviour of your parser.

Usage
=====
From a command line to generate the lexer use the following command line:

`jacob -t tokens.jacoblex [-l lexer.js]`

The `-t` argument specify the token specifications file, the optional `-l` parameter specify the name of the generated file. For the token specification file extension you can use whatever extension you want (here I used .jacoblex) except .js since .js file will be interpreted as javascript modules containing the internal representation of the tokens. You could also use this instead of the lexer language descripted later, this will be documented in the future.

Analogously to generate the parser you would use:

`jacob -g grammar.jacobgram [-p parser.js]`

Usually you'll generate both modules with just one invocation:

`jacob -t tokens.jacoblex [-l lexer.js] -g grammar.jacobgram [-p parser.js]`




Lexer
=====

In order for Jacob to create a lexer you have to provide it with a .jacoblex file which looks something like the following:

```[JavaSCript]

%moduleName MyLexer

%%

digits = [0-9]

%%
<>{digits}*\.{digits}+    {
    this.jjval = parseFloat(this.jjtext);
    return 'float';
}

<>{digits}+   {
    this.jjval = parseInt(this.jjtext);
    return 'integer';
}

<>print {
  return 'print';
}

<>\w+ { return 'id'; }

<>\s* { }

<>.   { return this.jjtext; }

<>$   { console.log('EOF'); return 'EOF'; }
```

The syntax is similar to Flex's, with some differences.
The file is split in three areas, separated by a double percent. In the first area are the directives. The only currently supported is %moduleName, which allow you to specify the name of the generated module.

The second section contains definitions, that allows you to assign names to regular expressions.

The third section contains the actual ules. In order to recognize a token, you specify the regular expression that matches it, and then assign it an action.

Take for example the following:
```[JavaSCript]
<>\w+ { return 'id'; }
```

The double angled brakets are used to specify (optional) starting state of the rule (more on that later), in this case the rule is active in the DEFAULT state. 
The regular expression `\w+` matches one or more alphanumeric chars. 
The associated action (between curly braces) is a javascript function that should return the name of the matched token.
This name is the name that can then be used in the grammar file.

Regular Expressions Syntax
=======================

Jacob implements most, if not all, the regular expressions mechanism found in most lexer, including forward lookahead.
Here is a summary:

| pattern | description |
|---------|-------------|
| x       | matches character 'x' |
| . | matches any character except newline |
| [xyz] | this is a character class: it matches either 'x','y' or 'z' |
| [a-f] | character class with range: it matches every character from 'a' to 'f' included |
| [^a-f] | range negation: matches everything BUT 'a'-'f' |
| r* | matches 0 or more times the regular expression r |
| r+ | matches 1 or more times r |
| r? | matches 0 or 1 r |
| r{2,5} | matches from 2 to 5 r |
| r{2,} | matches 2 or more r |
| r{,5} | matches from 0 to 5 r |
| r{4} | matches r exactly 4 times |
| {digits} | matches the definition named 'digits' |
| \X | '\' is the escape character, can be used to insert character like '\n','\r','\t' or to escape regex special character like \* |
| \x2a | matches character with hex code 2a |
| \u2103 | matches unicode character U+2103 |
| rs | the regular expression r followed by the regular expresson s |
| r&#124;s | either r or s |
| r/s | lookahead: matches r only if it is followed by s |
| ^r | matches r only at the beginning of a line |
| r$ | matches r only at the end of a line |
| ab(cd)* | matches ab, abdc, abcdcd, abcdcdcd ecc. |




Lexer Actions
============
In the actions you should specify what the lexer should do after recognizing a token. The simplest action is the empty one;

`<>\s* { }`

This is useful to ignore a given input. Since the action won't return any token name, the lexer will continue processing the input without outputting any token for the matched content, thus in fact ignoring that input. In the example above the whitespace is ignored.

Another common situation is having to parse the input to have a meaningful token:
```[JAvaScript]
<>{digits}+   {
    this.jjval = parseInt(this.jjtext);
    return 'integer';
}
```
Inside actions, this points to the lexer itself. In the lexer `jjtext` contains the text that the regular expression matched. `jjval` by default contains the same text as`jjtext` but you can change it inside an action. In the example above the text is parsed to get an integer value, which is then stored in `jjval`.
Note that `jjval` is the value that is used in the parsing phase by your interpreter/compiler.
Another powerful thing you could do inside an action is to change the lexer's state. Take this example:

```[JavaScript]
<>\/\*    {this.pushState('BLOCKCOMMENT');}
<BLOCKCOMMENT>\*\/    {this.popState();}
<BLOCKCOMMENT>(\n|\r|.) {}
```

When the lexer encounters a `/*` sequence, it will enter a BLOCKCOMMENT state because of the action `this.pushState('BLOCKCOMMENT');`. In this state, the only active rules art the ones in which the state list (the list inside angular brackets) contains the BLOCKCOMMENT identifier. So while the lexer is in BLOCKCOMMENT state, it whill ignore any character because of the rule `(\n|\r|.) {}`
The only way to change the state is to encounter a `*/` sequence in which the action `this.popState();` while resume the state that was active before encountering the first `/*` sequence.
The previous rules thus can be used to ignore block comments with a C-like syntax.

Here is a table of all the members of the generated lexer that are available for you inside the actions:

| member | description |
|--------|-------------|
| jjtext | the text matched by the regex |
| jjval | the value of the current token, by default the same as jjtext |
| jjpos | the position of the current token inside the input string |
| less(n)| this function can be called to push back n character into the input stream |
| isEOF()| returns true if the input is at the end |

Of courser the generated Lexer is a JavaScript object, so you can dynamically add any member or method you need in your actions.


Parser
======

In order to generate a parser you need to give Jacob the specification file containing an attributed grammar which describes the language you want to interpret/compile. Simply put, the grammar file will contains the grammar rules and the actions that the parser must execute after recognizing each rule.
Jacob can generate **SLR**, **LALR** and **LR1** parser type. If not specified, Jacob will choose the most appropiate parser type given the grammar.

Here is an example of a jacob grammar file:


```[Javascript]
%moduleName MyParser

%left 'PLUS' '-'
%left '*' '/'

Program = { Statement } function(){};

Statement = 'id' '=' Expression function(id,_, exp){this[id] = exp;}
            | 'print' Expression function(_,exp){ console.log(exp);} ;

Expression = Expression 'PLUS' Expression  function (e1, _, e2) {
                                                             return e1 + e2;
                                                         }
            | Expression '-' Expression function (e1, _, e2) {
                                                              return e1 - e2;
                                                          }
            | Expression '*' Expression function (e1, _, e2) {
                                                             return e1 * e2;
                                                         }
             | Expression '/' Expression function (e1, _, e2) {
                                                               return e1 / e2;
                                                           }
             | 'integer'  function (i) {
                                             return i;
                                         }
             | 'id'  function (id) {
                                        return this[id];
                                    }
             | '(' Expression ')'   function (_, e) {
                                                         return e;
                                                     }

;

```

Directives
----------
At the top of the file you define directives, those can be:

`%moduleName <name>` sets the name of the generated module

`%mode SLR|LALR|LR1` sets the type of the generated parser. If not provided the simplest type able to parse the grammar is used.

`%left|%right token1 [token2 token3...]` sets the precedence and the associativity of an operator. The operator defined first have lower precedence. The name used for the tokens should be the ones that the lexer is returning in their actions. They could be the actual input character (es: '-', '°') or an actual name (es: 'PLUS') the important thing is that they match what the lexer is returning.

`%nonassoc` tells the parser that that token is not associative, so that it will raise an error whenever it will be used is an expression with other operator of the same precedence.

EBNF
----
Tha actual grammar is specified in Extended Backus–Naur Form, with every rule followed by an action consisting in a javascript function.

The EBNF in the example defines rules using Nonterminal symbols (Program, Statement, Expression, ...) and terminal symbols ('(', ')', 'integer', '*',...). Terminal symbols are contained in single quotes and should match the name of the tokens as yielded by the lexer.

Each production can have several alternatives (separated by the pipe symbol) and each alternative can have its own action function. The action function will receive a parameter for each element of the corresponding right-hand-side part of the production.

Each rule is then terminated with a semicolon (;).

EBNF is more handier than BNF because it also adds shortcuts to define repetitions, optionals and grouping:

`{ ... }` means 0 or more (...)
`[ ... ]` means 0 or one (...)
`( ... )` will group the content into one group. This is useful to inline some rules that don't need a special action for themselves, for example:

`Assignment = Identifier  ':='  ( 'integer' | Identifier | 'string' )  function(id,_,rhsvalue) { ... };`




 