const Book = require('../models/book.model')

// ====== takes in title string, returns all-caps array of non-duplicate key words ======
function getTitleKeyWords(title) {
  const titleWords = title.split(" ")
  let keyWords = []
  let unimportant = ["AND","THE","OR","OF","A"]
  
  titleWords.forEach(element => {
    // remove special characters from the word EXCEPT `'`
    element = element.replace(/[^a-zA-Z0-9']/g," ")
    // trim any spaces off the ends of the word
    element = element.trim()
    // capitolize word
    element = element.toUpperCase()

    // check if word is uninmportant
    if (unimportant.indexOf(element) === -1 && element != '' ) {
      // check if word is already in array
      if (keyWords.indexOf(element) === -1 ) {
        // add word to keyWords array
        keyWords.push(element)
      }
    }
  })
  return keyWords
}
// ====== takes in author string, returns all-caps array of non duplicate key words ======
function getAuthorKeyWords(authors) {
  let keyWords = []

  // fires if input value is an array i.e. when adding a new book
  if (Array.isArray(authors)) {
    authors.forEach(author => {
      // remove periods from the authors name
      const authorWords = author.replace(/\./g,"").split(" ")
  
      authorWords.forEach(element => {
        // trim any spaces off the ends of the word
        element = element.trim()
        // capitalize word
        element = element.toUpperCase()
    
        // check if word is already in array
        if (keyWords.indexOf(element) === -1 && element != '' ) {
          // add word to keyWords array
          keyWords.push(element)
        }
      })
    })
    // fires if input value is just a string
  } else {
    // remove periods from the authors name
    const authorWords = authors.replace(/\./g,"").split(" ")
  
    authorWords.forEach(element => {
      // trim any spaces off the ends of the word
      element = element.trim()
      // capitalize word
      element = element.toUpperCase()
  
      // check if word is already in array
      if (keyWords.indexOf(element) === -1 && element != '' ) {
        // add word to keyWords array
        keyWords.push(element)
      }
    })
  }
  return keyWords
}

// ====== returns true if `userInput` does not contain unsafe characters ======
// ====== Note: `userInput` should be passed in as a string ======
function safeInput(userInput) {
  if (userInput.includes("<") && userInput.includes(">") || userInput.includes("function(") || userInput.includes("function (") ) {
    return false
  } else {
    return true
  }
}

// ====== Takes in tags-object array and makes an array of just non-duplicated tags ======
function makeAllTagsArray(tagObjectsArray) {
  let tagsArray = []
  tagObjectsArray.forEach(tagObject => {
    if (tagsArray.indexOf(tagObject.tag) == -1) {
      tagsArray.push(tagObject.tag)
    }
  })
  return tagsArray
}

exports.book_create_new_record = function (req, res) {

  // description field needs to be able to have html in it
  if (safeInput(JSON.stringify(req.body.title)) && safeInput(JSON.stringify(req.body.author)) && safeInput(JSON.stringify(req.body.isbn)) && safeInput(JSON.stringify(req.body.published)) && safeInput(JSON.stringify(req.body.publisher)) && safeInput(JSON.stringify(req.body.cover)) && safeInput(JSON.stringify(req.body.sameBook)) && safeInput(JSON.stringify(req.body.tagObjects)) && safeInput(JSON.stringify(req.body.tags)) && safeInput(JSON.stringify(req.body.comments))) {

    // checks required fields and handles instead of crashing
    if (req.body.goodreadsBookID && req.body.title && req.body.author && req.body.isbn) {
      let keyWords = getTitleKeyWords(req.body.title)
      let authorWords = getAuthorKeyWords(req.body.author)
      
      let book = new Book(
        {
          goodreadsBookID: req.body.goodreadsBookID,
          title: req.body.title,
          titleKeyWords: keyWords,
          author: req.body.author,
          authorKeyWords: authorWords,
          isbn: req.body.isbn,
          isbn13: req.body.isbn13,
          published: req.body.published,
          publisher: req.body.publisher,
          cover: req.body.cover,
          sameBook: req.body.sameBook,
          description: req.body.description,
          tagObjects: req.body.tagObjects,
          tags: req.body.tags,
          comments: req.body.comments,
          citations: req.body.citations,
          attributes: req.body.attributes
        }
      )

      book.save(function(err, book) {
        if (err) {
          return next(err)
        }
        // res.send('Book record created successfully!')
        res.send(book._id)
      })
    } else {
      // not all required fields were passed with a value
      newrelic.recordCustomEvent("failed_to_add_book", { "goodreadsBookID": req.body.goodreadsBookID })
      res.status(500).send('`goodreadsBookID`, `title`, `author`, `isbn`, `published`, `publisher`, and `cover` are all required fields')
    }
  } else {
    // client sent prohibited characters
    res.status(500).send('Client payload included prohibited characters.')
  }
}

exports.return_all_books = function (req, res) {
  Book.find({}, function (err, data) {
    if (err) return next(err)
    res.send(data)
  })
}

exports.book_details = function (req, res, next) {
  Book.findById(req.params.id, function (err, book) {
    if (err) return next(err)
    if (book) res.status(200).send(book)
    else res.status(404).send(`Book ID '${req.params.id}' does not exist in the database. NOTE: The required ID value is for the database '_id' field, not the Goodreads 'bookid' field.`)
  })
}

exports.book_update = function (req, res, next) {
  // limiting the fields that can be updated via the API to: tagObjects, tags, and comments
  let updateObject = {}
  if (req.body.tagObjects) { updateObject.tagObjects = req.body.tagObjects }
  if (req.body.tags) { updateObject.tags = req.body.tags }

  // checks that no prohibited characters were placed in tags
  if (safeInput(JSON.stringify(updateObject))) {
    if (req.body.comments) { updateObject.comments = req.body.comments }
    
    Book.findByIdAndUpdate(req.params.id, {$set: updateObject}, function (err, book) {
      if (err) return next(err)
      res.send('Book updated successfully!')
      return
    })
  } else {
    res.status(500).send('Client payload contains prohibited characters.')
  }
}

exports.book_delete = function (req, res) {
  Book.findByIdAndRemove(req.params.id, function (err, deletedBook) {
    if (err) return next(err)
    
    // confirming deletion was successful
    if (deletedBook) { res.send('Book deleted successfully!') }
    else { res.status(500).send(`Book ID '${req.params.id}' does not exist in the database. NOTE: The required ID value is for the database '_id' field, not the Goodreads 'bookid' field.`) }
  })
}

exports.find_by_title = function (req, res) {
  let keyWords = getTitleKeyWords(req.params.title)

  // using `$all` instead of `$in` here to be as specific as possible
  Book.find({ "titleKeyWords": { $all: keyWords } }, function (err, results) {
    if (err) { return next(err) }
    if (results.length === 0) { 
      // res.status(400).send(`No book in the database with title: ${req.params.title}`) 
      res.send({"message" : `No book in the database with title: ${req.params.title}`}) 
      return
    }
    res.send(results)
  })
}

exports.find_by_author = function (req, res) {
  let authorWords = getAuthorKeyWords(req.params.author)

  Book.find({ "authorKeyWords": { $all: authorWords } }, function (err, results) {
    if (err) { return next(err) }
    if (results.length === 0) { 
      res.send({"message" : `No book in the database with author: ${req.params.author}`}) 
      return
    }
    res.send(results)
  })
}

exports.find_by_tags = function (req, res) {
  const sentTags = req.params.tags.split(",")
  let selectedTags = []

  sentTags.forEach(element => {
    element = element.trim()
    if (selectedTags.indexOf(element) === -1) { selectedTags.push(element) }
  })

  Book.find({ "tags": { $all: selectedTags }}, function (err, results) {
    if (err) { return next(err) }
    if (results.length === 0) { 
      res.status(400).send(`No books in the database with tags: ${JSON.stringify(selectedTags)}`) 
      return
    }
    res.send(results)
  })
}

exports.find_by_isbn = function (req, res) {
  const isbn = req.params.isbn.trim()

  // if isbn is a number and 10 characters long
  if (parseInt(isbn) && isbn.length === 10) {
    Book.find({ "isbn": isbn }, function (err, book) {
      if (err) { return next(err) }
      if (book.length === 0) { 
        res.send({"message" : `No books in the database with isbn: ${isbn}`}) 
        return
      }
      res.send(book)
      return
    })
    // if isbn is a number and 13 characters long
  } else if (parseInt(isbn) && isbn.length === 13) {
    Book.find({ "isbn13": isbn }, function (err, book) {
      if (err) { return next(err) }
      if (book.length === 0) { 
        res.send({"message" : `No books in the database with isbn: ${isbn}`}) 
        return
      }
      res.send(book)
      return
    })
  } else {
    res.status(400).send('Client must send a valid 10 or 13 digit isbn value')
  }
}

exports.add_tags = function (req, res, next) {
  // full tag update
  if (req.body.creator) {
    let updateObject = {
      "tag": req.body.tag,
      "creator": req.body.creator
    }
    // $push just adds it, $addToSet adds if there are no duplicates
    Book.findByIdAndUpdate(req.params.id, { $addToSet: { tagObjects: updateObject, tags: req.body.tag }}, function (err, book) {
      if (err) return next(err)
      res.send('Tag added successfully!')
      return
    })
    // just update tags array
  } else {
    // $push just adds it, $addToSet adds if there are no duplicates
    Book.findByIdAndUpdate(req.params.id, { $addToSet: { tags: req.body.tag }}, function (err, book) {
      if (err) return next(err)
      res.send('Tag added successfully!')
      return
    })
  }
}

exports.delete_tags = function (req, res, next) {
  let deleteObject = {
    "tag": req.body.tag,
    "creator": req.body.creator
  }
  // {new: true} required in order to return the updated object
  Book.findByIdAndUpdate(req.params.id, { $pull: { tagObjects: deleteObject, tags: req.body.tag }}, {new: true}, function (err, result) {
    if (err) return next(err)
    res.send('Tag deleted successfully!')
    return
  })
}

exports.add_comments = function (req, res, next) {
  let updateObject = {
    "displayName": req.body.displayName,
    "text": req.body.text,
    "creator": req.body.creator
  }
  // $push just adds it, $addToSet adds if there are no duplicates
  Book.findByIdAndUpdate(req.params.id, { $addToSet: { comments: updateObject }}, function (err, book) {
    if (err) return next(err)
    res.send('Comment added successfully!')
    return
  })
}

exports.delete_comments = function (req, res, next) {
  let deleteObject = {
    "displayName": req.body.displayName,
    "text": req.body.text,
    "creator": req.body.creator
  }
  Book.findByIdAndUpdate(req.params.id, { $pull: { comments: deleteObject }}, function (err, book) {
    if (err) return next(err)
    res.send('Comment deleted successfully!')
    return
  })
}

exports.find_blank_books = function (req, res, next) {
  Book.find({ "tags": [] }, function (err, books) {
    if (err) { return next(err) }
    if (books.length === 0) { 
      res.send({"message" : `No blank books in the database.`}) 
      return
    }
    res.send(books)
    return
  })
}

exports.find_books_missing_tags = function (req, res) {
  let booksMissingTags = []
  Book.find({}, function (err, books) {
    for (let index = 0; index < books.length; index++) {
      const book = books[index];
      if (book.tags.length < book.tagObjects.length) {
        booksMissingTags.push(book)
      }
    }
    res.send(booksMissingTags)
  })
}