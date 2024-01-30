// JavaScript (login.js)
const loginButton = document.querySelector("#login");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#pass");
const newDiv = document.querySelector("#msg");

loginButton.addEventListener("click", UserLoginHandler);

async function UserLoginHandler() {
  const email = emailInput.value;
  const password = passwordInput.value;

  const loginUserData = {
    email: email,
    password: password,
  };

  try {
    const result = await checkForUserInBackend(loginUserData);

    if (result.success) {
      if (result.status === 200) {
        alert(result.data.message);
        window.location.href = "index.html";
      } else {
        console.warn("Unexpected status code:", result.status);
      }
    } else {
      if (result.status === 401) {
        newDiv.innerText = `${result.error}`;
      } else if (result.status === 404) {
        newDiv.innerText = `${result.error}`;
      } else {
        console.warn("Unexpected status code:", result.status);
      }
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

async function checkForUserInBackend(loginUserData) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/user/login",
      loginUserData
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
