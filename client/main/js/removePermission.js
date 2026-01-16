
removePermission = async (increment) => {
    const resId = document.getElementsByClassName(`new-class${increment}`)[0].id;
    const username = document.getElementById(`username-ele${increment}`).innerText;
    const role = document.getElementById(`role-ele${increment}`).innerText;
    if(username == "" || !username || !resId || !role) return await showAlertBox("Missing details");
    await showAlertBox("Removing permission....");
    fetch('/remove-resource-permission', {
      method: "POST",
      headers: {
        "Content-Type" : "application/json"
      },
      body: JSON.stringify({
        resId,
        username,
        role
      })
    }).then(response => {
      return response.json()
    }).then(async resource => {
        if(resource.remove){
          const infoEle = document.getElementById(`info-ele${increment}`);
          infoEle.remove();
        }
        return await showAlertBox(resource.msg);
  
    })
  }