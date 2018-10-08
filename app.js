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
app.use('/api/v1', apiRoute)
app.use('/', homeRoute)
// app.use(express.static(__dirname + '/views'));

app.listen(3000, () => {
	console.log('Server is running on port 3000')
})