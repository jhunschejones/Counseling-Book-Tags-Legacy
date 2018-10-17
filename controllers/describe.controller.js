function generateAPIdocumentation(hostPath) {
  const apiDocumentation = [
    {
      "route" : hostPath + "/",
      "requests" : [{
        "method" : "GET",
        "description" : "Returns home page with tagged-book list",
        "queryParameters" : [],
        "responseFormat" : {}
      }]
    },
    {
      "route" : hostPath + "/api/v1",
      "requests" : [{
        "method" : "GET",
        "description" : "Returns JSON documentation of all API endpoints",
        "queryParameters" : [],
        "responseFormat" : {}
      }]
    },
    {
      "route" : hostPath + "/api/v1/search/title/:title",
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
      "route" : hostPath + "/api/v1/search/author/:author",
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
      "route" : hostPath + "/api/v1/search/isbn/:isbn",
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
      "route" : hostPath + "/api/v1/search/details/:bookid",
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
      "route" : hostPath + "/api/v1/book",
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
            goodreadsBookID: {type: String, required: true},
            title: {type: String, required: true},
            titleKeyWords: {type: Array, required: true},
            author: {type: Array, required: true},
            authorKeyWords: {type: Array, required: true},
            isbn: {type: String, required: true},
            isbn13: {type: String, required: false},
            published: {type: String, required: false},
            publisher: {type: String, required: false},
            cover: {type: String, required: false},
            sameBook: {type: Array, required: false},
            tags: {type: Array, required: false},
            comments: {type: Array, required: false},
          }
        }
      ]
    },
    {
      "route" : hostPath + "/api/v1/book/:id",
      "requests" : 
      [
        {
          "method" : "GET",
          "description" : "Get a specific book from the tags database by id",
          "queryParameters" : [],
          "responseFormat" : {
            goodreadsBookID: {type: String, required: true},
            title: {type: String, required: true},
            titleKeyWords: {type: Array, required: true},
            author: {type: Array, required: true},
            authorKeyWords: {type: Array, required: true},
            isbn: {type: String, required: true},
            isbn13: {type: String, required: false},
            published: {type: String, required: false},
            publisher: {type: String, required: false},
            cover: {type: String, required: false},
            sameBook: {type: Array, required: false},
            tags: {type: Array, required: false},
            comments: {type: Array, required: false},
          }
        },
        {
          "method" : "PUT",
          "description" : "Update a specific book from the tags database by id",
          "queryParameters" : [],
          "responseFormat" : [],
          "payload" : "`_id` value for the book to update"
        },
        {
          "method" : "DELETE",
          "description" : "Delete a specific book from the tags database by id",
          "queryParameters" : [],
          "responseFormat" : [],
          "payload" : "`_id` value for the book to delete"
        }
      ]
    },
    {
      "route" : hostPath + "/api/v1/book/title/:title",
      "requests" : [{
        "method" : "GET",
        "description" : "Returns all books with matching title keywords",
        "queryParameters" : [],
        "responseFormat" : {
          goodreadsBookID: {type: String, required: true},
          title: {type: String, required: true},
          titleKeyWords: {type: Array, required: true},
          author: {type: Array, required: true},
          authorKeyWords: {type: Array, required: true},
          isbn: {type: String, required: true},
          isbn13: {type: String, required: false},
          published: {type: String, required: false},
          publisher: {type: String, required: false},
          cover: {type: String, required: false},
          sameBook: {type: Array, required: false},
          tags: {type: Array, required: false},
          comments: {type: Array, required: false},
        }
      }]
    },
    {
      "route" : hostPath + "/api/v1/book/author/:author",
      "requests" : [{
        "method" : "GET",
        "description" : "Returns all books with matching author keywords",
        "queryParameters" : [],
        "responseFormat" : {
          goodreadsBookID: {type: String, required: true},
          title: {type: String, required: true},
          titleKeyWords: {type: Array, required: true},
          author: {type: Array, required: true},
          authorKeyWords: {type: Array, required: true},
          isbn: {type: String, required: true},
          isbn13: {type: String, required: false},
          published: {type: String, required: false},
          publisher: {type: String, required: false},
          cover: {type: String, required: false},
          sameBook: {type: Array, required: false},
          tags: {type: Array, required: false},
          comments: {type: Array, required: false},
        }
      }]
    },
    {
      "route" : hostPath + "/api/v1/book/isbn/:isbn",
      "requests" : [{
        "method" : "GET",
        "description" : "Returns all books with matching isbn or isbn13",
        "queryParameters" : [],
        "responseFormat" : {
          goodreadsBookID: {type: String, required: true},
          title: {type: String, required: true},
          titleKeyWords: {type: Array, required: true},
          author: {type: Array, required: true},
          authorKeyWords: {type: Array, required: true},
          isbn: {type: String, required: true},
          isbn13: {type: String, required: false},
          published: {type: String, required: false},
          publisher: {type: String, required: false},
          cover: {type: String, required: false},
          sameBook: {type: Array, required: false},
          tags: {type: Array, required: false},
          comments: {type: Array, required: false},
        }
      }]
    },
    {
      "route" : hostPath + "/api/v1/book/tags/:tags",
      "requests" : [{
        "method" : "GET",
        "description" : "Returns all books matching tags passed in as comma-seperated strings",
        "queryParameters" : [],
        "responseFormat" : {
          goodreadsBookID: {type: String, required: true},
          title: {type: String, required: true},
          titleKeyWords: {type: Array, required: true},
          author: {type: Array, required: true},
          authorKeyWords: {type: Array, required: true},
          isbn: {type: String, required: true},
          isbn13: {type: String, required: false},
          published: {type: String, required: false},
          publisher: {type: String, required: false},
          cover: {type: String, required: false},
          sameBook: {type: Array, required: false},
          tags: {type: Array, required: false},
          comments: {type: Array, required: false},
        }
      }]
    },
  ]
  return apiDocumentation
}

exports.display_api_documentation = function (req, res) {
  const documentation = generateAPIdocumentation(req.headers.host)
  res.send(documentation)
}