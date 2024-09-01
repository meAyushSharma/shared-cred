document.getElementById('del-account').addEventListener('click', async () => {
    const answer = prompt("Enter your email to confirm deletion", "Ayush");
    if(answer != userName) return await showAlertBox("Answer not matching (┬┬﹏┬┬)");
    const response = await fetch('/credential-manager/delete-account', {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const result = await response.json();
    if(!result.success) return await showAlertBox(result.msg);
    try{
        const deleteCryptoKeys = await deleteKeys();
    }catch(err) {
        console.log("error deleting keys is: ", err);
        return showAlertBox("Error Deleting crypto keys")
    }
    window.location.reload();
})