const token = localStorage.getItem('token');
let latestChatId = localStorage.getItem('latestChatId') || 0;

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
                const response = await axios.get(`http://localhost:3000/chat/checknewchat?lastChatId=${latestChatId}`, {
                    headers: { "Authorization": token }
                })

                if (response && response.data && response.data.newChats) {
                    const newChats = response.data.newChats;
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


async function sendMessage(event) {
    event.preventDefault();
    try {
        const chat = document.getElementById('userChat').value;

        const response = await axios.post('http://localhost:3000/chat/sendchat', { chat }, {
            headers: { "Authorization": token }
        });

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

