const dashboardBtn = document.querySelector('#dashboard-dropdown .logout');
dashboardBtn.addEventListener('click', async e => {
    window.location.href = "/credential-manager/logout"
});


