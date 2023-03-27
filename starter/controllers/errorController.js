const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicate fields value: ${
    Object.keys(err.keyPattern)[0]
  }, Please use another value!`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) =>
  new AppError('Invalid Token. Please Log in Again!', 401);

const handleJWTExpiredError = (err) =>
  new AppError('Your Token has expired. Please Log in Again!', 401);

// This "sendErrorDev" is a function that sends error back to the client for development.
const sendErrorDev = (err, req, res) => {
  //"originalUrl"is basically the original url but not with the host. ".startsWith()" this function is available for the strings, and it does what the name says.
  if (req.originalUrl.startsWith('./api')) {
    // API
    // this section of code to show error for the api hitting routes, i.e comming from the postman.
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // RENDERED WEBSITE
  console.error('ERROR', err);
  // this code is to the render the error.
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

// This "sendErrorDev" is a function that sends error back to the client for production.
const sendErrorProd = (err, req, res) => {
  // return false;
  if (req.originalUrl.startsWith('./api')) {
    // A) API
    // this section of code to show error for the api hitting routes, i.e comming from the postman.
    if (err.isOperational) {
      // A) Operational, trusted error: send message to client
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming or other unknown error, dont leak error details.
    // 1) Log Error
    console.error('ERROR', err);
    // 2) Send Generic Message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  // B) RENDERED WEBSITE
  // this section of code to show error for the api hitting routes, i.e comming from the postman.
  // OPerational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
  // Programming or other unknown error, dont leak error details.
  // 1) Log Error
  console.error('ERROR', err);
  // 2) Send Generic Message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }; //this "error" object is the copy of the "err" that is coming into the middleware
    //this copies the "message" from "err" object to the "error"object made by us.
    error.message = err.message;

    if (error.kind === 'ObjectId') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error._message === 'Validation failed')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError(error);

    sendErrorProd(error, req, res);
  }
};
