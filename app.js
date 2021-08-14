const express = require('express')
const fs = require('fs')
const morgan = require('morgan')
//const { startSession } = require('./Models/tourModel')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const AppError = require('./utils/appError')
const GlobalErrorHandler = require('./Controllers/errorController')
const app = express();
const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')

//middlewares

app.use(helmet())
app.use(mongoSanitize())
app.use(xss())

const limiter = rateLimiter({
       max:100,
       WindowMs:60 * 60 * 1000,
       message:'Request limit exceded'
})

app.use('/api',limiter)
app.use(express.json())
if(process.env.NODE_ENV === 'development')
{
       app.use(morgan('dev'))
}

app.use(express.static(`${__dirname}/public`))

// app.use((req,res,next)=>{
//        console.log("Hello from the middleware")
//        next()
// })

app.use((req,res,next)=>{
       console.log(req.requestTime = new Date().toISOString())
       next()
})


//routes
app.use('/api/v1/tours',tourRouter)
app.use('/api/v1/users',userRouter)

app.all('*',(req,res,next)=>{
       next(new AppError(`Can't find ${req.originalUrl} on this server`,404))
})

app.use(GlobalErrorHandler)

module.exports = app