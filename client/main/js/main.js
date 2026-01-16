
var logo = document.getElementById("logo-id");
logo.addEventListener("click", function () {
  navigateToSection("top-here");
});

var about = document.getElementsByClassName("about-container")[0];
about.addEventListener("click", function () {
  navigateToSection("about");
});
var template = document.getElementsByClassName("credential-container")[0];
template.addEventListener("click", function () {
  navigateToSection("credential");
});
var navigate = document.getElementsByClassName("navigate-up")[0];
navigate.addEventListener("click", function () {
  navigateToSection("top-here");
});

function navigateToSection(sectionId) {
  const section = document.getElementById(sectionId);
  section.scrollIntoView({ behavior: "smooth" });
  history.pushState(null, null, "#" + sectionId);
}


// this here is for addUser popup
document.addEventListener('click', e=>{
  const isAddUser = e.target.matches("#button, #button > div, #arrow-down-svg, .add-user");
  if(!isAddUser && e.target.closest('[data-dropdown]')!= null) return;
  let currentDropdown;
  if(isAddUser){
    currentDropdown = e.target.closest('[data-dropdown]');
    currentDropdown.classList.toggle('active')
  }

  document.querySelectorAll('[data-dropdown]').forEach(dropdown =>{
    if(dropdown === currentDropdown){
      return;
    }
    dropdown.classList.remove('active');
  })
});


document.addEventListener('click', e => {
  const ifClickedOn = e.target.matches('path.find-btn-info, .info-btn>svg, .info-btn>svg>path');
  if(!ifClickedOn && e.target.closest(".info-btn") != null ) return;
  let currentDropdown;
  if(ifClickedOn) {
    currentDropdown = e.target.closest('.info-btn');
    currentDropdown.classList.toggle('activated')
  }
  document.querySelectorAll('.info-btn').forEach(dropdown => {
    if(dropdown === currentDropdown) return;
    dropdown.classList.remove('activated')
  })
})

document.addEventListener('click', e => {
  const ifClickedOn = e.target.matches('.dashboard-btn, .dashboard-btn>svg, .dashboard-btn>svg>path ');
  if(!ifClickedOn && e.target.closest("#dashboard-container") != null ) return;
  let currentDropdown;
  if(ifClickedOn) {
    currentDropdown = e.target.closest('#dashboard-container');
    document.getElementById('nav-bar-container').style.zIndex = 4;
    currentDropdown.classList.toggle('activated')
  }
  document.querySelectorAll('#dashboard-container').forEach(dropdown => {
    if(dropdown === currentDropdown) return;
    document.getElementById('nav-bar-container').style.zIndex = 3;
    dropdown.classList.remove('activated')
  })
})

// document.addEventListener('click', e => {
//   const ifClickedOn = e.target.matches('.cred-image-upload-container, .cred-image-upload-container>svg, .cred-image-upload-container>svg>path ');
//   if(!ifClickedOn && e.target.closest(".upload-container") != null ) return;
//   let currentDropdown;
//   if(ifClickedOn) {
//     currentDropdown = e.target.closest('.upload-container');
//     currentDropdown.classList.toggle('activated-upload')
//   }
//   document.querySelectorAll('.upload-container').forEach(dropdown => {
//     if(dropdown === currentDropdown) return;
//     dropdown.classList.remove('activated-upload')
//   })
// })

document.addEventListener('click', e => {
  const ifClickedOn = e.target.matches('.image-credential-name');
  if(!ifClickedOn && e.target.closest(".show-image-template") != null ) return;
  let currentDropdown;
  if(ifClickedOn) {
    currentDropdown = e.target.closest('.show-image-template');
    currentDropdown.classList.toggle('activated-image-dropdown');
  }
  document.querySelectorAll('.show-image-template').forEach(dropdown => {
    if(dropdown === currentDropdown) return;
    dropdown.classList.remove('activated-image-dropdown');
  })
})


document.addEventListener("DOMContentLoaded", async () => {
    const res = await fetch("/me");
    const { mustExportKeys } = await res.json();

    if (!mustExportKeys) return;

    try {
        await assertLocalKeysExist();
        showKeyWarningAndAutoExport();
    } catch (err) {
      if (err.message === "LOCAL_KEYS_MISSING") {
        showKeysLostModal();
      }
    }
});


