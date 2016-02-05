var express = require('express'),
    app = express(),
    passport = require('passport'),
    util = require('util'),
    FacebookStrategy = require('passport-facebook').Strategy,
    bodyParser = require('body-parser'),
    session = require('cookie-session'),
    UserService = require('./server/service/UserService'),
    apiRoutes = require('./server/routes/api'),
    homeRoutes = require('./server/routes/home');

const userService = new UserService();

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_API_KEY,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'displayName', 'photos', 'email']
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => {
        //Check whether the User exists or not using profile.id
        userService.upsert({
          user_id: profile.id,
          tokens: {
            access: accessToken,
            refresh: refreshToken
          },
          profile: profile
        })
        .then(() => {
          return done(null, profile);
        });
        //Further DB code.
      });
    }
));

app.use(session({
  keys: [process.env.SESSION_KEY]
}));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public'));
app.use( bodyParser.json() );

app.use(passport.initialize());
app.use(passport.session());

app.use('/', homeRoutes);
app.use('/api', apiRoutes);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});
app.get('/account', ensureAuthenticated, (req, res) => {
  res.render('account', { user: req.user });
});
//Passport Router
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect : '/',
      failureRedirect: '/login'
    }),
    (req, res) => {
      res.redirect('/');
    });
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.listen(process.env.PORT || 3000);

module.exports = app;