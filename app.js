const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const nunjucks = require('nunjucks');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const dbConfig = require('./dbconfig');

const indexRouter = require('./routes/index');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'njk');
nunjucks.configure('views', {
  express: app,
  autoescape: true,
});

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
const sessionStore = new MySQLStore(dbConfig);
app.use(session({
  key: 'session_cookie_name',
  secret: 'session_cookie_secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false
}));

// Routes setup
app.use('/', indexRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).render('error', { message: 'Not Found' });
});

// Error handler
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Internal Server Error' });
});

module.exports = app;
