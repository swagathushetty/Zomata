const mongoose=require('mongoose')
mongoose.Promise=global.Promise
const slug=require('slugs')

//slug makes our strings URL friendly
//eg- "nokia 371 mobile" converted to slug will be "nokia-371-mobile"

const storeSchema=new mongoose.Schema({
name:{
    type:String,
    trim:true,
    required:true
},
slug:String,
description:{
    type:String,
    trim:true
},
tags:[String],
created:{
    type:Date,
    default:Date.now()
},
location:{
    type:{
        type:String,
        default:'Point'
    },
    coordinates:[{
        type:Number,
        required:[true,'you must supply cooridinates']
    }],
    address:{
        type:String,
        required:[true,'You must specify the address']
    }
},
photo:String,
author:{
    type:mongoose.Schema.ObjectId,
    ref:'User',
    required:'you must supply an author'
}

},{
    toJSON:{ virtuals:true },
    toObject:{ virtuals:true },
},
    { typeKey: '$type' }
)

//find reviews where stores _id===reviews store proprty
//this is mongoose and not mongoDB
storeSchema.virtual('reviews',{
    ref:'Review', //what model to link
    localField:'_id', //which field on store ?
    foreignField:'store'  //which field on review ?
})

//define our index


storeSchema.pre('save',async function(next){
    if(!this.isModified('name')){
        next() //skipping
        return
    }
    this.slug=slug(this.name)
    //find other stores that have slug of same name
    const slugRegex=new RegExp(`^(${this.slug})((-[0-9]*$)?)$`,'i')
    const storesWithSlug=await this.constructor.find({slug:slugRegex})
    if(storesWithSlug.length){
        this.slug = `${this.slug}-${storesWithSlug.length+1}`
    }
    next()
})

//define our indexes
storeSchema.index({
    name:'text',
    description:'text'
})

storeSchema.index({location:'2dsphere'})


storeSchema.statics.getTagsList=function(){
    return this.aggregate([
        { 
            $unwind:'$tags'
        },
        {
            $group: { _id:'$tags',count:{ $sum:1 } } //sum is not reserved keyword. we can use any name
        },
        {
            $sort:{count:-1} //sort in descending order
        }
    ])
}

storeSchema.statics.getTopStores=function(){
    //virtuals cannot be used in aggregate as virtual is a mongoose thing and not in mongoDB
    return this.aggregate([
        //lookup stores and populate their reviews
        {$lookup:
            { from: 'reviews',localField:'_id',foreignField:'store',as:'reviews' }
        },

        //filter for only items that have 2 or more reviews
        {$match: {'reviews.1':{ $exists:true } }}, //match where 2nd item aka 1 index item exists

        //add the average reviews field
        {
            $project:{
                photo:'$$ROOT.photo',
                name:'$$ROOT.name',
                reviews: '$$ROOT.reviews',
                slug: '$$ROOT.slug',
                averageRating:{ $avg:'$reviews.rating' }
            }
        },

        //sort it by our field,highest reviews first
        { $sort: { averageRating:-1 }},

        //limit at most to 10
        { $limit:10 }

    ])
}


function autoPopulate(next){
    this.populate('reviews')
    next()
}
storeSchema.pre('find',autoPopulate)
storeSchema.pre('findOne', autoPopulate)


module.exports=mongoose.model('Store',storeSchema)