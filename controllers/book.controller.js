const Book = require('../models/book.model')

exports.test = function (req, res) {
  res.send('Greetings from Counseling Book Tags test controller!')
}

exports.book_create_new_record = function (req, res) {
  let book = new Book(
    {
      title: req.body.title,
      author: req.body.author,
      isbn: req.body.isbn,
      tags: req.body.tags,
      comments: req.body.comments
    }
  )

  book.save(function(err) {
    if (err) {
      return next(err)
    }
    res.send('Book record created successfully!')
  })
}

exports.return_all_books = function (req, res) {
  Book.find({}, function (err, data) {
    if (err) return next(err)
    res.send(data)
  })
}

exports.book_details = function (req, res) {
  Book.findById(req.params.id, function (err, book) {
    if (err) return next(err)
    if (book) res.send(book)
    else res.status(404).send('This book ID does not exist.')
  })
}

exports.book_update = function (req, res, next) {
  // either option works here
  Book.findByIdAndUpdate(req.params.id, {$set: req.body}, function (err, book) {
  // Book.findOneAndUpdate({_id: req.params.id}, {$set: req.body}, function (err, book) {
    if (err) return next(err)
    res.send('Book updated!')
  })
}

exports.book_delete = function (req, res) {
  Book.findByIdAndRemove(req.params.id, function (err) {
    if (err) return next(err)
    res.send('Book deleted successfully!')
  })
}