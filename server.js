var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");
const Article = require("./models/Article");
const Note = require("./models/Note.js");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines"
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.npr.org/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $(".story-wrap").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .find("h3.title")
        .text();

      result.summary = $(this)
        .find(".teaser")
        .text();
        
      result.link = $(this)
        .find("h3.title")
        .parent("a[href]")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an err occurred, log it
          console.log(err);
        });
    });

  });
  // Send a message to the client
  res.redirect('/')
});

// Reload page when the Save button is clicked
app.get('/', function(req, res) {

  res.send(index.html)

})

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({}).populate('notes')
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an err occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("notes")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an err occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
  console.log(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an err occurred, send it to the client
      res.json(err);
    });
});

// Route to view notes that user has added to the article
app.get('/notes', function(req, res) {

  // Find all notes in the note collection with the help of Note model
  Note.find({}, function(err, noteContent) {

    if (err) {
      res.json(err)
    } else {
      res.json(noteContent)
    }

  })

})

// Route to create a new note when the Save button is clicked
app.post("/submit/:id", function (req, res) {
  // Using our Note model to post a new note from the req.body
  var newNote = new Note(req.body);

  // Save the new note to mongoose
  newNote.save(function (err, note) {

    if (err) {

      res.json(err);

    } else {

      // Find our user and update the note id with the comment/title info
      Article.findOneAndUpdate({
        "_id": req.params.id
      }, {
        $push: {
          "notes": note._id
        }
      }, {
        new: true
      }, function (err, newNote) {

        if (err) {
            res.json(err);
        }
        else {
            res.json(newNote);
        }
        
      });
    }
  });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on http://localhost:" + PORT);
});
