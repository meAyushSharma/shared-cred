
async function editOnClickHandler(increment, role){
    if(role === "none"){
      var newKey = document.getElementById(`key${increment}`).innerText;
      var newValue = document.getElementById(`value${increment}`).innerText;
      var resId = document.getElementsByClassName(`new-class${increment}`)[0].id;
    }else if(role === "editor"){
      var newKey = document.getElementById(`editor-key${increment}`).innerText;
      var newValue = document.getElementById(`editor-value${increment}`).innerText;
      var resId = document.getElementsByClassName(`editor-cred-container${increment}`)[0].id;
    }else{
      var newKey = document.getElementById(`author-key${increment}`).innerText;
      var newValue = document.getElementById(`author-value${increment}`).innerText;
      var resId = document.getElementsByClassName(`author-cred-container${increment}`)[0].id;
    }
      if(!newKey || !newValue){
        await showAlertBox("Missing fields in edit values  ━┳━ ━┳━");
        return;
      }
      if(!resId){
        console.log('missing resId for editing');
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
          if(!role === "none"){
            showSharedBtn.click();
            await showAlertBox("Edited the document successfully!  (⌐■_■)");
            return;
          }
          addBtn.click();
          await showAlertBox("Edited the document successfully!  (⌐■_■)");
          return;
        }
        await showAlertBox("Some problem occured during the edit  (┬┬﹏┬┬)");
        return;
      })
    }
  