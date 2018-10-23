const mongoose = require('mongoose')
const Schema = mongoose.Schema

// ====== Model Notes: ======
// `author` is an array to accomidate multiple authors
// `goodreadsBookID` is the Goodreads book_id, different than MongoDB `_id` value
// `sameBook` is an array of Goodreads bookid's that should be treated as the same book
// `tags` and `comments` are arrays of objects that include the content and author id
let BookSchema = new Schema({
  goodreadsBookID: {type: String, required: true},
  title: {type: String, required: true},
  titleKeyWords: {type: Array, required: true},
  author: {type: Array, required: true},
  authorKeyWords: {type: Array, required: true},
  isbn: {type: String, required: true},
  isbn13: {type: String, required: false},
  published: {type: String, required: true},
  publisher: {type: String, required: true},
  cover: {type: String, required: true},
  description: {type: String, required: false},
  sameBook: {type: Array, required: false},
  tagObjects: {type: Array, required: false},
  tags: {type: Array, required: false},
  comments: {type: Array, required: false},
})

module.exports = mongoose.model('Book', BookSchema)