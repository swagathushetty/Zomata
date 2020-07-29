const nodemailer=require('nodemailer')
const pug=require('pug')
const juice=require('juice')
const htmlToText=require('html-to-text')
const promisify=require('es6-promisify')


const transport=nodemailer.createTransport({
    host:process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth:{
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
})


// transport.sendMail({
//     from:'swagath shetty <swagath.shetty@gmail.com>',
//     to:'randy@gmail.com',
//     subject:'Just trying things out',
//     html:'Hello I really am a good <strong>bout</strong>',
//     text:'PS call me'
// })


const generateHTML=(filename,options={})=>{
    const html=pug.renderFile(`${__dirname}/../views/email/${filename}.pug`,options)
    console.log(html)
    const inline=juice(html) //does css inlining(optional. doesnt affect your email in any way)
    return inline
}

exports.send=async(options)=>{
    const html=generateHTML(options.filename,options)
    const text=htmlToText.fromString(html)
    const mailOptions={
        from:'Wes bos <noreply@swagath.com>',
        to:options.user.email,
        subject:options.subject,
        html:html,
        text:text
    }
    const sendMail=promisify(transport.sendMail,transport)
    return sendMail(mailOptions)
}
