var router = require('express-promise-router')();
const notifications = require('../controller/notifications');
const { validateBody, schemas } = require('../helper/route_helpers')

router.route('/get')
    .get(notifications.getUserNotification)

router.route('/update')
    .post(notifications.updateUserNotification)

router.route('/delete')
    .post(notifications.deleteUserNotification)

router.route('/add')
    .post(notifications.addUserNotification)

router.route('/types')
    .get(notifications.getNotificationTypes)

module.exports = router;
