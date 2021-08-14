const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

//name,email,photo,password,Confirmpassword
const UserSchema = new mongoose.Schema({

  name:{
      type:String,
      required:[true,'Please tell us your name']
  },
  email:{
      type:String,
      required:[true,'Email is required'],
      unique:true,
      lowercase:true,
      validate:[validator.isEmail,'Please enter valid email']
  },
  active:{
    type:Boolean,
    default:true,
    select:false
  },
  photo:{
      type:String,
  },
  role:{
    type:String,
    enum:{
      values:['admin','guide','lead-guide','user'],
    }
   },
  password:
  {
      type:String,
      required:[true,'Please enter a password'],
      minlength:8,
      select:false
  },
  passwordConfirm:{
      type:String,
      required:[true,'Please enter your password'],
      validate:{
        validator:function(val){
          return val === this.password
        },
        message:'The value of password must be equal to Conformpassword'
      },
  },
  passwordChangedAt:String,
  passwordResetToken:String,
  passwordResetExpires:Date
}) 

UserSchema.pre('save',async function(next){

   if(!this.isModified('password') || this.isNew)
   {
     return next()
   }

   this.passwordChangedAt = Date.now() - 1000;
   next()

})

UserSchema.pre(/^find/,function(next){

  this.find({active : {$ne : false}})
  next()
})

UserSchema.pre('save',async function(next){

  //Only run if password was modified
  if(!this.isModified('password')) return next()

  //hash password
  this.password = await bcrypt.hash(this.password,8) 
  //delete passwordConfirm
  this.passwordConfirm = undefined
  next()
})


UserSchema.methods.correctPassword = async function(candidatepassword,dbpassword)
{
  const correct = await bcrypt.compare(candidatepassword,dbpassword)
  return correct
}

UserSchema.methods.createpasswordresetToken = async function()
{
  const resetToken  = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  this.passwordResetExpires = Date.now()+10*60*1000
  console.log(resetToken)
  console.log(this.passwordResetToken)
  return resetToken
}

const User = mongoose.model('User',UserSchema)

module.exports = User