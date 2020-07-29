const mongoose=require('mongoose')
mongoose.Promise = global.Promise

const md5=require('md5')
const validator=require('validator')
const mongodbErrorHandler=require('mongoose-mongodb-errors')
const passportLocalMongoose=require('passport-local-mongoose')



const userSchema=new mongoose.Schema({
    email:{
        type:String,
        unique:true,
        lowercase:true,
        trim:true,
        validate:[ validator.isEmail,'Invalid email address' ],
        required:'please supply an email address'
    },
    name:{
        type:String,
        required:'please supply a name',
        trim:true
    },
    role:{
        type:String,
        default:'regular'
    },
    resetPasswordToken:String,
    resetPasswordExpires:Date,
    hearts:[
        {
            type:mongoose.Schema.ObjectId,ref:'Store'
        }
    ]
})


userSchema.virtual('gravatar').get(function(){
    const hash=md5(this.email)
    return `http://gravatar.com/avatar/${hash}`
})



userSchema.plugin(passportLocalMongoose,{ usernameField:'email' }) //has a method register to 
userSchema.plugin(mongodbErrorHandler)


module.exports=mongoose.model('User',userSchema)
