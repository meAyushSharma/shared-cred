
// let timeoutId;

// const addBtn = document.getElementById("add-btn-id");
// addBtn.addEventListener("click", () => {
//   const key = document.getElementById("key").value;
//   const value = document.getElementById("value").value;

//   const credStoreContainer = document.getElementById("cred-store-container");
//   credStoreContainer.innerHTML = "";

//   sendDataGetResponse(key, value);
// });


// addBtn.click();

// async function sendDataGetResponse(key, value) {
//   if (key == "" || value == "") {
//     await showAlertBox("Refreshed credentials (*￣3￣)╭");
//   }

//   fetch("/credential-manager/create-resource", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       key: key,
//       value: value,
//     }),
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }
//       document.getElementById("key").value = '';
//       document.getElementById("value").value = '';

//       return response.json();
//     })
//     .then(async (resources) => {
//       let i = 1;
//       if(key || value){
//       await showAlertBox('Created resource successfully (〃￣︶￣)人(￣︶￣〃) !'); 
//       }
//       resources.forEach((ele) => {
//         createCredential(ele.resourceName, ele.resourceValue, ele._id, i, ele.resourceSharedWith);
//         i++;
//       });
//     })
//     .catch((err) => {
//       console.log(
//         `there was error while sending cred details from client side::::   ${err}`
//       );
//     });
// }

// async function showAlertBox(prompt){
//   if(timeoutId != undefined){
//     const alrt = document.getElementsByClassName('alert-container')[0];
//     alrt.classList.remove('alert-box-activate');
//     clearTimeout(timeoutId);
//   }
//   const alrt = document.getElementsByClassName('alert-container')[0];
//   alrt.innerText=prompt;
//   alrt.classList.toggle('alert-box-activate');
//   timeoutId = setTimeout(function(){
//     alrt.classList.remove('alert-box-activate');
//   }, 5000);
// }

// async function addUserOnclickHandler(increment) {
//   const member = document.getElementById(`member-email${increment}`).value;
//   let roleIs;
//   const role = document.getElementsByName(`role${increment}`).forEach((role) => {
//       if (role.checked) {
//         roleIs = role.value;
//       }
//   });
//   const credId = document
//     .getElementById(`dropdown-content${increment}`)
//     .closest(`.new-class`).id;
//   if (member == "" || roleIs == undefined) {
//     await showAlertBox("Fill out the missing fields ━┳━ ━┳━")
//     return;
//   }
//   if (!credId) {
//     await showAlertBox("Missing ResourceId")
//     return;
//   }
//   console.log(`member: ${member} && roleIs: ${roleIs} && credId is: ${credId}`);
//   fetch("/credential-manager/add-user", {
//     method: "POST",
//     headers: {
//       "content-type": "application/json",
//     },
//     body: JSON.stringify({
//       addedUser: member,
//       role: roleIs,
//       resourceId: credId,
//     }),
//   })
//     .then((response) => {
//       if(response.ok){
//         return response.json();
//       }
//     })
//     .then(async (resource) => {
//       console.log(resource.response);
//       let res = resource.response;
//       if(res.toString() == '1'){
//         document.getElementById(credId).classList.add('shared-color');
//         await showAlertBox(`Added USER: ${member} || ROLE: ${roleIs} || RESOURCE: ${document.getElementById(`key${increment}`).innerText} successfully (～￣▽￣)～`);
//       }else if(res.toString() == '2'){
//         await showAlertBox(`You are the OWNER of the resource already  (～￣▽￣)～`);
//       }else if(res.toString() == '3'){
//         await showAlertBox(resource.msg);
//       }else if(res.toString() == '4'){
//         await showAlertBox(resource.msg);
//       }else{
//         await showAlertBox("In adding user: missing fields on backend  ━┳━ ━┳━");
//       }
//     })
//     .catch((err) => {
//       console.log(`the error in addMember getting res response from backend is: ${err}`);
//     });
// }


