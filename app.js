const bodyParser = require('body-parser');
const cluster = require('cluster');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const express = require('express');
const favicon = require('serve-favicon');
const http = require('http');
const i18n = require('i18n');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const path = require('path');
const session = require('express-session');

dotenv.config({ path: path.join(__dirname, '.env') });
const numCPUs = process.env.WEB_CONCURRENCY || require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++)
    cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  const app = express();
  const server = http.createServer(app);

  const PORT = process.env.PORT || 3000;
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/node101';
  const MAX_SERVER_UPLOAD_LIMIT = 52428800;
  const MAX_SERVER_PARAMETER_LIMIT = 50000;
  const QUERY_LIMIT = 20;

  const adminRouteController = require('./routes/adminRoute');
  const apiRouteController = require('./routes/apiRoute');
  const authRouteController = require('./routes/authRoute');
  const blogRouteController = require('./routes/blogRoute');
  const bookRouteController = require('./routes/bookRoute');
  const eventRouteController = require('./routes/eventRoute');
  const guideRouteController = require('./routes/guideRoute');
  const indexRouteController = require('./routes/indexRoute');
  const memberRouteController = require('./routes/memberRoute');
  const projectRouteController = require('./routes/projectRoute');
  const stakeRouteController = require('./routes/stakeRoute');
  const tagRouteController = require('./routes/tagRoute');
  const venueRouteController = require('./routes/venueRoute');
  const wizardRouteController = require('./routes/wizardRoute');
  const writerRouteController = require('./routes/writerRoute');
  const writingRouteController = require('./routes/writingRoute');

  const fromDateToHTMLInputString = require('./utils/fromDateToHTMLInputString');
  // const updateData = require('./utils/updateData');

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  mongoose.set('strictQuery', false);
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  i18n.configure({
    locales:['tr', 'en'],
    directory: __dirname + '/translations',
    queryParameter: 'lang',
    defaultLocale: 'tr'
  });

  app.use(express.static(path.join(__dirname, 'public')));
  app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(bodyParser.json({ limit: MAX_SERVER_UPLOAD_LIMIT }));
  app.use(bodyParser.urlencoded({
    extended: true,
    limit: MAX_SERVER_UPLOAD_LIMIT,
    parameter: MAX_SERVER_PARAMETER_LIMIT
  }));
  app.use(i18n.init);

  const sessionOptions = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGODB_URI
    })
  });

  app.use(cookieParser());
  app.use(sessionOptions);

  app.use((req, res, next) => {
    if (!req.query || typeof req.query != 'object')
      req.query = {};
    if (!req.body || typeof req.body != 'object')
      req.body = {};

    res.locals.QUERY_LIMIT = QUERY_LIMIT;
    res.locals.fromDateToHTMLInputString = fromDateToHTMLInputString;
    req.query.limit = QUERY_LIMIT;

    next();
  });

  app.use('/', indexRouteController);
  app.use('/admin', adminRouteController);
  app.use('/api', apiRouteController);
  app.use('/auth', authRouteController);
  app.use('/blog', blogRouteController);
  app.use('/book', bookRouteController);
  app.use('/event', eventRouteController);
  app.use('/guide', guideRouteController);
  app.use('/member', memberRouteController);
  app.use('/project', projectRouteController);
  app.use('/stake', stakeRouteController);
  app.use('/tag', tagRouteController);
  app.use('/venue', venueRouteController);
  app.use('/wizard', wizardRouteController);
  app.use('/writer', writerRouteController);
  app.use('/writing', writingRouteController);

  server.listen(PORT, () => {
    console.log(`Server is on port ${PORT} as Worker ${cluster.worker.id} running @ process ${cluster.worker.process.pid}`);
  });
}
