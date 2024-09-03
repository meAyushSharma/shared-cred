let userName = "User";

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
              <input type="email" id="member-email${increment}" class="member-email-input" name="member-info" placeholder="enter email" autocomplete="off" required/>
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

async function sendDataGetResponse(credKey, credValue) {
  try {
      if (credKey === "" || credValue === "") await showAlertBox("Refreshed credentials (*￣3￣)╭");
      if(credKey !="" || credValue != "") await showAlertBox("Creating credential....");

      const key = await generateSymmetricKey();
      let publicKey;
      try{
        publicKey = await getPublicKey();
      } catch(err) {
        console.log('error fetching public key: ', err);
        return await showAlertBox("Please import crypto keys (づ￣ 3￣)づ ");
      }
      const arrayBufferEncryptedSymmetricKey = await encryptSymmetricKey(key, publicKey);
      const stringEncryptedSymmetricKey = arrayBufferToBase64(arrayBufferEncryptedSymmetricKey);
      const encryptedCredValue = await encryptData(key, credValue);
      const response = await fetch("/credential-manager/create-resource", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              key: credKey,
              value: encryptedCredValue,
              symmetricKey: stringEncryptedSymmetricKey
          }),
      });

      if (!response.ok) {
          throw new Error("Network response was not ok");
      }

      const { userOwnedResources, publicKeyFromDBString, username } = await response.json();
      const resources = userOwnedResources;
      userName = username;
      document.getElementById('username').innerText=`User: ${userName}`;

      // console.log("public key from databse", publicKeyFromDBString);
      const checkPublicKeyAuth = await isPublicKeyCorrect(publicKey, publicKeyFromDBString);
      if(!checkPublicKeyAuth) return await showAlertBox("Please import crypto keys (づ￣ 3￣)づ ");


      if (credKey || credValue) {
          await showAlertBox('Created resource successfully (〃￣︶￣)人(￣︶￣〃) !');
      }

      let i = 1;
      for (const ele of resources) {
        try {
          const resourceValue = await decryptResourceValue(ele.resourceValue, ele.symmetricKey);
          createCredential(ele.resourceName, resourceValue, ele._id, i, ele.resourceSharedWith);
          i++;
        } catch (error) {
          console.error(`Error decrypting resource ${ele._id}:`, error);
        }
      }
      document.getElementById("key").value = '';
      document.getElementById("value").value = '';

  } catch (err) {
      console.log(`There was an error while sending cred details from client side: ${err}`);
  }
}


const addBtn = document.getElementById("add-btn-id");
addBtn.addEventListener("click", async () => {
  try {
    const credKey = document.getElementById("key").value;
    const credValue = document.getElementById("value").value;
    const credStoreContainer = document.getElementById("cred-store-container");
    credStoreContainer.innerHTML = "";
    await sendDataGetResponse(credKey, credValue);
  } catch (err) {
    console.error("An error occurred in the click event handler:", err);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('/credential-manager/check-public-key', {
    method: "GET",
    headers: {
      'Content-Type': "application/json"
    }
  });
  const result = await response.json();
  if(result.publicKey == ""){
    const publicKey = await getPublicKey();
    const exportedPublicKey = await exportPublicKeyToBase64(publicKey);
    const sendPublicKey = await fetch('/credential-manager/set-public-key', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey: exportedPublicKey })
    });
    const data = await sendPublicKey.json();
    if(!data.success) return await showAlertBox("Error setting public key");
    await showAlertBox("Set public key Successfully");
    return addBtn.click();
  }
  return addBtn.click();
})