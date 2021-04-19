const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../models');
const CNST = require('../config/constant');
const _ = require('async');

module.exports = {
    add: async (req, res, next) => {
        let transaction;
        try {
            let payload = req.body;
            payload = { ...payload, user_id: req.user.id };
            transaction = await db.sequelize.transaction();
            const postRes = await db.quizzes.create(payload, { transaction });
            await transaction.commit();
            return res.status(200).json({ success: true, message: CNST.QUIZ_ADDED_SUCCESS })
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(400).json({ success: false, message: error.message })
        }
    },
    get: async (req, res, next) => {
        const id = req.query.id;
        let dataToSend;
        let page_number = parseInt(req.query.page_number) || CNST.DEFAULT_PAGE_NUMBER;
        const page_size = parseInt(req.query.page_size) || CNST.DEFAULT_PAGE_SIZE;
        page_number = page_number <= 1 ? 0 : ((page_number * page_size) - page_size);
        const quizProject = ['title', 'description', 'id'];
        const userProject = ['full_name', 'id'];
        try {
            if (!!id) {
                dataToSend = await db.quizzes.findOne({
                    where: { id: +id, has_deleted: "false" }, include: [
                        { model: db.users, as: 'user', attributes: userProject },
                    ], attributes: quizProject
                });
            } else {
                dataToSend = await db.quizzes.findAll({
                    where: { user_id: req.user.id, has_deleted: "false" },
                    include: [
                        {
                            model: db.users, as: 'user', attributes: userProject
                        },
                    ],
                    attributes: quizProject,
                    offset: page_number,
                    limit: page_size
                }, { rows: false })
            }
            return res.status(200).json({ success: true, message: CNST.QUIZ_GET_SUCCESS, data: dataToSend })
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message })
        }
    },
    update: async (req, res, next) => {
        let transaction;

        try {
            let payload = req.body;
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ success: false, message: CNST.QUIZ_ID_REQUIRED })
            }
            transaction = await db.sequelize.transaction();
            const postRes = await db.quizzes.update(payload, { where: { id }, transaction });
            await transaction.commit();
            return res.status(200).json({ success: true, message: CNST.QUIZ_UPDATED_SUCCESS })
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(400).json({ success: false, message: error.message })
        }
    },
    deleteQuiz: async (req, res, next) => {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: CNST.QUIZ_ID_REQUIRED })
            }
            await db.quizzes.update({ has_deleted: "true" }, { where: { id: id } })
            return res.status(200).json({ message: CNST.QUIZ_DELETED_SUCCESS, success: true, })
        }
        catch (error) {
            return res.status(400).json({ message: error.message, success: false, })
        }
    },
    addQuestions: async (req, res, next) => {
        let transaction;
        try {
            let { questions = [] } = req.body;
            transaction = await db.sequelize.transaction();
            let update = 0;
            await _.eachSeries(questions, async (payload) => {
                if (!!payload.id) {
                    update++;
                    const { answers, attributes, title, description, id } = payload;
                    const query = {
                        where: { id },
                        transaction
                    };
                    await db.questions.update({ title, description }, query);
                    _.eachSeries(answers, async (answer) => {
                        const { id: ans_id, ...update } = answer;
                        try {
                            await db.answers.update(update, { where: { id: ans_id } }, { transaction });
                        } catch (e) {
                            throw e;
                        }
                    });
                    _.eachSeries(attributes, async (attribute) => {
                        const { id: attribute_id, ...update } = attribute;
                        try {
                            await db.question_attributes.upsert(update, { where: { id: attribute_id } }, { transaction });
                        } catch (e) {
                            throw e;
                        }
                    });
                } else {
                    await db.questions.create(payload, {
                        transaction, include: [{
                            model: db.answers,
                            as: 'answers'
                        }, {
                            model: db.question_attributes,
                            as: 'attributes'
                        }]
                    });
                }
            });

            await transaction.commit();
            return res.status(200).json({ success: true, message: update > 0 ? CNST.QUIZ_QUESTIONS_UPDATE_SUCCESS : CNST.QUIZ_QUESTIONS_ADDED_SUCCESS })
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(400).json({ success: false, message: error.message })
        }
    },
    deleteQuestions: async (req, res, next) => {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: CNST.QUESTION_ID_REQUIRED })
            }
            await db.questions.update({ has_deleted: "true" }, { where: { id: id } })
            return res.status(200).json({ message: CNST.QUIZ_QUESTIONS_DELETE_SUCCESS, success: true })
        }
        catch (error) {
            return res.status(400).json({ message: error.message, success: false, })
        }
    },
    getQuestions: async (req, res, next) => {
        try {
            const quiz_id = req.query.quiz_id;
            const id = req.query.id;
            let page_number = parseInt(req.query.page_number) || CNST.DEFAULT_PAGE_NUMBER;
            const page_size = parseInt(req.query.page_size) || CNST.DEFAULT_PAGE_SIZE;
            page_number = page_number <= 1 ? 0 : ((page_number * page_size) - page_size);
            let dataToSend;
            if (!quiz_id) {
                return res.status(400).json({ success: false, message: CNST.QUIZ_ID_REQUIRED })
            }
            let query = {
                quiz_id: +quiz_id,
                has_deleted: "false"
            };
            if (!!id) {
                query = { id: +id, has_deleted: "false" }
            }
            if (!!quiz_id) {
                dataToSend = await db.questions.findAll({
                    where: query,
                    include: [
                        { model: db.answers, as: 'answers' },
                        { model: db.question_attributes, as: 'attributes' }
                    ],
                    offset: page_number,
                    limit: page_size
                }, { rows: false });
            }
            if (!!id) {
                dataToSend = await db.questions.findOne({
                    where: query,
                    include: [
                        { model: db.answers, as: 'answers' },
                        { model: db.question_attributes, as: 'attributes' }
                    ]
                });
            }
            return res.status(200).json({ success: true, message: CNST.QUIZ_GET_QUESTIONS_SUCCESS, data: dataToSend })
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message })
        }
    },
    updateQuestions: async (req, res, next) => {
        let transaction;
        try {
            let payload = req.body;
            let id = req.params.id;
            if (!id) {
                return res.status(400).json({ success: false, message: CNST.QUESTION_ID_REQUIRED })
            }
            transaction = await db.sequelize.transaction();
            const { answers, attributes, title, description } = payload;
            const query = {
                where: { id },
                transaction
            };
            await db.questions.update({ title, description }, query);
            _.eachSeries(answers, async (answer) => {
                const { id: ans_id, ...update } = answer;
                try {
                    await db.answers.update(update, { where: { id: ans_id } }, { transaction });
                } catch (e) {
                    throw e;
                }
            });
            _.eachSeries(attributes, async (attribute) => {
                const { id: attribute_id, ...update } = attribute;
                try {
                    await db.question_attributes.upsert(update, { where: { id: attribute_id } }, { transaction });
                } catch (e) {
                    throw e;
                }
            });
            await transaction.commit();
            return res.status(200).json({ success: true, message: CNST.QUIZ_QUESTIONS_UPDATE_SUCCESS })
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(400).json({ success: false, message: error.message })
        }
    },
    getRandomQuestion: async (req, res, next) => {
        try {
            const quiz = await db.questions.findAll({
                where: { has_deleted: "false" },
                include: [
                    { model: db.answers, as: 'answers' },
                    { model: db.question_attributes, as: 'attributes' }
                ],
                order:[
                    Sequelize.fn( 'RAND' ),
                  ],
                limit: 5,
            }, { rows: false });
            return res.status(200).json({ success: true, message: CNST.QUIZ_GET_QUESTIONS_SUCCESS, data: quiz })
        } catch (err) {
            return res.status(200).json({ success: true, message: err.message, data: [] })
        }
    }
};
