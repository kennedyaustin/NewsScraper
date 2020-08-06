// Get everything in database and add to the page
function getArticles() {
  $("#scrapedArticles").empty();
  $.getJSON("/articles", function (data) {
      for (var i = 0; i < data.length; i++) {

        // Display each article on the page
        if (data[i].notes.length > 0) {
        $("#scrapedArticles").append("<li class='list-group-item post-title' data-id='" + data[i]._id + "'>" + data[i].title + "<br><a href='http://reactkungfu.com/" + data[i].link + "'>Link to article</a><span class='badge'>"+data[i].notes.length+"</span></li>");
        }
        else {
            $("#scrapedArticles").append("<li class='list-group-item post-title' data-id='" + data[i]._id + "'>" + data[i].title + "<br><a href='http://reactkungfu.com/" + data[i].link + "'>Link to article</a></li>");
        }

      }
  });
}
getArticles();

// Onclick event to show the notes that have already been added to the page when a particular post is clicked on
var articleID;
$(document).on("click", "li", function () {
  // Empty the notes from the note section when there are none
  $('#userNotes').empty()
  // Save the id from the p tag
  var articleID = $(this).attr("data-id");
  $("#addNote").attr("data-id", articleID);

  $.ajax({
    method: "GET",
    url: "/articles/" + articleID
  })
    // When the ajax is done, add the note information to the page
    .then(function (data) {
        for (var i = 0; i < data.notes.length; i++) {

          if (data.notes[i].title && data.notes[i].body) {
            $('#userNotes').append("<li class='list-group-item'><strong>Title:</strong> " + data.notes[i].title + "</li>");
            $('#userNotes').append("<li class='list-group-item'><strong>Comment:</strong> " + data.notes[i].body + "</li>"); 
          }

        }
    });
});

// Get req.body.note/user id and post to database
// When you click the Save button from the index.html
$("#addNote").on("click", function () {
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
  // With that done
  .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
  });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});