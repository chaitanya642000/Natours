const AppError = require("../utils/appError")

const handleCastErrorDB = (err) =>{
  const message = `Invalid ${err.path}: ${err.value}`
  console.log(message)
  return new AppError(message,404)
}

const handleDuplicateValueError = (err) =>{
       const message = `Duplicate Value at ${err.index} and value ${err.keyValue.name}`
       return new AppError(message,301)
}

const handleValidationError = (err) =>{
       const errors = Object.values(err.errors).map(el =>el.message)
       const message = `${errors.join('. ')}`
       return new AppError(message,401)
}

const handleJWT = (err)=>{
       const message = 'Invalid Token .Please login and try again later'
       return new AppError(message,401)
}

const handleJWTExpired = (err) =>{
       const message = 'Token expired , please login again'
       return new AppError(message,401)
}

module.exports = (err,req,res,next)=>{
   // console.log(err.stack)
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
    err.message = err.message || `Invalid route ${req.originalUrl}`
    let error = {...err}
    console.log(err)
    console.log(err.name)
    if(err.name === 'CastError')
    {
           error = handleCastErrorDB(error)
    }
    if(err.code === 11000)
    {
           error = handleDuplicateValueError(error)
    }
    if(err.name === 'ValidationError')
    {
           error = handleValidationError(err)
    }

    if(err.name === 'JsonWebTokenError')
    {
           error = handleJWT(err)
           console.log(error)
    }
    if(err.name === 'TokenExpiredError')
    {
           error = handleJWTExpired(err)
           console.log(error)
    }
    //console.log(error)
    res.status(error.statusCode).json({
          status:error.status,
           //error:err,
           msg : error.message
    })
}