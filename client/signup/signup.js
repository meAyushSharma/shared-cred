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

document.getElementById('login-form').addEventListener('submit', async e=>{
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const response = await fetch('/credential-manager/login', {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
        },
        "body": JSON.stringify({
            username:username,
            password:password
        })
    });
    if(response.redirected){
        window.location.href = response.url;
    }else{
        window.location.reload();
    }
})