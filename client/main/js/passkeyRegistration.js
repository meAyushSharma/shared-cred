const registrationPasskeyBtn = document.getElementById("passkey-registration-btn");

registrationPasskeyBtn.addEventListener("click", async () => {
  // prevent double submission
  registrationPasskeyBtn.disabled = true;

  try {
    if (!window.PublicKeyCredential) {
      await showAlertBox("Passkeys are not supported on this device or browser.");
      return;
    }

    // 1. Ask server for registration options
    const response = await fetch("/register-passkey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to generate passkey options");
    }

    const { options } = await response.json();

    // 2. Browser handles passkey creation
    const passkeyAuthResult =
      await SimpleWebAuthnBrowser.startRegistration(options);

    // 3. Verify with server
    const verificationResponse = await fetch("/verify-passkey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cred: passkeyAuthResult }),
    });

    if (!verificationResponse.ok) {
      throw new Error("Passkey verification failed");
    }

    const verificationResult = await verificationResponse.json();

    if (verificationResult.verified === true) {
      await showAlertBox("Passkey registered successfully.");
    } else {
      await showAlertBox("Could not verify passkey. Please try again.");
    }
  } catch (err) {
    console.error("Passkey registration error:", err);
    await showAlertBox("Passkey registration was cancelled or failed.");
  } finally {
    registrationPasskeyBtn.disabled = false;
  }
});
