
function createSharedCredEle(resource, role, increment){
    if(role == "viewer"){
      const fieldContainer = document.createElement('fieldset');
      const legend = document.createElement('legend');
      const legendTextNode = document.createTextNode(`by: ${resource.resourceOwner}  /  ${resource.resourceOwnerName}`);
      legend.appendChild(legendTextNode);
      fieldContainer.appendChild(legend);
      const credContainer = document.createElement('div');
      credContainer.setAttribute("id", resource._id);
      credContainer.setAttribute("class", `shared-cred-template viewer-cred-container${increment}`);
      
      fieldContainer.appendChild(credContainer);
        const keyContainer = document.createElement("p");
        keyContainer.setAttribute("class", "key");
        keyContainer.setAttribute("id", `viewer-key${increment}`);
        const valueContainer = document.createElement("p");
        valueContainer.setAttribute("class", "value");
        valueContainer.setAttribute("id", `viewer-value${increment}`);
        const keyNode = document.createTextNode(resource.resourceName);
        const valueNode = document.createTextNode(resource.resourceValue);
        keyContainer.appendChild(keyNode);
        valueContainer.appendChild(valueNode);
  
        credContainer.append(
              keyContainer,
              valueContainer,
        );
        const credStoreContainer = document.getElementById("viewer-container");
        // credStoreContainer.appendChild(credContainer);
        credStoreContainer.appendChild(fieldContainer);
  
  
    }else if(role == "editor") {
      const fieldContainer = document.createElement('fieldset');
      const legend = document.createElement('legend');
      const legendTextNode = document.createTextNode(`by: ${resource.resourceOwner}  /  ${resource.resourceOwnerName}`);
      legend.appendChild(legendTextNode);
      fieldContainer.appendChild(legend);
  
      const credContainer = document.createElement("div");
      credContainer.setAttribute("id", resource._id);
      credContainer.setAttribute("class", `shared-cred-template editor-cred-container${increment}`);
      fieldContainer.appendChild(credContainer);
      const keyContainer = document.createElement("p");
      keyContainer.setAttribute("class", "key");
      keyContainer.setAttribute("id", `editor-key${increment}`);
      keyContainer.setAttribute("contenteditable", "true");
      const valueContainer = document.createElement("p");
      valueContainer.setAttribute("class", "value");
      valueContainer.setAttribute("id", `editor-value${increment}`);
      valueContainer.setAttribute("contenteditable", "true");
    
      const editContainer = document.createElement("div");
      editContainer.setAttribute("class", "edit-container");
      editContainer.setAttribute("id", `shared-edit-container${increment}`);
      editContainer.setAttribute("onclick", `editOnClickHandler(${increment}, role="editor")`);
      const editTextNode = document.createTextNode("Edit");
      editContainer.appendChild(editTextNode);
      const keyNode = document.createTextNode(resource.resourceName);
      const valueNode = document.createTextNode(resource.resourceValue);
      keyContainer.appendChild(keyNode);
      valueContainer.appendChild(valueNode);
    
      credContainer.append(
        keyContainer,
        valueContainer,
        editContainer,
      );
      const credStoreContainer = document.getElementById("editor-container");
      credStoreContainer.appendChild(fieldContainer);
  
      
    }else {
      const fieldContainer = document.createElement('fieldset');
      const legend = document.createElement('legend');
      const legendTextNode = document.createTextNode(`by: ${resource.resourceOwner}  /  ${resource.resourceOwnerName}`);
      legend.appendChild(legendTextNode);
      fieldContainer.appendChild(legend);
  
      const credContainer = document.createElement("div");
      credContainer.setAttribute("id", resource._id);
      credContainer.setAttribute("class", `shared-cred-template author-cred-container${increment}`);
      fieldContainer.appendChild(credContainer);
      const keyContainer = document.createElement("p");
      keyContainer.setAttribute("class", "key");
      keyContainer.setAttribute("id", `author-key${increment}`);
      keyContainer.setAttribute("contenteditable", "true");
      const valueContainer = document.createElement("p");
      valueContainer.setAttribute("class", "value");
      valueContainer.setAttribute("id", `author-value${increment}`);
      valueContainer.setAttribute("contenteditable", "true");
    
      const editContainer = document.createElement("div");
      editContainer.setAttribute("class", "edit-container");
      editContainer.setAttribute("id", `shared-edit-container${increment}`);
      editContainer.setAttribute("onclick", `editOnClickHandler(${increment}, role="author")`);
      const editTextNode = document.createTextNode("Edit");
      editContainer.appendChild(editTextNode);
    
      const deleteCredContainer = document.createElement("span");
      deleteCredContainer.setAttribute(
        "class",
        "material-symbols-outlined delete-btn"
      );
      const deleteTextNode = document.createTextNode("delete");
      deleteCredContainer.appendChild(deleteTextNode);
      const keyNode = document.createTextNode(resource.resourceName);
      const valueNode = document.createTextNode(resource.resourceValue);
      keyContainer.appendChild(keyNode);
      valueContainer.appendChild(valueNode);
    
      credContainer.append(
        keyContainer,
        valueContainer,
        editContainer,
        deleteCredContainer
      );
      const credStoreContainer = document.getElementById("author-container");
      credStoreContainer.appendChild(fieldContainer);
    }
  
  
  }