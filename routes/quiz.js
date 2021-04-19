const router = require('express-promise-router')();
const quizController = require('../controller/quiz');

router.route('/').post(quizController.add);
router.route('/questions').post(quizController.addQuestions);

router.route('/').get(quizController.get);
router.route('/questions').get(quizController.getQuestions);

router.route('/:id').put(quizController.update);
router.route('/:id').delete(quizController.deleteQuiz);

router.route('/questions/:id').put(quizController.updateQuestions);
router.route('/questions/:id').delete(quizController.deleteQuestions);

router.route('/random-questions').get(quizController.getRandomQuestion)
// router.route('/delete').delete(quizController.delete);


module.exports = router;
