const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
    username : {
        type:String,
        unique : [true,"Username already exists.."],
        required: [true, "Username is required"]
    },
    name:{
        type:String
    },
    email : {
        type:String,
        unique:[true,"Email already exists.."],
        required:[true, "Email is required"]
    },
    password:{
        type:String,
    },
    role:{
        type:String,
        required:[true,"Role is required"]
    },
    created_At : {
        type : String,
        default : `${Date.now()}`
    }
});

module.exports = mongoose.model("User", userSchema);

