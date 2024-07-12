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
    const memberSelect = document.getElementById('group-members');
    // const userIds = Array.from(memberSelect.selectedOptions).map(option => option.value);

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
            // console.log(response.data);
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
            removeUserBtn.onclick = () => {
                displayRemoveUserForm(groupId, response.data.users);
            };
            messagesContainer.appendChild(removeUserBtn);

            document.getElementById('messageInputContainer').style.display = 'block';
            document.getElementById('messageInput').dataset.groupId = groupId;
        })
        .catch(error => {
            console.error(error);
            alert('Failed to load messages.');
        });
}
function displayRemoveUserForm(groupId, users) {

    axios.get(`http://localhost:3000/group/${groupId}/users`, {
        headers: { "Authorization": token }
    })
        .then(response => {
            // console.log(response.data);
            const usersContainer = document.getElementById('createGroupForm');
            usersContainer.innerHTML = '';

            response.data.users.forEach(user => {
                const userDiv = document.createElement('div');
                const userLabel = document.createElement('label');
                const userCheckbox = document.createElement('input');

                userCheckbox.type = 'checkbox';
                userCheckbox.value = user.id;
                userLabel.textContent = user.userName;

                userDiv.appendChild(userCheckbox);
                userDiv.appendChild(userLabel);
                usersContainer.appendChild(userDiv);
            });

            const promoteBtn = document.createElement('button');
            promoteBtn.textContent = 'Remove Users';
            promoteBtn.onclick = () => removeUser(groupId)
            usersContainer.appendChild(promoteBtn);
        })
        .catch(error => {
            console.error(error);
            alert('Failed to load users.');
        });
}

function removeUser(groupId) {
    const selectedUserIds = [];
    document.querySelectorAll('#createGroupForm input[type="checkbox"]:checked').forEach(checkbox => {
        selectedUserIds.push(checkbox.value);
    });
    console.log(selectedUserIds);
    axios.post(`http://localhost:3000/group/${groupId}/removeUsers`, {
        userIds: selectedUserIds
    }, {
        headers: { "Authorization": token }
    })
        .then(response => {
            console.log(response.data);
            alert('User removed successfully.');
            loadGroupChats(groupId); // Reload messages and user list
        })
        .catch(error => {
            console.error(error);
            alert('Failed to remove user.');
        });
}

function displayAddAdminForm(groupId) {
    axios.get(`http://localhost:3000/group/${groupId}/users`, {
        headers: { "Authorization": token }
    })
        .then(response => {
            // console.log(response.data);
            const usersContainer = document.getElementById('createGroupForm');
            usersContainer.innerHTML = '';

            response.data.users.forEach(user => {
                const userDiv = document.createElement('div');
                const userLabel = document.createElement('label');
                const userCheckbox = document.createElement('input');

                userCheckbox.type = 'checkbox';
                userCheckbox.value = user.id;
                userLabel.textContent = user.userName;

                userDiv.appendChild(userCheckbox);
                userDiv.appendChild(userLabel);
                usersContainer.appendChild(userDiv);
            });

            const promoteBtn = document.createElement('button');
            promoteBtn.textContent = 'Promote to Admin';
            promoteBtn.onclick = () => promoteToAdmin(groupId);
            usersContainer.appendChild(promoteBtn);
        })
        .catch(error => {
            console.error(error);
            alert('Failed to load users.');
        });
}

function promoteToAdmin(groupId) {
    const selectedUserIds = [];
    document.querySelectorAll('#createGroupForm input[type="checkbox"]:checked').forEach(checkbox => {
        selectedUserIds.push(checkbox.value);
    });
    console.log('--------');
    console.log(selectedUserIds);
    console.log('--------');
    axios.post(`http://localhost:3000/group/${groupId}/promote`, {
        userIds: selectedUserIds
    }, {
        headers: { "Authorization": token }
    })
        .then(response => {
            console.log(response.data);
            alert('Users promoted to admin successfully.');
        })
        .catch(error => {
            console.error(error);
            alert('Failed to promote users to admin.');
        });
}



// function addMemberToGroup(event) {
//     event.preventDefault();
//     const groupId = document.getElementById('groupIdInput').value;
//     const memberSelect = document.getElementById('new-members');
//     const userIds = Array.from(memberSelect.selectedOptions).map(option => option.value);

//     axios.post('http://localhost:3000/group/addMember', { groupId, userIds }, {
//         headers: { "Authorization": token }
//     })
//         .then(response => {
//             console.log(response.data);
//             alert('Members added successfully!');
//             closeModal();
//             loadGroupChats(groupId); 
//         })
//         .catch(error => {
//             console.error(error);
//             alert('Failed to add members.');
//         });
// }

function sendMessage() {
    const groupId = document.getElementById('messageInput').dataset.groupId;
    const messageText = document.getElementById('messageInput').value;
    // console.log(groupId, messageText);

    axios.post(`http://localhost:3000/group/${groupId}/message`, { text: messageText }, {
        headers: { "Authorization": token }
    })
        .then(response => {
            loadGroupChats(groupId);
            document.getElementById('messageInput').value = '';
        })
        .catch(error => {
            console.error(error);
            alert('Failed to send message.');
        });
}

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
