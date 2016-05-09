/**
 * Created by Asle on 26.03.2016.
 */
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var fs = require('fs');
var csv = require('fast-csv');
var http = require('http');

var httpServer = http.createServer(function(req, res){
    res.writeHead(200, {"Content-type" : "text/plain"});

    res.end("Hello fra HTTP");

} );

httpServer.listen(3001);

var db = mongoose.connect('mongodb://localhost/sasapi');

var article = require('./models/article');

const port = 3000;
var app = express();

var testValue = 4;

function loadData() {
    var reader = fs.createReadStream("./CSV/exportArticleValue2.csv")

    csv
        .fromPath("./CSV/csv.csv", {delimiter: "|"})
        .on('data', function (data) {

            var array = data;
            var newArticle = new article({
                "title": array[0],
                "year": array[1],
                "category": array[2],
                "author": array[3],
                "abstract": array[4],
                "score": array[5],
                "article": array[6]
            });
            newArticle.save();
        })
        .on('end', function (data) {
            console.log("file ended")
        });
}


app.use(bodyParser.json());
var sasRouter = express.Router();

sasRouter.route('/articles')
      .post(function(req, res) {
    var art = new article(req.body);

        art.save();
          res.send("Artikkelen \"" + art.title +"\" lagt til!");

     })
    .get(function (req, res) {
        var filter = {};
        if (req.query.title){
            filter.title = req.query.title;
        }
        if(req.query.author){
            filter.author = req.query.author;
        }
         article.find(filter, function(err, articles){
         if(err){
         res.status(500).send(err);
         }else{
         if(!articles.length){
             loadData();
             res.send("Ingen treff på filtrering")
         }else {
           //  var jsonArticle = {};

             var updated = {
                  jsonArticles:[]
             };

             for (a in articles){
                 var art = articles[a];

                 updated.jsonArticles.push({
                   "title" : art.title,
                     "author" : art.author,
                     "year" : art.year,
                     "score" : art.score,
                     "abstract" : art.abstract,

                     "article" : art.article
                 });

             }

             res.json(updated);
         }
         }
         });

    });

sasRouter.use('/articles/:articleId', function(req, res, next){
    article.findById(req.params.articleId, function(err, article){
        if(err){
            res.status(500).send(err);
        }else{
            req.article = article;
            next();
        }
    })
})

sasRouter.route('/articles/:articleId')

    .get(function(req, res){
        article.findById(req.params.articleId, function (err, article) {
            if(err){
                res.status(500).send(err);
            }else{
                res.json(article)
            }
        });

    })
    .delete(function(req, res){



        req.article.remove(function(err){
            if(err){
                res.status(500).send(err);
            }else{
                res.status(204).send("Deleted");
            }
        });
    });

sasRouter.route('/graphs')
    .get(function(req, res){
       fs.readFile("./graphs/test.html", "UTF-8", function(err, html){
           res.writeHead(200, {"Content-Type" : "text/html"});
           res.end(html);
       })
    });


app.get('/', function(req, res){
    res.send("Welkome to SAS API");
})

app.use('/api', sasRouter);

app.listen(port, function(){
    console.log("Listening on port " + port + " :)");
});


