const passport = require('passport')
const JtwStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const CNST = require('./constant');
const db = require('../models');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
//JWT STRATEGY
passport.use(new JtwStrategy({
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    //Find the user specified in token
    const user = await db.users.findByPk(payload.sub)

    //If user does not exist, handle it
    if (!user) {
      return done(null, false)
    }

    //Otherwise, return the user
    done(null, user)
  } catch (error) {
    done(error, false)
  }
}))

//LOCAL STRATEGY
passport.use(new LocalStrategy({
  usernameField: 'user_name',
}, async (user_name, password, done) => {
  try {
    var isMatch = "";
    //Find the user given the email
    const user = await db.users.findOne({
      where: {
        [Op.or]: {
          email: `${user_name}`,
          user_name: `${user_name}`
        }
      }
    });

    //If not, handle it
    if (!user) {
      return done({ message: CNST.ACCOUNT_NOT_EXIST }, false);
    }
    if (user.has_deleted === "true") {
      return done({ message: CNST.ACCOUNT_NOT_EXIST }, false);
    }
    if (user.temp_password === password) {
      isMatch = true;
    }
    else {
      //Check if the password is correct
      isMatch = await db.users.prototype.validatepassword(
        password,
        user.password,
        user.temp_password
      );
    }

    //If not, handle it
    if (!isMatch) {
      return done({ message: CNST.INVALID_CREDENTIAL }, false);
    }

    // Check user has approved and active from Admin
    if (user.has_blocked === "false") {
      //Otherwise return the user
      done(null, user);
    }
    else {
      // Throw error
      return done({ message: CNST.ACCOUNT_BLOCKED_MSG }, false);
    }

  } catch (error) {
    done(error, false);
  }
}))





