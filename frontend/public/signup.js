/**********DOM For Sign UP**************/

const signupButton = document.getElementById("signup");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#pass");
const newDiv = document.querySelector("#msg");

signupButton.addEventListener("click", userSignupHandler);

async function userSignupHandler(event) {
  event.preventDefault();

  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;

  const userData = {
    name: name,
    email: email,
    password: password,
  };
  try {
    const result = await storeUserToBackend(userData);
    if (result.success) {
      if (result.status === 201) {
        console.log("Newly created User :", result.data.user);
        alert(result.data.message);
      } else {
        console.warn("Unexpected status code:", result.status);
      }
    } else {
      if (result.status === 400) {
        newDiv.innerText = `${result.error}`;
      } else {
        console.warn("Unexpected status code:", result.status);
      }
    }
  } catch (error) {
    console.error("Unexpected error:", err);
  }
}

async function storeUserToBackend(userData) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/user/signup",
      userData
    );
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response.data.message,
      status: error.response.status,
    };
  }
}
