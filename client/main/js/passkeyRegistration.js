
const registrationPasskeyBtn = document.getElementById("passkey-registration-btn");
registrationPasskeyBtn.addEventListener('click', async e => {
  const response = await fetch('/register-passkey', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  });
  const result = await response.json();
  const passkeyAuthResult = await SimpleWebAuthnBrowser.startRegistration(result.options);
  const verificationResult = await fetch('/verify-passkey', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({cred:passkeyAuthResult})
  });
  const verificationResultJson = await verificationResult.json();

  if(verificationResultJson.verified && verificationResultJson){
    console.log("successfully verified!")
    await showAlertBox("Passkey registered and verified successfully o(￣▽￣)K")
  }else{
    await showAlertBox("Something went wrong with passkey registration");
  }
})