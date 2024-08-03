
function createShowResourceInfoEle(username, role, increment) {
    const infoEle = document.createElement('div');
    infoEle.setAttribute("class", "info-ele");
    infoEle.setAttribute("id", `info-ele${increment}`);
    const roleEle = document.createElement("div");
    roleEle.setAttribute("class", "role-ele");
    roleEle.setAttribute("id", `role-ele${increment}`);
    roleEle.innerText = role;
    const usernameEle = document.createElement("div");
    usernameEle.innerText = username;
    usernameEle.setAttribute("class", "username-ele");
    usernameEle.setAttribute("id", `username-ele${increment}`);
    const removeEle = document.createElement("div");
    removeEle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4 8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8ZM6 10V20H18V10H6ZM9 12H11V18H9V12ZM13 12H15V18H13V12ZM7 5V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V5H22V7H2V5H7ZM9 4V5H15V4H9Z"></path></svg>`
    removeEle.setAttribute("class", "remove-ele");
    removeEle.setAttribute("id", `remove-ele${increment}`); 
    removeEle.setAttribute("onclick", `removePermission(${increment})`); 
  
    infoEle.append(roleEle, usernameEle, removeEle);
    const toAppend = document.getElementById(`cred-info${increment}`);
    toAppend.appendChild(infoEle);
  }
  
  async function infoBtnOnClickHandler(increment) {
    const res = document.getElementsByClassName(`new-class${increment}`)[0];
    const resId = res.id;
    fetch('/credential-manager/show-resource-info', {
      method:"POST",
      headers: {
        'Content-Type' : "application/json"
      },
      body:JSON.stringify({
        resId:resId
      })
    }).then(response => {
      return response.json()
    }).then(async resource => {
      if(!resource || resource.msg != undefined) return await showAlertBox("Some problem while fetching credential details (┬┬﹏┬┬)");
      const toAppend = document.getElementById(`cred-info${increment}`);
      toAppend.innerHTML = "";
      resource.viewers.forEach(resInfo => {
        createShowResourceInfoEle(resInfo.username , role="Viewer", increment);
      })
      resource.editors.forEach(resInfo => {
        createShowResourceInfoEle(resInfo.username , role="Editor",  increment);
      })
      resource.authors.forEach(resInfo => {
        createShowResourceInfoEle(resInfo.username , role="Author",  increment);
      })
    })
  
    
  }