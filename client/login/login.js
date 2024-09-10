document.getElementById('login-form').addEventListener('submit', async e=>{
    e.preventDefault();
    const username = document.getElementById('login-username').value.toLowerCase().trim();
    const password = document.getElementById('login-password').value.trim();
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
        console.log("told to be redirected to: ", response.url);
        window.location.href = response.url;
    }else{
        window.location.reload();
    }
})

document.getElementById('passkey-login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('passkey-login-username').value;
    const response = await fetch('/credential-manager/login-passkey', {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
        },
        "body": JSON.stringify({
            username: username
        })
    });
    const result = await response.json();
    const authenticationResult = await SimpleWebAuthnBrowser.startAuthentication(result.options);
    console.log(authenticationResult);

    const verificationResult = await fetch('/credential-manager/verify-login-passkey', {
        method: "POST",
        headers : {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            cred: authenticationResult,
            username: username
        })
    })
    const verificationResponse = await verificationResult.json();
    if(verificationResponse.verified){
        console.log("verified");
        window.location.href = "/credential-manager"
    }
})

document.getElementById('login-password').addEventListener('mouseover', (e) => {
    if(e.target.type === 'text'){
        e.target.type = 'text'
    }else{
        e.target.type = 'text';
    }
});

document.getElementById('login-password').addEventListener('mouseout', (e) => {
    if(e.target.type === 'password'){
        e.target.type = 'password'
    }else{
        e.target.type = 'password';
    }
});

document.getElementById('forgot-pass-btn').addEventListener('click', async (e) => {
    window.location.href = '/credential-manager/forgot-password';
})