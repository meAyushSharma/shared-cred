document.getElementById('del-account').addEventListener('click', async () => {
    const answer = prompt("Enter your email to confirm deletion", "Enter your email/username");
    // if(answer != userName) return await showAlertBox("Answer not matching (┬┬﹏┬┬)");
    await showAlertBox("Deleting user account....")
    const response = await fetch('/delete-account', {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    if(!result.success) return await showAlertBox(result.msg);
    try{
        const deleteCryptoKeys = await deleteKeys();
    }catch(err) {
        console.log("error deleting keys is: ", err);
        return await showAlertBox("Error Deleting crypto keys")
    }
    await showAlertBox("Deleted user account ::> _ <::");
    window.location.reload();
})