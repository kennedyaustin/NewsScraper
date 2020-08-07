// Get everything in database and add to the page
function getArticles() {
  $("#scrapedArticles").empty();
  $.getJSON("/articles", function(data) {

    for (var i = 0; i < data.length; i++) {
      // Display each article on the page with title, link, and summary
      // Changes display of 'comment, comments, or nothing' depending on how many comments are on that article
      if (data[i].notes.length == 1) {
        $("#scrapedArticles")
        .append(
          "<li class='list-group-item post-title' data-id='" + data[i]._id + "'><h4>" + 
          data[i].title + "</h4><br><br><p>" + data[i].summary + "</p> <br> <a target= '_blank' href='" + data[i].link +
           "'>Link to article</a><span class='badge'>" + data[i].notes.length + " Comment</span></li>"
        );
      } else if (data[i].notes.length > 0) {
        $("#scrapedArticles")
        .append(
          "<li class='list-group-item post-title' data-id='" + data[i]._id + "'><h4>" + 
          data[i].title + "</h4><br><br><p>" + data[i].summary + "</p> <br> <a target= '_blank' href='" + data[i].link +
           "'>Link to article</a><span class='badge'>" + data[i].notes.length + " Comments</span></li>"
        );
      } else {
        $("#scrapedArticles")
        .append(
          "<li class='list-group-item post-title' data-id='" + data[i]._id + "'><h4>" +
          data[i].title + "</h4><br><br><p>" + data[i].summary + "</p> <br> <a target= '_blank' href='" + data[i].link + "'>Link to article</a></li>"
        );
      }
    }

  });
}
getArticles();

// Onclick event to show the notes that have already been added to the page when a particular post is clicked on
var articleID;
$(document).on("click", "li", function() {
  // Empty the notes from the note section when there are none
  $('#userComments').empty()
  // Save the id from the p tag
  var articleID = $(this).attr("data-id");
  $("#addComment").attr("data-id", articleID);

  $.ajax({
    method: "GET",
    url: "/articles/" + articleID
  })
  // When the ajax is done, add the note information to the page
  .then(function (data) {

    for (var i = 0; i < data.notes.length; i++) {
      if (data.notes[i].title && data.notes[i].body) {
        $('#userComments').append("<li class='list-group-item'><strong>Title:</strong><br> " + data.notes[i].title + "</li>");
        $('#userComments').append("<li class='list-group-item'><strong>Comment:</strong><br> " + data.notes[i].body + "</li>"); 
      }
    }
    
  });
});

// Get req.body.note/user id and post to database
// When you click the Save button from the index.html
$("#addComment").on("click", function () {
  // Grab the id associated with the article from the Save button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/submit/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
  .then(function(data) {

    // Reload page so the number of current comments are added
    window.location.reload()

  });

  // Remove the values entered in the textareas for comment entries
  $("#titleinput").val("");
  $("#bodyinput").val("");
});