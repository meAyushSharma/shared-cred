
async function encryptSymmetricKey(symmetricKey, publicKey) {
    // Export the symmetric key to a raw format (ArrayBuffer)
    const keyBuffer = await window.crypto.subtle.exportKey("raw", symmetricKey);
    // Encrypt the symmetric key using the public key
    const encryptedKey = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        publicKey,          // The public key for encryption
        keyBuffer           // The symmetric key as an ArrayBuffer
    );
    return encryptedKey;    // Returns an ArrayBuffer of the encrypted key
  }
  
  
  async function getPublicKey() {
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open("crypto-keys", 2);

        dbRequest.onsuccess = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("keys")) {
                reject("Object store 'keys' not found.");
                return;
            }
            const transaction = db.transaction(["keys"], "readonly");
            const store = transaction.objectStore("keys");
            const getRequest = store.get("publicKey");
  
            getRequest.onsuccess = async function(event) {
                const storedKey = event.target.result;
  
                if (!storedKey) {
                    console.log("Public key not found");
                    reject("Public key not found.");
                    return;
                }
  
                try {
                    const publicKey = await window.crypto.subtle.importKey(
                        "spki",
                        storedKey.key,
                        {
                            name: "RSA-OAEP",
                            hash: "SHA-256",
                        },
                        true,
                        ["encrypt"]
                    );
                    resolve(publicKey);
                } catch (error) {
                    reject("Failed to import the public key: " + error.message);
                }
            };
  
            getRequest.onerror = function() {
                reject("Failed to retrieve the public key.");
            };
        };
  
        dbRequest.onerror = function() {
            reject("Failed to open the database.");
        };
    });
  }
  
  async function getPrivateKey() {
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open("crypto-keys", 2);

        dbRequest.onsuccess = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("keys")) {
                reject("Object store 'keys' not found.");
                return;
            }
            const transaction = db.transaction(["keys"], "readonly");
            const store = transaction.objectStore("keys");
            const getRequest = store.get("privateKey");
  
            getRequest.onsuccess = async function(event) {
                const storedKey = event.target.result;
                try {
                    const privateKey = await window.crypto.subtle.importKey(
                        "pkcs8", // Correct format for private keys
                        storedKey.key,
                        {
                            name: "RSA-OAEP",
                            hash: "SHA-256",
                        },
                        true, // The key is extractable
                        ["decrypt"] // Operations allowed with the private key
                    );
                    resolve(privateKey);
                } catch (error) {
                    reject("Failed to import the private key: " + error.message);
                }
            };
  
            getRequest.onerror = function() {
                reject("Failed to retrieve the private key.");
            };
        };
  
        dbRequest.onerror = function() {
            reject("Failed to open the database.");
        };
    });
  }
  
  
  async function generateSymmetricKey() {
      // Generate a symmetric key using AES-GCM
      const key = await crypto.subtle.generateKey(
          {
              name: "AES-GCM", // AES algorithm in Galois/Counter Mode
              length: 256,     // Key length: 256 bits
          },
          true,               // Whether the key is extractable (i.e., can be used outside the Web Crypto API)
          ["encrypt", "decrypt"] // Key usages: encryption and decryption
      );
      return key;
  }
  
  function arrayBufferToBase64(buffer) {
    // Convert the ArrayBuffer to a Uint8Array, then to a string, and finally to base64
    const uint8Array = new Uint8Array(buffer);
    const string = String.fromCharCode.apply(null, uint8Array);
    return btoa(string);
  }
  
  async function stringToKey(base64Key) {;
    // Convert the base64 string to a binary string
    const binaryString = atob(base64Key);
    // Convert the binary string to an ArrayBuffer
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer; // This is the ArrayBuffer
  }
  
  
  async function encryptData(key, data) {
    // Convert the data to an ArrayBuffer
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    
    // Create an initialization vector (IV) for encryption
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes is recommended for AES-GCM
    
    // Encrypt the data using the symmetric key
    const encryptedData = await crypto.subtle.encrypt(
        {
            name: "AES-GCM", // The algorithm to use
            iv: iv,          // The initialization vector
        },
        key,                // The symmetric key to use
        encodedData         // The data to encrypt
    );
  
    // Combine the IV and the encrypted data into a single ArrayBuffer
    const combined = new Uint8Array(iv.byteLength + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.byteLength);
    // Convert the combined ArrayBuffer to a Base64 string
    const base64String = btoa(String.fromCharCode(...combined));
    return base64String;
  }
  
  
  
