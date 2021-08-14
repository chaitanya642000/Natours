const fs = require('fs');
const { default: validator } = require('validator');
const users = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/users.json`));
const User  = require('../Models/UserModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync')


const filterObj=(obj,...fields)=>{

   const newObj = {}
   Object.keys(obj).forEach(el=>{
        if(fields.includes(el)) newObj[el] = obj[el]
   })
   return newObj
}

exports.getAllUsers = catchAsync(async(req,res,next)=>{

  const users = await User.find()

    return res.status(200).json({
           status:'success',
           data:{
                  users:users
           }
    })  
})


exports.createUser = (req,res)=>{
    const user = req.body
    return res.json({
           status:"success",
           data:{
                  user:user
           }
    })
}


exports.getUser = (req,res)=>{
    const id = req.params.id
    console.log(id)
    const user = users.find(el=>el._id === req.params.id)
    if(!user)
    {
           return res.status(404).send("User not found")
    }
    res.status(201).json({
           status:"success",
           data:
           {
                  user:user
           }
    })
    console.log(user)

}


exports.updateMe = catchAsync(async(req,res,next)=>{
       //1.post error if user changes password data

       console.log(req.body)
       if(req.body.password || req.body.passwordConfirm)
       {
              return res.status(401).send('Password updation is not allowed in this route')
       }

       //2.filtered unwanted field names that are not allowed to update
       const filterBody = filterObj(req.body ,"name","email")
       const Updateduser = await User.findByIdAndUpdate(req.user.id,filterBody,{new:true,runValidators:true})
              
       res.status(200).json({
              status:'success',
              Updateduser
       })
})



exports.updateUser = (req,res)=>{
    const id = req.params.id

    console.log(req.body)
    const user = users.find(el=>el._id === req.params.id)
    if(!user)
    {
       return res.send("User not found")
    }
    res.status(201).json({
           status:"success",
           data:
           {
                  user:user
           }
    })
}


exports.deleteMe = catchAsync(async(req,res,next)=>{

     const user = await User.findByIdAndUpdate(req.user.id,{active:false})
    console.log(user)
       res.status(204).json({
              status:'success',
              user
       })
})


exports.deleteUser = (req,res)=>{
    const id = req.params.id*1
    if(id>=users.length)
    {
           return res.status(404).send("User not found")
    }

    console.log(req.params.id)
    const user = users.find(el=>el.id === req.params.id)
    res.status(201).json({
           status:"success",
           data:"updated"
    })
}

