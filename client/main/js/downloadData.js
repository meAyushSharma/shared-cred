document.getElementById('download-cred').addEventListener('click', async () => {
    const response = await fetch('/credential-manager/download-data', {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const result = await response.json();
    if(!result.success) return await showAlertBox(result.msg);
    let text=`<h3 align="center"> CREDENTIALS </h3> \n`;
    let count=0;
    for(resource of result.downloadableData.resources) {
        const resourceValue = await decryptResourceValue(resource.resourceValue, resource.resourceSymmetricKey);
        text = text+`${++count}. \n- Credential Name: ${resource.resourceName},\n- Credential Value: ${resourceValue},\n- Viewer Access: ${resource.resourceViewers},\n- Editor Access: ${resource.resourceEditors},\n- Author Access: ${resource.resourceAuthors},\n------------------------------------------\n`
    }
    let credTextURLs = "Uploaded Credentials: \n";
    let counter=0;
    result.downloadableData.credImageURLs.forEach(url => {
        credTextURLs= credTextURLs+ `${++counter}. Credential Name: ${url.name} ![${url.name}](${url.url}) \n-----------------------------\n`
    });
    text+=credTextURLs;

    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${userName}_credentials.md`; 

    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    document.body.removeChild(a);
})