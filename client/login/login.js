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
        console.log("verified")
        
        window.location.href = "/credential-manager"
    }
})