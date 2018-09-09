const express = require('express');

 const router = express.Router();

const request = require('request'); 

const cheerio = require("cheerio"); 

const db = require('../models');

var mongoose = require("mongoose");

var Article = require('../models/Article');

const Comments = require('../models/Comment');



 router.get('/', (req, res) => {

     res.render('index', { mainPage: true} );



 });




router.get('/scrape', (req, res) => {

    

    Article.remove({saved: false}).exec();

    

    const atlanticURL = "https://www.theatlantic.com/";

    request(atlanticURL, (err, response, html) => {

        if (err) { console.log(error) };    


        const $ = cheerio.load(html);  

       let atlanticResult = [];   

        let atlanticParentSelector = "li.archive-item-component";  



        $(atlanticParentSelector).each( (i, element) => {

		            wiredResult.push({

		                title: $(element).find('h2.archive-item-component__title').text(),

		                body: $(element).find('p.archive-item-component__desc').text(),

		                url: $(element).find('a').attr('href')


		        });

		    });
















        Article.create(wiredResult)

            .then( dbArticle => {

                res.render('scrape', {articles: dbArticle, title: "Click on Headline Button to Save & Read"});

            })

            .catch( err => {

                console.error(err);

                res.redirect('/');

            })

















    });



});



router.get("/article/:id", function(req, res) {

  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...

  Article.findOne({ "_id": req.params.id })

  // ..and populate all of the comments associated with it

  .populate("comments")

  // now, execute our query

  .exec(function(error, doc) {

    // Log any errors

    if (error) {

      console.log(error);

    }

    // Otherwise, send the doc to the browser as a json object

    else {

      res.json(doc);

    }

  });

});











// GET '/save/:id' Saves article for later viewing

router.put('/save/:articleID', (req, res) => {

    Article.findByIdAndUpdate(req.params.articleID, { $set: {saved: true} }, { new: true })

        .then( article => {

            res.send("Article updated");

        })

        .catch( err => {

            console.error(err);

            res.redirect('/');

        })

});



// GET '/save' Show all saved articles

router.get('/save', (req, res) => {

    Article.find({ saved: true })

        .then(dbArticles => {

            res.render('savedArticles', { articles: dbArticles, title: "These are your saved articles" });

        })

        .catch( err => {

            console.error(err);

            res.redirect('/');

        })

});



//DELETE article from saved area 

router.delete('/delete/article/:removeArticleID', (req, res) => {

    Article.findByIdAndRemove(req.params.removeArticleID)

        .then( article => {

            res.send("Article removed");

        })

        .catch(err => console.error(err));

})



// GET '/save/comments/:getCommentID' Display comments for a specific article

// router.get('/save/comment/:getCommentID', (req, res) => {

//     Article.findById(req.params.getCommentID)

//         .populate("comments")

//         .then(dbArticles => res.json(dbArticles))

//         .catch(err => console.error(err));

// })



// POST '/save/comments/:postCommentID' Create comments for a specific article

// router.post('/save/comment/:postCommentID', (req, res) => {

//     Comment.create(req.body)

//         .then(dbComment => Articles.findByIdAndUpdate(req.params.postCommentID, { comments: dbComment._id }, { new: true}))

//         .then( dbArticles => res.redirect('/save'))

//         .catch( err => console.error(err));

// });

router.get('/comments/save/:getCommentID', (req, res) => {

  Article.findOne({

    _id: req.params.getCommentID

  })

  .populate('comments')

  .then(dbArticles => {

    res.json(dbArticles);

  })

  .catch(err => {

    console.log(err);

  });

});



//POST '/save/comments/:postCommentID' Create comments for a specific article

router.post('/comments/save/:postCommentID', (req, res) => {

    Comment.create(req.body)

    .then(dbComment => {

        return Article.findOneAndUpdate({ _id: req.params.postCmmentID }, { comments: dbComment._id}, { new: true })

    })

    .then(dbArticle => {

        res.redirect('/save')

    })

    .catch(err => {

        console.log(err);

    })

});





// router.post("/comments/save/:id", function(req, res) {

//   // Create a new note and pass the req.body to the entry

//   var newComment = new Comment({

//     body: req.body.text,

//     article: req.params.id

//   });

//   console.log(req.body)

//   // And save the new note the db

//   newComment.save(function(error, note) {

//     // Log any errors

//     if (error) {

//       console.log(error);

//     }

//     // Otherwise

//     else {

//       // Use the article id to find and update it's notes

//       Article.findOneAndUpdate({ "_id": req.params.id }, {$push: { "comments": req.body.text } })

//       // Execute the above query

//       .exec(function(err) {

//         // Log any errors

//         if (err) {

//           console.log(err);

//           res.send(err);

//         }

//         else {

//           // Or send the note to the browser

//           res.send(note);

//         }

//       });

//     }

//   });

// });











 module.exports = router;