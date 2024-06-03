const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const User = require("./Schema/userSchema.js");
const Bets = require("./Schema/betsSchema.js");



mongoose.connect("mongodb://localhost:27017/").then(() => {
    console.log("connected");
}).catch((err) => {
    console.log("Error occured while connecting to mongodb");
})




app.use(session({
    secret:"abc@123",
    saveUninitialized:false,
    resave:true
}))
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/views"));
app.set("view engine", "ejs");


function authentication(req, res, next) {
    if(req.session.userAuthenticated){
        next();
    }else{
        res.redirect("/login");
    }
}


function authorization(req, res, next){
    if(req.session.userAuthenticated && req.session.userData.role === "admin"){
        next();
    }else{
        res.redirect("/");
    }
}


app.get("/", authentication, async (req, res) => {
    const uname = req.session.userData.username;
    try{
        const betsData = await Bets.find({username : uname}).lean();
        res.render("home",{message:`Welcome ${uname}, this is the home page`, userData : req.session.userData, betsData });
    }catch(err){
        console.log("Some error occured during fetching the bets data for the user...:",err);
    }
})

app.get("/dashboard", authorization, async (req, res) => {
    try{
        const betsData = await Bets.find({}).lean();
        res.render("dashboard",{betsData});
    }catch(err){
        console.log("Error occurred while showing dashbaord : ",err);
        res.redirect("/");
    }
})

app.post("/searchuname", async (req, res) => {
    try{
        const {username } = req.body;
        const usernameData = await Bets.find({username}).lean();
        console.log(usernameData);
        res.render("dashboard",{betsData : usernameData});
    }catch(err){
        console.log("Error occured while showing username data : ",err);
    }
})

app.post("/searchgame", async (req, res) => {
    try{
        const { game } = req.body;
        const gameData = await Bets.find({game}).lean();
        console.log(gameData);
        res.render("dashboard",{betsData : gameData});
    }catch(err){
        console.log("Error occured while showing username data : ",err);
    }
})


app.get("/login", (req, res) => {
    if(req.session.userAuthenticated){
        res.redirect("/");
    }else{
        res.render("login",{message:"Please Enter your credentials"});
    }
})

app.post("/login", async (req, res) => {
    const { username, password } = req.body; 
    try{
        const userData = { username, password };
        const userExists = await User.findOne(userData);
        if(userExists){
            console.log("User found ...");
            req.session.userAuthenticated = true;
            req.session.userData = {
                username : userExists.username,
                name : userExists.name,
                email : userExists.email,
                role : userExists.role,
            };
            console.log(userExists);
            console.log(req.session.userData);
            res.redirect("/");
        }else{
            console.log("User not found, maybe wrong credentials entered...");
            const wrongPass = await User.findOne({username});
            const wrongUname = await User.findOne({password});
            if(wrongPass){
                console.log("Wrong Password Entered...");
                res.render("login",{message:"Wrong Password Entered"});
            }
            if(wrongUname){
                console.log("Wrong Username entered...");
                res.render("login",{message:"Wrong Username Entered"});
            }
            else{
                console.log("User credentials do not match..");
                console.log("User not registered.. redirecting to the signup page..");
                res.redirect("/signup");
            }
        }
    }catch(err){
        console.log("Error occurred while trying to log-In : ", err);
        res.render("login",{message:"Please Enter your credentials"});
    }
})

app.get("/signup", (req, res) => {
    if(req.session.userAuthenticated){
        res.redirect("/");
    }else{
        res.render("signup",{message:"Create new Account"});
    }
})

app.post("/signup", async (req, res) => {
    const { username, name, email, password } = req.body;
    try{
        const newUserData = { username, name, email, password, role:"user" };
        const userExists = await User.findOne(newUserData);
        if(userExists){
            console.log("User already exists..");
            res.render("signup",{message:"Credentials alreayd exists"});
        }else{
            const newUser = await new User(newUserData);
            await newUser.save();
            req.session.userAuthenticated = true;
            req.session.userData = {
                username,name,email,role:"user"
            }
            console.log("User successfully regsitered ....");
            res.redirect("/");
        }
    }catch(err){
        console.log("Error occurred while connecting to data : ",err);
        res.redirect("/signup");
    }
})

app.get("/adduser/:username/:name/:email/:password", authorization, async (req, res ) => {
    const { username, name, email, password } = req.params;
    const userData = {
        username, name, email, password, role:"user"
    }
    try{
        const newUser = await new User(userData);
        await newUser.save();
        console.log("Admin created new user...");
        res.redirect("/");
    }catch(err){
        console.log("Error occurred while inserting new user : ", err);
        res.redirect("/");
    }
})

app.get("/placebets", (req, res) => {
    res.render("placebets");
});

app.post("/placebets", async (req, res) => {
    const { game, price } = req.body;
    const uname = req.session.userData.username;
    const role = req.session.userData.role;
    try{
        const newBet = await new Bets({ username:uname, game, price, role});
        await newBet.save();
        console.log("New bet placed successfully..");
        res.redirect("/");
    }catch(err){
        console.log("Error occurred while placing the bets...:",err);
        res.redirect("/");
    }
})




app.get("/logout",(req, res) => {
    req.session.destroy();
    res.redirect("/login");
})

app.listen(3000, (err) => {
    if(err){
        console.log("Error occurred in starting the server..");
    }else{
        console.log("Server is listening at http://localhost:3000");
    }
})