async function handleSignUp(event) {
    event.preventDefault();
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = '';
    try {
        const userName = document.getElementById('userName').value;
        const emailId = document.getElementById('emailId').value;
        const password = document.getElementById('password').value;

        const userDetails = {
            userName: userName,
            emailId: emailId,
            password: password
        };
        console.log(userDetails);

        await axios.post("http://54.234.138.208:4000/user/signup", userDetails)
            .then(response => {
                console.log('User details sent successfully');
                document.getElementById('userName').value = '';
                document.getElementById('emailId').value = '';
                document.getElementById('password').value = '';
            })
            .catch(err => {
                if (err.response && err.response.data && err.response.data.message) {
                    console.error(err.response.data.message);
                    messageDiv.textContent = err.response.data.message;

                } else {
                    console.error(err);
                }
            });
    } catch (err) {
        console.log(err);
    }
}
// async function signup(e){
//     try{
//         e.preventDefault()
//        const signupDetails ={
//         name:  e.target.name.value,
//         email: e.target.email.value,
//         password:e.target.password.value
        
//        }
//        const response=await axios.post("http://3.84.192.127:4000/user/signup",signupDetails)
//        .then(response=>{
//         console.log(response)
//         const obj=response.data.message
//         document.body.innerHTML+=obj
//         window.location.href="../login/login.html"
//        })
//     }
//     catch(err){
//         document.body.innerHTML+=`<div style="color:red;">${err}</div>`
//     }
// }