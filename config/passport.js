var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var verifyHandler = function (token, tokenSecret, profile, done) {
  process.nextTick(function () {
    Member.findOne({ fbid: profile.id }).done(function (err, member) {
      if (err) return done(err);

      if (member) {
        return done(null, member);
      } else {
        var jsonProfile = profile._json;
        Member.create({
          fbid: jsonProfile.id,
          name: jsonProfile.name,
          firstName: jsonProfile.first_name,
          lastName: jsonProfile.last_name,
          link: jsonProfile.link,
          username: jsonProfile.username,
          birthday: new Date(jsonProfile.birthday),
          gender: jsonProfile.gender,
          email: jsonProfile.email,
          timezone: jsonProfile.timezone,
          locale: jsonProfile.locale,
          verified: jsonProfile.verified,
          updatedTime: jsonProfile.updated_time
        }).done(function (err, member) {
          return done(err, member);
        });
      }
    });
  });
};

passport.serializeUser(function (member, done) {
  done(null, member.fbid);
});

passport.deserializeUser(function (uid, done) {
  Member.findOne({ fbid: uid }).done(function (err, member) {
    done(err, member)
  });
});

module.exports = {
  // Init custom express middleware
  express: {
    customMiddleware: function (app) {
      passport.use(
        new FacebookStrategy({
          clientID: "404730709673780",
          clientSecret: "3442db51f3ead3f5ef34b8ae3be7cd67",
          callbackURL: "http://localhost:1337/auth/facebook/callback"
        },
        verifyHandler
      ));

      app.use(passport.initialize());
      app.use(passport.session());
    }
  }
};
