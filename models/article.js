/**
 * Created by Asle on 26.03.2016.
 */
var mongo = require('mongoose'),
    Schema = mongo.Schema;

var article = new Schema({

        createdAt: {type: Date, default: Date.now},
        title: {type: String},
        author: {type: String},
        year: {type: String},
        publisher: {type: String},
        citedBy: {type: String},
        abstract: {type: String},
        article: {type: String},
        score: {type: String},
        category: {type: String},
        link1: {type: String},
        link2: {type: String}

});

article.index({ createdAt: 1 }, { expireAfterSeconds : 10 });


module.exports = mongo.model('article', article);