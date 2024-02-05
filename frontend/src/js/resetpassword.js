const resetPasswordForm = document.getElementById("resetPasswordForm");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const resetPasswordButton = document.getElementById("resetPasswordButton");

resetPasswordButton.addEventListener("click", async function () {
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (newPassword !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  const requestId = window.location.pathname.split("/").pop();

  try {
    const response = await axios.post(
      `http://localhost:3000/api/password/updatepassword/${requestId}`,
      {
        newPassword,
      }
    );

    if (response.status === 200) {
      const result = response.data;
      alert(result.message);
      // Redirect or perform any other action as needed after successful password update
    } else {
      console.error("Error updating password:", response.status);
      // Handle error scenarios
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    // Handle unexpected errors
  }
});
