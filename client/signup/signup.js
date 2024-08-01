document.getElementById('signup-form').addEventListener('submit', async e=>{
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const name = document.getElementById('signup-name').value;
    const response = await fetch('/credential-manager/signup', {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
        },
        "body": JSON.stringify({
            username:username,
            name:name,
            password:password
        })
    });
    if(response.redirected){
        window.location.href = response.url;
    }else{
        window.location.reload();
    }
})

// const loginBtn = document.getElementById('login-btn');
// loginBtn.addEventListener('click', async e => {
//     console.log("clicked on login")
//     try {
//         const response = await fetch('http://localhost:3005/credential-manager/login', {
//           method: 'GET',
//         });
//         if (!response.ok) {
//           throw new Error('Network response was not ok ' + response.statusText);
//         }
//         // const data = await response.text();
//         // console.log(data);
//       } catch (error) {
//         console.error('There has been a problem with your fetch operation:', error);
//       }
// })