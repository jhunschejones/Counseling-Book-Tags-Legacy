const express = require('express')
const router = express.Router()

// returns a JSON object describing all available endpoints
router.get('/', function(req, res) {
  const apiDocumentation = [
    {
      "route" : req.headers.host + "/",
      "requests" : [{
        "method" : "GET",
        "description" : "Returns home page with tagged-book list",
        "queryParameters" : [],
        "responseFormat" : {}
      }]
    },
    {
      "route" : req.headers.host + "/api/v1",
      "requests" : [{
        "method" : "GET",
        "description" : "Returns JSON documentation of all API endpoints",
        "queryParameters" : [],
        "responseFormat" : {}
      }]
    },
    {
      "route" : req.headers.host + "/api/v1/search/title/:title",
      "requests" : [{
        "method" : "GET",
        "description" : "Returns JSON array of all books matching the title specified in the URI parameter",
        "queryParameters" : [{"&page=" : "takes an integer for page number", "default" : "1"}],
        "responseFormat" : {
          "bookid" : "string",
          "title" : "string",
          "author" : "string",
          "published" : "string: year",
          "cover" : "string: image url"
        }
      }]
    },
    {
      "route" : req.headers.host + "/api/v1/search/author/:author",
      "requests" : [{
        "method" : "GET",
        "description" : "Returns JSON array of all books matching the author specified in the URI parameter",
        "queryParameters" : [{"&page=" : "takes an integer for page number", "default" : "1"}],
        "responseFormat" : {
          "bookid" : "string",
          "title" : "string",
          "author" : "string",
          "published" : "string: year",
          "cover" : "string: image url"
        }
      }]
    },
    {
      "route" : req.headers.host + "/api/v1/search/isbn/:isbn",
      "requests" : [{
        "method" : "GET",
        "description" : "Returns JSON array of all books matching the isbn specified in the URI parameter",
        "queryParameters" : [],
        "responseFormat" : {
          "bookid" : "string",
          "title" : "string",
          "author" : "string",
          "published" : "string: year",
          "cover" : "string: image url"
        }
      }]
    },
    {
      "route" : req.headers.host + "/api/v1/search/details/:bookid",
      "requests" : [{
        "method" : "GET",
        "description" : "Returns JSON array of all books matching the bookid specified in the URI parameter",
        "queryParameters" : [],
        "responseFormat" : {
          "id" : "string",
          "title" : "string",
          "author(s)" : "array of authors",
          "isbn" : "string",
          "isbn13" : "string",
          "published" : "string",
          "publisher" : "string",
          "cover" : "string: image url",
          "description" : "string: html"
        }
      }]
    },
    {
      "route" : req.headers.host + "/api/v1/book",
      "requests" : 
      [
        {
          "method" : "GET",
          "description" : "Returns JSON array of all books in the tags database",
          "queryParameters" : [],
          "responseFormat" : []
        },
        {
          "method" : "POST",
          "description" : "Add a new book to the database",
          "queryParameters" : [],
          "responseFormat" : [],
          "payload" : {
            "title": "string",
            "author": "string",
            "isbn": "string",
            "tags": [],
            "comments": []
          }
        }
      ]
    },
    {
      "route" : req.headers.host + "/api/v1/book/:id",
      "requests" : 
      [
        {
          "method" : "GET",
          "description" : "Get a specific book from the tags database by id",
          "queryParameters" : [],
          "responseFormat" : [],
        },
        {
          "method" : "PUT",
          "description" : "Update a specific book from the tags database by id",
          "queryParameters" : [],
          "responseFormat" : [],
        },
        {
          "method" : "DELETE",
          "description" : "Delete a specific book from the tags database by id",
          "queryParameters" : [],
          "responseFormat" : [],
        }
      ]
    },

  ]
  res.send(apiDocumentation)
})

module.exports = router