const pug = require('pug');
const compiledFunction = pug.compileFile('mail_template.pug');

console.log(compiledFunction({
    title: "This is title",
    type: 'notice',
    news: [{
        title: "News 1",
        _id: 4104,

    }]
}));