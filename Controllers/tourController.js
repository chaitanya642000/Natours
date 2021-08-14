//const fs = require('fs');
const express = require('express');
const catchAsync = require('../utils/catchAsync')
const { Query } = require('mongoose');
const Tour = require('../Models/tourModel')
const APIFeatures = require('../utils/APIFeatures')
//exports. tourRouter = express.Router()
//exports. tours = JSON.parse(fs.readFileSync("../dev-data/data/tours-simple.json"))
const router = express.Router();
const AppError = require('../utils/appError')

//router functions

exports.aliasTopTours = catchAsync(async (req,res,next) =>{
   
        req.query.limit = '5'
        req.query.sort = '-ratingsAverage,price'
        req.query.fields = 'name,ratingsAverage,price,summary,difficulty'
    
        next()
    
})


exports.getAllTours = catchAsync(async (req,res,next)=>{

    const features = new APIFeatures(Tour.find(),req.query).filter().sort().limitFields().pagination()
    const tours = await features.query
    res.status(200).json({
        status:"success",
        results:tours.length,
        data:
        {
            tours
        }
    })

    // try
    // {
    //   const features = new APIFeatures(Tour.find(),req.query).filter().sort().limitFields().pagination()
    //   const tours = await features.query

    //   res.status(200).json({
    //       status:"success",
    //       results:tours.length,
    //       data:
    //       {
    //           tours
    //       }
    //   })
    // }
    // catch(err)
    // {
    //     res.status(401).json({
    //         status:'failed',
    //         msg:'Something went wrong'
    //     })
    //     console.log(err)
    // }
})

  

exports.createTour = catchAsync(async (req,res,next)=>{

    
        const newTour = await Tour.create(req.body)
        console.log(req.body)
        res.status(200).json({
            status:'success',
            data:
            {
                tour:newTour
            }
        })
    
})

exports.getTourById = catchAsync(async (req,res,next)=>{
   
        const tour = await Tour.findById(req.params.id)
        if(!tour)
        {
            console.log('No tour found')
            return next(new AppError('Tour not found',404))
        }
        res.status(200).json({
            status:"success",
            data:
            {
                tour
            }
        })
})

exports.UpdateTour =catchAsync(async (req,res,next)=>{

       const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,{
           new:true,
           runValidators:true
       })

       if(!tour)
       {
           return next(new AppError('Tour not found',404))
       }

       res.status(202).json({
           status:"success",
           data:{
               tour
           }
       })
})

exports.deleteTour = catchAsync(async (req,res,next)=>{
    // const tours = await Tour.find()
    // const len = tours.length;
    // const tour = await Tour.findByIdAndDelete(req.params.id)
    // const tourupdated = await Tour.find()
    
        let [len1,tour, len2] = await Promise.all([Tour.find(),Tour.findByIdAndDelete(req.params.id), Tour.find()]);
        len1 = len1.length
        len2 = len2.length
        if(!tour)
        {
            return res.send('Tour not found')
        }
        res.status(200).json({
    
            status:"success",
            data:{
                len1,
                len2
            }
        })
})

exports.getTourStats = catchAsync(async(req,res)=>{
    
         const stats = await Tour.aggregate([
             {
                 $match :{ ratingsAverage :{$gte : 4.5} }
             },
             {
                 $group : { 
                     _id:'$difficulty',
                     numTours:{$sum:1},
                     numRatings:{$sum:'$ratingsQuantity'},
                     avgRating : {$avg : '$ratingsAverage'},
                     avgPrice : {$avg : '$price'},
                     minPrice:{$min:'$price'},
                     maxPrice: {$max : '$price'},
                  }
             },
             {
             $sort : {avgPrice:1} 
             }
         ]) 

         res.status(200).json({
             status:'success',
             data:{
                 stats
             }
         })
    
})

exports.getMonthlyPlan = catchAsync(async (req,res)=>{
      const year = req.params.year*1
      const plan = await Tour.aggregate([
          {
              $unwind:'$startDates'
          },
          {
            $match:{
                startDates:{
                    $gte:new Date(`${year}-01-01`),
                    $lte:new Date(`${year}-12-31`)
                }
            }
          },
         {
             $group:{
                 _id:{ $month:'$startDates'},
                 numTours :{$sum:1},
                 tours:{$push:'$name'}
             }
         },
         {
             $addFields:{month:'$_id'}
         },
         {
           $project:{
               _id:0
           }
         },
         {
             $sort:{numTours:-1}
         },

      ])
      
      res.status(200).json({
        status:'success',
        data:{
            plan
        }
    })
   
})