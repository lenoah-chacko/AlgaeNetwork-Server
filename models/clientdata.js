const mongoose=require("mongoose")

const Schema=mongoose.Schema
const clientSchema=new Schema({
    name : String,
    phoneNum : String,
    email: String,
    location: String,
    algaeImage: String
})
module.exports=mongoose.model('clientdata',clientSchema,'clients')