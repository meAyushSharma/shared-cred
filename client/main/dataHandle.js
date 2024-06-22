const addBtn = document.getElementById("add-btn-id");
addBtn.addEventListener("click", () => {
  const key = document.getElementById("key").value;
  const value = document.getElementById("value").value;

  const credStoreContainer = document.getElementById("cred-store-container");
  credStoreContainer.innerHTML = "";

  sendDataGetResponse(key, value);
});

async function sendDataGetResponse(key, value) {
  if (!key || !value) {
    return null;
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
      return response.json();
    })
    .then((resources) => {
      resources.forEach((ele) => {
        createCredential(ele.resourceName, ele.resourceValue, ele._id);
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

function createCredential(key, value, resourceId) {
  const credContainer = document.createElement("div");
  credContainer.setAttribute("class", "new-class");
  credContainer.setAttribute("id", resourceId);
  const keyContainer = document.createElement("p");
  keyContainer.setAttribute("class", "key");
  const valueContainer = document.createElement("p");
  valueContainer.setAttribute("class", "value");

  const addUserContainer = document.createElement("div");
  addUserContainer.setAttribute("class", "add-user-container");
  const addUserNode = document.createElement("span");
  addUserNode.setAttribute("class", "material-symbols-outlined add-user");
  const addUserTextNode = document.createTextNode("person_add");
  const addUserRoleNode = document.createElement("span");
  addUserRoleNode.setAttribute("class", "material-symbols-outlined add-role");
  const addUserRoleTextNode = document.createTextNode("admin_panel_settings");

  addUserNode.append(addUserTextNode);
  addUserRoleNode.append(addUserRoleTextNode);

  addUserContainer.append(addUserNode, addUserRoleNode);

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
  addUserContainer.append(addUserNode, addUserRoleNode);
  credContainer.append(
    keyContainer,
    valueContainer,
    addUserContainer,
    deleteCredContainer
  );
  const credStoreContainer = document.getElementById("cred-store-container");
  credStoreContainer.appendChild(credContainer);
}

document
  .getElementById("cred-store-container")
  .addEventListener("click", function (event) {
    if (event.target && event.target.classList.contains("delete-btn")) {
      // Find the parent .new-class element and remove it
      const credContainer = event.target.closest(".new-class");
      if (credContainer) {
        // console.log(credContainer.id);
        // const tokenResponse = getCookie("token");

        // if (!tokenResponse) {
        //   return null;
        // }

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
        credContainer.remove();
      }
    }
  });
