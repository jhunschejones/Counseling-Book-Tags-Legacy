// const newrelic = require('newrelic')
const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')
const app = express()
app.use(bodyParser.json())
app.use(compression())

// ====== Set up database connection ======
const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://danielle:password88@ds027699.mlab.com:27699/counseling-tags', { useNewUrlParser: true })
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

// ====== Set up routes ======
const apiRoute = require('./routes/book.routes')
const homeRoute = require('./routes/home.routes')
const searchRoute = require('./routes/search.routes')
app.use('/api/v1/book', apiRoute)
app.use('/api/v1/search', searchRoute)
app.use('/', homeRoute)
// app.use(express.static(__dirname + '/views'));

var PORT = process.env.PORT || 3000
app.listen(PORT, () => {
	console.log('Server is running on port ' + PORT)
})