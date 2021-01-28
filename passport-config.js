
//passport local allows username and passwords to be used when logging in to an account
const local_login = require('passport-local').Strategy; 

const bcrypt = require('bcrypt');

//function to configure the passport to use with the login and registration system
 function initialize(passport, getUserByEmail, getUserById){
    const authenticate_user = async (email, password, done) => {
        const user = getUserByEmail(email);
//check if a user exists 
        if(user == null){
            return done(null, false, {message: 'No user registered with that email'});
        }

        try{
            if(await bcrypt.compare(password, user.password)){
                return done(null, user);
            }else{
                return done(null, false, {message: 'Password does not match our records'} );
            }
        }
        catch(e){
            return done(e);
        }
    }
    passport.use(new local_login({ usernameField: 'email' }, authenticate_user));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) =>{
        
       return done(null, getUserById(id))
    });
}

module.exports = initialize