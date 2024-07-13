const socket = io('http://localhost:3000');
const token = localStorage.getItem('token');

function toggleDropdownMenu() {
    const menu = document.getElementById('dropdown-menu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

function displayCreateGroupForm(event) {
    event.preventDefault();
    const formContainer = document.getElementById('createGroupForm');
    formContainer.innerHTML = `
        <form id="create-group-form" onsubmit="createGroup(event)">
            <input type="text" id="group-name" name="group-name" placeholder="Enter group name" required>
            <button type="submit">Create Group</button>
        </form>
    `;
}

function createGroup(event) {
    event.preventDefault();
    const groupName = document.getElementById('group-name').value;

    axios.post('http://localhost:3000/group/creategroup', { groupName }, {
        headers: { "Authorization": token }
    })
        .then(response => {
            console.log(response.data);
            alert('Group created successfully!');
            document.getElementById('createGroupForm').innerHTML = '';
            loadUserGroups();
        })
        .catch(error => {
            console.error(error);
            alert('Failed to create group.');
        });
}

function loadGroupChats(groupId) {
    axios.get(`http://localhost:3000/group/${groupId}/messages`, {
        headers: { "Authorization": token }
    })
        .then(response => {
            const messagesContainer = document.getElementById('messages');
            messagesContainer.innerHTML = '';

            response.data.messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.textContent = `${msg.User.userName}: ${msg.text}`;
                messagesContainer.appendChild(messageDiv);
            });

            const addUserBtn = document.createElement('button');
            addUserBtn.textContent = 'Add Users';
            addUserBtn.onclick = () => displayAddMemberForm(groupId);
            messagesContainer.appendChild(addUserBtn);

            const addAdminBtn = document.createElement('button');
            addAdminBtn.textContent = 'Add Admins';
            addAdminBtn.onclick = () => displayAddAdminForm(groupId);
            messagesContainer.appendChild(addAdminBtn);

            const removeUserBtn = document.createElement('button');
            removeUserBtn.textContent = 'Remove Users';
            removeUserBtn.onclick = () => displayRemoveUserForm(groupId, response.data.users);
            messagesContainer.appendChild(removeUserBtn);

            document.getElementById('messageInputContainer').style.display = 'block';
            document.getElementById('messageInput').dataset.groupId = groupId;

            socket.emit('joinGroup', groupId);
        })
        .catch(error => {
            console.error(error);
            alert('Failed to load messages.');
        });
}

function sendMessage() {
    const groupId = document.getElementById('messageInput').dataset.groupId;
    const messageText = document.getElementById('messageInput').value;

    const message = {
        groupId,
        text: messageText,
        userName: 'YourUsername' // Replace with the actual username
    };

    socket.emit('message', message);
    document.getElementById('messageInput').value = '';
}

socket.on('message', (message) => {
    const messagesContainer = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `${message.userName}: ${message.text}`;
    messagesContainer.appendChild(messageDiv);
});

function displayAddMemberForm(groupId) {
    axios.get(`http://localhost:3000/user/users?groupId=${groupId}`, {
        headers: { "Authorization": token }
    })
        .then(response => {
            const users = response.data.users;
            const formContainer = document.getElementById('createGroupForm');
            let userOptions = users.map(user => `<option value="${user.id}">${user.userName}</option>`).join('');
            formContainer.innerHTML = `
            <form id="add-member-form" onsubmit="addMemberToGroup(event, ${groupId})">
                <select multiple id="new-members" name="new-members">
                    ${userOptions}
                </select>
                <button type="submit">Add Members</button>
            </form>
        `;
        })
        .catch(error => {
            console.error(error);
            alert('Failed to load users.');
        });
}

function addMemberToGroup(event, groupId) {
    event.preventDefault();
    const memberSelect = document.getElementById('new-members');
    const userIds = Array.from(memberSelect.selectedOptions).map(option => option.value);

    axios.post('http://localhost:3000/group/addMember', { groupId, userIds }, {
        headers: { "Authorization": token }
    })
        .then(response => {
            console.log(response.data);
            alert('Members added successfully!');
            document.getElementById('createGroupForm').innerHTML = '';
            loadUserGroups();
        })
        .catch(error => {
            console.error(error);
            alert('Failed to add members.');
        });
}

function loadUserGroups() {
    axios.get('http://localhost:3000/group/user/groups', {
        headers: { "Authorization": token }
    })
        .then(response => {
            const groupListContainer = document.getElementById('groupList');
            groupListContainer.innerHTML = response.data.groups.map(group => `<div onclick="loadGroupChats(${group.id})">${group.groupName}</div>`).join('');
        })
        .catch(error => {
            console.error(error);
            alert('Failed to load groups.');
        });
}

window.onload = function () {
    loadUserGroups();
};

window.onclick = function (event) {
    if (!event.target.matches('.three-dots')) {
        const dropdowns = document.getElementsByClassName('dropdown-menu');
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.style.display === 'block') {
                openDropdown.style.display = 'none';
            }
        }
    }
};
