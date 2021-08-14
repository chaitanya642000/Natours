const express = require('express')
const fs = require('fs');
const { dirname } = require('path');
const tourController = require('../Controllers/tourController')
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
//const tourRouter = express.Router()
//const tours = JSON.parse(fs.readFileSync("../dev-data/data/tours-simple.json"))
const router = express.Router();
const authController = require('../Controllers/authController')





//monthly-plan
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)

//tour stats
router.route('/tour-stats').get(tourController.getTourStats)
//router.param('id',tourController.checkID)
router.route('/top-5-cheap').get(tourController.aliasTopTours,tourController.getAllTours)
//routes
router.route('/').get(authController.protect,tourController.getAllTours).post(tourController.createTour)
router.route('/:id').get(tourController.getTourById).patch(tourController.UpdateTour).delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTour)

module.exports = router