async function decryptResourceValue(encryptedResourceValue, encryptedSymmetricKey){
    let symmetricKey;
    try{
        symmetricKey = await convertTokey(encryptedSymmetricKey);
    } catch(err) {
        console.log("error form convertToKey: ", err);
        return;
    }
    const buffer = await stringToKey(encryptedResourceValue);
    const view = new DataView(buffer);
    const ivLength = 12; 
    const iv = new Uint8Array(buffer, 0, ivLength);
    const encryptedData = new Uint8Array(buffer, ivLength);
    const decryptedData = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,           
        },
        symmetricKey,       
        encryptedData       
    );
    const decoder = new TextDecoder();
    const decodedData = decoder.decode(decryptedData);
    return decodedData;
  }
  
async function convertTokey(encryptedSymmetricKey){
    const arrayBuffer = await stringToKey(encryptedSymmetricKey);
    let privateKey;
    try {
        privateKey = await getPrivateKey();
    } catch(err) {
        reject('Error fetching private key: ', err)
        return;
    }
    let symmetricKeyArrayBuffer;
    try {
     symmetricKeyArrayBuffer = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP"
        },
        privateKey,
        arrayBuffer
    );
    } catch(err) {
        console.log("the error in symmericKeyArrayBuffer is: ", err);
        return;
    }
    const symmetricKey = await crypto.subtle.importKey(
      "raw",
      symmetricKeyArrayBuffer,       // ArrayBuffer
      {
        name: "AES-GCM"    // Same algorithm as used during key generation
      },
      true,                     // Whether the key is extractable
      ["encrypt", "decrypt"]    // usages
    );
    return symmetricKey;
}
  
async function importPublicKey(base64Key) {
    // Convert base64 string to ArrayBuffer
    const keyBuffer = await stringToKey(base64Key);

    // Import the public key
    const publicKey = await crypto.subtle.importKey(
        "spki", // SubjectPublicKeyInfo format
        keyBuffer,
        { name: "RSA-OAEP", hash: "SHA-256" }, // Use the appropriate algorithm and hash
        true,
        ["encrypt"] // Key usages
    );
    return publicKey;
}


async function exportPublicKeyToBase64(publicKey) {
    const exported = await window.crypto.subtle.exportKey(
        "spki",
        publicKey
    );
    const exportedAsString = String.fromCharCode.apply(null, new Uint8Array(exported));
    const exportedAsBase64 = btoa(exportedAsString);
    return exportedAsBase64;
}

async function isPublicKeyCorrect(publicKey, publicKeyBase64FromDB) {
    const publicKeyBase64 = await exportPublicKeyToBase64(publicKey);
    // console.log("public key on browser: ", publicKeyBase64);
    return publicKeyBase64 === publicKeyBase64FromDB;
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



async function deleteKeys() {
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open("crypto-keys", 2);

        dbRequest.onsuccess = function(event) {
            const db = event.target.result;

            const transaction = db.transaction(["keys"], "readwrite");
            const store = transaction.objectStore("keys");

            // store.delete("privateKey");
            // store.delete("publicKey");

            const deletePrivateKeyRequest = store.delete("privateKey");
            const deletePublicKeyRequest = store.delete("publicKey");
    
            deletePrivateKeyRequest.onsuccess = function() { console.log("Private key deleted successfully.") };
            deletePrivateKeyRequest.onerror = function() { console.error("Failed to delete private key.") };
            deletePublicKeyRequest.onsuccess = function() { console.log("Public key deleted successfully.") };
            deletePublicKeyRequest.onerror = function() { console.error("Failed to delete public key.") };

            transaction.oncomplete = function() {
                console.log("Keys deleted successfully.");
                resolve();
            };

            transaction.onerror = function(event) {
                console.error("Failed to delete keys.", event.target.error);
                reject("Failed to delete keys.");
            };
        };

        dbRequest.onerror = function(event) {
            console.error("Failed to open the database.", event.target.error);
            reject("Failed to open the database.");
        };
    });
}