const express = require('express');
const groupController = require('../controller/groupController');
const authenticate = require('../autentication/userAutentication')

const router = express.Router();

router.post('/creategroup', authenticate, groupController.createGroup);
router.post('/addMember', authenticate, groupController.addMemberToGroup);
router.get('/:groupId/messages', authenticate, groupController.getGroupMessages);
router.post('/:groupId/message', authenticate, groupController.sendMessage);
router.get('/user/groups', authenticate, groupController.getUserGroups);
router.get('/:groupId/users', authenticate, groupController.getGroupUsers);
router.post('/:groupId/promote', authenticate, groupController.promoteUsersToAdmin);
router.delete('/:groupid/removeUsers', authenticate, groupController.removeUserFromGroup);



module.exports = router;
