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
const bookID = (new URL(document.location)).searchParams.get("id")
var bookLocation
if (bookID.length === 24) { bookLocation = "database" }
else { bookLocation = "goodreadsAPI" }

// setting a function as the input parameter to use laster 
// when handling the returned data
function getBookDetails(handleData) {
  if (bookLocation === "database") {
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
  } else {
    // Try to get book details from Goodreads API
    $.ajax({
      method: "GET",
      url: `/api/v1/search/details/${bookID}`,
      success: function(data) {
        handleData(data)
      },
      error: function() {
        $('.container-fluid').html('')
        $('.container-fluid').append(`<br/><br/><br/><p style="text-align:center;">Oops, looks like we couldn't find a book with that ID! Head back <a href="/">home</a> to try again.</p>`)
      }
    })
  }
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

function addNewBook(goodreadsBookID, buttonClicked) {
  let newBookData

  // Get full book details from Goodreads API
  $.ajax({
    method: "GET",
    url: `/api/v1/search/details/${goodreadsBookID}`,
    success: function(data) {
      newBookData = data
    },
  })
  .then(function() {
    let newBook = {
      "goodreadsBookID": newBookData.goodreadsBookID,
      "title": newBookData.title,
      "author": newBookData.author,
      "isbn": newBookData.isbn,
      "isbn13": newBookData.isbn13,
      "published": newBookData.published,
      "publisher": newBookData.publisher,
      "cover": newBookData.cover,
      "description": newBookData.description,
      "language": newBookData.language,
      "sameBook": [],
      "tagObjects": [],
      "tags": [],
      "comments": [],
      "citations": [],
      "attributes": []
    }
    // POST new book to the database
    $.ajax({
      method: "POST",
      url: '/api/v1/book/',
      data: JSON.stringify(newBook),
      contentType: "application/json",
      success: function(data) {
        // Direct to book details page for this book
        window.location.href = `/update?id=${data}&clicked=${buttonClicked}`
      },
      error: function() {
        alert('Oh no! This book is missing some information required in order for us to be able to add it to the database. Please select a different new book or search by different criteria.')
      }
    })
  })
}

function poulatePage() {

  $('#book-title').text(bookData.title)
  $('#book-author').html("&nbsp&nbsp-&nbsp;" + makeAuthorString(bookData.author))
  $('#book-cover').attr('src', bookData.cover)
  $('#publisher').text(bookData.publisher)
  $('#published-year').html("&nbsp;&copy;" + bookData.published)
  $('#book-description').html(cleanDescriptionString(bookData.description))

  if (bookData.tagObjects && bookData.tagObjects.length > 0) {
    for (let index = 0; index < bookData.tagObjects.length; index++) {
      const tagObject = bookData.tagObjects[index];

      let displayTag
      if (tagObject.tag.length > 40) { displayTag = truncate(tagObject.tag, 40) }
      else { displayTag = tagObject.tag }
      
      $('#book-tags').append(`<button class="tag badge badge-pill" data-tag-creator="${tagObject.creator}" value="${tagObject.tag}">${displayTag}</button>`)
    }
  } else {
    $('#book-tags').html('<span class="text-secondary">There are no tags yet for this book.</span>')
  }

  if (bookData.comments && bookData.comments.length > 0) {
    for (let index = 0; index < bookData.comments.length; index++) {
      const comment = bookData.comments[index]
      
      let horizontalRule
      if (index === 0) { horizontalRule = "" }
      else { horizontalRule = "<hr />" }

      $('#book-comments').append(`${horizontalRule}<p class="comment">"${comment.text}"<span class="text-secondary"> - ${comment.displayName || "Unknown"}</span></p>`)
    }
  } else {
    $('#book-comments').html('<span class="text-secondary">There are no comments yet for this book.</span>')
  }

  // ====== Add event listeners ======
  document.getElementById("up-arrow").addEventListener("click", function(){
    toggleContentAndArrows('book-description', 'up-arrow', 'down-arrow')
  })
  document.getElementById("down-arrow").addEventListener("click", function(){
    toggleContentAndArrows('book-description', 'up-arrow', 'down-arrow')
  })
  $(".tag").on("click", function() { window.location.href = "/results?tags=" + $(this).attr("value").replace(/,/g, '%2C') })

  $('#add-comment-button').on("click", function(){ 
    let goodreadsBookID = bookData.goodreadsBookID
    let titleKeyWords = bookData.title
    let similarBookTitles

    if (bookLocation === "database") {
      window.location.href = `/update?id=${bookData._id}&clicked=add-comment`
      // for a new book, check for duplicates by title
    } else {
      $.ajax({
        method: "GET",
        url: '/api/v1/book/title/' + titleKeyWords,
        success: function(data) {
          similarBookTitles = data
        }
      }).then(function(){
        if (similarBookTitles.length > 0) {
          $('#add-new-book-modal-body').html('')
          $('#add-new-book-modal').modal('toggle')

          let booksList = '<ul id="alternate-book-list">'
          similarBookTitles.forEach(book => {
            booksList += `<li class="alternate-book text-primary" data-bookID="${book._id}">${book.title}</li>`
          })
          booksList += '</ul>'
        
          if (similarBookTitles.length == 1) { $('#add-new-book-tile').text('Did you mean this book instead?') } 
          else { $('#add-new-book-tile').text('Did you mean one of these books instead?') }
          $('#add-new-book-modal-body').append(booksList)

          $('.alternate-book').on('click', function(){
            window.location.href = "/update?id=" + $(this).attr("data-bookID") + "&clicked=add-comment"
          })
          document.getElementById('add-new-book-button').addEventListener('click', function(){
            addNewBook(goodreadsBookID, "add-comment")
          })
        } else {
          addNewBook(goodreadsBookID, "add-comment")
        }           
      })
    }
  })

  $('#add-tag-button').on("click", function(){ 
    let goodreadsBookID = bookData.goodreadsBookID
    let titleKeyWords = bookData.title
    let similarBookTitles

    if (bookLocation === "database") {
      window.location.href = `/update?id=${bookData._id}&clicked=add-tag`
      // for a new book, check for duplicates by title
    } else {
      $.ajax({
        method: "GET",
        url: '/api/v1/book/title/' + titleKeyWords,
        success: function(data) {
          similarBookTitles = data
        }
      }).then(function(){
        if (similarBookTitles.length > 0) {
          $('#add-new-book-modal-body').html('')
          $('#add-new-book-modal').modal('toggle')

          let booksList = '<ul id="alternate-book-list">'
          similarBookTitles.forEach(book => {
            booksList += `<li class="alternate-book text-primary" data-bookID="${book._id}">${book.title}</li>`
          })
          booksList += '</ul>'
        
          if (similarBookTitles.length == 1) { $('#add-new-book-tile').text('Did you mean this book instead?') } 
          else { $('#add-new-book-tile').text('Did you mean one of these books instead?') }
          $('#add-new-book-modal-body').append(booksList)

          $('.alternate-book').on('click', function(){
            window.location.href = "/update?id=" + $(this).attr("data-bookID") + "&clicked=add-tag"
          })
          document.getElementById('add-new-book-button').addEventListener('click', function(){
            addNewBook(goodreadsBookID, "add-tag")
          })
        } else {
          addNewBook(goodreadsBookID, "add-tag")
        }           
      })
    }
  })
}