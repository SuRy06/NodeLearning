const mongoose = require('mongoose');
const Tour = require('./tourModels');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
      trim: true,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be within 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  //   THIS PART IS USED WHEN THE IT IS NOT STORED IN DATABASE BUT IS SHOWN WHEN THE QUERY IS FETCHED.
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// This code is for each combination of tour and user has always have to be unique. It is used here so that the user cannot write multiple reviews for the same tour
reviewSchema.index({ tour: 1, user: 1 }, { uniuq: true });

// FUNCTION TO POPULATE THE REFRENCING ID'S WITH THE EMBEDDING OF DATA
// 1 starts
/*
const populateSchema = function (ths, popObj) {
  ths.populate(popObj);
};

reviewSchema.pre(/^find/, function (next) {
  const popObj = {
    path: 'tour',
    select: 'name',
  };
  populateSchema(this, popObj);
  next();
});
reviewSchema.pre(/^find/, function (next) {
  const popObj = {
    path: 'user',
    select: 'name photo',
  };
  populateSchema(this, popObj);
  next();
});
*/
// 1 ends
// OR
// 2 starts
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});
// 2 ends

// We use statics method here to call the aggregate function to the Review modal. this.aggregate, points to the current save document of review.
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }, //selecting all the reviews that match the selected tourId
    },
    {
      //calculated statistics for all of this reviews
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  // saving the statistics to the currrent tour
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// In order to call this calcAverageRatings function, we call it after a new review is being created, i.e using the post method
reviewSchema.post('save', function () {
  // "this" points to the current review document that is being saved.
  this.constructor.calcAverageRatings(this.tour); //this.constructor, points to the current model, here i.e Review model
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // here the "this"keyword refers to the current query, not the current doc. so we are going to execute the query so that it give us the current document on which it is being executed.
  this.r = await this.findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, async function (next) {
  await this.r.constructor.calcAverageRatings(this.r.tour); //this.r == 'this' in "this.constructor.calcAverageRatings(this.tour)". so this.r is equal to the current document and this.r.constrcutor refers to the model. // "await this.findOne()" does NOT work here, because the query is already executed. //"this.r.tour" here "tour" refers to the current doc's id.
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

/*
Notes->
1- findByIdAndUpdate , findByIdAndDelete does not have document middleware, but only query middleware. In query we dont have access to the document, in order to do something like this-> "this.constructor.calcAverageRatings(this.tour) 110".
2- findByIdAndUpdate, findByIdAndDelete is just actually a short hand for "findOneAndUpdate" with the current ID.
3- static methods are need to be called in the model.
4-calcAverageRatings - to use this kind of function in update and delete, we need use the query middleware, in this "query middleware" we do not directly have access to the current document, and so we need to go around that by using the "findOne()", so basically retrieving the current document from the database. we then store it to the current query variable i.e "this.r". and by doing that we then get access to the next post middleware. where we, update the document.
*/
