
document
  .getElementById("shared-cred-store-container")
  .addEventListener("click", async function (event) {
    if (event.target && event.target.classList.contains("delete-btn")) {
      // Find the parent .new-class element and remove it
      const credContainer = event.target.closest(".shared-cred-template");
      if (credContainer) {
        await showAlertBox("Deleting credential....");
        // send fetch request
        fetch("/credential-manager/delete-resource", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resourceId: credContainer.id
          }),
        }).then(response => {
          return response.json()
        }).then(async result => {
          if(!result.deleted){
            return await showAlertBox(`Resource NOT Deleted, ${result.msg}  ━┳━ ━┳━`)
          }
          credContainer.closest("fieldset").remove();
          await showAlertBox(`Resource Deleted Successfully!  （￣︶￣）↗`)
          return;
        })
      }
    }
});