// ====== Start Utility Functions ======
function truncate(str, len){
  // set up the substring
  var subString = str.substr(0, len-1);
  // add elipse after last complete word and trim trailing comma
  return (
    subString.substr(0, subString.lastIndexOf(' '))
    .replace(/(^[,\s]+)|([,\s]+$)/g, '') + '...'
  )
}

function toggleContentAndArrows(content, up, down) {
  let query = $(`#${content}`); 
  let downArrow = $(`#${down}`); 
  let upArrow = $(`#${up}`); 

  // check if element is Visible
  var isVisible = query.is(':visible');

  if (isVisible === true) {
    // element was Visible
    query.hide()
    downArrow.show()
    upArrow.hide()
  } else {
    // element was Hidden
    query.show()
    downArrow.hide()
    upArrow.show()
  }
}

// ====== returns true if `userInput` does not contain unsafe characters ======
// ====== Note: `userInput` should be passed in as a string ======
function safeInput(userInput) {
  if (userInput.includes("<") || userInput.includes(">") || userInput.includes("function(") || userInput.includes("function (") ) {
    return false
  } else {
    return true
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function makeAuthorString(authorArray) {
  if (authorArray.length > 1) {
    let authorString = ''
    authorArray.forEach(author => {
      authorString = authorString + author + ', '
    })
    authorString = authorString.slice(0, -2)
    return authorString
  } else {
    return authorArray[0]
  }
}

function cleanDescriptionString(textInput) {
  // remove tripple breaks and breaks before bullet points in lists
  return textInput.replace(/<br \/><br \/><br \/>/g, '<br /><br />').replace(/<br \/><br \/>\•/g, '<br />&#8226;')
}
// ====== End Utility Functions ======
var bookData
var userID
var existingTags = []
const bookID = (new URL(document.location)).searchParams.get("id")
const action = (new URL(document.location)).searchParams.get("clicked") || false

// setting a function as the input parameter to use laster 
// when handling the returned data
function getBookDetails(handleData) {
  $("#results-for-this-letter").html('')
  $.ajax({
    method: "GET",
    url: "/api/v1/book/" + bookID,
    success: function(data) {
      handleData(data)
    },
    error: function() {
      $('.container-fluid').html('')
      $('.container-fluid').append(`<br/><br/><br/><p style="text-align:center;">Oops, looks like we couldn't find a book with that ID! Head back <a href="/">home</a> to try again.</p>`)
    }
  })
}  

getBookDetails(function(output) {
  if (output) {
    bookData = output
    poulatePage()
  } else {
    // handle successful respons with no results
    $('.container-fluid').html('')
    $('.container-fluid').append(`<br/><br/><br/><p style="text-align:center;">Oops, looks like we couldn't find a book with that ID! Head back <a href="/">home</a> to try again.</p>`)
  }
})

function poulatePage() {
  $('#book-title').text(bookData.title)
  $('#book-author').html("&nbsp&nbsp-&nbsp;" + makeAuthorString(bookData.author))
  $('#book-cover').attr('src', bookData.cover)
  $('#publisher').text(bookData.publisher)
  $('#published-year').html("&nbsp;&copy;" + bookData.published)
  $('#book-description').html(cleanDescriptionString(bookData.description))

  if (bookData.tagObjects.length > 0) {
    // reset existing tags
    existingTags = []
    $('#book-tags').html('')
    for (let index = 0; index < bookData.tagObjects.length; index++) {
      const tagObject = bookData.tagObjects[index];

      let displayTag
      if (tagObject.tag.length > 40) { displayTag = truncate(tagObject.tag, 40) }
      else { displayTag = tagObject.tag }
      
      $('#book-tags').append(`<a class="tag badge badge-pill" data-tag="${tagObject.tag}" data-creator="${tagObject.creator}"><span class="tag-clicker" data-tag="${tagObject.tag}" data-creator="${tagObject.creator}">${displayTag}</span><span class="delete-button" data-tag="${tagObject.tag}" data-creator="${tagObject.creator}">&#10005;</span></a>`)
      existingTags.push(tagObject.tag.toUpperCase())
    }
  } else {
    $('#book-tags').html('<span class="text-secondary">There are no tags yet for this book.</span>')
  }

  if (bookData.comments.length > 0) {
    $('#book-comments').html('')

    for (let index = 0; index < bookData.comments.length; index++) {
      const comment = bookData.comments[index]

      let horizontalRule
      if (index === 0) { horizontalRule = "" }
      else { horizontalRule = "<hr />" }

      $('#book-comments').append(`${horizontalRule}<p class="comment" data-creator="${comment.creator}">"${comment.text}"<span class="text-secondary"> - ${comment.displayName || "Unknown"}</span><span class="delete-button" data-comment-index="${index}" data-creator="${comment.creator}">&#10005;</span></p>`)
    }
  } else {
    $('#book-comments').html('<span class="text-secondary">There are no comments yet for this book.</span>')
  }
  $('#tags-spinner').hide()

  // ====== DELETE BUTTON EVENT LISTENER ======
  $(".delete-button").on("click", function() { 
    if ($(this).attr("data-tag")) {
      let deleteTag = $(this).attr("data-tag")
      let deleteCreator = $(this).attr("data-creator")

      let deleteObject = {
        "tag" : deleteTag,
        "creator" : deleteCreator
      }

      $.ajax({
        method: "DELETE",
        url: '/api/v1/book/tags/' + bookID,
        data: JSON.stringify(deleteObject),
        contentType: "application/json",
        success: function(data) {
          getBookDetails(function(output) {
            bookData = output
            poulatePage()
          })
        }
      })
    }

    if ($(this).attr("data-comment-index")) {
      let clickedComment = bookData.comments[$(this).attr("data-comment-index")]

      let deleteObject = {
        "displayName": clickedComment.displayName,
        "text": clickedComment.text,
        "creator": clickedComment.creator
      }

      $.ajax({
        method: "DELETE",
        url: '/api/v1/book/comments/' + bookID,
        data: JSON.stringify(deleteObject),
        contentType: "application/json",
        success: function(data) {
          getBookDetails(function(output) {
            bookData = output
            poulatePage()
          })
        }
      })
    }
  })
  $(".tag-clicker").on("click", function() { window.location.href = "/results?tags=" + $(this).attr("data-tag").replace(/,/g, '%2C') })

  showDeleteButtons()
}

function addTag() {
  let bookID = bookData._id
  let newTag = capitalizeFirstLetter($('#add-tag-input').val().trim())
  
  if (newTag != '') {
    if (existingTags.indexOf(newTag.toUpperCase()) === -1 ) {
      if (safeInput(newTag)) {
        let updateObject = {
          "tag" : newTag,
          "creator" : userID
        }

        $.ajax({
          method: "PUT",
          url: '/api/v1/book/tags/' + bookID,
          data: JSON.stringify(updateObject),
          contentType: "application/json",
          success: function(data) {
            getBookDetails(function(output) {
              bookData = output
              poulatePage()
            })
            $('#add-tag-input').val('')
            $('#add-tag-modal').modal('toggle')
          }
        })
        // === UNSAFE CHARACTERS IN INPUT === 
      } else {
        alert('Some characters are now allowed in tag text.')
        $('#add-tag-input').val('')
      }
      // === TAG ALREADY EXISTS
    } else {
      alert(`The "${newTag}" tag already exists!`)
      $('#add-tag-input').val('')
    }
    // === BLANK USER INPUT === 
  } else {
    alert('Please add some text for your tag!')
  }
}

function addComment() {
  let bookID = bookData._id
  let newCommentText = $('#add-comment-text-area').val().trim().replace(/(\r\n|\n|\r)/g, '<br /><br />').replace(/<br \/><br \/><br \/><br \/>/g, '<br /><br />')
  let displayName = capitalizeFirstLetter($('#display-name').val().trim())

  // validating user input in display name
  if (!safeInput(displayName)) { alert('Some characters are now allowed in display name.'); $('#display-name').val(''); $('#display-name').focus(); return; }

  if (newCommentText != '') {
    let updateObject = {
      "text" : newCommentText,
      "displayName" : displayName,
      "creator" : userID
    }

    $.ajax({
      method: "PUT",
      url: '/api/v1/book/comments/' + bookID,
      data: JSON.stringify(updateObject),
      contentType: "application/json",
      success: function(data) {
        getBookDetails(function(output) {
          bookData = output
          poulatePage()
        })
        $('#add-comment-text-area').val('')
        $('#display-name').val('')
        $('#add-comment-modal').modal('toggle')
      }
    })

  } else {
    alert('Please add some text for your comment!')
  }

}

function showDeleteButtons() {
  // show delete buttons for elements created by this author
  for (let index = 0; index < $(".delete-button").length; index++) {
    const element = $(".delete-button")[index];
    if (element.dataset.creator == userID ) { 
      $(element).show() 
      if ($(element).parent().is("a")) {
        $(element).parent().removeClass("tag").addClass("selected-tag badge-light")
      }
      if ($(element).parent().is("p")) {
        $(element).parent().removeClass("comment").addClass("comment-editable")
      }
    } else { 
      $(element).hide() 
      if ($(element).parent().is("a")) {
        $(element).parent().removeClass("selected-tag badge-light").addClass("tag")
      }
      if ($(element).parent().is("p")) {
        $(element).parent().removeClass("comment-editable").addClass("comment")
      }
    }
  }
}

// ====== GENERAL EVENT LISTENERS ======
document.getElementById('add-tag-submit').addEventListener('click', function() {
  addTag()
})
document.getElementById('add-comment-submit').addEventListener('click', function() {
  addComment()
})
document.getElementById("log-in-button").addEventListener('click', logIn)

document.getElementById("up-arrow").addEventListener("click", function(){
  toggleContentAndArrows('book-description', 'up-arrow', 'down-arrow')
})
document.getElementById("down-arrow").addEventListener("click", function(){
  toggleContentAndArrows('book-description', 'up-arrow', 'down-arrow')
})

// focus on modal inputs when loaded
$('#add-comment-modal').on('shown.bs.modal', function () {
  setTimeout(function (){
      $('#display-name').focus()
  }, 100)
})
$('#add-tag-modal').on('shown.bs.modal', function () {
  setTimeout(function (){
      $('#add-tag-input').focus()
  }, 100)
})

// ====== FIREBASE USER AUTHENTICATION ======

// checking if user is logged in or logs in during session
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is already signed in
    userID = firebase.auth().currentUser.uid
    $('#logged-out-message').hide()
    $('#logged-in-content').show()   
    showDeleteButtons()
    $('#log-out-button').show()
    document.getElementById("log-out-button").addEventListener("click", logOut)

    if (action === "add-tag") { 
      $('#add-tag-modal').modal('toggle')
      // remove action param from url
      window.history.pushState({}, "", window.location.href.replace("&clicked=add-tag",""))
    }
    if (action === "add-comment") { 
      $('#add-comment-modal').modal('toggle') 
      // remove action param from url
      window.history.pushState({}, "", window.location.href.replace("&clicked=add-comment",""))
    }
  } else {
    // User is not signed in yet
    console.log("User is not logged in!")
    $('#logged-in-content').hide()
    $('#logged-out-message').show()
    $(".delete-button").hide()
    $('#log-out-button').hide()
  }
})

function logIn() {
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  // local persistance remains if browser is closed
  .then(function() {
    let provider = new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithPopup(provider);
  })
  .then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    userID = user.uid
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
  })
}

function logOut() {
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
    userID = null
    $('#logged-in-content').hide()
    $('#logged-out-message').show()
    $(".delete-button").hide()
    $('#log-out-button').hide()
  }).catch(function(error) {
    // An error happened.
  })
}