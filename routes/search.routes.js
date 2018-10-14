const express = require('express')
const request = require('request')
const xml2js = require('xml2js')
const router = express.Router()

router.get('/title/:title', function(req, res) {
  const title = req.params.title

  request.get(  
  {  
    url: `https://www.goodreads.com/search/index.xml?key=6TVJIoGvRqax9atpBsJFPw&q=${title}&search[field]=title`
  },  
  (getErr, getRes, getBody) => {  
    if (getErr) {  
      console.error(getErr)
      res.status(500).send({ "error" : getErr })
      return
    } else { 
      // res.setHeader("Cache-Control", "private, max-age=600")
      xml2js.parseString(getBody, function (err, result) {
        res.send(result.GoodreadsResponse.search[0].results);
        return
      })
    }  
  })
})

router.get('/author/:author', function(req, res) {
  const author = req.params.author

  request.get(  
  {  
    url: `https://www.goodreads.com/search/index.xml?key=6TVJIoGvRqax9atpBsJFPw&q=${author}&search[field]=author`
  },  
  (getErr, getRes, getBody) => {  
    if (getErr) {  
      console.error(getErr)
      res.status(500).send({ "error" : getErr })
      return
    } else { 
      // res.setHeader("Cache-Control", "private, max-age=600")
      xml2js.parseString(getBody, function (err, result) {
        res.send(result.GoodreadsResponse.search[0].results);
        return
      })
    }  
  })
})

router.get('/isbn/:isbn', function(req, res) {
  const isbn = parseInt(req.params.isbn)

  // isbn will have a value of null if it is not a number value  
  if (isbn) {
    request.get(  
    {  
      url: `https://www.goodreads.com/search/index.xml?key=6TVJIoGvRqax9atpBsJFPw&q=${isbn}&search[field]=isbn`
    },  
    (getErr, getRes, getBody) => {  
      if (getErr) {  
        console.error(getErr)
        res.status(500).send({ "error" : getErr })
        return
      } else { 
        // res.setHeader("Cache-Control", "private, max-age=600")
        xml2js.parseString(getBody, function (err, result) {
          res.send(result.GoodreadsResponse.search[0].results);
          return
        })
      }  
    })
  } else {
    res.status(500).send({"error": "isbn must be a number"})
  }
})

module.exports = router