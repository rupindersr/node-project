var router = require('express-promise-router')();
const postsController = require('../controller/posts');
const { validateBody, schemas } = require('../helper/route_helpers')

router.route('/add')
  .post(validateBody(schemas.addUpdatePost), postsController.addPost)

router.route('/update')
  .post(validateBody(schemas.addUpdatePost), postsController.updatePost)

router.route('/feeds')
  .get(postsController.feedList)

router.route('/list')
  .get(postsController.postListByTagORUser)

router.route('/view/:post_id')
  .get(postsController.viewPostById)

router.route('/like')
  .post(validateBody(schemas.postLike), postsController.likeUnlikePost)

router.route('/comment/add')
  .post(validateBody(schemas.postComment), postsController.addComment)

router.route('/comments/:post_id')
  .get(postsController.commentsByPostID)

router.route('/likes/:post_id')
  .get(postsController.likesListByPostID)

router.route('/delete/:post_id')
  .delete(postsController.deletePost)

router.route('/comment/delete/:post_comment_id')
  .delete(postsController.deleteComment)

router.route('/serach-post')
  .get(postsController.searchPost)

module.exports = router;