removePermission = async (increment) => {
  const resId = document.getElementsByClassName(`new-class${increment}`)[0].id;
  const username = document.getElementById(`username-ele${increment}`).innerText;
  const role = document.getElementById(`role-ele${increment}`).innerText;
  fetch('/credential-manager/remove-resource-permission', {
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

// function createShowResourceInfoEle(username, role, increment) {
//   const infoEle = document.createElement('div');
//   infoEle.setAttribute("class", "info-ele");
//   infoEle.setAttribute("id", `info-ele${increment}`);
//   const roleEle = document.createElement("div");
//   roleEle.setAttribute("class", "role-ele");
//   roleEle.setAttribute("id", `role-ele${increment}`);
//   roleEle.innerText = role;
//   const usernameEle = document.createElement("div");
//   usernameEle.innerText = username;
//   usernameEle.setAttribute("class", "username-ele");
//   usernameEle.setAttribute("id", `username-ele${increment}`);
//   const removeEle = document.createElement("div");
//   removeEle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4 8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8ZM6 10V20H18V10H6ZM9 12H11V18H9V12ZM13 12H15V18H13V12ZM7 5V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V5H22V7H2V5H7ZM9 4V5H15V4H9Z"></path></svg>`
//   removeEle.setAttribute("class", "remove-ele");
//   removeEle.setAttribute("id", `remove-ele${increment}`); 
//   removeEle.setAttribute("onclick", `removePermission(${increment})`); 

//   infoEle.append(roleEle, usernameEle, removeEle);
//   const toAppend = document.getElementById(`cred-info${increment}`);
//   toAppend.appendChild(infoEle);
// }

// async function infoBtnOnClickHandler(increment) {
//   const res = document.getElementsByClassName(`new-class${increment}`)[0];
//   const resId = res.id;
//   fetch('/credential-manager/show-resource-info', {
//     method:"POST",
//     headers: {
//       'Content-Type' : "application/json"
//     },
//     body:JSON.stringify({
//       resId:resId
//     })
//   }).then(response => {
//     return response.json()
//   }).then(async resource => {
//     if(!resource || resource.msg != undefined) return await showAlertBox("Some problem while fetching credential details (┬┬﹏┬┬)");
//     const toAppend = document.getElementById(`cred-info${increment}`);
//     toAppend.innerHTML = "";
//     resource.viewers.forEach(resInfo => {
//       createShowResourceInfoEle(resInfo.username , role="Viewer", increment);
//     })
//     resource.editors.forEach(resInfo => {
//       createShowResourceInfoEle(resInfo.username , role="Editor",  increment);
//     })
//     resource.authors.forEach(resInfo => {
//       createShowResourceInfoEle(resInfo.username , role="Author",  increment);
//     })
//   })

  
// }


// function createCredential(key, value, resourceId, increment, resourceSharedWith) {
//   const credContainer = document.createElement("div");
//   credContainer.setAttribute("id", resourceId);
//   if(resourceSharedWith){
//     credContainer.setAttribute("class", `new-class shared-color new-class${increment}`);
//   }else{
//     credContainer.setAttribute("class", `new-class new-class${increment}`);
//   }
//   const keyContainer = document.createElement("p");
//   keyContainer.setAttribute("class", "key");
//   keyContainer.setAttribute("id", `key${increment}`);
//   keyContainer.setAttribute("contenteditable", "true");
//   const valueContainer = document.createElement("p");
//   valueContainer.setAttribute("class", "value");
//   valueContainer.setAttribute("id", `value${increment}`);
//   valueContainer.setAttribute("contenteditable", "true");

//   const addUser = document.createElement("div");
//   addUser.setAttribute("class", "add-user dropdown");
//   addUser.setAttribute("data-dropdown", "dum");

//   addUser.innerHTML = `
//       <div id="button" data-dropdown-button> 
//         <div>Add User</div>
//         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" height="32px" id="arrow-down-svg"><path d="M12 19.1642L18.2071 12.9571L16.7929 11.5429L12 16.3358L7.20711 11.5429L5.79289 12.9571L12 19.1642ZM12 13.5143L18.2071 7.30722L16.7929 5.89301L12 10.6859L7.20711 5.89301L5.79289 7.30722L12 13.5143Z"></path></svg>
//       </div>
//       <div class="dropdown-content" id="dropdown-content${increment}">
//           <div class="dropdown-info">
//             <span class="dropdown-heading">Member Email:</span><br>
//             <input type="email" id="member-email${increment}" class="member-email-input" name="member-info" placeholder="enter email" required/>
//             <br>
//             <span class="dropdown-heading">Member Role:</span><br>
//             <input type="radio" id="viewer${increment}" name="role${increment}" value="viewer" checked/>
//             <label for="viewer${increment}">VIEWER</label><br>
//             <input type="radio" id="editor${increment}" name="role${increment}" value="editor" />
//             <label for="editor${increment}">EDITOR</label><br>
//             <input type="radio" id="author${increment}" name="role${increment}" value="author"/>
//             <label for="author${increment}">AUTHOR</label>
//           </div>
//           <div class="submit-btn submit-btn${increment}" id="submit-btn${increment}" onclick="addUserOnclickHandler(${increment})" >SUBMIT</div>
//        </div>`;

//   const editContainer = document.createElement("div");
//   editContainer.setAttribute("class", "edit-container");
//   editContainer.setAttribute("id", `edit-container${increment}`);
//   editContainer.setAttribute("onclick", `editOnClickHandler(${increment}, role="none")`);
//   const editTextNode = document.createTextNode("Edit");
//   editContainer.appendChild(editTextNode);

//   const deleteCredContainer = document.createElement("span");
//   deleteCredContainer.setAttribute(
//     "class",
//     "material-symbols-outlined delete-btn"
//   );
//   const deleteTextNode = document.createTextNode("delete");
//   deleteCredContainer.appendChild(deleteTextNode);
//   const keyNode = document.createTextNode(key);
//   const valueNode = document.createTextNode(value);
//   keyContainer.appendChild(keyNode);
//   valueContainer.appendChild(valueNode);
//   const infoContainer = document.createElement('div');
//   infoContainer.setAttribute("class", "info-btn");
//   infoContainer.setAttribute("onclick", `infoBtnOnClickHandler(${increment})`);
//   infoContainer.setAttribute("id", `info-btn${increment}`);
//   infoContainer.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path class="find-info-btn" d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 11V17H13V11H11ZM11 7V9H13V7H11Z"></path></svg>
//   <div class="cred-info" id="cred-info${increment}" to-drop="dum"></div>`
//   credContainer.append(
//     keyContainer,
//     valueContainer,
//     addUser,
//     editContainer,
//     deleteCredContainer,
//     infoContainer
//   );
//   const credStoreContainer = document.getElementById("cred-store-container");
//   credStoreContainer.appendChild(credContainer);
// } 
// function ended here



// document
//   .getElementById("cred-store-container")
//   .addEventListener("click", async function (event) {
//     if (event.target && event.target.classList.contains("delete-btn")) {
//       // Find the parent .new-class element and remove it
//       const credContainer = event.target.closest(".new-class");
//       if (credContainer) {
//         // send fetch request
//         fetch("/credential-manager/delete-resource", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             resourceId: credContainer.id,
//             // token:tokenResponse,
//           }),
//         }).then(response => {
//           return response.json()
//         }).then(async result => {
//           if(!result.deleted){
//             return await showAlertBox(`Resource NOT Deleted, ${result.msg}  ━┳━ ━┳━`)
//           }
//           await showAlertBox(`Resource Deleted Successfully!  （￣︶￣）↗`)
//           credContainer.remove();
//           return;
//         })
//       }
//     }
// });
  

// async function editOnClickHandler(increment, role){
//   if(role === "none"){
//     var newKey = document.getElementById(`key${increment}`).innerText;
//     var newValue = document.getElementById(`value${increment}`).innerText;
//     var resId = document.getElementsByClassName(`new-class${increment}`)[0].id;
//   }else if(role === "editor"){
//     var newKey = document.getElementById(`editor-key${increment}`).innerText;
//     var newValue = document.getElementById(`editor-value${increment}`).innerText;
//     var resId = document.getElementsByClassName(`editor-cred-container${increment}`)[0].id;
//   }else{
//     var newKey = document.getElementById(`author-key${increment}`).innerText;
//     var newValue = document.getElementById(`author-value${increment}`).innerText;
//     var resId = document.getElementsByClassName(`author-cred-container${increment}`)[0].id;
//   }
//     if(!newKey || !newValue){
//       await showAlertBox("Missing fields in edit values  ━┳━ ━┳━");
//       return;
//     }
//     if(!resId){
//       console.log('missing resId for editing');
//       return;
//     }

//   // sending edited data to backend
//     fetch('/credential-manager/edit-resource', {
//       "method": "POST",
//       "headers": {
//         "content-type": "application/json"
//       },
//       "body": JSON.stringify({
//         newKey: newKey,
//         newValue: newValue,
//         resId: resId
//       })
//     }).then(response => {
//       document.getElementById("key").value = '';
//       document.getElementById("value").value = '';
//       return response.json();
//     }).then(async res => {
//       if(res.response){
//         if(!role === "none"){
//           showSharedBtn.click();
//           await showAlertBox("Edited the document successfully!  (⌐■_■)");
//           return;
//         }
//         addBtn.click();
//         await showAlertBox("Edited the document successfully!  (⌐■_■)");
//         return;
//       }
//       await showAlertBox("Some problem occured during the edit  (┬┬﹏┬┬)");
//       return;
//     })
//   }


// const registrationPasskeyBtn = document.getElementById("passkey-registration-btn");
// registrationPasskeyBtn.addEventListener('click', async e => {
//   const response = await fetch('/credential-manager/register-passkey', {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     }
//   });
//   const result = await response.json();
//   const passkeyAuthResult = await SimpleWebAuthnBrowser.startRegistration(result.options);
//   const verificationResult = await fetch('/credential-manager/verify-passkey', {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({cred:passkeyAuthResult})
//   });
//   const verificationResultJson = await verificationResult.json();

//   if(verificationResultJson.verified && verificationResultJson){
//     console.log("successfully verified!")
//     await showAlertBox("Passkey registered and verified successfully o(￣▽￣)K")
//   }else{
//     await showAlertBox("Something went wrong with passkey registration");
//   }
// })




// ---------------------------------------------------------------- shared credentials handling ------------------------------------------------------------//



// function createSharedCredEle(resource, role, increment){
//   if(role == "viewer"){
//     const fieldContainer = document.createElement('fieldset');
//     const legend = document.createElement('legend');
//     const legendTextNode = document.createTextNode(`by: ${resource.resourceOwner}  /  ${resource.resourceOwnerName}`);
//     legend.appendChild(legendTextNode);
//     fieldContainer.appendChild(legend);
//     const credContainer = document.createElement('div');
//     credContainer.setAttribute("id", resource._id);
//     credContainer.setAttribute("class", `shared-cred-template viewer-cred-container${increment}`);
    
//     fieldContainer.appendChild(credContainer);
//       const keyContainer = document.createElement("p");
//       keyContainer.setAttribute("class", "key");
//       keyContainer.setAttribute("id", `viewer-key${increment}`);
//       const valueContainer = document.createElement("p");
//       valueContainer.setAttribute("class", "value");
//       valueContainer.setAttribute("id", `viewer-value${increment}`);
//       const keyNode = document.createTextNode(resource.resourceName);
//       const valueNode = document.createTextNode(resource.resourceValue);
//       keyContainer.appendChild(keyNode);
//       valueContainer.appendChild(valueNode);

//       credContainer.append(
//             keyContainer,
//             valueContainer,
//       );
//       const credStoreContainer = document.getElementById("viewer-container");
//       // credStoreContainer.appendChild(credContainer);
//       credStoreContainer.appendChild(fieldContainer);


//   }else if(role == "editor") {
//     const fieldContainer = document.createElement('fieldset');
//     const legend = document.createElement('legend');
//     const legendTextNode = document.createTextNode(`by: ${resource.resourceOwner}  /  ${resource.resourceOwnerName}`);
//     legend.appendChild(legendTextNode);
//     fieldContainer.appendChild(legend);

//     const credContainer = document.createElement("div");
//     credContainer.setAttribute("id", resource._id);
//     credContainer.setAttribute("class", `shared-cred-template editor-cred-container${increment}`);
//     fieldContainer.appendChild(credContainer);
//     const keyContainer = document.createElement("p");
//     keyContainer.setAttribute("class", "key");
//     keyContainer.setAttribute("id", `editor-key${increment}`);
//     keyContainer.setAttribute("contenteditable", "true");
//     const valueContainer = document.createElement("p");
//     valueContainer.setAttribute("class", "value");
//     valueContainer.setAttribute("id", `editor-value${increment}`);
//     valueContainer.setAttribute("contenteditable", "true");
  
//     const editContainer = document.createElement("div");
//     editContainer.setAttribute("class", "edit-container");
//     editContainer.setAttribute("id", `shared-edit-container${increment}`);
//     editContainer.setAttribute("onclick", `editOnClickHandler(${increment}, role="editor")`);
//     const editTextNode = document.createTextNode("Edit");
//     editContainer.appendChild(editTextNode);
//     const keyNode = document.createTextNode(resource.resourceName);
//     const valueNode = document.createTextNode(resource.resourceValue);
//     keyContainer.appendChild(keyNode);
//     valueContainer.appendChild(valueNode);
  
//     credContainer.append(
//       keyContainer,
//       valueContainer,
//       editContainer,
//     );
//     const credStoreContainer = document.getElementById("editor-container");
//     credStoreContainer.appendChild(fieldContainer);

    
//   }else {
//     const fieldContainer = document.createElement('fieldset');
//     const legend = document.createElement('legend');
//     const legendTextNode = document.createTextNode(`by: ${resource.resourceOwner}  /  ${resource.resourceOwnerName}`);
//     legend.appendChild(legendTextNode);
//     fieldContainer.appendChild(legend);

//     const credContainer = document.createElement("div");
//     credContainer.setAttribute("id", resource._id);
//     credContainer.setAttribute("class", `shared-cred-template author-cred-container${increment}`);
//     fieldContainer.appendChild(credContainer);
//     const keyContainer = document.createElement("p");
//     keyContainer.setAttribute("class", "key");
//     keyContainer.setAttribute("id", `author-key${increment}`);
//     keyContainer.setAttribute("contenteditable", "true");
//     const valueContainer = document.createElement("p");
//     valueContainer.setAttribute("class", "value");
//     valueContainer.setAttribute("id", `author-value${increment}`);
//     valueContainer.setAttribute("contenteditable", "true");
  
//     const editContainer = document.createElement("div");
//     editContainer.setAttribute("class", "edit-container");
//     editContainer.setAttribute("id", `shared-edit-container${increment}`);
//     editContainer.setAttribute("onclick", `editOnClickHandler(${increment}, role="author")`);
//     const editTextNode = document.createTextNode("Edit");
//     editContainer.appendChild(editTextNode);
  
//     const deleteCredContainer = document.createElement("span");
//     deleteCredContainer.setAttribute(
//       "class",
//       "material-symbols-outlined delete-btn"
//     );
//     const deleteTextNode = document.createTextNode("delete");
//     deleteCredContainer.appendChild(deleteTextNode);
//     const keyNode = document.createTextNode(resource.resourceName);
//     const valueNode = document.createTextNode(resource.resourceValue);
//     keyContainer.appendChild(keyNode);
//     valueContainer.appendChild(valueNode);
  
//     credContainer.append(
//       keyContainer,
//       valueContainer,
//       editContainer,
//       deleteCredContainer
//     );
//     const credStoreContainer = document.getElementById("author-container");
//     credStoreContainer.appendChild(fieldContainer);
//   }


// }


// const showSharedBtn = document.getElementsByClassName('shared-cred-heading')[0];
// showSharedBtn.addEventListener('click', async e =>{
//   const viewerContainer = document.getElementById('viewer-container');
//   const editorContainer = document.getElementById('editor-container');
//   const authorContainer = document.getElementById('author-container');
//   viewerContainer.innerHTML = "";
//   editorContainer.innerHTML="";
//   authorContainer.innerHTML = "";
//   const response = await fetch("/credential-manager/show-shared-resources", {
//     method: "GET",
//     headers : {
//       'Content-Type': 'application/json'
//     }
//   });
//   const {resourcesToSend} = await response.json();
//   if(!resourcesToSend || resourcesToSend == undefined){
//     await showAlertBox("Problem fetching credentials ━┳━　━┳━");
//     return;
//   }
//   console.log(resourcesToSend);
  
//   let inc = 1;
//   await resourcesToSend.viewer.forEach(resource => {
//     createSharedCredEle(resource, role="viewer", inc);
//     inc++;
//   });
//   await resourcesToSend.editor.forEach(resource => {
//     createSharedCredEle(resource, role="editor", inc);
//     inc++;
//   });
//   await resourcesToSend.author.forEach(resource => {
//     createSharedCredEle(resource, role="author", inc);
//     inc++
//   });
// })


// document
//   .getElementById("shared-cred-store-container")
//   .addEventListener("click", async function (event) {
//     if (event.target && event.target.classList.contains("delete-btn")) {
//       // Find the parent .new-class element and remove it
//       const credContainer = event.target.closest(".shared-cred-template");
//       if (credContainer) {
//         // send fetch request
//         fetch("/credential-manager/delete-resource", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             resourceId: credContainer.id
//           }),
//         }).then(response => {
//           return response.json()
//         }).then(async result => {
//           if(!result.deleted){
//             return await showAlertBox(`Resource NOT Deleted, ${result.msg}  ━┳━ ━┳━`)
//           }
//           credContainer.closest("fieldset").remove();
//           await showAlertBox(`Resource Deleted Successfully!  （￣︶￣）↗`)
//           return;
//         })
//       }
//     }
// });


