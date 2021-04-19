var router = require('express-promise-router')();
const usersController = require('../controller/users');
const { validateBody, schemas } = require('../helper/route_helpers')
const passport = require('passport')
const passportConf = require('../config/passport')
const passportJWT = passport.authenticate('jwt', { session: false });
const passportSignIn = passport.authenticate('local', { session: false });

router.route('/validate_username')
  .post(validateBody(schemas.validateUserName), usersController.validateUserName)
router.route('/signup')
  .post(validateBody(schemas.signUp), usersController.signUp);
router.route('/forgot-password').put(validateBody(schemas.forgotPassword), usersController.forgotPassword);

router.route('/signin')
  .post(validateBody(schemas.signIn), passportSignIn, usersController.signIn);

router.route('/change-password')
  .post(validateBody(schemas.changePassword), usersController.changePassword)

router.route('/follow')
  .post(validateBody(schemas.followUnfollow), usersController.follow)

router.route('/profile/:profile_id')
  .get(usersController.getProfileData)

router.route('/update')
  .post(validateBody(schemas.updateUser), usersController.update)

router.route('/all')
  .get(usersController.allUsersList)

router.route('/logout')
  .get(validateBody(schemas.logout), usersController.logout)

router.route('/secret')
  .get(passportJWT, usersController.secret);

router.route('/:id')
  .put(usersController.updateUserDetails);

router.route('/:id')
  .delete(usersController.deleteUser);

router.route('/add-user').post(usersController.add);

router.route('/get-following/:uid')
  .get(usersController.getFollowing)
router.route('/get-follower/:uid')
  .get(usersController.getFollowers)


module.exports = router;
