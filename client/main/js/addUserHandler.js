
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
        console.log(`the error in addMember getting res response from backend is: ${err}`);
      });
  }