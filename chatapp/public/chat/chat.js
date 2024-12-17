const token = localStorage.getItem('token');


document.addEventListener("DOMContentLoaded", async () => {
    try {
        let storedChats = localStorage.getItem('chats');
        if (storedChats) {
            storedChats = JSON.parse(storedChats);
            storedChats.forEach(chat => {
                addChatToTheTable(chat);
            });
        }

        const getNewChats = async () => {
            try {
                let latestChatId = localStorage.getItem('latestChatId') || 0;
                const response = await axios.get(`http://localhost:3000/chat/checknewchat?lastChatId=${latestChatId}`, {
                    headers: { "Authorization": token }
                })

                if (response && response.data && response.data.newChats) {
                    const newChats = response.data.newChats;
                    // console.log(newChats);
                    if (newChats.length > 0) {
                        newChats.forEach(chat => {
                            addChatToTheTable(chat);
                        })
                        let updatedChats = storedChats ? [...storedChats, ...newChats] : newChats;
                        localStorage.setItem('chats', JSON.stringify(updatedChats));
                        latestChatId = newChats[newChats.length - 1].id;
                        localStorage.setItem('latestChatId', latestChatId);
                    }
                }
            } catch (err) {
                console.log(err);
            }
        }
        setInterval(getNewChats, 5000);
        await getNewChats();
    } catch (err) {
        console.log(err);
    }
});

document.getElementById('createGroupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const groupName = document.getElementById('groupName').value;

    const response = await axios.post('http://localhost:3000/group/create', { name: groupName }, {
        headers: { "Authorization": token }
    });

    if (response.data.newGroup) {
        // Update UI with the new group
        const groupItem = document.createElement('li');
        groupItem.textContent = response.data.newGroup.name;
        groupItem.dataset.groupId = response.data.newGroup.id;
        document.getElementById('groupsList').appendChild(groupItem);
    }
});

document.getElementById('inviteUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userEmail = document.getElementById('userEmail').value;
    const groupId = document.getElementById('groupId').value;

    const response = await axios.post('http://localhost:3000/group/invite', { groupId, userEmail }, {
        headers: { "Authorization": token }
    });

    if (response.data.userGroup) {
        // Notify the user that the invitation was successful
        alert('User invited successfully');
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    // Fetch and display groups
    const groupsResponse = await axios.get('http://localhost:3000/groups', {
        headers: { "Authorization": token }
    });

    if (groupsResponse.data.groups) {
        groupsResponse.data.groups.forEach(group => {
            const groupItem = document.createElement('li');
            groupItem.textContent = group.name;
            groupItem.dataset.groupId = group.id;
            document.getElementById('groupsList').appendChild(groupItem);
        });
    }

    // Fetch and display chats for the selected group
    document.getElementById('groupsList').addEventListener('click', async (e) => {
        const groupId = e.target.dataset.groupId;
        const chatsResponse = await axios.get(`http://localhost:3000/group/chats?groupId=${groupId}`, {
            headers: { "Authorization": token }
        });

        if (chatsResponse.data.groupChats) {
            const chatsContainer = document.getElementById('chatsContainer');
            chatsContainer.innerHTML = ''; // Clear previous chats
            chatsResponse.data.groupChats.forEach(chat => {
                const chatItem = document.createElement('li');
                chatItem.textContent = chat.message;
                chatsContainer.appendChild(chatItem);
            });
        }
    });
});


async function sendMessage(event) {
    event.preventDefault();
    try {
        const chat = document.getElementById('userChat').value;

        const response = await axios.post('http://localhost:3000/chat/sendchat', { chat }, {
            headers: { "Authorization": token }
        });

        localStorage.setItem('latestChatId', response.data.newChat.id);
        addChatToTheTable(response.data.newChat);


        // chat = '';

    } catch (err) {
        console.log(err);
    }
}

async function addChatToTheTable(data) {
    try {
        const messageElem = document.getElementById('message');

        const chat = document.createElement('li');
        chat.textContent = data.chatLogs;

        messageElem.appendChild(chat);
    } catch (err) {
        console.log(err);
    }
}

// document.addEventListener("DOMContentLoaded", async () => {

//     const response = await axios.get('http://localhost:3000/chat/chatlogs', {
//         headers: { "Authorization": token }
//     })
//     // console.log(response);
//     if (response) {
//         response.data.allChats.forEach(chat => {
//             addChatToTheTable(chat);
//         })
//     }
//     setInterval(async () => {
//         const lastGet = new Date().toISOString();
//         console.log(lastGet);
//         const checkNewChat = await axios.get(`http://localhost:3000/chat/checknewchat?lastGet=${lastGet}`, {
//             headers: { "Authorization": token }
//         });
//         console.log(checkNewChat.data);
//         if (checkNewChat) {
//             checkNewChat.data.newChats.forEach(chat => {
//                 console.log('I am inside');
//                 addChatToTheTable(chat);
//             });
//         }
//     }, 1000)

// });

// setInterval(async () => {
//     try {
//         const lastGet = new Date().toISOString();
//         console.log(lastGet);
//         const checkNewChat = await axios.get(`http://localhost:3000/chat/checknewchat?lastGet=${lastGet}`, {
//             headers: { "Authorization": token }
//         });
//         console.log(checkNewChat.data);
//         if (checkNewChat) {
//             checkNewChat.data.newChats.forEach(chat => {
//                 console.log('I am inside');
//                 addChatToTheTable(chat);
//             });
//         }
//     } catch (err) {
//         console.log(err);
//     }
// }, 1000);

