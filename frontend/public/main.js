const commonHeaders = {
  Authorization: localStorage.getItem("token"),
};

const expenseInput = document.querySelector("#exp");
const descInput = document.querySelector("#desc");
const catInput = document.querySelector("#category");
const addButton = document.querySelector("#addExp");
const listItem = document.querySelector("#itemList");
const downloadFileButton = document.querySelector("#downloadFile");
const paginationContainer = document.querySelector("#pagination");
let currentPage = 1;
const limit = 4;
// Function to get the user's preference from local storage
function getExpensesPerPagePreference() {
  const preference = localStorage.getItem("expensesPerPage");
  console.log("received from localStorage", preference);
  // If preference exists, return it, otherwise return a default value
  return preference ? parseInt(preference) : limit; // Default value is 4 expenses per page
}

// Use the user's preference to display the appropriate number of expenses
const expensesPerPage = getExpensesPerPagePreference();

const logoutButton = document.querySelector("#logoutButton");
logoutButton.addEventListener("click", (event) => {
  localStorage.removeItem("token");
  localStorage.removeItem("ispremiumUser");
  window.location.href = "http://localhost:3000/api/user/loginPage";
});

window.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch user data to get the username
    const userData = await fetchUserData();
    if (userData.success) {
      const username = userData.data.username;
      // Display the username in the navbar
      const usernameElement = document.getElementById("username");
      if (usernameElement) {
        usernameElement.textContent = username;
      }
    } else {
      console.error("Failed to fetch user data:", userData.error);
    }

    downloadFileButton.addEventListener("click", handleDownload);
    const premiummembership = localStorage.getItem("ispremiumUser");
    if (!premiummembership) {
      downloadFileButton.disabled = true;
    } else {
      displayPremiumFeature();
      showLeaderBoardToPremiumUsers();
      downloadFileButton.disabled = false;
    }

    // Fetch and display expenses for the first page when the page loads
    const result = await fetchExpenses(currentPage, expensesPerPage);
    if (result.success) {
      if (result.status === 200) {
        displayExpenses(result.data.expenses);
        // Create pagination buttons
        createPaginationButtons(
          result.data.currentPage,
          result.data.totalPages
        );
        // Update current page and total pages in UI
        updatePageInfo(result.data.currentPage, result.data.totalPages);
      }
    }
    // Add event listener for changing expenses per page preference
    const expensesPerPageSelect = document.getElementById("expensesPerPage");
    expensesPerPageSelect.addEventListener("change", async () => {
      const selectedValue = expensesPerPageSelect.value;
      localStorage.setItem("expensesPerPage", selectedValue);
    });
  } catch (error) {
    console.error("Unexpected error:", error);
  }
});

