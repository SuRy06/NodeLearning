const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const app = express();

// 1) MIDDLEWARES
app.use(morgan('dev'))
app.use(express.json());

app.use((req, res, next) => {
  console.log(`Hello`)
  next()
})

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next()
})

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// 2) ROUTE HANDLERS/CONTROLLERS

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  const id = req.params.id * 1;

  if(id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  const tour = tours.find(el => el.id === id);
  
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
}

const createTour = (req, res) => {

  const newId = tours[tours.length - 1].id +1;
  const newTour = Object.assign({id:newId}, req.body);

  tours.push(newTour);

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    })
  })

}

const updateTour = (req,res) => {

  if(req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: 'Updated tour here...'
    }
  })

}

const deleteTour = (req,res) => {

  if(req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  res.status(204).json({
    status: 'success',
    data: null
  })

}

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'err',
    message: 'This route is not yet defined!'
  })
}
const createUser = (req, res) => {
  res.status(500).json({
    status: 'err',
    message: 'This route is not yet defined!'
  })
}
const getUser = (req, res) => {
  res.status(500).json({
    status: 'err',
    message: 'This route is not yet defined!'
  })
}
const updateUser = (req, res) => {
  res.status(500).json({
    status: 'err',
    message: 'This route is not yet defined!'
  })
}
const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'err',
    message: 'This route is not yet defined!'
  })
}
// 3) ROUTES

const tourRouter = express.Router();
app.use('/api/v1/tours', tourRouter);

tourRouter.route('/').get(getAllTours).post(createTour)
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour)

const userRouter = express.Router();
app.use('/api/v1/users', userRouter);

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

// 4) START SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
