const newrelic = require('newrelic');
const cluster = require('cluster');

// this code runs in the master process
if (cluster.isMaster) {
  // count the machine's CPU's
  var cpuCount = require('os').cpus().length;
  var workerCount;

  // create a worker for each CPU, limit 4
  if (cpuCount > 3) { workerCount = 3; } 
  else { workerCount = cpuCount; }

  for (var i = 0; i < workerCount; i += 1) {
    cluster.fork();
  }

  // listen for dying workers
  cluster.on('exit', function (worker) {
    console.log("Worker %d died :(", worker.id);
    var deadWorker = worker.id;
    newrelic.recordMetric('Custom/Backend/WorkerDown', deadWorker);
    newrelic.recordCustomEvent('WorkerDeath', {'Dead Worker': deadWorker});

    // replace the dead worker
    cluster.fork();
  }); 
} else {
  // this code runs in a worker process
  if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
  }
  const express = require('express');
  const bodyParser = require('body-parser');
  const compression = require('compression');
  const app = express();
  // security
  const helmet = require('helmet'); 
  const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;
  const cors = require('cors');

  // limit requests to 100 per 15mins in production
  const rateLimit = require('express-rate-limit');
  app.enable("trust proxy"); 
  const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 200,
    message: "Too many requests from this IP, please try again in 15 minutes",
    statusCode: 429
  });
  if (process.env.NODE_ENV === 'production') { app.use("/api/", apiLimiter); }

  app.use(bodyParser.json());
  app.use(compression());
  app.use(helmet());
  app.use(redirectToHTTPS([/localhost:(\d{4})/]));
  app.use(cors());

  // ====== Set up database connection ======
  const mongoose = require('mongoose');
  mongoose.set('useFindAndModify', false);
  mongoose.connect(process.env.MONGO_STRING, { useNewUrlParser: true });
  let db = mongoose.connection;
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));

  // ====== Set up routes ======
  const bookRoute = require('./routes/book.routes');
  const homeRoute = require('./routes/home.routes');
  const searchRoute = require('./routes/search.routes');
  const describeRoute = require('./routes/describe.routes');
  app.use('/api/v1/book', bookRoute);
  app.use('/api/v1/search', searchRoute);
  app.use('/api/v1', describeRoute);
  app.use('/', homeRoute);
  app.set('json spaces', 2);
  // ====== Serve up public folder resources ======
  app.use('/public', express.static(__dirname + '/public'));

  var PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Worker ${cluster.worker.id} is running on port ${PORT} in ${process.env.NODE_ENV}.`);
  });
}