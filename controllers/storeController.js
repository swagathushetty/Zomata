const mongoose=require('mongoose')
const Store=mongoose.model('Store')
const User = mongoose.model('User')
const multer=require('multer')
const jimp=require('jimp')
const uuid=require('uuid')

const multerOptions={
    storage:multer.memoryStorage(),
    fileFilter:function(req,file,next){
        const isPhoto=file.mimetype.startsWith('image/')
        if(isPhoto){
            next(null,true); //first is error,second is value 
        }else{
            next({message:'the filetype isnt allowed'},false)
        }

    }
}

 


exports.homePage = (req, res) => {
    res.render('index')
}

exports.addStore=(req,res)=>{
    res.render('editStore',{title:'add Store'})
}


exports.upload=multer(multerOptions).single('photo')

exports.resize=async(req,res,next)=>{
    //check if there is no new file to resize
    if(!req.file){
        return next()
    }
    // console.log(req.file)
    const extension=req.file.mimetype.split('/')[1]
    req.body.photo=`${uuid.v4()}.${extension}`

    const photo=await jimp.read(req.file.buffer)
    await photo.resize(800,jimp.AUTO); //resize
    await photo.write(`./public/uploads/${req.body.photo}`)

    //once we have written to the file system keep going
    next()



}


exports.createStore=async(req,res)=>{
    req.body.author=req.user._id
    const store=new Store(req.body)
    await store.save()
    req.flash('success',`successfully created ${store.name}. care to leave a review ?`)
    res.redirect('/')
}


exports.getStores= async(req,res)=>{
    const page=req.params.page || 1
    const limit=6
    const skip=(page*limit)-limit 
   const storesPromise= Store
     .find()
     .skip(skip)
     .limit(limit)
     .sort({created:'desc'})

   const countPromise=Store.count()
   
   const[stores,count]=await Promise.all([storesPromise,countPromise])

   const pages=Math.ceil(count/limit) //total pages

   if(!stores.length && skip) {
       req.flash('info',`hey you asked for page ${page}. But that page doesnt exist. So putting you back to page ${pages}`)
       res.redirect(`/stores/page/${pages}`)
       return
   }

//    console.log(stores)
    res.render('stores',{title:'Stores', stores,page,pages,count })
}

const confirmOwner=(store,user)=>{
    if(!store.author.equals(user._id) || user.role==='admin'){
        throw Error('You must own the store to edit it')
    }
}

exports.editStore=async(req,res)=>{
    //find the store given the id
    const store=await Store.findOne({_id:req.params.id})

    //confirm they are the owner of the store
        confirmOwner(store,req.user)
  

    // res.json(store)

    //render out the edit form so user can update
    res.render('editStore',{title:`Edit ${store.name}`,store:store})
}

exports.updateStore=async(req,res)=>{
    //set the location data to a point
    req.body.location.type='Point'

    //find and update store
    const store=await Store.findOneAndUpdate({_id:req.params.id},req.body,{
        new:true, //return the new store instead of old ones which is the default
        runValidators:true //run all the validators
    }).exec()

    req.flash('success',`succesfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View store</a>`)

    //redirect them to the updated store
    res.redirect(`/stores/${store._id}/edit`)
}



exports.getStoreBySlug=async(req,res,next)=>{

    const store=await Store.findOne({slug:req.params.slug}).populate('author reviews')
    // console.log(store)
    if(!store){
        return next()
    }
    res.render('store',{store:store,title:store.name})
}


exports.getStoresByTag=async(req,res,next)=>{
    console.log('enterded')

    const tag = req.params.tag;

     // select any store that atleast has one tag on it if no tag is specified
    const tagQuery = tag || { $exists: true, $ne: [] };

    const tagsPromise = Store.getTagsList();
    const storesPromise = Store.find({ tags: tagQuery });
    const [tags, stores] = await Promise.all([tagsPromise, storesPromise])


    res.render('tag', { tags, title: 'Tags', tag, stores });

}



exports.searchStores=async(req,res)=>{

    //find stores that match the query
    const stores=await Store.find({
        $text:{
            $search:req.query.q,
        }
    },{
        score:{ $meta:'textScore' } //improve our search. this field will also be added to the search result
    })
    //sort the item
    .sort({
        score:{ $meta:'textScore' }
    })
    //only first 5 result
    .limit(5)
    res.json(stores)
}



exports.mapStores=async(req,res)=>{
    const coordinates=[ req.query.lng, req.query.lat ].map(parseFloat)
    // console.log(coordinates)
    const q={
        location:{
            $near:{
                $geometry:{
                    type:'Point',
                    coordinates: coordinates
                },
                $maxDistance:10000 //show all results within 10kms
            }
        }
    }
    // console.log(q)
    const stores=await Store.find(q).select('slug name description location').limit(10)
    res.json(stores)
}


exports.mapPage=(req,res)=>{
    res.render('map',{ title:"Map" } )
}


exports.heartStore=async(req,res)=>{
    const hearts=req.user.hearts.map(obj=>obj.toString())
    // console.log(hearts)

    //if already liked or hearted add otherwise remove
    const operator=hearts.includes(req.params.id) ? '$pull' : '$addToSet'
    // console.log(operator,hearts)
    const user=await User.findByIdAndUpdate(req.user._id,
                            { [operator] :{ hearts:req.params.id} },
                            { new:true }
                          )
    res.json(user)
}


exports.getTopStores=async(req,res)=>{
    const stores=await Store.getTopStores()
    res.render('topStores',{stores:stores})
}