const tncCheckbox = document.getElementById("agree-tnc");
const submitBtn = document.getElementById("signup-submit");
const form = document.getElementById("signup-form");

// --- T&C checkbox → button enable ---
tncCheckbox.addEventListener("change", () => {
  submitBtn.disabled = !tncCheckbox.checked;
});

// --- Password show/hide (ONLY via checkbox, no hover) ---
const pwd = document.getElementById("signup-password");
const togglePwd = document.getElementById("toggle-password");

togglePwd.addEventListener("change", () => {
  pwd.type = togglePwd.checked ? "text" : "password";
});


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("signup-username").value.toLowerCase().trim();
  const password = pwd.value; // do NOT .trim() passwords
  const name = document.getElementById("signup-name").value.trim();
  const agreeTnc = tncCheckbox.checked;

  // ---- Client-side validation FIRST ----
  if (!username || !password || !name) {
    alert("Please fill all required fields.");
    return;
  }

  if (!agreeTnc) {
    alert("You must agree to the Terms & Conditions.");
    return;
  }

  try {
    // ---- Key generation AFTER validation ----
    const keyPair = await generateKeyPair();
    const exportedPublicKey = await exportPublicKey(keyPair.publicKey);

    await storeKeys(keyPair.privateKey, keyPair.publicKey);

    const response = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        name,
        publicKey: exportedPublicKey,
        agreeTnc: true
      })
    });

    if (response.redirected) {
      window.location.href = response.url;
    } else {
      const text = await response.text();
      alert(text);
    }
  } catch (err) {
    console.error("Signup failed:", err);
    alert("Signup failed. Please try again.");
  }
});



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




document.getElementById("google-text").addEventListener("click", async (event) => {
  event.preventDefault();
  const keyPair = await generateKeyPair();
  await storeKeys(keyPair.privateKey, keyPair.publicKey);
  window.location.href = "/auth/google";
});