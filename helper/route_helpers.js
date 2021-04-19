const Joi = require('joi');
const JOI = require('./joi_validation');
module.exports = {
    validateBody: (schema) => {
        return (req, res, next) => {
            const result = Joi.validate(req.body, schema);
            if (result.error) {
                return res.status(400).json({ message: result.error.message })
            }
            if (!req.value) { req.value = {}; }
            req.value['body'] = result.value;
            //req['body'] = result.value;
            next();
        }
    },

    schemas: {
        validateUserName: Joi.object().keys({
            user_name: Joi.string().required().error(new Error(JOI.USER_NAME_REQUIRED_MSG)),
        }),
        forgotPassword: Joi.object().keys({
            email: Joi.string().email({ minDomainAtoms: 2 }).required().error(new Error(JOI.VALID_EMAIL_MSG))
        }),
        signUp: Joi.object().keys({
            user_name: Joi.string().required().error(new Error(JOI.USER_NAME_REQUIRED_MSG)),
            email: Joi.string().email({ minDomainAtoms: 2 }).required().error(new Error(JOI.VALID_EMAIL_MSG)),
            password: Joi.string().required().error(new Error(JOI.PASSWORD_REQUIRED_MSG)),
            profile_picture: Joi.string().allow(''),
            device_type: Joi.string().required().error(new Error(JOI.DEVICE_TYPE_REQUIRED_MSG)),
            device_id: Joi.string().required().error(new Error(JOI.DEVICE_ID_REQUIRED_MSG)),
            fcm_token: Joi.string().required().error(new Error(JOI.FCM_TOKEN_REQUIRED_MSG)),
        }),
        signIn: Joi.object().keys({
            user_name: Joi.string().required().error(new Error(JOI.USER_NAME_REQUIRED_MSG)),
            password: Joi.string().required().error(new Error(JOI.PASSWORD_REQUIRED_MSG)),
            device_type: Joi.string().required().error(new Error(JOI.DEVICE_TYPE_REQUIRED_MSG)),
            device_id: Joi.string().required().error(new Error(JOI.DEVICE_ID_REQUIRED_MSG)),
            fcm_token: Joi.string().required().error(new Error(JOI.FCM_TOKEN_REQUIRED_MSG)),
        }),
        changePassword: Joi.object().keys({
            old_password: Joi.string().required().error(new Error(JOI.OLD_PASSWORD_REQUIRED_MSG)),
            new_password: Joi.string().required().error(new Error(JOI.NEW_PASSWORD_REQUIRED_MSG))
        }),
        updateUser: Joi.object().keys({
            user_name: Joi.string().allow(''),
            profile_picture: Joi.string().allow(''),
            date_of_birth: Joi.string().allow(''),
            gender: Joi.string().allow(''),
            full_name: Joi.string().allow('')
        }),
        followUnfollow: Joi.object().keys({
            following_user_id: Joi.number().required().error(new Error(JOI.FOLLOWING_USER_ID_REQUIRED_MSG)),
        }),
        addUpdatePost: Joi.object().keys({
            post_id: Joi.string().optional().allow('').allow(null),
            media_type: Joi.string().required().error(new Error(JOI.MEDIA_TYPE_REQUIRED_MSG)),
            media: Joi.string().required().error(new Error(JOI.MEDIA_REQUIRED_MSG)),
            media_width: Joi.string().optional().allow('').allow(null),
            media_height: Joi.string().optional().allow('').allow(null),
caption: Joi.string().optional().allow('').allow(null),            
full_address: Joi.string().optional().allow('').allow(null),
            lat: Joi.string().optional().allow('').allow(null),
            long: Joi.string().optional().allow('').allow(null),
            city: Joi.string().optional().allow('').allow(null),
            state: Joi.string().optional().allow('').allow(null),
            country: Joi.string().optional().allow('').allow(null),
            postal_code: Joi.string().optional().allow('').allow(null),
            tags: Joi.array().items(Joi.object({
                user_id: Joi.number().required().error(new Error(JOI.USER_ID_REQUIRED_MSG)),
                tag_x_position: Joi.string().required().error(new Error(JOI.TAG_X_POSITION_REQUIRED_MSG)),
                tag_y_position: Joi.string().required().error(new Error(JOI.TAG_Y_POSITION_REQUIRED_MSG))
            })).optional()
        }),
        postLike: Joi.object().keys({
            post_id: Joi.number().required().error(new Error(JOI.POST_ID_REQUIRED_MSG))
        }),
        postComment: Joi.object().keys({
            comment: Joi.string().required().error(new Error(JOI.COMMENT_REQUIRED_MSG)),
            post_id: Joi.number().required().error(new Error(JOI.POST_ID_REQUIRED_MSG))
        }),
        addProduct: Joi.object().keys({
            title: Joi.string().required().error(new Error(JOI.PRODUCT_TITLE_REQUIRED_MSG)),
            description: Joi.string().required().error(new Error(JOI.PRODUCT_DESCRIPTION_REQUIRED_MSG)),
            price: Joi.number().required().error(new Error(JOI.PRODUCT_PRICE_REQUIRED_MSG)),
            product_category_id: Joi.number().min(1).required().error(new Error(JOI.PRODUCT_CATEGORY_ID_REQUIRED_MSG)),
            product_images: Joi.array().required().error(new Error(JOI.PRODUCT_IMAGE_REQUIRED_ERROR))
        }),
        addCategory: Joi.object().keys({
            category_name: Joi.string().required().error(new Error(JOI.CATEGORY_NAME_REQUIRED_MSG))
        }),
        addToCart: Joi.object().keys({
            product_id: Joi.number().required().error(new Error(JOI.PRODUCT_ID_REQUIRED_MSG)),
            quantity: Joi.number().required().error(new Error(JOI.PRODUCT_QUANTITY_REQUIRED_MSG))
        }),
        updateCart: Joi.object().keys({
            quantity: Joi.number().required().error(new Error(JOI.PRODUCT_QUANTITY_REQUIRED_MSG))
        }),
        placeOrder: Joi.object().keys({
            orders: Joi.array().items(Joi.object({
                cart_id: Joi.number().required().error(new Error(JOI.CART_ID_REQUIRED_MSG)),
                sub_total: Joi.number().positive().precision(2).required().error(new Error(JOI.SUB_TOTAL_REQUIRED_MSG)),
                shipping_charges: Joi.number().positive().precision(2).required().error(new Error(JOI.SHIPPING_CHARGES_REQUIRED_MSG)),
                tax: Joi.number().positive().precision(2).required().error(new Error(JOI.TAX_REQUIRED_MSG)),
                total_amount: Joi.number().positive().precision(2).required().error(new Error(JOI.TOTAL_AMOUNT_REQUIRED_MSG))
            }))
        }),
        logout: Joi.object().keys({
            token: Joi.string().required().error(new Error(JOI.TOKEN_REQUIRED_MSG))
        }),
    }
}
