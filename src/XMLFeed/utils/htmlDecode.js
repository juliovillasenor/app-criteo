const entities = require('entities');

module.exports.htmlDecode = (string) => entities.decodeHTML(string);
