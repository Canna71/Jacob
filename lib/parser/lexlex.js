/**
 * Created by gcannata on 22/08/2014.
 */

(function() {
    var tokenspecs = {
        tokens: [

            {'regexp': '\\/\\*', action: function(){this.pushState('BLOCKCOMMENT');}},//0
            {'regexp': '\\*\\/', action: function(){this.popState();}, state:'BLOCKCOMMENT'},//1
            {'regexp': '(\\n|\\r|.)', action: function(){}, state:'BLOCKCOMMENT'},//2
            {'regexp': '\\{', action: function(){this.pushState('ACTIONBLOCK');}},//3
            {'regexp': '\\}', action: function(){this.popState();}, state:'ACTIONBLOCK'},//4
            {'regexp': '[^\\}]*', action: function(){return 'actionblock'; }, state:'ACTIONBLOCK'},//5
            {'regexp': '\\/\\/', action: function(){this.pushState('LINECOMMENT');}},//6
            {'regexp': '[^\\n]*', action: function(){}, state:'LINECOMMENT'},//7
            {'regexp': '\\n', action: function(){this.popState();}, state:'LINECOMMENT'},//8
            //TODO: line comment
            {'regexp': '%%', action: function () {
                this.jjval = (this.jjtext);
                return 'SEPARATOR';
            }},
            {'regexp': '%\\w+', action: function () {
                this.jjval = this.jjtext.substring(1);
                return 'directive';
            }},
            {'regexp': '<\\w+>', action: function () {
                this.jjval = this.jjtext.substring(1,this.jjtext.length-1);
                return 'state';
            }},
            {'regexp': '\\w+', action: function () {

                return 'id';
            }},
            { 'regexp': '=', action: function () {
                return this.jjtext;
            }},
            {'regexp': '[^\\s\\n\\r]+', action: function () {

                return 'regex';
            }},

            { 'regexp': '\\s*', action: function () {
                //ignore spaces
            }},

            { 'regexp': '.', action: function () {
                return this.jjtext;
            }},
            { 'regexp': '$', action: function () {
                console.log('end of file');
                return 'EOF';
            }}
        ],
        moduleName: 'JacobLexerLexer'
    };
    return tokenspecs;
})();
