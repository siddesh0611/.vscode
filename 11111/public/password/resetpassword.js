// Function to extract query parameter from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Set the resetPasswordId input value with the id from URL
document.addEventListener('DOMContentLoaded', (event) => {
    const id = getQueryParam('id');
    console.log('Extracted id from URL:', id); // Debugging line
    if (id) {
        document.getElementById('resetPasswordId').value = id;
    } else {
        console.error('ID parameter not found in URL');
    }
});

async function formSubmitted(event) {
    event.preventDefault();
    try {
        const newPassword = document.getElementById('newpassword').value;
        const id = document.getElementById('resetPasswordId').value;
        console.log('id:', id);
        console.log('newPassword:', newPassword);

        const response = await axios.post(`/password/updatepassword/${id}`, { newpassword: newPassword });

        if (response.status === 200) {
            console.log('Password updated successfully');
        }

    } catch (err) {
        console.error('Error updating password:', err);
    }
}
