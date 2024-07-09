document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3000/chat/chatlogs', {
        headers: { "Authorization": token }
    })
    // console.log(response);
    if (response) {
        response.data.allChats.forEach(chat => {
            addChatToTheTable(chat);
        })
    }

});

async function sendMessage(event) {
    event.preventDefault();
    try {
        const chat = document.getElementById('userChat').value;
        const token = localStorage.getItem('token');

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
