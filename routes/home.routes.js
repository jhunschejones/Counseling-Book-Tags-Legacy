const express = require('express')
const router = express.Router()
const path = require('path')

router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../views', 'index.html'))
})

router.get('/search', function(req, res) {
  res.sendFile(path.join(__dirname, '../views', 'search.html'))
})

router.get('/details', function(req, res) {
  res.sendFile(path.join(__dirname, '../views', 'details.html'))
})

module.exports = router