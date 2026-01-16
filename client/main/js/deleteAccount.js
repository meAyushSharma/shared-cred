document.getElementById('del-account').addEventListener('click', async () => {
    showDeleteConfirmationModal();
})

const DELETE_PHRASES = [
  "DELETE ALL MY DATA",
  "DELETE MY ACCOUNT PERMANENTLY",
  "I UNDERSTAND THIS CANNOT BE UNDONE",
  "ERASE MY ACCOUNT COMPLETELY"
];

function showDeleteConfirmationModal() {
  const phrase =
    DELETE_PHRASES[Math.floor(Math.random() * DELETE_PHRASES.length)];

  let overlay = document.getElementById("delete-confirm-overlay");
  if (overlay) return;

  overlay = document.createElement("div");
  overlay.id = "delete-confirm-overlay";
  overlay.innerHTML = `
    <style>
      #delete-confirm-overlay {
        position: fixed;
        inset: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: "Cabinet Grotesk", sans-serif;
      }
      .delete-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(20, 20, 15, 0.5);
        backdrop-filter: blur(8px);
        z-index: 1;
      }
      .delete-box {
        position: relative;
        z-index: 2;
        background: #ffffff;
        width: 90%;
        max-width: 420px;
        padding: 2.5rem 2rem;
        border-radius: 16px;
        border: 1px solid #aeae9d;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        text-align: center;
      }
      .delete-box h2 {
        font-family: "General Sans", sans-serif;
        font-size: 1.5rem;
        color: #b91c1c; /* Danger Red */
        margin-bottom: 1rem;
      }
      .delete-box p {
        font-size: 0.95rem;
        color: #6b6b5b;
        line-height: 1.5;
        margin-bottom: 1.5rem;
      }
      .confirm-instruction {
        font-size: 0.85rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: #262626;
      }
      .confirm-phrase {
        background: #fff5f5;
        color: #b91c1c;
        padding: 0.75rem;
        border-radius: 6px;
        font-family: monospace;
        font-weight: 700;
        margin-bottom: 1.25rem;
        border: 1px solid #fee2e2;
        user-select: none;
      }
      #delete-confirm-input {
        width: 100%;
        padding: 0.8rem;
        border: 1px solid #d1d1c7;
        border-radius: 8px;
        font-family: "General Sans", sans-serif;
        font-size: 1rem;
        margin-bottom: 1.5rem;
        text-align: center;
      }
      #delete-confirm-input:focus {
        outline: none;
        border-color: #b91c1c;
      }
      .danger-actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      #confirm-delete-btn {
        width: 100%;
        padding: 0.9rem;
        background: #b91c1c;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        font-family: "General Sans", sans-serif;
        transition: opacity 0.2s;
      }
      #confirm-delete-btn:disabled {
        background: #d1d1c7;
        cursor: not-allowed;
        opacity: 0.6;
      }
      #cancel-delete-btn {
        background: transparent;
        border: none;
        color: #8c8c73;
        font-weight: 500;
        cursor: pointer;
        padding: 0.5rem;
        font-size: 0.9rem;
      }
      #cancel-delete-btn:hover {
        color: #262626;
        text-decoration: underline;
      }
    </style>
    <div class="delete-backdrop"></div>
    <div class="delete-box">
      <h2>Delete account</h2>
      <p>
        This will permanently erase your account and all encrypted data. 
        <strong>This cannot be undone.</strong>
      </p>

      <p class="confirm-instruction">Type the following phrase exactly:</p>
      <div class="confirm-phrase">${phrase}</div>

      <input
        type="text"
        id="delete-confirm-input"
        placeholder="Type the phrase here"
        autocomplete="off"
      />

      <div class="danger-actions">
        <button id="confirm-delete-btn" disabled>Delete everything</button>
        <button id="cancel-delete-btn">No, take me back</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const input = document.getElementById("delete-confirm-input");
  const confirmBtn = document.getElementById("confirm-delete-btn");

  input.focus();

  input.addEventListener("input", () => {
    confirmBtn.disabled = input.value !== phrase;
  });

  confirmBtn.onclick = async () => {
    confirmBtn.innerText = "Deleting...";
    confirmBtn.disabled = true;
    await performAccountDeletion();
    overlay.remove();
  };

  document.getElementById("cancel-delete-btn").onclick = () => {
    overlay.remove();
  };
}

async function performAccountDeletion() {
  await showAlertBox("Deleting user account…");

  const response = await fetch("/delete-account", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  const result = await response.json();
  if (!result.success) {
    return await showAlertBox(result.msg);
  }

  try {
    await deleteKeys();
  } catch (err) {
    console.error("error deleting keys:", err);
    return await showAlertBox("Error deleting crypto keys");
  }

  await showAlertBox("User account deleted permanently.");
  window.location.reload();
}

function openDB() {
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
                openDB().then(resolve).catch(reject);
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
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["keys"], "readwrite");
    const store = transaction.objectStore("keys");

    const deletePrivate = store.delete("privateKey");
    const deletePublic = store.delete("publicKey");

    transaction.oncomplete = () => {
      console.log("Crypto keys deleted successfully from IndexedDB.");
      resolve(true);
    };

    transaction.onerror = (event) => {
      console.error("Failed to delete crypto keys.", event.target.error);
      reject("Failed to delete crypto keys");
    };
  });
}
