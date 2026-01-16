async function exportKeysAsZip() {
    await assertLocalKeysExist();
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["keys"], "readonly");
        const store = transaction.objectStore("keys");

        const privateKeyRequest = store.get("privateKey");
        const publicKeyRequest = store.get("publicKey");

        privateKeyRequest.onsuccess = function(event) {
            const privateKey = privateKeyRequest.result.key;

            publicKeyRequest.onsuccess = function(event) {
                const publicKey = publicKeyRequest.result.key;
                const zip = new JSZip();

                zip.file("privateKey.key", privateKey);
                zip.file("publicKey.key", publicKey);

                zip.generateAsync({ type: "blob" })
                    .then(function(content) {
                        const url = URL.createObjectURL(content);
                        downloadFile(url, `${userName}-crypto-keys.zip`);
                        resolve();
                    })
                    .catch(function(error) {
                        console.error("Failed to create ZIP file.", error);
                        reject("Failed to create ZIP file.");
                    });
            };

            publicKeyRequest.onerror = function() {
                reject("Failed to retrieve the public key.");
            };
        };

        privateKeyRequest.onerror = function() {
            reject("Failed to retrieve the private key.");
        };
    });
}

async function importUserKeysFromZip() {
    const zipFile = document.getElementById("imp-keys").files[0];

    if (zipFile) {
        await importKeysFromZip(zipFile);
        return await showAlertBox("Successfully imported keys (～￣▽￣)～");
    } else {
        console.error("Please select a ZIP file.");
        return await showAlertBox("Failed at importing keys (～￣▽￣)～");
    }
}



async function importKeysFromZip(zipFile) {
    const jszip = new JSZip();
    const zipContent = await jszip.loadAsync(zipFile);

    const privateKeyFile = await zipContent.file("privateKey.key").async("arraybuffer");
    const publicKeyFile = await zipContent.file("publicKey.key").async("arraybuffer");

    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["keys"], "readwrite");
        const store = transaction.objectStore("keys");

        store.put({ name: "privateKey", key: privateKeyFile });
        store.put({ name: "publicKey", key: publicKeyFile });

        transaction.oncomplete = function() {
            console.log("Keys imported successfully from ZIP.");
            resolve();
        };

        transaction.onerror = function(event) {
            console.error("Failed to import keys from ZIP.", event.target.error);
            reject("Failed to import keys from ZIP.");
        };
    });
}


function downloadFile(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

