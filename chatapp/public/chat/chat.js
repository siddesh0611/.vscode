const token = localStorage.getItem('token');
document.addEventListener("DOMContentLoaded", async () => {

    const response = await axios.get('http://localhost:3000/chat/chatlogs', {
        headers: { "Authorization": token }
    })
    // console.log(response);
    if (response) {
        response.data.allChats.forEach(chat => {
            addChatToTheTable(chat);
        })
    }
    setInterval(async () => {
        const lastGet = new Date().toISOString();
        console.log(lastGet);
        const checkNewChat = await axios.get(`http://localhost:3000/chat/checknewchat?lastGet=${lastGet}`, {
            headers: { "Authorization": token }
        });
        console.log(checkNewChat.data);
        if (checkNewChat) {
            checkNewChat.data.newChats.forEach(chat => {
                console.log('I am inside');
                addChatToTheTable(chat);
            });
        }
    }, 1000)

});

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
