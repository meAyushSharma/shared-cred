const addBtn = document.getElementById("add-btn-id");
addBtn.addEventListener("click", () => {
  const key = document.getElementById("key").value;
  const value = document.getElementById("value").value;

  const credStoreContainer = document.getElementById("cred-store-container");
  credStoreContainer.innerHTML = "";

  sendDataGetResponse(key, value);
});

async function sendDataGetResponse(key, value) {
  //'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1lYXl1c2giLCJwYXNzd29yZCI6IiQyYiQxMCRqdlg3TzV3TTBkV0FURzc4dFMuZU51YmtMVC5BazZ5SFNYUmF3SVQ1TjRnNVp6T1V0SkF5MiIsIm5hbWUiOiJBeXVzaCBTaGFybWEiLCJpYXQiOjE3MTgzOTY3NTR9.UJmhDeLTJA2-BRCueJlBgpVNscTXz42QNicITNvfhVI'
  const tokenResponse = getCookie("token");

  if (!tokenResponse) {
    return null;
  }
  if (!key || !value) {
    return null;
  }

  fetch("/credential-manager/fetch-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key: key,
      value: value,
      token: tokenResponse,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((user) => {
      // console.log(user);
      user.credential.forEach((ele) => {
        createCredential(ele.key, ele.value);
      });
    })
    .catch((err) => {
      console.log(
        `there was error while sending cred details from client side::::   ${err}`
      );
    });
}

function getCookie(name) {
  let cookieArr = document.cookie.split(";");

  for (let i = 0; i < cookieArr.length; i++) {
    let cookiePair = cookieArr[i].split("=");

    if (name == cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1]);
    }
  }

  return null;
}

function createCredential(key, value) {
  const credContainer = document.createElement("div");
  credContainer.setAttribute("class", "new-class");
  const keyContainer = document.createElement("p");
  keyContainer.setAttribute("class", "key");
  const valueContainer = document.createElement("p");
  valueContainer.setAttribute("class", "value");
  const addUserContainer = document.createElement("div");
  addUserContainer.setAttribute("class", "add-user-container");
  addUserContainer.setAttribute("id", "addUserContainer");
  const addUserNode = document.createTextNode("Add User");
  const keyNode = document.createTextNode(key);
  const valueNode = document.createTextNode(value);
  keyContainer.appendChild(keyNode);
  valueContainer.appendChild(valueNode);
  addUserContainer.appendChild(addUserNode);
  credContainer.append(keyContainer, valueContainer, addUserContainer);
  const credStoreContainer = document.getElementById("cred-store-container");
  credStoreContainer.appendChild(credContainer);
}
