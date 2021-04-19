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
                return res.status(400).json({ message: CNST.USER_NAME_ALREADY_EXIST_MSG, success: false })
            }
            return res.status(200).json({ message: CNST.SUCCESS, success: true })
        } catch (error) {
            return res.status(400).json({ message: err.message, success: false })
        }
    },
    signUp: async (req, res, next) => {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            let { user_name, email, password, device_type, device_id, fcm_token } = req.value.body;
            let userObj = { user_name, email, password };
            let deviceDetailObj = { device_type, device_id, fcm_token };
            //Check if there is a user with the same email
            const foundUser = await db.users.findOne({ where: { [Op.or]: { email, user_name } } }, { transaction });
            if (foundUser) {
                if (foundUser.user_name === user_name) {
                    return res.status(400).json({ message: CNST.USER_NAME_ALREADY_EXIST_MSG, success: false })
                }
                else {
                    return res.status(400).json({ message: CNST.ACCOUNT_WITH_EMAIL_EXIST, success: false })
                }
            }

            const user = await db.users.create(userObj, {
                attributes: {
                    exclude: ['password', 'has_deleted', 'has_blocked', 'role']
                }
            }, { transaction })
            // save device detail in db
            deviceDetailObj.user_id = user.id;
            const deviceDetailRes = await db.device_detail.create(deviceDetailObj, { transaction });
            //Generate token
            const token = await signToken(user);
            //Send Email to super admin
            const userData = [{
                name: user_name,
                email: email
            }]
            const emailRes = sendEmail('signup', userData);
            await transaction.commit();
            // const tokenWithBearer = `${token}`;
            return res.status(200).json({ data: user, token, message: CNST.SUCCESS, success: true })

        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(400).json({ message: error.message, success: false })
        }

    },
    signIn: async (req, res, next) => {
        try {
            let user_id = req.user.id;
            let { device_type, device_id, fcm_token } = req.body
            const user = await db.users.findOne({
                where: { id: user_id },
                raw: true,
                attributes: [
                    "id", "user_name", "email", "full_name", "gender", "date_of_birth", "profile_picture", "has_private",
                    [db.sequelize.fn("COUNT", db.sequelize.col("posts.post_id")), "total_post"]
                ],
                include: [
                    { model: db.posts, as: 'posts', attributes: [], required: false },
                    // { model: db.user_follow, as: 'follower', attributes: [], required: false },
                    // { model: db.user_follow, as: 'following', attributes: [], required: false }
                ]
            })
            let token = await signToken(req.user)
            let userProfile = user;
            let total_following = await db.user_follow.count({ where: { follower_id: user_id } })
            let total_follower = await db.user_follow.count({ where: { following_id: user_id } })
            userProfile.total_following = total_following
            userProfile.total_follower = total_follower
            //save device and token detail in DB
            let deviceDetailObj = { device_type, device_id, fcm_token, user_id, token }
            await db.device_detail.update(deviceDetailObj, { where: { device_id } })
            return res.status(200).json({ data: userProfile, token, message: CNST.LOGIN_SUCCESS_MSG, success: true })
        } catch (error) {
            return res.status(400).json({ message: error.message, success: false })
        }
    },
    forgotPassword: async (req, res, next) => {
        try {
            const { email } = req.value.body;
            const userDetail = await db.users.findOne({ where: { [Op.and]: { email, has_deleted: 'false' } } });
            if (!userDetail) {
                return res.status(400).json({ message: CNST.ACCOUNT_NOT_EXIST, success: false })
            }
            // Generate temporary password
            var temp_password = pwdGenerator.generate({
                length: 5,
                numbers: true
            });
            const result = await db.users.update({ temp_password }, { where: { [Op.and]: { email, has_deleted: 'false' } } })
            //Send temporary password to user email
            const emailContent = [{
                name: userDetail.user_name,
                email: email,
                temp_password: temp_password
            }]
            const emailRes = sendEmail('forgot_password', emailContent);
            return res.status(200).json({ message: CNST.FORGOT_EMAIL_SUCCESS, success: true });

        } catch (error) {
            return res.status(400).json({ message: error.message, success: false })
        }
    },
    update: async (req, res, next) => {
        try {
            const user_id = req.user.id;
            if (req.body.user_name) {
                const hasUserNameExist = await db.users.findOne({
                    where: {
                        [Op.and]: { user_name: req.body.user_name, id: { [Op.ne]: user_id } }
                    }
                })
                if (hasUserNameExist) {
                    return res.status(400).json({ message: CNST.USER_NAME_ALREADY_EXIST_MSG, success: false })
                }
            }

            const updateRes = await db.users.update(req.body, { where: { id: user_id } })
            return res.status(200).json({ message: CNST.PROFILE_UPDATED_SUCCESS_MSG, success: true })
        }
        catch (error) {
            return res.status(400).json({ message: error.message, success: false })
        }
    },
    follow: async (req, res, next) => {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            const { following_user_id } = req.body;
            const followObj = { follower_id: req.user.id, following_id: following_user_id }
            if (followObj.follower_id === following_user_id) {
                return res.status(400).json({ message: CAN_NOT_FOLLOW_OWN_MSG, success: false })
            }
            const hasUserExist = await db.users.findOne({
                where: { [Op.and]: { id: following_user_id, has_deleted: 'false' } },
            }, { transaction })
            if (hasUserExist) {
                const hasAlreadyFollow = await db.user_follow.findOne({
                    where: {
                        [Op.and]: followObj
                    }
                }, { transaction });
                if (hasAlreadyFollow) {
                    const unfollowRes = await db.user_follow.destroy({
                        where: {
                            [Op.and]: followObj
                        }
                    }, { transaction });
                    await transaction.commit();
                    return res.status(200).json({ has_follow: false, message: CNST.UNFOLLOW_SUCCESS, success: true })
                }
                else {
                    const followRes = await db.user_follow.create(followObj, { transaction })
                    await transaction.commit();
                    return res.status(200).json({ has_follow: true, message: CNST.FOLLOW_SUCCESS, success: true })
                }
            }
            else {
                return res.status(400).json({ message: CNST.FOLLOWING_USER_NOT_FOUND_MSG, success: false })
            }
        } catch (error) {
            if (transaction) {
                await transaction.rollback()
            }
            return res.status(400).json({ message: error.message })
        }
    },
    getProfileData: async (req, res, next) => {
        try {
            const { profile_id } = req.params || req.user.id;
            if (profile_id === "0") {
                return res.status(400).json({ message: CNST.INVALID_USER_ID_MSG })
            }
            const hasUserExist = await db.users.findOne({ where: { id: profile_id } })
            if (!hasUserExist) {
                return res.status(400).json({ message: CNST.INVALID_USER_ID_MSG })
            }
            // const userProfile = await db.posts.count({ where: { user_id: profile_id } })
            const userProfile = await db.users.findOne({
                where: { id: profile_id },
                raw: true,
                include: [
                    { model: db.posts, as: 'posts', attributes: [], required: false },
                    // { model: db.user_follow, as: 'follower', attributes: [], required: false },
                    // { model: db.user_follow, as: 'following', attributes: [], required: false }
                ],
                attributes: [
                    "id", "user_name", "email", "full_name", "gender", "date_of_birth", "profile_picture", "has_private",
                    [db.sequelize.fn("COUNT", db.sequelize.col("posts.post_id")), "total_post"]
                ],
            })
            let total_following = await db.user_follow.count({ where: { follower_id: profile_id } })
            let total_follower = await db.user_follow.count({ where: { following_id: profile_id } })
let has_following = await db.user_follow.count({ where: { follower_id: req.user.id, following_id: profile_id } })
let has_follow = await db.user_follow.count({ where: { follower_id: profile_id, following_id: req.user.id } })
            userProfile.total_following = total_following
            userProfile.total_follower = total_follower
            userProfile.has_follow = has_follow === 0 ? false : true
            userProfile.has_following = has_following === 0 ? false : true            
return res.status(200).json({ data: userProfile, message: CNST.SUCCESS })
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    },
    allUsersList: async (req, res, next) => {
        try {
            var page_number = parseInt(req.query.page_number) || CNST.DEFAULT_PAGE_NUMBER,
                page_size = parseInt(req.query.page_size) || CNST.DEFAULT_PAGE_SIZE,
                page_number = page_number <= 1 ? 0 : ((page_number * page_size) - page_size);
            const user_id = req.user.id;
            const { qs } = req.query || '';
            var usersList = "", attributes = ['id', 'user_name', 'full_name', 'profile_picture', 'gender', 'date_of_birth', 'email'];
            if (qs) {
                usersList = await db.users.findAndCountAll({
                    attributes: attributes,
                    where: {
                        has_deleted: 'false',
                        [Op.or]: {
                            'user_name': { [Op.like]: `%${qs}%` },
                            'email': { [Op.like]: `%${qs}%` }
                        },
                        [Op.not]: { id: user_id }
                    },
                    order: [
                        ["id", "DESC"]
                    ],
                    offset: page_number, limit: page_size
                }, { rows: false })
            }
            else {
                usersList = await db.users.findAndCountAll({
                    attributes: attributes,
                    where: { has_deleted: 'false' },
                    order: [
                        ["id", "DESC"]
                    ],
                    offset: page_number, limit: page_size
                }, { rows: false })
            }
            return res.status(200).json({ data: usersList.rows, Total: usersList.count, Message: CNST.SUCCESS, Success: true })
        } catch (error) {
            return res.status(400).json({ message: error.message, success: false })
        }
    },
    changePassword: async (req, res, next) => {
        try {
            var isMatch = "";
            const { old_password, new_password } = req.body;
            const { id } = req.user;
            //Get user data from DB
            const userData = await db.users.findOne({ where: { [Op.and]: { id, has_deleted: 'false' } } })
            if (!userData) {
                return res.status(400).json({ message: CNST.ACCOUNT_NOT_EXIST, success: false });
            }
            else {
                //Check if the password is correct
                isMatch = await db.users.prototype.validatepassword(old_password, userData.password);
            }
            if (!isMatch) {
                return res.status(400).json({ message: CNST.WRONG_OLD_PASSWORD_MSG, success: false });
            }
            else {
                //Update new password in DB
                const updatePass = await db.users.update({ password: new_password }, { where: { id } })
                return res.status(200).json({ message: CNST.PASSWORD_UPDATE_SUCCESS_MSG, success: true })
            }
        } catch (error) {
            return res.status(400).json({ message: error.message, success: false })
        }
    },
    logout: async (req, res, next) => {
        try {
            const { token } = req.headers;
            if (!token) {
                return res.status(400).json({ message: CNST.TOKEN_REQUIRED_MSG, success: false })
            }
            await db.device_detail.destroy({ where: { token } })
            return res.status(200).json({ message: CNST.LOGOUT_SUCCESS_MSG, success: true })
        } catch (error) {
            return res.status(400).json({ message: error.message, success: false })
        }
    },
    secret: async (req, res, next) => {
        return res.status(200).json({ secret: "resource" })
    },
    updateUserDetails: async (req, res, next) => {
        try {
            const user_id = req.params.id;
            if (!user_id) {
                return res.status(400).json({ message: CNST.INVALID_USER_ID_MSG, success: false })
            }
            let payload = req.body
            const updateRes = await db.users.update(req.body, { where: { id: user_id } });
            return res.status(200).json({ message: CNST.PROFILE_UPDATED_SUCCESS_MSG, success: true })
        }
        catch (error) {
            return res.status(400).json({ message: error.message, success: false })
        }
    },
    deleteUser: async (req, res, next) => {
        try {
            const user_id = req.params.id;
            if (!user_id) {
                return res.status(400).json({ message: CNST.INVALID_USER_ID_MSG, success: false })
            }
            const updateRes = await db.users.update({ has_deleted: "true" }, { where: { id: user_id } })
            return res.status(200).json({ message: CNST.USER_DELETE_SUCCESS, success: true })
        }
        catch (error) {
            return res.status(400).json({ message: error.message, success: false })
        }
    },
    add: async (req, res, next) => {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            let { user_name, email, password, device_type = '', device_id = '', fcm_token = '', gender, date_of_birth, profile_picture, full_name } = req.body;
            let userObj = { user_name, email, password, gender, date_of_birth, profile_picture, full_name };
            let deviceDetailObj = { device_type, device_id, fcm_token };
            //Check if there is a user with the same email
            const foundUser = await db.users.findOne({ where: { [Op.or]: { email, user_name } } }, { transaction });
            if (foundUser) {
                if (foundUser.user_name === user_name) {
                    return res.status(400).json({ message: CNST.USER_NAME_ALREADY_EXIST_MSG, success: false })
                }
                else {
                    return res.status(400).json({ message: CNST.ACCOUNT_WITH_EMAIL_EXIST, success: false })
                }
            }

            const user = await db.users.create(userObj, {
                attributes: {
                    exclude: ['password', 'has_deleted', 'has_blocked', 'role']
                }
            }, { transaction })
            // save device detail in db
            deviceDetailObj.user_id = user.id;
            const deviceDetailRes = await db.device_detail.create(deviceDetailObj, { transaction });
            //Generate token
            const token = await signToken(user);
            //Send Email to super admin
            const userData = [{
                name: user_name,
                email: email
            }]
            // const emailRes = sendEmail('signup', userData);
            await transaction.commit();
            // const tokenWithBearer = `${token}`;
            return res.status(200).json({ data: user, token, message: CNST.SUCCESS, success: true })

        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(400).json({ message: error.message, success: false })
        }
    },
    getFollowers: async (req, res, next) => {
        try {
            var data = await db.user_follow.findAll({
                attributes: ['id'],
                where: { following_id: parseInt(req.params.uid) }, include: [
                    {
                        model: db.users, as: 'follower',
attributes: ["id", "user_name", "email", "full_name", "gender", "date_of_birth", "profile_picture", "has_private"]
                    }
                ]
            })
            return res.status(200).json({ message: 'working.....', data: data || [] })
        }
        catch (err) {
            return res.status(400).json({ message: err.message, data: [] })
        }
    },
    getFollowing: async (req, res, next) => {
        try {
            var data = await db.user_follow.findAll({
                attributes: ['id'],
                where: { follower_id: parseInt(req.params.uid) }, include: [
                    {
                        model: db.users, as: 'following',
attributes: ["id", "user_name", "email", "full_name", "gender", "date_of_birth", "profile_picture", "has_private"]
                    }
                ]
            })
            return res.status(200).json({ message: 'working.....', data: data || [] })
        }
        catch (err) {
            return res.status(400).json({ message: err.message, data: [] })
        }
    }
}
