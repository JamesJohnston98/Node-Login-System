//load in the environment variables 
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();

}

const express = require('express');

const app = express();

const bcrypt = require('bcrypt');

//passport library used for authentication 
const passport = require('passport');


//express session allows us to express the user who is logged in across multiple pages 
const session = require('express-session');
//express flash allows messages to be displayed if the login or registration has failed 
const flash = require('express-flash');

const method_override = require('method-override');

//initialize the passport function 
const intializePassport = require('./passport-config');
intializePassport(
    passport, 
   email => users.find(user => user.email === email),
   id => users.find(user => user.id === id)
);

//users details 
const users = [];

//set the view engine so the app knows to look for ejs
app.set('view-engine', 'ejs');

//want to ensure that we can access the email and password within the post variable.
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize())
//session used to enable users data can be accessed across multiple pages
app.use(passport.session())

app.use(method_override('_method'))

app.get('/', check_authenticated_user, (req, res) => {
    //render the home page when the application runs
    res.render('index.ejs', {name: req.user.name });
});

//this will render the login page within the application when required 
app.get('/login', check_not_authenticated, (req, res) => {
    res.render('login.ejs');
});
//use the passport authentication for the login and use the local strategy
//options are passed in which we want to modify
app.post('/login',  check_not_authenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

//this will allow the registration page to render within the application when it would be required. 
app.get('/register', check_not_authenticated, (req, res) => {
    res.render('register.ejs');
});

//this will allow the user to be registered and have the name, email and password entered saved to our system
app.post('/register', check_not_authenticated,  async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
         id: Date.now().toString(),
         name: req.body.name,
         email: req.body.email,
         password: hashedPassword
        })
        res.redirect('/login');
    }
    catch{
        res.redirect('/register');
    }
    //log the users to the console when each user registers
    console.log(users);
});
//will allow the user to logout when they wish to within the application
app.delete('/logout', (req, res) => {
    //the logout is set within the passport which will allow the user to logout
    req.logOut();
    res.redirect('/login');
})


function check_authenticated_user(req, res, next){
    if(req.isAuthenticated()){
        //if there is a user authenticated then move onto the next stage and open the login page
        return next();
    }
    res.redirect('/login')
}
//check if the user is not authenticated and only if they are not will it allow the user to access the login page again 
function check_not_authenticated(req, res, next){
    if(req.isAuthenticated()){
        //if the user is authenticated redirect them to the index page 
        return res.redirect('/');
}
//if they are not authenticated take them to the login page
next()
}

//where the app will run on the local host 
app.listen(3000);
