const express      = require('express');
const path         = require('path');
const favicon      = require('serve-favicon');
const logger       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const layouts      = require('express-ejs-layouts');
const mongoose     = require('mongoose');
const session      = require('express-session');  // ORDER MATTERS
const passport     = require('passport');         // SESSION THEN PASSPORT
const cors         = require('cors');


require('dotenv').config();
// run all the code inside "passport-config.js"
require('./config/passport-config.js');

mongoose.connect(process.env.MONGODB_URI);

const app = express();
const router = express.Router();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// default value for title local
app.locals.title = 'mhPortal';

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(layouts);
app.use(session({
  secret:'blah sdfj qewop', // value doesn't matter, has to be different for every app
  resave:true,
  saveUninitialized:true
})); // parentheses for .use( and (session

// PASSPORT Middlewares
//    need to come after app.use(session({...}));
app.use(passport.initialize());
app.use(passport.session());
// ----------------------------------------------

app.use(cors({
  credentials:true,
  origin:['http://localhost:4200']
}));

// THIS MIDDELWARE CREATES THE "currentUser" varaivable for ALL views
//    check if the user is loggged in
app.use((req, res, next) => {
  if (req.user) {
    // creates the currentUser variable
    res.locals.currentUser = req.user;
  }
  // if you don't include "next()" your app will hang
  next();
});

const checklogin = require('./routes/checklogin');
app.use('/api', checklogin);

const dataRoute = require('./routes/data-route');
app.use('/api', dataRoute);

const patientApi = require('./routes/patient-route');
app.use('/patient-api', patientApi);

const doctorApi = require('./routes/doctor-route');
app.use('/doctor-api', doctorApi);

app.use((req, res, next) => {
  res.sendFile(__dirname+'/public/index.html');
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
