const Group = require('../models/group');
const User = require('../models/user');
const Message = require('../models/message');
const UserGroup = require('../models/userGroup');

exports.createGroup = async (req, res) => {
    try {
        const { groupName } = req.body;
        const userId = req.user.id;

        const group = await Group.create({ groupName, createdBy: userId });
        await group.addUsers(userId);
        await UserGroup.update({ isAdmin: true }, {
            where: {
                UserId: userId,
                GroupId: group.id // Assuming group.id is the ID of the group you just created
            }
        });


        res.status(201).json({ message: 'Group created successfully', group });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Failed to create group' });
    }
};


exports.addMemberToGroup = async (req, res) => {
    try {
        const { groupId, userIds } = req.body;

        const group = await Group.findByPk(groupId);
        const users = await User.findAll({ where: { id: userIds } });

        if (group && users.length > 0) {
            for (const user of users) {
                await group.addUsers(userIds);
            }
            res.status(200).json({ message: 'Users added to group successfully' });
        } else {
            res.status(404).json({ error: 'Group or Users not found' });
        }
    } catch (error) {
        console.error('Error adding members to group:', error);
        res.status(500).json({ error: 'Failed to add members to group' });
    }
};


exports.getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;

        const messages = await Message.findAll({ where: { groupId }, include: [User] });
        res.status(200).json({ messages });
    } catch (error) {
        console.error('Error fetching group messages:', error);
        res.status(500).json({ error: 'Failed to fetch group messages' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { text } = req.body;
        const userId = req.user.id;
        console.log(groupId);
        const message = await Message.create({ text, GroupId: groupId, UserId: userId });

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

exports.getUserGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            include: Group
        });

        if (user) {
            res.status(200).json({ groups: user.Groups });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user groups:', error);
        res.status(500).json({ error: 'Failed to fetch user groups' });
    }
};



exports.getGroupUsers = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findByPk(groupId, {
            include: [{ model: User, attributes: ['id', 'userName'] }]
        });

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.status(200).json({ users: group.Users });
    } catch (error) {
        console.error('Error fetching group users:', error);
        res.status(500).json({ error: 'Failed to fetch group users' });
    }
};

exports.promoteUsersToAdmin = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userIds } = req.body;
        console.log(groupId, userIds);

        const group = await Group.findByPk(groupId);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const users = await User.findAll({ where: { id: userIds } });

        if (users.length === 0) {
            return res.status(404).json({ error: 'Users not found' });
        }

        for (const user of users) {
            await UserGroup.update({ isAdmin: true }, { where: { GroupId: groupId, UserId: user.id } });
        }

        res.status(200).json({ message: 'Users promoted to admin successfully' });
    } catch (error) {
        console.error('Error promoting users to admin:', error);
        res.status(500).json({ error: 'Failed to promote users to admin' });
    }
};

exports.removeUserFromGroup = async (req, res) => {
    const groupId = req.params;
    const userId = req.body;
    console.log('------------------');
    console.log(groupId, userId, req.user.id);
    try {
        // Check if the requesting user is an admin of the group
        const userGroup = await UserGroup.findOne({
            where: {
                GroupId: groupId.groupid,
                UserId: req.user.id, // Assuming you have authentication middleware setting req.user
                isAdmin: true
            }
        });
        console.log(userGroup);
        if (!userGroup) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Remove user from the group
        await UserGroup.destroy({
            where: {
                GroupId: groupId.groupid,
                UserId: userId.userIds
            }
        });

        res.json({ message: 'User removed from group successfully' });
    } catch (error) {
        console.error('Error removing user from group:', error);
        res.status(500).json({ error: 'Failed to remove user from group' });
    }
}