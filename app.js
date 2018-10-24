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
// --- Llab database string
// mongoose.connect('mongodb://danielle:password88@ds027699.mlab.com:27699/counseling-tags', { useNewUrlParser: true })
// --- mongoDB.Atlas database string
mongoose.connect('mongodb://user:counseling-tags@cluster1-shard-00-00-elo9z.mongodb.net:27017,cluster1-shard-00-01-elo9z.mongodb.net:27017,cluster1-shard-00-02-elo9z.mongodb.net:27017/counseling-book-tags-database?ssl=true&replicaSet=Cluster1-shard-0&authSource=admin&retryWrites=true', { useNewUrlParser: true })
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

// ====== Set up routes ======
const bookRoute = require('./routes/book.routes')
const homeRoute = require('./routes/home.routes')
const searchRoute = require('./routes/search.routes')
const describeRoute = require('./routes/describe.routes')
app.use('/api/v1/book', bookRoute)
app.use('/api/v1/search', searchRoute)
app.use('/api/v1', describeRoute)
app.use('/', homeRoute)
app.set('json spaces', 2);
// ====== Serve up public folder resources ======
app.use('/public', express.static(__dirname + '/public'));

var PORT = process.env.PORT || 3000
app.listen(PORT, () => {
	console.log('Server is running on port ' + PORT)
})