const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({});
    // newTour.save();
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    //const tour = await Tour.findByIdAndDelete(req.params.id);
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          //_id: '$ratingsAverage',
          numTours: { $sum: 1 }, // Add 1 for each document
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' }, // Calculate average
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 } // 1 for ascending
      }
      //   {
      //     $match: { _id: { $ne: 'EASY' } }, // Exclude documents with _id = 'EASY'
      //   },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; // 2021

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          _id: 0 // Hide _id
        }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      {
        $limit: 12 // Limit to 12 results
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};
