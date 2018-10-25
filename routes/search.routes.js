const express = require('express')
const request = require('request')
const xml2js = require('xml2js')
const router = express.Router()

// ====== search all books by title ======
router.get('/title/:title', function(req, res) {
  const title = req.params.title
  // if page is not set `?page=`, or not a number, set it to 1
  const page = parseInt(req.query.page) || 1

  request.get(  
  {  
    url: `https://www.goodreads.com/search/index.xml?key=6TVJIoGvRqax9atpBsJFPw&q=${title}&search[field]=title&page=${page}`
  },  
  (getErr, getRes, getBody) => {  
    if (getErr) {  
      // console.error(getErr)
      res.status(500).send({ "error" : getErr })
      return
    } else { 
      xml2js.parseString(getBody, function (err, result) {
        const query = result.GoodreadsResponse.search[0]
        const works = query.results[0].work
        let returnArray = [{ 
          "totalResults" : query["total-results"][0], 
          "pageStart" : query["results-start"][0], 
          "pageEnd" : query["results-end"][0], 
          "currentPage" : page,
          "totalPages" : Math.floor(query["total-results"][0] / 19)
        }]

        try {
          for (let index = 0; index < works.length; index++) {
            let element = works[index];

            let bookSearchObject = {
              "goodreadsBookID" : element.best_book[0].id[0]._,
              "title" : element.best_book[0].title[0],
              "author" : element.best_book[0].author[0].name[0],
              "published" : element.original_publication_year[0]._,
              "cover" : element.best_book[0].image_url[0].replace(/m\//g, 'l/').replace(/col\//g, 'com/')
            }

            returnArray.push(bookSearchObject)
          }
          res.send(returnArray)
          return

        } catch (error) {
          // error means the query is past the last page
          returnArray.push({ "message" : "no more pages of results, totalPages and totalResults in response[0] may not be correct" })
          res.status(500).send(returnArray)
          return
        }
      })
    }  
  })
})

// ====== search all books by author ======
router.get('/author/:author', function(req, res) {
  const author = req.params.author
  // if page is not set, or not a number, set it to 1
  const page = parseInt(req.query.page) || 1

  request.get(  
  {  
    url: `https://www.goodreads.com/search/index.xml?key=6TVJIoGvRqax9atpBsJFPw&q=${author}&search[field]=author&page=${page}`
  },  
  (getErr, getRes, getBody) => {  
    if (getErr) {  
      // console.error(getErr)
      res.status(500).send({ "error" : getErr })
      return
    } else { 
      xml2js.parseString(getBody, function (err, result) {
        const query = result.GoodreadsResponse.search[0]
        const works = query.results[0].work
        let returnArray = [{ 
          "totalResults" : query["total-results"][0], 
          "pageStart" : query["results-start"][0], 
          "pageEnd" : query["results-end"][0], 
          "currentPage" : page,
          "totalPages" : Math.floor(query["total-results"][0] / 19)
        }]

        try {
          for (let index = 0; index < works.length; index++) {
            let element = works[index];

            let bookSearchObject = {
              "goodreadsBookID" : element.best_book[0].id[0]._,
              "title" : element.best_book[0].title[0],
              "author" : element.best_book[0].author[0].name[0],
              "published" : element.original_publication_year[0]._,
              "cover" : element.best_book[0].image_url[0].replace(/m\//g, 'l/').replace(/col\//g, 'com/')
            }

            returnArray.push(bookSearchObject)
          }
          res.send(returnArray)
          return

        } catch (error) {
          // error means the query is past the last page
          returnArray.push({ "message" : "no more pages of results, totalPages and totalResults in response[0] may not be correct" })
          res.status(500).send(returnArray)
          return
        }
      })
    }  
  })
})

// ====== search all books by isbn or isbn13 ======
router.get('/isbn/:isbn', function(req, res) {
  const isbn = req.params.isbn

  // isbn will have a value of null if it is not a number value  
  if (parseInt(isbn)) {
    request.get(  
    {  
      url: `https://www.goodreads.com/search/index.xml?key=6TVJIoGvRqax9atpBsJFPw&q=${isbn}&search[field]=isbn`
    },  
    (getErr, getRes, getBody) => {  
      if (getErr) {  
        // console.error(getErr)
        res.status(500).send({ "error" : getErr })
        return
      } else { 
        xml2js.parseString(getBody, function (err, result) {
          // returns an array of works
          const works = result.GoodreadsResponse.search[0].results[0].work
          let returnArray = []

          for (let index = 0; index < works.length; index++) {
            let element = works[index];

            let bookSearchObject = {
              "goodreadsBookID" : element.best_book[0].id[0]._,
              "title" : element.best_book[0].title[0],
              "author" : element.best_book[0].author[0].name[0],
              "published" : element.original_publication_year[0]._,
              "cover" : element.best_book[0].image_url[0].replace(/m\//g, 'l/').replace(/col\//g, 'com/')
            }
              returnArray.push(bookSearchObject)
          }
          res.send(returnArray)
          return
        })
      }  
    })
  } else {
    res.status(500).send({"error": "isbn must be a number"})
  }
})

// ====== use goodreads bookid, obtained through other searches, to find book details ======
router.get('/details/:bookid', function(req, res) {
  const bookid = parseInt(req.params.bookid)

  // bookid will have a value of null if it is not a number value  
  if (bookid) {
    request.get(  
    {  
      url: `https://www.goodreads.com/book/show.xml?key=6TVJIoGvRqax9atpBsJFPw&id=${bookid}`
    },  
    (getErr, getRes, getBody) => {  
      if (getErr) {  
        // console.error(getErr)
        res.status(500).send({ "error" : getErr })
        return
      } else { 
        xml2js.parseString(getBody, function (err, result) {
          const book = result.GoodreadsResponse.book[0]
          let authors = []

          const contributors = book.authors[0].author
          for (let index = 0; index < contributors.length; index++) {
            const contributor = contributors[index]
            // making sure to only return authors, not other kinds of contributors
            if (contributor.role[0] == "") { authors.push(contributor.name[0]) }
          }
          
          let returnObject = {
            "goodreadsBookID" : book.id[0],
            "title" : book.title[0],
            "author" : authors,
            "isbn" : book.isbn[0],
            "isbn13" : book.isbn13[0],
            "published" : book.publication_year[0],
            "publisher" : book.publisher[0],
            "cover" : book.image_url[0].replace(/m\//g, 'l/').replace(/col\//g, 'com/'),
            "description" : book.description[0]
          }

          res.send(returnObject)
          return
        })
      }  
    })
  } else {
    res.status(500).send({"error": "searched value must be a valid Goodreads book_id"})
  }
})  


module.exports = router