async function fetchUserData() {
  try {
    const response = await axios.get("http://localhost:3000/api/user/data", {
      headers: commonHeaders,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response.data.message };
  }
}

addButton.addEventListener("click", expenseHandler);

async function expenseHandler(event) {
  event.preventDefault();

  const expense_amount = expenseInput.value;
  const description = descInput.value;
  const category = catInput.value;

  const expenseData = {
    expense_amount: expense_amount,
    description: description,
    category: category,
  };
  try {
    const result = await saveExpensesToBackend(expenseData);
    if (result.success) {
      if (result.status === 201) {
        // After adding an expense, fetch and display expenses for the current page
        const resp = await fetchExpenses(currentPage);
        await displayExpenses(resp.data.expenses);
        // Update pagination buttons
        createPaginationButtons(resp.data.currentPage, resp.data.totalPages);
      } else {
        console.warn("Unexpected status code:", result.status);
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Function to update current page and total pages in UI
function updatePageInfo(currentPage, totalPages) {
  const pageText = document.querySelector(".page-text");
  if (pageText) {
    pageText.textContent = `${currentPage}/${totalPages}`;
  }
}

async function saveExpensesToBackend(expenseData) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/expense/addexpense",
      expenseData,
      { headers: commonHeaders }
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

async function fetchExpenses(page, expensesPerPage) {
  try {
    const response = await axios.get(
      `http://localhost:3000/api/expense/getExpenses?page=${page}&limit=${expensesPerPage}`,
      { headers: commonHeaders }
    );
    console.log("Fetched expenses:", response.data); // Add this line for debugging
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response.data.message,
      status: error.response.status,
    };
  }
}

async function displayExpenses(expenses) {
  if (expenses.length > 0) {
    listItem.innerHTML = "";

    expenses.forEach((expense) => {
      const newli = document.createElement("li");
      newli.classList.add(
        "list-group-item",
        "list-group-item-light",
        "text-center"
      );

      const spanElement = document.createElement("span");
      spanElement.classList.add("float-start");
      spanElement.innerHTML = `&#9997;`;
      newli.append(spanElement);

      newli.append(
        `${expense.expense_amount}-${expense.description}-${expense.category}`
      );

      const deleteButton = document.createElement("button");
      deleteButton.classList.add(
        "btn",
        "btn-outline-danger",
        "btn-sm",
        "ms-2",
        "float-end",
        "delete"
      );
      deleteButton.innerText = "Delete";

      newli.appendChild(deleteButton);
      listItem.append(newli);

      deleteButton.addEventListener("click", async () => {
        try {
          const result = await deleteExpense(expense.id);
          if (result.success) {
            deleteButton.parentElement.remove();
            console.log(result.message);
          }
        } catch (error) {
          console.log(error);
        }
      });
    });
  } else {
    const headingElement = document.createElement("p");
    headingElement.textContent = "No Expenses To Show.";
    headingElement.classList.add("text-center", "my-3", "h5");
    listItem.append(headingElement);
  }
}

async function deleteExpense(expenseId) {
  try {
    const response = await axios.delete(
      `http://localhost:3000/api/expense/deleteExpense/${expenseId}`,
      { headers: commonHeaders }
    );
    return { success: true, message: "Item deleted successfully" };
  } catch (error) {
    return {
      success: false,
      error: error.response.data.message,
      status: error.response.status,
    };
  }
}

paginationContainer.addEventListener("click", async (event) => {
  if (event.target.classList.contains("page-link")) {
    let clickedPage;

    if (event.target.id === "nextPage") {
      currentPage++;
      clickedPage = currentPage;
    } else if (event.target.id === "prevPage") {
      currentPage--;
      clickedPage = currentPage;
    } else {
      clickedPage = parseInt(event.target.textContent);
    }

    const resp = await fetchExpenses(clickedPage, expensesPerPage);
    await displayExpenses(resp.data.expenses);
    togglePaginationButtons(clickedPage, resp.data.totalPages);
    updatePageInfo(clickedPage, resp.data.totalPages);
  }
});

function createPaginationButtons(currentPage, totalPages) {
  paginationContainer.innerHTML = "";

  const prevPageButton = document.createElement("button");
  prevPageButton.id = "prevPage";
  prevPageButton.classList.add("btn", "btn-primary", "page-link", "me-2");
  prevPageButton.textContent = "<";

  paginationContainer.appendChild(prevPageButton);

  const pageText = document.createElement("span");

  pageText.textContent = `${currentPage} / ${totalPages}`;
  pageText.classList.add("page-text", "fs-4");
  paginationContainer.appendChild(pageText);

  const nextPageButton = document.createElement("button");
  nextPageButton.id = "nextPage";
  nextPageButton.classList.add("btn", "btn-primary", "page-link", "ms-2");
  nextPageButton.textContent = ">";

  paginationContainer.appendChild(nextPageButton);

  const expensesPerPageSelect = document.createElement("select");
  expensesPerPageSelect.classList.add("ms-2", "text-wrap");
  expensesPerPageSelect.id = "expensesPerPage";
  expensesPerPageSelect.innerHTML = `
    <option value="">select expenses per page</option>
       <option value="5">5 Expenses</option>
       <option value="10">10 Expenses</option>
       <option value="20">20 Expenses</option>
       <option value="30">30 Expenses</option>
       <option value="40">40 Expenses</option>
     `;
  paginationContainer.appendChild(expensesPerPageSelect);

  togglePaginationButtons(currentPage, totalPages);
}

function togglePaginationButtons(currentPage, totalPages) {
  const prevPageButton = document.querySelector("#prevPage");
  const nextPageButton = document.querySelector("#nextPage");

  if (prevPageButton && nextPageButton) {
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
  }
}

/***********razorpay**************/
const rzpButton = document.querySelector("#rzp-button");

rzpButton.addEventListener("click", paymentHandler);

async function paymentHandler(event) {
  try {
    const response = await axios.get(
      "http://localhost:3000/purchase/premiummembership",
      {
        headers: commonHeaders,
      }
    );

    const { key_id, order } = response.data;

    const options = {
      key: key_id,
      order_id: order.id,
      handler: async function (response) {
        try {
          const updateResponse = await axios.post(
            "http://localhost:3000/purchase/updatetransactionstatus",
            {
              order_id: order.id,
              payment_id: response.razorpay_payment_id,
            },
            { headers: commonHeaders }
          );

          if (
            updateResponse.data.success &&
            updateResponse.data.ispremiumuser
          ) {
            localStorage.setItem(
              "ispremiumUser",
              updateResponse.data.ispremiumuser
            );
            displayPremiumFeature();
            showLeaderBoardToPremiumUsers();
            console.log("Transaction Successful");
          }
        } catch (error) {
          console.error("Error updating transaction status:", error);
          alert("An error occurred. Please try again.");
        }
      },
    };
    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();
    event.preventDefault();
    razorpayInstance.on("payment.failed", async function (response) {
      if (response.error.code === "BAD_REQUEST_ERROR") {
        try {
          const updateFailedResponse = await axios.post(
            "http://localhost:3000/purchase/updatetransactionstatus",
            {
              order_id: order.id,
              payment_id: response.razorpay_payment_id,
            },
            { headers: commonHeaders }
          );
        } catch (error) {
          localStorage.setItem("ispremiumUser", false);
          console.log("Transaction Failed");
          alert("Transaction Failed. Please try again.");
          console.error("Transaction request declined>>>>>>>>", error);
        }
      }
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    alert("An error occurred while initiating payment. Please try again.");
  }
}

function displayPremiumFeature() {
  if (rzpButton) {
    rzpButton.style.display = "none";
  }
  const premiumMessage = document.createElement("p");
  premiumMessage.textContent = "You are a Premium User!";
  premiumMessage.classList.add(
    "text-success",
    "fw-bold",
    "mt-3",
    "text-center"
  );

  const msgDiv = document.querySelector("#msg");

  msgDiv.append(premiumMessage);
}

function showLeaderBoardToPremiumUsers() {
  const leaderboardButton = document.createElement("button");
  const containerElement = document.querySelector("#leaderboard");
  const newDivElement = document.createElement("div");
  let table = document.createElement("table");
  let tableBody = document.createElement("tbody");
  let tableHead = document.createElement("thead");
  let headerRow = tableHead.insertRow();
  let nameHeader = document.createElement("th");
  let expenseHeader = document.createElement("th");

  table.classList.add("table", "table-success", "table-striped");

  newDivElement.classList.add("text-center", "mt-3");
  leaderboardButton.type = "button";

  const crownIcon = document.createElement("img");

  crownIcon.src = "/assets/crown.png";
  crownIcon.alt = "Crown Icon";
  crownIcon.width = 60;
  crownIcon.height = 60;
  crownIcon.classList.add("crown-icon", "me-2");

  newDivElement.classList.add("text-center", "mt-3");
  leaderboardButton.type = "button";

  leaderboardButton.classList.add("btn", "btn-light", "btn-lg", "lead");
  // Add the crown icon before the text content of the button
  leaderboardButton.appendChild(crownIcon);
  leaderboardButton.appendChild(document.createTextNode("Show Leaderboard"));

  newDivElement.append(leaderboardButton);
  containerElement.append(newDivElement);

  const colDiv = document.createElement("div");
  colDiv.classList.add("col-auto", "col-md-6", "m-auto");
  colDiv.append(table);

  let isLeaderboardVisible = false;

  leaderboardButton.addEventListener("click", async () => {
    isLeaderboardVisible = !isLeaderboardVisible;

    if (isLeaderboardVisible) {
      // Make a GET request to fetch leaderboard data
      try {
        const leaderboardResponse = await axios.get(
          "http://localhost:3000/premium/showleaderboard",
          { headers: commonHeaders }
        );

        const leaderboardData = leaderboardResponse.data;

        tableBody.innerHTML = "";
        // Set header text
        nameHeader.textContent = "Name";
        expenseHeader.textContent = "Total Expense";

        // Add a class to center the text in th elements
        nameHeader.classList.add("text-center");
        expenseHeader.classList.add("text-center");

        // Append header cells to the header row
        headerRow.appendChild(nameHeader);
        headerRow.appendChild(expenseHeader);

        // Append the header to the table
        tableHead.appendChild(headerRow);
        table.appendChild(tableHead);

        leaderboardData.forEach((user) => {
          const row = tableBody.insertRow();
          row.classList.add("text-center");
          const nameCell = row.insertCell(0);
          const expenseCell = row.insertCell(1);

          nameCell.textContent = user.name;
          expenseCell.textContent = user.total_expense;
        });

        table.appendChild(tableBody);
        table.classList.add("table", "table-bordered", "mt-3");
        containerElement.appendChild(colDiv);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    } else {
      table.innerHTML = "";
    }
  });
}

async function handleDownload() {
  try {
    let response = await axios.get("http://localhost:3000/api/user/download", {
      headers: commonHeaders,
    });
    if (response.status === 200) {
      const { fileURL, filename } = response.data;

      const a = document.createElement("a");
      a.href = fileURL;
      a.download = filename;
      a.click();
      a.remove();
      displayDownloadedFiles();
    }
  } catch (error) {
    console.log(error);
  }
}

async function displayDownloadedFiles() {
  try {
    let response = await axios.get(
      "http://localhost:3000/api/user/downloadedFiles",
      {
        headers: commonHeaders,
      }
    );
    if (response.status === 200) {
      const files = response.data.Allfiles;
      const list = document.querySelector("#downloaedFileList");

      list.innerHTML = "";

      files.forEach((file) => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item");
        const anchor = document.createElement("a");

        anchor.href = file.fileUrl;

        anchor.textContent = `my-expense-list-link-downloaded on ${new Date(
          file.createdAt
        ).toLocaleDateString()}`;

        anchor.target = "_blank";

        listItem.appendChild(anchor);
        list.appendChild(listItem);
      });
    }
  } catch (error) {
    console.log(error);
  }
}
