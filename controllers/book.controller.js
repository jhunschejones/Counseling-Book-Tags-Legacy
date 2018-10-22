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
    if (unimportant.indexOf(element) === -1 ) {
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

  authors.forEach(author => {
    const authorWords = author.split(" ")

    authorWords.forEach(element => {
      // trim any spaces off the ends of the word
      element = element.trim()
      // capitolize word
      element = element.toUpperCase()
  
      // check if word is already in array
      if (keyWords.indexOf(element) === -1 ) {
        // add word to keyWords array
        keyWords.push(element)
      }
    })
  });
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

  // description field needs to be able to have html in it, so this security check blocks valid content
  // if (safeInput(JSON.stringify(req.body))) {

    // checks required fields and handles instead of crashing
    if (req.body.goodreadsBookID && req.body.title && req.body.author && req.body.isbn) {
      let keyWords = getTitleKeyWords(req.body.title)
      let authorWords = getAuthorKeyWords(req.body.author)
      let all_tags = makeAllTagsArray(req.body.tags)
      
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
          tags: req.body.tags,
          allTags: all_tags,
          comments: req.body.comments
        }
      )

      book.save(function(err) {
        if (err) {
          return next(err)
        }
        res.send('Book record created successfully!')
      })
    } else {
      // not all required fields were passed with a value
      res.status(500).send('`goodreadsBookID`, `title`, `author`, and `isbn` are required fields')
    }
  // } else {
  //   // client sent prohibited characters
  //   res.status(500).send('Client payload included prohibited characters.')
  // }
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
    if (book) res.send(book)
    else res.status(404).send(`Book ID '${req.params.id}' does not exist in the database. NOTE: The required ID value is for the database '_id' field, not the Goodreads 'bookid' field.`)
  })
}

exports.book_update = function (req, res, next) {
  // description field needs to be able to have html in it, so this security check blocks valid content
  // if (safeInput(JSON.stringify(req.body))) {
    Book.findByIdAndUpdate(req.params.id, {$set: req.body}, function (err, book) {
      if (err) return next(err)
      res.send('Book updated successfully!')
      return
    })
  // } else {
  //   res.status(500).send('Client payload contains prohibited characters.')
  // }
}

// TODO no error handling at this endpoint
exports.book_delete = function (req, res) {
  Book.findByIdAndRemove(req.params.id, function (err) {
    if (err) return next(err)
    res.send('Book deleted successfully!')
  })
}

exports.find_by_title = function (req, res) {
  let keyWords = getTitleKeyWords(req.params.title)

  // using `$all` instead of `$in` here to be as specific as possible
  Book.find({ "titleKeyWords": { $all: keyWords } }, function (err, results) {
    if (err) { return next(err) }
    if (results.length === 0) { 
      res.status(400).send(`No book in the database with title: ${req.params.title}`) 
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
      res.status(400).send(`No book in the database with author: ${req.params.author}`) 
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

  Book.find({ "allTags": { $all: selectedTags }}, function (err, results) {
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
        res.status(400).send(`No books in the database with isbn: ${isbn}`) 
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
        res.status(400).send(`No books in the database with isbn: ${isbn}`) 
        return
      }
      res.send(book)
      return
    })
  } else {
    res.status(400).send('Client must send a valid 10 or 13 digit isbn value')
  }
}