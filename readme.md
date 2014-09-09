# JACOB
 Possibly Acronym for: JAvascript COmpiler Bison-like
 Or maybe even Just Another Compiler to OBjects

Jacob is a tool like Flex and Bison to generate interpreters or compilers. This can be used for example to create a DSL (domain specific language) to be used in NodeJS or in the browser.
 
Generating a language interpreter (or compiler) involves two steps: 
 1. aggregate the input characters into a series of "tokens": this is done by a module called "lexer"
 2. interpreting the series of tokens as a language, according to a grammar, this is done by a module called "parser".
 
Also, you will define an actual behaviour which is the semantic of the language, that is, what the program should do according to a language statement.
 
Given appropiate instructions, Jacob will generate both the lexer and the parser. We'll see how to specify the actual behaviour of your parser.

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


To generate the lexer use the following command line:

`jacob -t tokens.jacoblex [-l lexer-js]`

The `-t` argument specify the token specifications file, the optional `-l` parameter specify the name of the generated file.

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

Here is a table of all the members of the generated lexer that are available for you inside the actions:

| member | description |
|--------|-------------|
| jjtext | the text matched by the regex |
| jjval | the value of the current token, by default the same as jjtext |
| jjpos | the position of the current token inside the input string |
| less(n)| this function can be called to push back n character into the input stream |
| isEOF()| returns true if the input is at the end |




 