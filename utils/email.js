const nodemailer = require('nodemailer')
const sendEmail =async options => {
    //1.create a transporter
    const transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth:{
            user : "3c628c7a94710f",
            pass : "d703d6176bd7cb"
        },
        secure: false,
    })

     //2.define the email options

     console.log(options)
    const mailOptions = {
        from:'chaitanya gujarathi <chaitanya.gujarathi06@gmail.com>',
        to:options.email,
        subject:options.subject,
        text:options.message
    }   
    //3.Actually send the email
    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail