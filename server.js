const dotenv = require('dotenv');
const mongoose = require('mongoose')
const app = require('./app');

dotenv.config({ path: './config.env' });

process.env.NODE_ENV = 'development';



const port = 3000;
const server = app.listen(port, () => {
  console.log('listening');
});

process.on('uncaughtException',err=>{
  console.log(err.name,err.message)
  console.log('Uncaught Exception')
  server.close(()=>{
    process.exit(1)
  })
})


//console.log(process.env)

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)

mongoose.connect(DB,{
useNewUrlParser:true,
useFindAndModify:false,
useCreateIndex:true
}).then(conn=>{
  //console.log(conn.connections)
  console.log('DB CONNECTION SUCCESSFUL')
})


console.log(process.env.NODE_ENV);

// const port = 3000;
// const server = app.listen(port, () => {
//   console.log('listening');
// });

//unhandledRejection
process.on('unhandledRejection',err=>{
  console.log(err.name,err.message)
  console.log('Unhandled Rejection encounter')
  server.close(()=>{
    process.exit(1)
  })
})





