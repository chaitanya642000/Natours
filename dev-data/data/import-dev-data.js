const dotenv = require('dotenv');
const mongoose = require('mongoose')
const Tour = require('./../../Models/tourModel')
const fs = require('fs')

dotenv.config({ path: './config.env' });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`,'utf-8'))


const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)

//console.log(tours)

mongoose.connect(DB,{
useNewUrlParser:true,
useFindAndModify:false,
useCreateIndex:true
}).then(conn=>{
  //console.log(conn.connections)
  console.log('DB CONNECTION SUCCESSFUL')
})

const importData = async ()=>{
    try
    {
        await Tour.create(tours)
        console.log('Data successfully inserted')
    }
    catch(err)
    {
        console.log('Something went wrong')
        console.log(err)
    }
}

const deleteData = async (req,res)=>{
try{
    const tours = await Tour.deleteMany()
    console.log("Data Successfully deleted")
    process.exit()
}
catch(err)
{
    console.log(err)
    res.status(400).json({
        status:"failed",
        msg:"Something went wrong"
    })
}
}

if(process.argv[2] === '-import')
{
    importData()
}
else if(process.argv[2] === '-deleteData')
{
    deleteData()
}
console.log(process.argv)