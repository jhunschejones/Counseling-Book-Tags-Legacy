document.getElementById('search-button').addEventListener('click', function(){
  const searchType = $('#search-type').val()
  const searchValue = $('#search-input').val().trim()
  $('#database-books-header').hide()
  $('#new-books-header').hide()
  $('#new-books-sub-header').hide()
  $('#database-books-sub-header').hide()

  if (searchType === 'isbn') {
    bookSearch(searchValue, 'isbn')
  } else if (searchType === 'author') {
    bookSearch(searchValue, 'author')
  } else if (searchType === 'title') {
    bookSearch(searchValue, 'title')
  } else {
    // How did you even get here?
  }
})

function bookSearch(searchValue, searchParam) {
  $('#database-books-spinner').show()
  $('#new-books-spinner').show()
  $('#new-book-results').html('')
  $('#database-book-results').html('')

  let newBooks
  let databaseBooks
  let multiPage = false
  $.when(
    // Get matching new books from Goodreads API
    $.ajax({
      method: "GET",
      url: `/api/v1/search/${searchParam}/${searchValue}`,
      success: function(data) {
        newBooks = data
      }
    }),
    // Get matching books in the database
    $.ajax({
      method: "GET",
      url: `/api/v1/book/${searchParam}/${searchValue}`,
      success: function(data) {
        databaseBooks = data
      }
    })
  ).then(function() {
    if (newBooks[0] && newBooks[0].totalPages && newBooks[0].totalPages > 1) { multiPage = true }
    // Remove new books from the newBooks array if they are already in the database
    if (databaseBooks && databaseBooks.length > 0 && !databaseBooks.message) {
      for (let index = 0; index < newBooks.length; index++) {
        const newBook = newBooks[index]
        
        for (let index = 0; index < databaseBooks.length; index++) {
          const databaseBook = databaseBooks[index]

          if (databaseBook.goodreadsBookID === newBook.goodreadsBookID) {
            newBooks.splice(index, 1)
          }
        }
      }
    }

    // newBooks and databaseBooks now have non-duplicate values by this point in the function
    if (!databaseBooks.message) {
      populateDatabaseBooks(databaseBooks)
    } else {
      $('#database-books-spinner').hide()
    }

    if (multiPage) {
      $.ajax({
        method: "GET",
        url: `/api/v1/search/${searchParam}/${searchValue}?page=2`,
        success: function(data) {
          newBooks = newBooks.concat(data)
        }
      }).then(function(){
        if (databaseBooks && databaseBooks.length > 0 && !databaseBooks.message) {
          // remove page count
          newBooks.splice(0, 1)

          for (let index = 0; index < newBooks.length; index++) {
            const newBook = newBooks[index]

            for (let index = 0; index < databaseBooks.length; index++) {
              const databaseBook = databaseBooks[index]
              
              if(databaseBook.goodreadsBookID === newBook.goodreadsBookID) {
                newBooks.splice(index, 1)
              }
            }
          }
        }

        for (let index = 0; index < newBooks.length; index++) {
          const book = newBooks[index];

          // remove "undefined" results
          if (!book.goodreadsBookID) { newBooks.splice(index, 1) }
          else {
            // Get full book details from Goodreads API
            $.ajax({
              method: "GET",
              url: `/api/v1/search/details/${book.goodreadsBookID}`,
              success: function(fullData) {
                // remove books with no isbn
                if (!fullData.isbn ) { newBooks.splice(index, 1) }
              },
              error: function() {
                // remove broken goodreads book id's
                newBooks.splice(index, 1)
              }
            })
          }
        }
        populateNewBooks(newBooks)
      })
    } else {
      populateNewBooks(newBooks)
    }
  }).fail(function(){
    // server error message
    $('#database-book-results').html('<p class="text-center">There were no results matching this search. Please try a different search.</p>')
  })
}

function addNewBook(goodreadsBookID) { 
  window.location.href = "/details?id=" + goodreadsBookID 
}

function populateDatabaseBooks(bookData) {
  $('#database-books-header').show()
  $('#database-books-sub-header').show()
  
  if (bookData) {
    bookData.forEach(book => {
      $('#database-book-results').append(`<span class="database-book" data-id="${book._id}" data-toggle="tooltip" data-placement="right" data-html="true" title="<img src='${book.cover}' style='height:175px;'>">${book.title} - ${book.author[0]} (${book.published})</span><br/>`)
    })
  }
  $('#database-books-spinner').hide()
  $('.database-book').on("click", function(){ window.location.href = "/details?id=" + $(this).attr("data-id") })
}

function populateNewBooks(bookData) {
  $('#new-books-header').show()
  $('#new-books-sub-header').show()
  // fires for paginated results
  if (bookData[0] && bookData[0].totalPages) {
    const pageInfo = bookData[0]
    for (let index = 1; index < bookData.length; index++) {
      const book = bookData[index]
      if (book.goodreadsBookID != "undefined") {
        $('#new-book-results').append(`<span class="new-book" data-goodreadsBookID="${book.goodreadsBookID}" data-title="${book.title}" data-toggle="tooltip" data-placement="right" data-html="true" title="<img src='${book.cover}' style='height:175px;'>">${book.title} - ${book.author} (${book.published})&nbsp;&nbsp;<strong class="add-tag-button text-secondary">&#43;</strong></span><br/>`)
      }
    }
  //fires for un-paginated results
  } else {
    bookData.forEach(book => {
      $('#new-book-results').append(`<span class="new-book" data-goodreadsBookID="${book.goodreadsBookID}" data-title="${book.title}" data-toggle="tooltip" data-placement="right" data-html="true" title="<img src='${book.cover}' style='height:175px;'>">${book.title} - ${book.author} (${book.published})&nbsp;&nbsp;<strong class="add-tag-button text-secondary">&#43;</strong></span></br>`)
    })
  }
  $('#new-books-spinner').hide()

  // enable all tool tips if no touch actions are availible
  let isTouchDevice = false
  if ("ontouchstart" in document.documentElement) { isTouchDevice = true }
  if(isTouchDevice === false) { $('[data-toggle="tooltip"]').tooltip() }

  // ====== CLICKING A NEW BOOK, CHECK FOR DUPLICATES ======
  $('.new-book').on("click", function(){ 
    let goodreadsBookID = $(this).attr("data-goodreadsBookID") 
    let titleKeyWords = $(this).attr("data-title")
    let similarBookTitles

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
          window.location.href = "/details?id=" + $(this).attr("data-bookID")
        })
        document.getElementById('add-new-book-button').addEventListener('click', function(){
          addNewBook(goodreadsBookID)
        })
      } else {
        addNewBook(goodreadsBookID)
      }           
    })
  })
}

// ====== ADD GENERAL EVENT LISTENERS ======

// trigger search click on enter in input field
let searchInput = document.getElementById("search-input")
searchInput.addEventListener("keyup", function(event) {
  event.preventDefault()
  if (event.keyCode === 13) {
    document.getElementById("search-button").click()
  }
})