function showKeyWarningAndAutoExport() {
  let overlay = document.getElementById("key-warning-overlay");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "key-warning-overlay";
    overlay.innerHTML = `
      <style>
        #key-warning-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Cabinet Grotesk", sans-serif;
        }
        .key-warning-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(20, 20, 15, 0.4);
          backdrop-filter: blur(8px);
          z-index: 1;
        }
        .key-warning-box {
          position: relative;
          z-index: 2;
          background: #ffffff;
          width: 90%;
          max-width: 440px;
          padding: 2.5rem 2rem;
          border-radius: 16px;
          border: 1px solid #aeae9d;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          text-align: center;
        }
        .key-warning-box h2 {
          font-family: "General Sans", sans-serif;
          font-size: 1.6rem;
          color: #262626;
          margin-bottom: 1rem;
        }
        .key-warning-box p {
          font-size: 0.95rem;
          color: #6b6b5b;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        .countdown-container {
          background: #f9f9f6;
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          border: 1px solid #e1e1d7;
          margin-bottom: 1.5rem;
          color: #262626;
        }
        #key-export-countdown { 
          color: #4a4ae2; 
          font-weight: 700;
          font-size: 1.1rem;
        }
        #download-keys-now {
          width: 100%;
          padding: 0.9rem;
          background: #4a4ae2;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 1.5rem;
          font-family: "General Sans", sans-serif;
          transition: transform 0.1s;
        }
        #download-keys-now:active { transform: scale(0.98); }
        
        .confirm-download {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 0.85rem;
          color: #262626;
          cursor: pointer;
          margin-bottom: 1.5rem;
          user-select: none;
        }
        #confirm-export {
          width: 100%;
          padding: 0.9rem;
          background: #8c8c73;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-family: "General Sans", sans-serif;
        }
        #confirm-export:disabled {
          background: #d1d1c7;
          cursor: not-allowed;
          opacity: 0.6;
        }
      </style>
      <div class="key-warning-backdrop"></div>
      <div class="key-warning-box">
        <h2>Download Security Keys</h2>
        <p>
          Your keys are required to decrypt your data. 
          Save them securely; we cannot recover them for you.
        </p>

        <div class="countdown-container">
          Automatic download in <span id="key-export-countdown">10</span> seconds
        </div>

        <button id="download-keys-now">Download keys now</button>

        <label class="confirm-download">
          <input type="checkbox" id="confirm-downloaded" />
          <span>I have saved my keys securely</span>
        </label>

        <button id="confirm-export" disabled>
          Continue
        </button>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const countdownEl = document.getElementById("key-export-countdown");
  const downloadBtn = document.getElementById("download-keys-now");
  const confirmCheckbox = document.getElementById("confirm-downloaded");
  const confirmBtn = document.getElementById("confirm-export");

  let seconds = 10;

  const timer = setInterval(() => {
    seconds--;
    if (countdownEl) countdownEl.textContent = seconds;

    if (seconds <= 0) {
      clearInterval(timer);
      exportKeysAsZip(); // Trigger auto-download
    }
  }, 1000);

  downloadBtn.onclick = () => {
    clearInterval(timer); // Stop the auto-timer if user clicks manually
    exportKeysAsZip();
    if (countdownEl) countdownEl.parentElement.textContent = "Download started";
  };

  confirmCheckbox.onchange = () => {
    confirmBtn.disabled = !confirmCheckbox.checked;
  };

  confirmBtn.onclick = async () => {
    clearInterval(timer); // Stop timer just in case
    await acknowledgeKeyExport();
    overlay.remove();
  };
}

async function acknowledgeKeyExport() {
  await fetch("/keys-exported", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
}


async function triggerKeyExportAndAcknowledge() {
  try {
    await exportKeysAsZip();

    await fetch("/keys-exported", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    document.getElementById("key-warning-overlay")?.remove();
  } catch (err) {
    console.error("Key export failed:", err);
    alert(
      "Failed to export keys. Without these keys, your data cannot be recovered."
    );
  }
}

function showKeysLostModal() {
  let overlay = document.getElementById("keys-lost-overlay");
  if (overlay) return;

  overlay = document.createElement("div");
  overlay.id = "keys-lost-overlay";
  overlay.innerHTML = `
    <div class="key-warning-backdrop">
      <div class="key-warning-box danger">
        <h2>Encryption keys missing</h2>
        <p>
          Your private encryption keys are no longer available on this device
          and were never backed up.
        </p>
        <p>Because this app uses end-to-end encryption:</p>
        <ul>
          <li>Your encrypted credentials cannot be decrypted</li>
          <li>The server cannot recover your keys</li>
        </ul>
        <p>
          You must delete your account to continue.
        </p>

        <div class="danger-actions">
          <button id="delete-account-btn">Delete account</button>
          <button id="sign-out-btn">Sign out</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("delete-account-btn").onclick = () => {
    const deleteBtn = document.getElementById("del-account");

    if (!deleteBtn) {
      alert(
        "Account deletion is not available yet. Please open the dashboard menu first."
      );
      return;
    }

    // Trigger existing, trusted delete flow
    deleteBtn.click();
  };

  document.getElementById("sign-out-btn").onclick = () => {
    window.location.href = "/logout";
  };
}



async function assertLocalKeysExist() {
  const db = await openDatabase();
  const tx = db.transaction(["keys"], "readonly");
  const store = tx.objectStore("keys");

  const privateKeyReq = store.get("privateKey");
  const publicKeyReq = store.get("publicKey");

  return new Promise((resolve, reject) => {
    privateKeyReq.onsuccess = () => {
      publicKeyReq.onsuccess = async () => {
        if (!privateKeyReq.result || !publicKeyReq.result) {
          await showAlertBox(
            "Encryption keys not found on this device. Without these keys, your credentials cannot be decrypted."
          );
          reject(new Error("LOCAL_KEYS_MISSING"));
        } else {
          resolve(true);
        }
      };
    };

    privateKeyReq.onerror = publicKeyReq.onerror = async () => {
      await showAlertBox(
        "Failed to access encryption keys. Please reload the page or try again."
      );
      reject(new Error("KEY_STORAGE_READ_FAILED"));
    };
  });
}


