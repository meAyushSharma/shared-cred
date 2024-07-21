let timeoutId;

const addBtn = document.getElementById("add-btn-id");
addBtn.addEventListener("click", () => {
  const key = document.getElementById("key").value;
  const value = document.getElementById("value").value;

  const credStoreContainer = document.getElementById("cred-store-container");
  credStoreContainer.innerHTML = "";

  sendDataGetResponse(key, value);
});

addBtn.click();

async function sendDataGetResponse(key, value) {
  if (!key || !value) {
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

// function getCookie(name) {
//   let cookieArr = document.cookie.split(";");

//   for (let i = 0; i < cookieArr.length; i++) {
//     let cookiePair = cookieArr[i].split("=");

//     if (name == cookiePair[0].trim()) {
//       return decodeURIComponent(cookiePair[1]);
//     }
//   }

//   return null;
// }

async function showAlertBox(prompt){
  if(timeoutId != undefined){
    const alrt = document.getElementsByClassName('alert-container')[0];
    alrt.classList.remove('alert-box-activate');
    clearTimeout(timeoutId);
  }
  const alrt = document.getElementsByClassName('alert-container')[0];
  alrt.innerText=prompt;
  alrt.classList.toggle('alert-box-activate');
  timeoutId = setTimeout(function(){
    alrt.classList.remove('alert-box-activate');
  }, 5000);
}

async function addUserOnclickHandler(increment) {
  const member = document.getElementById(`member-email${increment}`).value;
  let roleIs;
  const role = document.getElementsByName(`role${increment}`).forEach((role) => {
      if (role.checked) {
        roleIs = role.value;
      }
  });
  const credId = document
    .getElementById(`dropdown-content${increment}`)
    .closest(`.new-class`).id;
  if (member == "" || roleIs == undefined) {
    await showAlertBox("Fill out the missing fields ━┳━ ━┳━")
    return;
  }
  if (!credId) {
    await showAlertBox("Missing ResourceId")
    return;
  }
  console.log(`member: ${member} && roleIs: ${roleIs} && credId is: ${credId}`);
  fetch("/credential-manager/add-user", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      addedUser: member,
      role: roleIs,
      resourceId: credId,
    }),
  })
    .then((response) => {
      if(response.ok){
        return response.json();
      }
    })
    .then(async (resource) => {
      console.log(resource.response);
      let res = resource.response;
      if(res.toString() == '1'){
        document.getElementById(credId).classList.add('shared-color');
        await showAlertBox(`Added USER: ${member} || ROLE: ${roleIs} || RESOURCE: ${document.getElementById(`key${increment}`).innerText} successfully (～￣▽￣)～`);
      }else if(res.toString() == '2'){
        await showAlertBox(`You are the OWNER of the resource already  (～￣▽￣)～`);
      }else if(res.toString() == '3'){
        await showAlertBox(resource.msg);
      }else if(res.toString() == '4'){
        await showAlertBox(resource.msg);
      }else{
        await showAlertBox("In adding user: missing fields on backend  ━┳━ ━┳━");
      }
    })
    .catch((err) => {
      console.log(
        `the error in addMember getting res response from backend is: ${err}`
      );
    });
}

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
  editContainer.setAttribute("onclick", `editOnClickHandler(${increment})`);
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

  credContainer.append(
    keyContainer,
    valueContainer,
    addUser,
    editContainer,
    deleteCredContainer
  );
  const credStoreContainer = document.getElementById("cred-store-container");
  credStoreContainer.appendChild(credContainer);
}

document
  .getElementById("cred-store-container")
  .addEventListener("click", async function (event) {
    if (event.target && event.target.classList.contains("delete-btn")) {
      // Find the parent .new-class element and remove it
      const credContainer = event.target.closest(".new-class");
      if (credContainer) {
        // send fetch request
        fetch("/credential-manager/delete-resource", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resourceId: credContainer.id,
            // token:tokenResponse,
          }),
        });
        await showAlertBox(`Resource Deleted Successfully!  （￣︶￣）↗`)
        credContainer.remove();
      }
    }
  });
  

async function editOnClickHandler(increment){
    const newKey = document.getElementById(`key${increment}`).innerText;
    const newValue = document.getElementById(`value${increment}`).innerText;
    const resId = document.getElementsByClassName(`new-class${increment}`)[0].id;

    if(!newKey || !newValue){
      // alert("missing fields! in edit");
      await showAlertBox("Missing fields in edit values  ━┳━ ━┳━");
      return;
    }
    if(!resId){
      return;
    }

    // sending edited data to backend
    fetch('/credential-manager/edit-resource', {
      "method": "POST",
      "headers": {
        "content-type": "application/json"
      },
      "body": JSON.stringify({
        newKey: newKey,
        newValue: newValue,
        resId: resId
      })
    }).then(response => {
      document.getElementById("key").value = '';
      document.getElementById("value").value = '';
      return response.json();
    }).then(async res => {
      if(res.response){
        addBtn.click();
        await showAlertBox("Edited the document successfully!  (⌐■_■)");
      }else{
        // alert("some problem occured during the edit");
        await showAlertBox("Some problem occured during the edit  (┬┬﹏┬┬)");
      }
    })
  }




