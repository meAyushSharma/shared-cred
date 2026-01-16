document.getElementById('login-form').addEventListener('submit', async e=>{
    e.preventDefault();
    const username = document.getElementById('login-username').value.toLowerCase().trim();
    const password = document.getElementById('login-password').value;
    const response = await fetch('/login', {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
        },
        "body": JSON.stringify({
            username:username,
            password:password
        })
    });
    if(response.redirected){
        console.log("told to be redirected to: ", response.url);
        window.location.href = response.url;
    }else{
        window.location.reload();
    }
})

document.getElementById("passkey-login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  // 1. Ask server for generic auth options
  const response = await fetch("/login-passkey", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  const { options } = await response.json();

  // 2. Browser handles passkey selection (or failure)
  const authenticationResult =
    await SimpleWebAuthnBrowser.startAuthentication(options);

  // 3. Send assertion back — server infers user from credential ID
  const verificationResult = await fetch("/verify-login-passkey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cred: authenticationResult
    })
  });

  if (!verificationResult.ok) {
    const text = await verificationResult.text();
    throw new Error(text);
  }

  const verificationResponse = await verificationResult.json();

  if (verificationResponse.verified) {
    window.location.href = "/";
  } else {
    alert("Passkey verification failed.");
  }
});


const loginPwd = document.getElementById("login-password");
const toggleLoginPwd = document.getElementById("toggle-login-password");

toggleLoginPwd.addEventListener("change", () => {
  loginPwd.type = toggleLoginPwd.checked ? "text" : "password";
});


document.getElementById('forgot-pass-btn').addEventListener('click', async (e) => {
    window.location.href = '/forgot-password';
})


document.addEventListener("DOMContentLoaded", async () => {
  if (!window.PublicKeyCredential) return;

  try {
    // Small delay so UI paints first
    setTimeout(() => {
      document.getElementById("passkey-submit")?.click();
    }, 300);
  } catch (e) {
    console.log("Passkey auto-start skipped:", e);
  }
});
