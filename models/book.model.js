const mongoose = require('mongoose')
const Schema = mongoose.Schema

let BookSchema = new Schema({
  title: {type: String, required: true},
  author: {type: String, required: true},
  isbn: {type: Number, required: true},
  tags: {type: Array, required: false},
  comments: {type: Array, required: false},
})

module.exports = mongoose.model('Book', BookSchema)