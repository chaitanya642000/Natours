const User = require('../Models/UserModel')
const catchAsync = require('../utils/catchAsync')
const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')
const bcrypt = require('bcryptjs')
const {promisify} = require('util')
const sendEmail = require('../utils/email')
const crypto = require('crypto')


const signToken = id =>{
  const token =  jwt.sign({id:id},process.env.SECRET,{
    expiresIn:process.env.JWT_EXPIRES_IN
  })
  return token
}

const createSendToken = (user,statusCode,res)=>{
  const token = signToken(user.id)
 
  console.log(process.env.JWT_COOKIE_EXPIRES_IN)
   const cookieOptions = {
     expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
     httpOnly:true,
   }

   if(process.env.NODE_ENV === 'production') cookieOptions.secure = true

   res.cookie('jwt',token,cookieOptions)
  return res.status(statusCode).json({
    status:"success",
    token:token,
    data:{
      user
    }
  })
}

exports.signup = catchAsync(async(req,res,next)=>{
    
  const newUser = await User.create({
    name:req.body.name,
    email:req.body.email,
    password:req.body.password,
    passwordConfirm:req.body.passwordConfirm,
    role:req.body.role
  })

   const token = jwt.sign({id:newUser._id},process.env.SECRET,{
     expiresIn:process.env.JWT_EXPIRES_IN
   })
   
   createSendToken(newUser,200,res)
  
})

exports.login = catchAsync(async(req,res,next)=>{

   const {email,password} = req.body
   if(!email || !password){
     return next(new AppError('Please enter email and password',404))
   }

   const user = await User.findOne({email:email}).select('+password')
   if(!user)
   {
     return next(new AppError('User with provided email does not exist',404));
   }

    const correct = await user.correctPassword(password,user.password)
    if(!correct || !user)
    {
      return next(new AppError('Incorrect password or user',401))
    }

   //console.log(email+" "+password)
   const token =  signToken(user._id)
   console.log(user)

   createSendToken(user,200,res)
  // res.status(200).json({
  //   status:'success',
  //   data:{
  //     token
  //   }
  // })
})

exports.protect = catchAsync(async(req,res,next)=>{

  console.log(req.headers)
   let token;
   if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
   {
       token = req.headers.authorization.split(' ')[1]
       console.log(token)
   }
   if(!token)
   {
     return next(new AppError('Please login and try again later',401))
   }
   //console.log(token)
   console.log(req.body)
  const decoded =  await promisify(jwt.verify)(token,process.env.SECRET)
  console.log(decoded)
  console.log(decoded.exp-decoded.iat)

  const freshuser = await User.findById(decoded.id)
  if(!freshuser)
  {
    return next(new AppError('The user belonging to token no longer exists',401))
  }

  //GRANT ACCESS TO THE USER THROUGH PROTECTED ROUTE
  req.user = freshuser
  next()
})

exports.restrictTo = (...roles)=>{
  return (req,res,next)=>{
      console.log(req.user.role)
      if(!roles.includes(req.user.role))
      {
        return next(new AppError('You do not have to perform this action',403))
      }
      next()
  }
}

exports.forgotPassword = catchAsync(async(req,res,next) =>{

  //1.get the user email
  const user = await User.findOne({email : req.body.email})
  console.log(user)
  if(!user)
  {
    return next(new AppError('User with provided email does not exist',404))
  }

  //2.generate random token
   const resetToken = await user.createpasswordresetToken()
   await user.save({validateBeforeSave:false})

  //3.send it to user email
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
  const messageTosend = `Forgot your password, Submit a patch request to token ${resetUrl} with your new password and passwordConfirm to reset url,If you didnt forgot your password , please ignore`
     
  console.log(messageTosend)
  try
  {
    await sendEmail({
      email:user.email,
      subject:`Your password reset token ,Token is valid only for 10 minutes`,
      message:messageTosend
    })
    console.log("-------------------------------------------------------------------")
    res.status(200).send('Token send to email')
  }
  catch(err)
  {
     user.passwordResetToken = undefined
     user.passwordResetExpires = undefined

     await user.save({validateBeforeSave:false})
     console.log(err)

    return next(new AppError('Email cannot be send , Some error occurred',500))
  }
})


exports.resetPassword = catchAsync(async(req,res,next) =>{
//console.log("hello----------------")
//1.Get user based on token

//resetToken is not encrypted , to compare it with resetpassword in db first encrypt it with crypto
const resetToken = req.params.id
console.log(resetToken)

//imp:
const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
console.log(hashedToken)
const user = await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt:Date.now()}})

//const user = await User.findOne({passwordResetToken:hashedToken})
//console.log(user)
if(!user)
{
  return next(new AppError('Token expired please try again later',401))
}

//2 .set new password only if token is not expired
user.password = req.body.password
user.passwordConfirm = req.body.passwordConfirm

user.passwordResetExpires = undefined
user.passwordResetToken = undefined

await user.save()
//3.update the changedpasswordAt property for user 

//4.Log in user
const token =  signToken(user._id)
 //  console.log(user)
  // res.status(200).json({
  //   status:'success',
  //   data:{
  //     token
  //   }
  // })

  createSendToken(user,200,res)
next()
})

exports.updatePassword = catchAsync(async(req,res,next)=>{

   //1. Get current user 
    const user = await User.findById(req.user.id).select('+password')
     
   //2.check if the current password POSTed by user is correct
   const check = await user.correctPassword(req.body.passwordCurrent,user.password)
   if(!check)
   {
     return next(new AppError('Your current password is wrong',401))
   }

   //3.if so update the password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm

    await user.save()

   //4.log in user
   const token = signToken(user._id)
  //  res.status(200).json({
  //    status:'success',
  //    token:{
  //      token
  //    },
  //    data: {
  //      user
  //     }
  //  })

  createSendToken(user,200,res)
   next()

})