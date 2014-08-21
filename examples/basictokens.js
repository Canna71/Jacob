/**
 * Created by gcannata on 21/08/2014.
 */
(function() {
    var tokenspecs = {
        definitions: {
            "digits": "[0-9]"
        },
        tokens: [
            {'regexp': '{digits}*\\.{digits}+', action: function () {
                this.jjval = parseFloat(this.jjtext);
                return 'float';
            }},
            { "regexp": '{digits}+', action: function () {
                this.jjval = parseInt(this.jjtext);
                return 'integer';
            }},
            { 'regexp': 'print', action: function () {
                return 'print';
            }},
            { 'regexp': '\\w+', action: function () {
                return 'id';
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
        moduleName: 'MyLexer'
    };
    return tokenspecs;
})();
