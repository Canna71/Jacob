/**
 * Created by gcannata on 22/08/2014.
 */

(function() {
    var tokenspecs = {
        tokens: [

            {'regexp': '\\/\\*', action: function(){this.pushState('BLOCKCOMMENT');}},//0
            {'regexp': '\\*\\/', action: function(){this.popState();}, state:'BLOCKCOMMENT'},//1
            {'regexp': '(\\n|\\r|.)', action: function(){}, state:'BLOCKCOMMENT'},//2
            {'regexp': '\\{', action: function(){
                this.pushState('ACTIONBLOCK'); this.blocklevel=1;this.func='';}},//3
            {'regexp': '\\{', action: function(){
                this.blocklevel++;this.func+='{'}, state:'ACTIONBLOCK'},//3

            {'regexp': '\\}', action: function(){
                this.blocklevel--;if(this.blocklevel===0) {
                this.popState();
                this.jjval = this.func;
                this.jjtext = this.func;
                return 'actionblock';
            }else{
                this.func+='}';
            }}, state:'ACTIONBLOCK'},//4
            {'regexp': '[^\\}\\{]*', action: function(){
                this.func+=this.jjtext; }, state:'ACTIONBLOCK'},//5
            {'regexp': '\\/\\/', action: function(){
                this.pushState('LINECOMMENT');}},//6
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
            {'regexp': '>', action: function () {
                //this.jjval = this.jjtext.substring(1,this.jjtext.length-1);
                this.pushState('RE');
                return this.jjtext;
            }},
            {'regexp': '\\w+', action: function () {

                return 'id';
            }},
            { 'regexp': '=', action: function () {
                this.pushState('RE');
                return this.jjtext;
            }},
            {'regexp': '[^\\s\\n\\r]+', action: function () {
                this.popState();
                return 'regex';
            }, state:'RE'},
            { 'regexp': '\\s*', action: function () {
                //ignore spaces
            },state:['RE','DEFAULT']},
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
