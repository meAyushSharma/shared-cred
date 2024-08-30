document.getElementById('signup-form').addEventListener('submit', async e=>{
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const name = document.getElementById('signup-name').value;

    generateKeyPair().then(async keyPair => {
        console.log("Public Key:", keyPair.publicKey);
        console.log("Private Key:", keyPair.privateKey);

        const exportedPublicKey = await exportPublicKey(keyPair.publicKey);

        storeKeys(keyPair.privateKey, keyPair.publicKey).then(async ()=> {
            const response = await fetch('/credential-manager/signup', {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                },
                "body": JSON.stringify({
                    username:username,
                    name:name,
                    password:password,
                    publicKey: exportedPublicKey
                })
            });
            if(response.redirected){
                window.location.href = response.url;
            }else{
                window.location.reload();
            }
        }).catch(err =>{
            console.log(`the error in storing private key: ${err}`);
        })

    });
})



async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true, // whether the key is extractable (i.e., can be used in exportKey)
        ["encrypt", "decrypt"] // can be used for these operations
    );
    return keyPair;
}


async function storeKeys(privateKey, publicKey) {
    // Open an IndexedDB database
    const dbRequest = indexedDB.open("crypto-keys", 2);

    dbRequest.onupgradeneeded = function(event) {
        const db = event.target.result;
        // Create an object store for keys if it doesn't exist
        if (!db.objectStoreNames.contains("keys")) {
            db.createObjectStore("keys", { keyPath: "name" });
        }
    };
    dbRequest.onsuccess = async function(event) {
        const db = event.target.result;
        const exportedPrivateKey = await window.crypto.subtle.exportKey("pkcs8", privateKey);
        const exportedPublicKey = await window.crypto.subtle.exportKey("spki", publicKey);

        // Create the transaction and store the keys
        const transaction = db.transaction(["keys"], "readwrite");
        const store = transaction.objectStore("keys");

        store.put({ name: "privateKey", key: exportedPrivateKey });
        store.put({ name: "publicKey", key: exportedPublicKey });

        transaction.oncomplete = function() {
            console.log("Keys stored successfully.");
        };
        transaction.onerror = function() {
            console.log("Transaction failed.");
        };
    };

    dbRequest.onerror = function(event) {
        console.error("Failed to open the database.", event.target.error);
    };
}


async function exportPublicKey(publicKey) {
    const exported = await window.crypto.subtle.exportKey(
        "spki", // SubjectPublicKeyInfo format
        publicKey
    );
    // Convert ArrayBuffer to Base64 string
    const exportedAsString = String.fromCharCode.apply(null, new Uint8Array(exported));
    const exportedAsBase64 = btoa(exportedAsString);
    return exportedAsBase64;
}


