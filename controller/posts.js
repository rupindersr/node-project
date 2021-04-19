var Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../models');
const CNST = require('../config/constant');

module.exports = {
    feedList: async (req, res, next) => {
        try {
            var page_number = parseInt(req.query.page_number) || CNST.DEFAULT_PAGE_NUMBER,
                page_size = parseInt(req.query.page_size) || CNST.DEFAULT_PAGE_SIZE,
                page_number = page_number <= 1 ? 0 : ((page_number * page_size) - page_size);
            // const page_size = 20, page_number = 0;
            const user_id = req.user.id;
            const [count, rows] = await Promise.all([
                db.posts.count({ where: { has_deleted: 'false' } }),
                db.posts.findAll({
                    subQuery: false,
                    where: { has_deleted: 'false' },
                    attributes: {
                        exclude: ['has_deleted'],
                        include: [
                            'posts.*',
                            [db.sequelize.fn("COUNT", db.sequelize.col("post_comments.post_comment_id")), "total_comment"],
                            [db.sequelize.fn("COUNT", db.sequelize.col("post_likes.post_like_id")), "total_likes"]
                        ]
                    },
                    group: 'posts.post_id',
                    include: [
                        {
                            model: db.post_tags,
                            attributes: ['post_tag_id', 'tag_x_position', 'tag_y_position', 'tagged_user_id'],
                            include: [
                                {
                                    model: db.users, as: 'tagged_user_detail',
                                    attributes: [
                                        'id', 'user_name', 'full_name', 'email', 'gender',
                                        'date_of_birth', 'has_private',
                                    ],
                                }
                            ],
                        },
                        { model: db.post_comments, attributes: [] },
                        { model: db.post_likes },
                        { model: db.users, attributes: ["id", "user_name", "email", "full_name", "gender", "date_of_birth", "profile_picture", "has_private"] },
                    ],
                    distinct: true,
                    // Add order conditions here....
                    order: [
                        ['post_id', 'DESC']
                    ],
                    offset: page_number, limit: page_size
                }, { rows: false })
            ])


            return res.status(200).json({ data: rows, total_records: count, message: CNST.SUCCESS })
        } catch (error) {
            return res.status(200).json({ message: error.message })
        }
    },
    addPost: async (req, res, next) => {
        let transaction;
        try {
            const { tags } = req.value.body;
            req.value.body.user_id = req.user.id;

            transaction = await db.sequelize.transaction();
            const postRes = await db.posts.create(req.value.body, { transaction });
            if (tags.length) {
                var tagsArray = []
                for (let k = 0; k < tags.length; k++) {
                    var obj = {
                        post_id: postRes.post_id,
                        tagged_user_id: tags[k].user_id,
                        tag_x_position: tags[k].tag_x_position,
                        tag_y_position: tags[k].tag_y_position
                    }
                    tagsArray.push(obj);
                }
                const tagRes = await db.post_tags.bulkCreate(tagsArray, { transaction });
            }
            await transaction.commit();
            // Return the post back into response
            req.params.post_id = postRes.post_id
            module.exports.viewPostById(req, res, next)
            //return res.status(200).json({ message: CNST.POST_ADDED_SUCCESS })
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(400).json({ message: error.message })
        }
    },
    updatePost: async (req, res, next) => {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            const { tags, post_id } = req.value.body;
            const postRes = await db.posts.update(req.value.body, { where: { post_id } }, { transaction });
            //Destroy tags of this post
            const tagDestroyRes = await db.post_tags.destroy({ where: { post_id } }, { transaction });

            if (tags.length) {
                var tagsArray = []
                for (let k = 0; k < tags.length; k++) {
                    var obj = {
                        post_id: postRes.id,
                        user_id: tags[k].user_id,
                        tag_x_position: tags[k].tag_x_position,
                        tag_y_position: tags[k].tag_y_position
                    }
                    tagsArray.push(obj);
                }
                const tagRes = await db.post_tags.bulkCreate(tagsArray, { transaction });
            }
            await transaction.commit();

            // Return the post back into response
            req.params.post_id = post_id
            module.exports.viewPostById(req, res, next)
            // return res.status(200).json({ message: CNST.SUCCESS })
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(400).json({ message: error.message })
        }
    },
    postListByTagORUser: async (req, res, next) => {
        //Get posts that's are tagged or only posted by me
        try {
            var page_number = parseInt(req.query.page_number) || CNST.DEFAULT_PAGE_NUMBER,
                page_size = parseInt(req.query.page_size) || CNST.DEFAULT_PAGE_SIZE,
                page_number = page_number <= 1 ? 0 : ((page_number * page_size) - page_size);
            const user_id = req.user.id;
            const { type, profile_id } = req.query;
            if (type.toLowerCase() === "tag") {
                const [count, data] = await Promise.all([
                    db.posts.count({
                        where: { has_deleted: 'false' },
                        include: [
                            {
                                model: db.post_tags,
                                attributes: [],
                                where: { tagged_user_id: profile_id },
                            }
                        ]
                    }),
                    db.posts.findAll({
                        subQuery: false,
                        where: { has_deleted: 'false' },
                        attributes: {
                            exclude: ['has_deleted'],
                            include: [
                                'posts.*',
                                [db.sequelize.fn("COUNT", db.sequelize.col("post_comments.post_comment_id")), "total_comment"],
                                [db.sequelize.fn("COUNT", db.sequelize.col("post_likes.post_like_id")), "total_likes"]
                            ]
                        },
                        group: 'posts.post_id',
                        include: [
                            {
                                model: db.post_tags,
                                attributes: ['post_tag_id', 'tag_x_position', 'tag_y_position', 'tagged_user_id'],
                                where: { tagged_user_id: profile_id },
                                include: [
                                    {
                                        model: db.users,
                                        as: 'tagged_user_detail',
                                        attributes: [
                                            'id', 'user_name', 'full_name', 'email', 'gender',
                                            'date_of_birth', 'has_private',
                                            // [db.sequelize.fn("COUNT", db.sequelize.col("posts.post_id")), "total_post"],
                                        ],
                                        // group: ['users.id'],
                                        // include: [
                                        //     { model: db.posts, as: 'posts', attributes: [] },
                                        //     { model: db.user_follow, as: 'follower', attributes: [] },
                                        //     { model: db.user_follow, as: 'following', attributes: [] }
                                        // ],
                                    }
                                ],
                                where: { tagged_user_id: profile_id },
                            },
                            { model: db.users, attributes: ['id', 'user_name', 'full_name', 'email', 'gender', 'date_of_birth', 'has_private'] },
                            { model: db.post_comments, attributes: [] },
                            { model: db.post_likes, attributes: [] }
                        ],
                        distinct: true,
                        // Add order conditions here....
                        order: [
                            ['post_id', 'DESC']
                        ],
                        offset: page_number,
                        limit: page_size
                    }, { rows: false })
                ])
                return res.status(200).json({ data: data, total_records: count, message: CNST.SUCCESS })
            }
            else {
                const [count, rows] = await Promise.all([
                    db.posts.count({
                        where: { user_id: profile_id, has_deleted: 'false' },
                    }),
                    db.posts.findAll({
                        subQuery: false,
                        where: { user_id: profile_id, has_deleted: 'false' },
                        attributes: {
                            exclude: ['has_deleted'],
                            include: [
                                'posts.*',
                                [db.sequelize.fn("COUNT", db.sequelize.col("post_comments.post_comment_id")), "total_comment"],
                                [db.sequelize.fn("COUNT", db.sequelize.col("post_likes.post_like_id")), "total_likes"]
                            ]
                        },
                        group: 'posts.post_id',
                        include: [
                            {
                                model: db.post_tags,
                                attributes: ['post_tag_id', 'tag_x_position', 'tag_y_position', 'tagged_user_id'],
                                include: [
                                    {
                                        subQuery: false,
                                        model: db.users, as: 'tagged_user_detail',
                                        attributes: [
                                            "id", "user_name", "email", "full_name", "gender", "date_of_birth", "profile_picture", "has_private",
                                            // [db.sequelize.fn("COUNT", db.sequelize.col("posts.post_id")), "total_post"],
                                            // [db.sequelize.fn("COUNT", db.sequelize.col("follower.follower_id")), "total_following"],
                                            // [db.sequelize.fn("COUNT", db.sequelize.col("following.following_id")), "total_follower"],
                                        ],
                                        // group: ['users.id'],
                                        // include: [
                                        //     { model: db.posts, as: 'posts', attributes: [] },
                                        //     { model: db.user_follow, as: 'follower' },
                                        //     { model: db.user_follow, as: 'following' }
                                        // ],
                                    }
                                ],
                            },
                            { model: db.users, attributes: ['id', 'user_name', 'full_name', 'email', 'gender', 'date_of_birth', 'has_private'] },
                            { model: db.post_comments, attributes: [] },
                            { model: db.post_likes, attributes: [] }
                        ],
                        distinct: true,
                        // Add order conditions here....
                        order: [
                            ['post_id', 'DESC']
                        ],
                        offset: page_number, limit: page_size
                    }, { rows: false })
                ])
                return res.status(200).json({ data: rows, total_records: count, message: CNST.SUCCESS })
            }
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    },
    viewPostById: async (req, res, next) => {
        try {
            const { post_id } = req.params;
            if (!post_id) {
                return res.status(400).json({ message: CNST.POST_ID_REQUIRED })
            }
            const post = await db.posts.findAll({
                // subQuery: false,
                where: {
                    [Op.and]: { has_deleted: 'false', post_id }
                },
                attributes: {
                    exclude: ['has_deleted'],
                    include: [
                        'posts.*',
                        [db.sequelize.fn("COUNT", db.sequelize.col("post_comments.post_comment_id")), "total_comment"],
                        [db.sequelize.fn("COUNT", db.sequelize.col("post_likes.post_like_id")), "total_likes"]
                    ]
                },
                // group: 'posts.post_id',
                include: [
                    { model: db.post_comments, attributes: [] },
                    { model: db.post_likes, attributes: [] },
                    { model: db.users, attributes: ["id", "user_name", "email", "full_name", "gender", "date_of_birth", "profile_picture", "has_private"] },
                    {
                        model: db.post_tags,
                        attributes: ['post_tag_id', 'tag_x_position', 'tag_y_position', 'tagged_user_id'],
                        include: [
                            {
                                model: db.users, as: 'tagged_user_detail',
                                attributes: [
                                    "id", "user_name", "email", "full_name", "gender", "date_of_birth", "profile_picture", "has_private",
                                    // [db.posts.sequelize.fn("COUNT", db.posts.sequelize.col("posts.post_id")), "total_post"],
                                    // [db.sequelize.fn("COUNT", db.sequelize.col("follower.follower_id")), "total_follower"],
                                ],
                                // group: ['users.id'],
                                // include: [
                                //     // { model: db.posts, as: 'posts' },
                                //     { model: db.user_follow, as: 'follower' },
                                //     { model: db.user_follow, as: 'following' }
                                // ],
                            }
                        ],
                    },

                ],
                // distinct: true,

            })
            return res.status(200).json({ data: post, message: CNST.SUCCESS })
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    },
    likeUnlikePost: async (req, res, next) => {
        try {
            const { post_id } = req.value.body;
            var likeObj = { user_id: req.user.id, post_id: post_id }
            //Check post exist or not in DB
            const hasPostExist = await db.posts.findOne({ where: { [Op.and]: { post_id, has_deleted: 'false' } } })
            if (hasPostExist) {
                const hasAlreadyLike = await db.post_likes.findOne({ where: { [Op.and]: likeObj } })
                if (hasAlreadyLike) {
                    //Unlike the post
                    const unlikeRes = await db.post_likes.destroy({ where: { [Op.and]: likeObj } });
                    return res.status(200).json({ has_like: false, message: CNST.UNLIKE_SUCCESS });
                }
                else {
                    const likeRes = await db.post_likes.create(likeObj);
                    return res.status(200).json({ has_like: true, message: CNST.LIKE_SUCCESS });
                }
            }
            else {
                return res.status(400).json({ message: CNST.INVALID_POST_ID_MSG })
            }
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    },
    addComment: async (req, res, next) => {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            const { comment, post_id } = req.value.body;
            var user_id = req.user.id;
            var commentObj = { user_id, post_id, comment }
            //Check post id exist or not in db
            const hasPostExist = await db.posts.findOne({
                where: {
                    [Op.and]: { post_id, has_deleted: 'false' }
                }
            })
            if (hasPostExist) {
                const commentRes = await db.post_comments.create(commentObj, { transaction });

                await transaction.commit();
                //Return recent added comment back to user
                const recentComment = await db.post_comments.findOne({
                    where: { post_comment_id: commentRes.post_comment_id },
                    attributes: ['post_comment_id', 'comment', 'createdAt', 'updatedAt'],
                    include: [
                        {
                            model: db.users,
                            attributes: ["id", "user_name", "email", "full_name", "gender", "date_of_birth", "profile_picture", "has_private"]
                        }
                    ],
                })
                return res.status(200).json({ data: recentComment, message: CNST.COMMENT_ADD_SUCCESS });
            }
            else {
                return res.status(400).json({ message: CNST.POST_NOT_FOUND_MSG })
            }
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(400).json({ message: error.message })
        }
    },
    commentsByPostID: async (req, res, next) => {
        try {
            var page_number = parseInt(req.query.page_number) || CNST.DEFAULT_PAGE_NUMBER,
                page_size = parseInt(req.query.page_size) || CNST.DEFAULT_PAGE_SIZE,
                page_number = page_number <= 1 ? 0 : ((page_number * page_size) - page_size);
            const { post_id } = req.params;
            if (!post_id) {
                return res.status(400).json({ message: CNST.POST_ID_REQUIRED })
            }
            const { rows, count } = await db.post_comments.findAndCountAll({
                where: { post_id },
                attributes: ['post_comment_id', 'comment', 'createdAt', 'updatedAt'],
                include: [
                    {
                        model: db.users,
                        attributes: ["id", "user_name", "email", "full_name", "gender", "date_of_birth", "profile_picture", "has_private"]
                    }
                ],
                distinct: true,
                // Add order conditions here....
                order: [
                    ['post_comment_id', 'DESC']
                ],
                offset: page_number, limit: page_size
            }, { rows: false })
            return res.status(200).json({ data: rows, total_records: count, message: CNST.SUCCESS });
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    },
    likesListByPostID: async (req, res, next) => {
        try {
            const { post_id } = req.params;
            if (!post_id) {
                return res.status(400).json({ message: CNST.POST_ID_REQUIRED })
            }
            const likeData = await db.post_likes.findAll({
                where: { post_id },
                // attributes: [[db.sequelize.fn("COUNT", db.sequelize.col("post_like_id")), "total_likes"]],
                include: [
                    {
                        model: db.users,
                        attributes: ["id", "user_name", "email", "full_name", "gender", "date_of_birth", "profile_picture", "has_private"]
                    }
                ]
                //group: ['post_id']
            })
            return res.status(200).json({ data: likeData, message: CNST.SUCCESS })
        }
        catch (error) {
            return res.status(400).json({ message: error.message })
        }
    },
    deletePost: async (req, res, next) => {
        try {
            const { post_id } = req.params;
            if (post_id) {
                const deleteRes = await db.posts.update({ has_deleted: 'true' }, { where: { post_id } })
                return res.status(200).json({ message: CNST.POST_DELETE_SUCCESS })
            }
            else {
                return res.status(400).json({ message: CNST.POST_ID_REQUIRED })
            }
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    },
    deleteComment: async (req, res, next) => {
        try {
            const { post_comment_id } = req.params;
            if (post_comment_id) {
                const hasCommentExist = await db.post_comments.findOne({ where: { post_comment_id } });
                if (hasCommentExist) {
                    const deleteRes = await db.post_comments.destroy({ where: { post_comment_id } })
                    return res.status(200).json({ message: CNST.COMMENT_DELETE_SUCCESS })
                }
                else {
                    return res.status(400).json({ message: CNST.INVALID_POST_COMMENT_ID_MSG })
                }
            }
            else {
                return res.status(400).json({ message: CNST.POST_COMMENT_ID_REQUIRED })
            }
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    },
    searchPost: async (req, res, next) => {

        try {
            var page_number = parseInt(req.query.page_number) || CNST.DEFAULT_PAGE_NUMBER,
                page_size = parseInt(req.query.page_size) || CNST.DEFAULT_PAGE_SIZE,
                page_number = page_number <= 1 ? 0 : ((page_number * page_size) - page_size);
            const { search } = req.query;
            let data = await db.posts.findAll({
                subQuery: false,
                where: { has_deleted: 'false', caption: { [Op.substring]: `%${search}%` } },
                attributes: {
                    exclude: ['has_deleted'],
                    include: [
                        'posts.*',
                        [db.sequelize.fn("COUNT", db.sequelize.col("post_comments.post_comment_id")), "total_comment"],
                        [db.sequelize.fn("COUNT", db.sequelize.col("post_likes.post_like_id")), "total_likes"]
                    ]
                },
                group: 'posts.post_id',
                include: [
                    {
                        model: db.post_tags,
                        attributes: ['post_tag_id', 'tag_x_position', 'tag_y_position', 'tagged_user_id'],
                        include: [
                            {
                                model: db.users, as: 'tagged_user_detail',
                                attributes: [
                                    'id', 'user_name', 'full_name', 'email', 'gender',
                                    'date_of_birth', 'has_private',
                                ],
                            }
                        ],
                    },
                    { model: db.post_comments, attributes: [] },
                    { model: db.post_likes, attributes: [] },
                    { model: db.users, attributes: ["id", "user_name", "email", "full_name", "gender", "date_of_birth", "profile_picture", "has_private"] },
                ],
                distinct: true,
                // Add order conditions here....
                order: [
                    ['post_id', 'DESC']
                ],
                offset: page_number,
                limit: page_size
            }, { rows: false })
            return res.status(200).json({ data: data, message: CNST.SUCCESS })
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    },
    searchByTags:async(req,res,next)=>{
        try {
            var page_number = parseInt(req.query.page_number) || CNST.DEFAULT_PAGE_NUMBER,
                page_size = parseInt(req.query.page_size) || CNST.DEFAULT_PAGE_SIZE,
                page_number = page_number <= 1 ? 0 : ((page_number * page_size) - page_size);
            const { search } = req.query;
            let data = await db.posts.findAll({
                subQuery: false,
                where: { has_deleted: 'false', caption: { [Op.substring]: `%${search}%` } },
                attributes: {
                    exclude: ['has_deleted'],
                    include: [
                        'posts.*',
                        [db.sequelize.fn("COUNT", db.sequelize.col("post_comments.post_comment_id")), "total_comment"],
                        [db.sequelize.fn("COUNT", db.sequelize.col("post_likes.post_like_id")), "total_likes"]
                    ]
                },
                group: 'posts.post_id',
                include: [
                    {
                        model: db.post_tags,
                        attributes: ['post_tag_id', 'tag_x_position', 'tag_y_position', 'tagged_user_id'],
                        include: [
                            {
                                model: db.users, as: 'tagged_user_detail',
                                attributes: [
                                    'id', 'user_name', 'full_name', 'email', 'gender',
                                    'date_of_birth', 'has_private',
                                ],
                            }
                        ],
                    },
                    { model: db.post_comments, attributes: [] },
                    { model: db.post_likes, attributes: [] },
                    { model: db.users, attributes: ["id", "user_name", "email", "full_name", "gender", "date_of_birth", "profile_picture", "has_private"] },
                ],
                distinct: true,
                // Add order conditions here....
                order: [
                    ['post_id', 'DESC']
                ],
                offset: page_number,
                limit: page_size
            }, { rows: false })
            return res.status(200).json({ data: data, message: CNST.SUCCESS })
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }  
    }
}
