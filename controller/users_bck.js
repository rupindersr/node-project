var Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../models');
const JWT = require('jsonwebtoken');
const CNST = require('../config/constant');
const { sendEmail } = require('../helper/email');
const pwdGenerator = require('generate-password');
signToken = (user) => {
    return JWT.sign({
        iss: 'beyondroot',
        sub: user.id,
        iat: new Date().getTime(), // current time
        exp: new Date().setDate(new Date().getDate() + 1), // current time + 1 day ahead
        user_role: user.role_id
    }, process.env.JWT_SECRET)
}
module.exports = {
    validateUserName: async (req, res, next) => {
        try {
            const { user_name } = req.value.body;
            const userExist = await db.users.findOne({ where: { user_name, has_deleted: 'false' } })
            if (userExist) {
                return res.status(400).json({ message: CNST.USER_NAME_ALREADY_EXIST_MSG })
            }
            return res.status(200).json({ message: CNST.SUCCESS })
        } catch (error) {
            return res.status(400).json({ message: err.message })
        }
    },
    signUp: async (req, res, next) => {
        try {
            let { user_name, email, password, device_type, device_id, fcm_token } = req.value.body;
            let userObj = { user_name, email, password };
            let deviceDetailObj = { device_type, device_id, fcm_token };
            //Check if there is a user with the same email
            const foundUser = await db.users.findOne({ where: { email } });
            if (foundUser) {
                return res.status(400).json({ message: CNST.ACCOUNT_WITH_EMAIL_EXIST })
            }

            //Send Email to super admin
            const userData = [{
                name: user_name,
                email: email
            }]
            const emailRes = sendEmail('signup', userData);
            const user = await db.users.create(userObj, {
                attributes: {
                    exclude: ['password', 'has_deleted', 'has_blocked', 'role']
                }
            })
            // save device detail in db
            deviceDetailObj.user_id = user.id;
            const deviceDetailRes = await db.device_detail.create(deviceDetailObj);
            //Generate token
            const token = await signToken(user);
            // const tokenWithBearer = `${token}`;
            return res.status(200).json({ data: user, token, message: CNST.SUCCESS })

        } catch (error) {
            return res.status(400).json({ message: error.message })
        }

    },
    signIn: async (req, res, next) => {
        try {
            let token = await signToken(req.user)
            return res.status(200).json({ data: req.user, token, message: CNST.SUCCESS })
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    },
    forgotPassword: async (req, res, next) => {
        try {
            const { email } = req.value.body;
            const userDetail = await db.users.findOne({ where: { email } });
            if (!userDetail) {
                return res.status(400).json({ message: CNST.ACCOUNT_NOT_EXIST })
            }
            // Generate temporary password
            var temp_password = pwdGenerator.generate({
                length: 5,
                numbers: true
            });
            const result = await db.users.update({ temp_password }, { where: { email, has_deleted: 'false' } })
            //Send temporary password to user email
            const emailContent = [{
                name: userDetail.user_name,
                email: email,
                temp_password: temp_password
            }]
            const emailRes = sendEmail('forgot_password', emailContent);
            return res.status(200).json({ message: CNST.FORGOT_EMAIL_SUCCESS });

        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    },
    follow: async (req, res, next) => {
        try {
            const { following_user_id } = req.body;
            const followObj = { follower_id: req.user.id, following_id: following_user_id }
            const hasAlreadyFollow = await db.user_follow.findOne({
                where: {
                    [Op.and]: followObj
                }
            });
            if (hasAlreadyFollow) {
                const unfollowRes = await db.user_follow.destroy({
                    where: {
                        [Op.and]: followObj
                    }
                });
                return res.status(200).json({ message: CNST.UNFOLLOW_SUCCESS })
            }
            else {
                const followRes = await db.user_follow.create(followObj)
                return res.status(200).json({ message: CNST.FOLLOW_SUCCESS })
            }
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    },

    secret: async (req, res, next) => {
        return res.status(200).json({ secret: "resource" })
    }

}
