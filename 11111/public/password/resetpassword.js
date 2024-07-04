function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

document.addEventListener('DOMContentLoaded', (event) => {
    const id = getQueryParam('id');
    if (id) {
        document.getElementById('resetPasswordId').value = id;
    } else {
        console.log('Error in ressetPassword');
    }
});

async function formSubmitted(event) {
    event.preventDefault();
    try {
        const newPassword = document.getElementById('newpassword').value;
        const id = document.getElementById('resetPasswordId').value;
        // console.log('id:', id);
        // console.log('newPassword:', newPassword);

        const response = await axios.post(`/password/updatepassword/${id}`, { newpassword: newPassword });

        if (response.status === 200) {
            console.log('Password updated successfully');
        }

    } catch (err) {
        console.log('Error updating password:', err);
    }
}
