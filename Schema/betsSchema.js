const mongoose = require("mongoose");
const betsSchema = mongoose.Schema({
    username : {
        type:String, 
        required:[true,"Username is required"]
    },
    game : {
        type:String,
        required:[true,"Game name is required"]
    },
    price:{
        type:String,
        required:[true,"Price of game is required"]
    },
    role:{
        type:String,
        default:"user"
    },
    placed_at : {
        type:Date,
        default:Date.now()
    }
});

module.exports = mongoose.model("Bet",betsSchema);