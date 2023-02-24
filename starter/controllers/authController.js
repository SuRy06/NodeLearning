const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })

}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });

  const token = signToken(newUser._id)

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const {email, password} = req.body;

  // CHECK IF EMAIL AND PASSWORD EXISTS
  if(!email || !password){
    return next(new AppError(`Please provide email and password!`, 400));
  }

  // CHECK IF USER EXISTS && PASSWORD IS CORRECT
  const user = await User.findOne({ email }).select('+password');

  if(!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password'), 401)
  }

  // IF EVERYTHING OK, SEND TOKEN TO CLIENT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  })
})

exports.protect = catchAsync(async (req, res, next) => {
  // 1) GETTING TOKEN AND CHECKING IF ITS EXISTS
  let token;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(' ')[1]
  }

  if(!token) {
    return next (new AppError('You are not logged in! Please log in to get access.', 401))
  }

  // 2) VALIDATE/VARIFICATION OF TOKEN
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  // 3) CHECK IF USER STILL EXISTS
  const currentUser = await User.findById(decoded.id);

  if(!currentUser) {
    return next(new AppError('The user belonging to this token does not exist.', 401))
  }
  
  // 4) CHECK IF USER CHANGE PASSWORD AFTER THE TOKEN IS ISSUED
  if (currentUser.changePasswordAfter(decoded.iat)) {

    return next(new AppError('User recently changed password! Please log in again', 401))
  };

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
})

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // role = ['admin', 'lead-guide']. Now role = 'req.user.role' i.e by default 'user'.
    if(!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403))
    }

    next();
  }
}

exports.forgotPassword = catchAsync(async(req, res, next) => {
  // 1) Get user based on Posted Email
    const user = await User.findOne({email:req.body.email})
    
    if(!user) {
      return next(new AppError('There is no User with this Email!', 404))
    }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false})

  // 3) Send it to users Email
})
exports.resetPassword = (req, res, next) => {}