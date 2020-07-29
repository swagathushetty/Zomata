const mongoose=require('mongoose')
mongoose.Promise=global.Promise

const reviewSchema=new mongoose.Schema({
    created:{
        type:Date,
        default:Date.now()
    },
    author:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:'you must supply an author to a review'
    },
    store:{
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: 'you must supply an store to a review'
    },
    text:{
        type:String,
        required:'A review cannot be empty.please provide text'
    },
    rating:{
        type:Number,
        min:1,
        max:5
    }
})


function autoPopulate(next){
    this.populate('author')
    next()
}

reviewSchema.pre('find',autoPopulate)
reviewSchema.pre('findOne', autoPopulate)


module.exports=mongoose.model('Review',reviewSchema)