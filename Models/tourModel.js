const slugify = require('slugify')
const mongoose = require('mongoose')
const tourSchema = new mongoose.Schema({
    name:{
      type:String,
      required:[true,'A tour must have name'],
      unique:true,
      maxlength:[40,'Tour Name must have less than equal to 40 characters'],
      minlength:[10,'Tour Name must have more than equal to 10 characters']
    },
    duration:
    {
      type:Number,
      required:[true,'A tour must have duration']

    },
    maxGroupSize:
    {
      type:Number,
      required:[true,'Tour must have a group size']
    },
    difficulty:
    {
      type:String,
      required:[true,'Tour should have difficulty'],
      enum:{
        values:['easy','medium','difficult'],
        message:'Difficulty is either easy,medium or difficult'
      }
    },
    ratingsAverage:{
      type:Number,
      default:4.5
    },
    ratingsQuantity:
    {
      type:Number,
      default:0
    },
    price:{
      type:Number,
      required:[true,'A tour must have a price']
    },
    priceDiscount:{
      type:Number,
      validate:{
        validator:function(val){
          return val<this.price
        },
        message:'The value of priceDiscount({VALUE}) must be less than the price'
      },
      },
    summary:
    {
      type:String,
      trim:true
    },
    rating:{
      type:Number,
      default:4.5
    },
    description:
    {
      type:String,
      trim:true,
      required:[true,'A tour must have description']
    },
    slug:String,
    secretTour:{
      type:Boolean,
      default:false
    },
    imageCover:
    {
      type:String,
      required:[true,'A tour must have covered Image']
    },
    images:[String],
    createdAt:{
      type:Date,
      default:Date.now(),
      select:false
    },
    startDates:[Date]
  },{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
  });

  //VIRTUAL FIELD - NOT SAVED IN DB
  tourSchema.virtual('durationweeks').get(function(){
    return this.duration/7
  })

  //DOCUMENT MIDDLEWARE RUNS ONLY BEFORE create() and save()
  tourSchema.pre('save',function(next){
     this.slug = slugify(this.name,{lower:true})
     next()
  })
  
  // tourSchema.post('save',function(doc,next){
  //   console.log(doc)
  //   next()
  // })

  //QUERY MIDDLEWARE
  tourSchema.pre(/^find/,function(next)
  {
    this.find({secretTour:{$ne : true}})
    next()
  })

  tourSchema.post(/^find/,function(docs,next)
  {
    //console.log(docs.length)
    console.log(docs)
    next()
  })


  //AGREGATE MIDDLEWARE
  tourSchema.pre('aggregate',function(next){
        console.log(this.pipeline())
        this.pipeline().unshift({$match : {secretTour : {$ne : true}}})
        next()
  })

  const Tour = mongoose.model('Tour',tourSchema);

  module.exports = Tour
  