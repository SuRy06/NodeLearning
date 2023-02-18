const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {

  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
  // const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicate fields value: ${err.errors.name.value}, Please use another value!`;

  return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(message, 400)
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  })
}
const sendErrorProd = (err, res) => {
  if(err.isOperational) {
    // OPerational, trusted error: send message to client
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    })

    // Programming or other unknown error, dont leak error details.
  } else {
    // 1) Log Error
    console.error("ERROR", err);

    // 2) Send Generic Message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    })
  }
}


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development') {
      sendErrorDev(err, res)
    }else if(process.env.NODE_ENV === 'production') {
      let error = {...err};

      if(error.kind === 'ObjectId') error = handleCastErrorDB(error);
      if(error.errors.name.kind === 'user defined') error = handleDuplicateFieldsDB(error);
      if(error._message === 'Validation failed') error = handleValidationErrorDB (error);

      sendErrorProd(error, res)
    }
  
  }