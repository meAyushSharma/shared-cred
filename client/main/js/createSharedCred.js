function createSharedCredEle(resource, role, increment, resourceValue) {
  try {
    // const resourceValue = await decryptResourceValue(resource.resourceValue, resource.encryptedSymmetricKey);
    const fieldContainer = document.createElement('fieldset');
    const legend = document.createElement('legend');
    const legendTextNode = document.createTextNode(`by: ${resource.resourceOwner}  /  ${resource.resourceOwnerName}`);
    legend.appendChild(legendTextNode);
    fieldContainer.appendChild(legend);

    const credContainer = document.createElement('div');
    credContainer.setAttribute('id', resource._id);
    credContainer.setAttribute('class', `shared-cred-template ${role}-cred-container${increment}`);
    fieldContainer.appendChild(credContainer);

    const keyContainer = document.createElement('p');
    keyContainer.setAttribute('class', 'key');
    keyContainer.setAttribute('id', `${role}-key${increment}`);
    if (role === 'editor' || role === 'author') {
      keyContainer.setAttribute('contenteditable', 'true');
    }

    const valueContainer = document.createElement('p');
    valueContainer.setAttribute('class', 'value');
    valueContainer.setAttribute('id', `${role}-value${increment}`);
    if (role === 'editor' || role === 'author') {
      valueContainer.setAttribute('contenteditable', 'true');
    }

    const keyNode = document.createTextNode(resource.resourceName);
    const valueNode = document.createTextNode(resourceValue);
    keyContainer.appendChild(keyNode);
    valueContainer.appendChild(valueNode);

    credContainer.appendChild(keyContainer);
    credContainer.appendChild(valueContainer);

    if (role === 'editor' || role === 'author') {
      const editContainer = document.createElement('div');
      editContainer.setAttribute('class', 'edit-container');
      editContainer.setAttribute('id', `shared-edit-container${increment}`);
      editContainer.setAttribute('onclick', `editOnClickHandler(${increment}, role="${role}")`);
      const editTextNode = document.createTextNode('Edit');
      editContainer.appendChild(editTextNode);
      credContainer.appendChild(editContainer);
    }

    if (role === 'author') {
      const deleteCredContainer = document.createElement('span');
      deleteCredContainer.setAttribute('class', 'material-symbols-outlined delete-btn');
      const deleteTextNode = document.createTextNode('delete');
      deleteCredContainer.appendChild(deleteTextNode);
      credContainer.appendChild(deleteCredContainer);
    }

    const credStoreContainer = document.getElementById(`${role}-container`);
    credStoreContainer.appendChild(fieldContainer);

  } catch (err) {
    console.error(`Error creating shared credential element: ${err}`);
  }
}
