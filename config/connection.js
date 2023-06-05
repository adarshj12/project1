const MongoClient=require('mongodb').MongoClient

const state={
    db:null
}

module.exports.connect=(done)=>{
    // const url='mongodb://localhost:27017'
    // const dbname="shopping"
    const url='mongodb+srv://adarsh:adarsh@cluster0.yiuki7r.mongodb.net/?retryWrites=true&w=majority'
    const dbname="ecommerce"

    MongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
     
}

module.exports.get=function(){
    return state.db
}