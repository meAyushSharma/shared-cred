const dashboardBtn = document.querySelector('#dashboard-dropdown .logout');
dashboardBtn.addEventListener('click', async e => {
    await deleteKeys();
    window.location.href = "/credential-manager/logout"
});

document.getElementById('reset-btn').addEventListener('click', (e) => {
    const resetBtn = document.getElementById('reset-password-container');
    if(resetBtn.style.display == "none") {
        resetBtn.style.display = "block";
    }else {
        resetBtn.style.display = "none"
    }
})


document.getElementById('reset-password').addEventListener('mouseover', (e) => {
    if(e.target.type === 'text'){
        e.target.type = 'text'
    }else{
        e.target.type = 'text';
    }
});

document.getElementById('reset-password').addEventListener('mouseout', (e) => {
    if(e.target.type === 'password'){
        e.target.type = 'password'
    }else{
        e.target.type = 'password';
    }
});


document.getElementById('confirm-password').addEventListener('mouseover', (e) => {
    if(e.target.type === 'text'){
        e.target.type = 'text'
    }else{
        e.target.type = 'text';
    }
});

document.getElementById('confirm-password').addEventListener('mouseout', (e) => {
    if(e.target.type === 'password'){
        e.target.type = 'password'
    }else{
        e.target.type = 'password';
    }
});

document.getElementById('reset-submit').addEventListener('click', async () => {
    const newPass = document.getElementById('reset-password').value;
    const confirmPass = document.getElementById('confirm-password').value;
    if(!(newPass === confirmPass)) return await showAlertBox("Password not matching");
    const response = await fetch("/credential-manager/reset-password", {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            newPassword: confirmPass.toString()
        })
    })
    const result = await response.json();
    // if(!result.success) return await showAlertBox(result.msg);
    await showAlertBox(result.msg);
    return window.location.reload();
})


