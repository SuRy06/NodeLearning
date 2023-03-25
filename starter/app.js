const path = require('path'); //this is a builtin core module of node that manipulates path.
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser')

// MOUNTING OF ROUTES
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.engine('pug', require('pug').__express)
app.set('view engine', 'pug'); //this piece of code here tells express which templating engine to use. pug templates are called "views".
app.set('views', path.join(__dirname, 'views')); //"path.join(__dirname, 'views')" this will behind the scenes will then, join the directory name with views. By using this node will automatically create the correct path.

// GLOBAL MIDDLEWARES
// *Serving static files
//old->
// app.use(express.static(`${__dirname}/public`));
//new->
app.use(express.static(path.join(__dirname, 'public'))); //"express.static"by using this code, we define that, all the static assets will, automatically be served from a folder called 'public'.

// *Set security HTTP headers
app.use(helmet())

// *Developmetn Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// *Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100,
  message: 'Too many requests from this IP, please try again in an hour',
});

app.use('/api', limiter);

// *Body Parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //-This is a body parser thar parses the data from the body.
app.use(cookieParser()); //-This is a cookie parser that parses the data from the cookie, that comes in with the request.

// Data sanitizaation against NoSQL query injection
app.use(mongoSanitize());

// Data sanitizaation against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// *Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  console.log(req.cookies);
  next();
});

// ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`)
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));

  // next(err);
});

app.use(globalErrorHandler);

module.exports = app;
