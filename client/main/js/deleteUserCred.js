
document
  .getElementById("cred-store-container")
  .addEventListener("click", async function (event) {
    if (event.target && event.target.classList.contains("delete-btn")) {
      // Find the parent .new-class element and remove it
      const credContainer = event.target.closest(".new-class");
      if (credContainer) {
        await showAlertBox("Deleting credntial....");
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
        }).then(response => {
          return response.json()
        }).then(async result => {
          if(!result.deleted){
            return await showAlertBox(`Resource NOT Deleted, ${result.msg}  ━┳━ ━┳━`)
          }
          await showAlertBox(`Resource Deleted Successfully!  （￣︶￣）↗`)
          credContainer.remove();
          return;
        })
      }
    }
});