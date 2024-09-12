document.getElementById('signup-form').addEventListener('submit', async e=>{
    e.preventDefault();
    const username = document.getElementById('signup-username').value.toLowerCase().trim();
    const password = document.getElementById('signup-password').value.toString().trim();
    const name = document.getElementById('signup-name').value.trim();

    generateKeyPair().then(async keyPair => {
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

async function openDatabase() {
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open("crypto-keys", 2);

        dbRequest.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("keys")) {
                db.createObjectStore("keys", { keyPath: "name" });
            }
        };

        dbRequest.onsuccess = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("keys")) {
                db.close();
                indexedDB.deleteDatabase("crypto-keys");
                console.log("Database is missing the 'keys' object store, recreating...");
                openDatabase().then(resolve).catch(reject);
                return;
            }
            console.log("deleted and recreated!");
            resolve(db);
        };

        dbRequest.onerror = function(event) {
            reject("Failed to open the database.");
        };
    });
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


async function storeKeys(privateKey, publicKey) {
    const db = await openDatabase();
    // console.log("------------------------------------------------------------------------------------------------------------------------------------")
    const dbRequest = indexedDB.open("crypto-keys", 2);

    dbRequest.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("keys")) {
            db.createObjectStore("keys", { keyPath: "name" });
        }
    };
    dbRequest.onsuccess = async function(event) {
        const db = event.target.result;
        const exportedPrivateKey = await window.crypto.subtle.exportKey("pkcs8", privateKey);
        const exportedPublicKey = await window.crypto.subtle.exportKey("spki", publicKey);

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


document.getElementById('signup-password').addEventListener('mouseover', (e) => {
    if(e.target.type === 'text'){
        e.target.type = 'text'
    }else{
        e.target.type = 'text';
    }
});

document.getElementById('signup-password').addEventListener('mouseout', (e) => {
    if(e.target.type === 'password'){
        e.target.type = 'password'
    }else{
        e.target.type = 'password';
    }
});



document.getElementById('google-text').addEventListener('click', async function (event) {
    event.preventDefault();
    const keyPair = await generateKeyPair();
    await storeKeys(keyPair.privateKey, keyPair.publicKey);
    window.location.href = `/credential-manager/auth/google`;
});