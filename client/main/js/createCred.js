

function createCredential(key, value, resourceId, increment, resourceSharedWith) {
    const credContainer = document.createElement("div");
    credContainer.setAttribute("id", resourceId);
    if(resourceSharedWith){
      credContainer.setAttribute("class", `new-class shared-color new-class${increment}`);
    }else{
      credContainer.setAttribute("class", `new-class new-class${increment}`);
    }
    const keyContainer = document.createElement("p");
    keyContainer.setAttribute("class", "key");
    keyContainer.setAttribute("id", `key${increment}`);
    keyContainer.setAttribute("contenteditable", "true");
    const valueContainer = document.createElement("p");
    valueContainer.setAttribute("class", "value");
    valueContainer.setAttribute("id", `value${increment}`);
    valueContainer.setAttribute("contenteditable", "true");
  
    const addUser = document.createElement("div");
    addUser.setAttribute("class", "add-user dropdown");
    addUser.setAttribute("data-dropdown", "dum");
  
    addUser.innerHTML = `
        <div id="button" data-dropdown-button> 
          <div>Add User</div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" height="32px" id="arrow-down-svg"><path d="M12 19.1642L18.2071 12.9571L16.7929 11.5429L12 16.3358L7.20711 11.5429L5.79289 12.9571L12 19.1642ZM12 13.5143L18.2071 7.30722L16.7929 5.89301L12 10.6859L7.20711 5.89301L5.79289 7.30722L12 13.5143Z"></path></svg>
        </div>
        <div class="dropdown-content" id="dropdown-content${increment}">
            <div class="dropdown-info">
              <span class="dropdown-heading">Member Email:</span><br>
              <input type="email" id="member-email${increment}" class="member-email-input" name="member-info" placeholder="enter email" required/>
              <br>
              <span class="dropdown-heading">Member Role:</span><br>
              <input type="radio" id="viewer${increment}" name="role${increment}" value="viewer" checked/>
              <label for="viewer${increment}">VIEWER</label><br>
              <input type="radio" id="editor${increment}" name="role${increment}" value="editor" />
              <label for="editor${increment}">EDITOR</label><br>
              <input type="radio" id="author${increment}" name="role${increment}" value="author"/>
              <label for="author${increment}">AUTHOR</label>
            </div>
            <div class="submit-btn submit-btn${increment}" id="submit-btn${increment}" onclick="addUserOnclickHandler(${increment})" >SUBMIT</div>
         </div>`;
  
    const editContainer = document.createElement("div");
    editContainer.setAttribute("class", "edit-container");
    editContainer.setAttribute("id", `edit-container${increment}`);
    editContainer.setAttribute("onclick", `editOnClickHandler(${increment}, role="none")`);
    const editTextNode = document.createTextNode("Edit");
    editContainer.appendChild(editTextNode);
  
    const deleteCredContainer = document.createElement("span");
    deleteCredContainer.setAttribute(
      "class",
      "material-symbols-outlined delete-btn"
    );
    const deleteTextNode = document.createTextNode("delete");
    deleteCredContainer.appendChild(deleteTextNode);
    const keyNode = document.createTextNode(key);
    const valueNode = document.createTextNode(value);
    keyContainer.appendChild(keyNode);
    valueContainer.appendChild(valueNode);
    const infoContainer = document.createElement('div');
    infoContainer.setAttribute("class", "info-btn");
    infoContainer.setAttribute("onclick", `infoBtnOnClickHandler(${increment})`);
    infoContainer.setAttribute("id", `info-btn${increment}`);
    infoContainer.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path class="find-info-btn" d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 11V17H13V11H11ZM11 7V9H13V7H11Z"></path></svg>
    <div class="cred-info" id="cred-info${increment}" to-drop="dum"></div>`
    credContainer.append(
      keyContainer,
      valueContainer,
      addUser,
      editContainer,
      deleteCredContainer,
      infoContainer
    );
    const credStoreContainer = document.getElementById("cred-store-container");
    credStoreContainer.appendChild(credContainer);
  }


  
  async function sendDataGetResponse(key, value) {
      if (key == "" || value == "") {
    await showAlertBox("Refreshed credentials (*￣3￣)╭");
  }

  fetch("/credential-manager/create-resource", {
      method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        key: key,
      value: value,
    }),
  })
    .then((response) => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
      document.getElementById("key").value = '';
      document.getElementById("value").value = '';
      
      return response.json();
    })
    .then(async (resources) => {
        let i = 1;
        if(key || value){
            await showAlertBox('Created resource successfully (〃￣︶￣)人(￣︶￣〃) !'); 
        }
        resources.forEach((ele) => {
            createCredential(ele.resourceName, ele.resourceValue, ele._id, i, ele.resourceSharedWith);
            i++;
        });
    })
    .catch((err) => {
        console.log(
            `there was error while sending cred details from client side::::   ${err}`
      );
    });
}

const addBtn = document.getElementById("add-btn-id");
addBtn.addEventListener("click", () => {
  const key = document.getElementById("key").value;
  const value = document.getElementById("value").value;

  const credStoreContainer = document.getElementById("cred-store-container");
  credStoreContainer.innerHTML = "";

  sendDataGetResponse(key, value);
});


addBtn.click();