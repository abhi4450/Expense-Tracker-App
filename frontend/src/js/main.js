const commonHeaders = {
  Authorization: localStorage.getItem("token"),
  // Add any other common headers here
};

const expenseInput = document.querySelector("#exp");
const descInput = document.querySelector("#desc");
const catInput = document.querySelector("#category");
const addButton = document.querySelector("#addExp");
const listItem = document.querySelector("#itemList");

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const premiummembership = localStorage.getItem("ispremiumUser");
    if (premiummembership) {
      displayPremiumFeature();
      showLeaderBoardToPremiumUsers();
    }
    result = await fetchExpenses();
    if (result.success) {
      if (result.status === 200) {
        console.log(result.data.expenses);
        displayExpenses(result.data.expenses);
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
});

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
        const resp = await fetchExpenses();
        await displayExpenses(resp.data.expenses);
      } else {
        console.warn("Unexpected status code:", result.status);
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error);
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

async function fetchExpenses() {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/expense/getExpenses",

      {
        headers: commonHeaders,
      }
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
        } catch {
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
      {
        headers: commonHeaders,
      }
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
    // razorpayInstance.on("payment.failed", async function (response) {
    //   if (response.error.code === "BAD_REQUEST_ERROR") {
    //     await axios.post(
    //       "http://localhost:3000/purchase/updatetransactionstatus",
    //       {
    //         order_id: order.id,
    //         payment_id: response.razorpay_payment_id,
    //       },
    //       { headers: commonHeaders }
    //     );
    //   }
    // });
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
  // You can choose to remove the button if needed
  msgDiv.append(premiumMessage);
}

// function showLeaderBoardToPremiumUsers() {
//   const leaderboardButton = document.createElement("button");
//   const containerElement = document.querySelector("#leaderboard");
//   const newDivElement = document.createElement("div");
//   let table = document.createElement("table");
//   let tableBody = document.createElement("tbody");
//   let tableHead = document.createElement("thead");
//   let headerRow = tableHead.insertRow();
//   let nameHeader = document.createElement("th");
//   let expenseHeader = document.createElement("th");

//   newDivElement.classList.add("text-center", "mt-3");
//   leaderboardButton.type = "button";
//   leaderboardButton.textContent = "Show Leaderboard";
//   leaderboardButton.classList.add("btn", "btn-warning", "btn-lg");
//   newDivElement.append(leaderboardButton);
//   containerElement.append(newDivElement);

//   let isLeaderboardVisible = false;

//   // Set header text
//   nameHeader.textContent = "Name";
//   expenseHeader.textContent = "Total Expense";

//   // Append header cells to the header row
//   headerRow.appendChild(nameHeader);
//   headerRow.appendChild(expenseHeader);

//   // Append the header to the table
//   tableHead.appendChild(headerRow);
//   table.appendChild(tableHead);

//   leaderboardButton.addEventListener("click", async () => {
//     isLeaderboardVisible = !isLeaderboardVisible;

//     if (isLeaderboardVisible) {
//       // Make a GET request to fetch leaderboard data
//       try {
//         const leaderboardResponse = await axios.get(
//           "http://localhost:3000/premium/showleaderboard",
//           { headers: commonHeaders }
//         );

//         const leaderboardData = leaderboardResponse.data;

//         // Clear previous table content
//         tableBody.innerHTML = "";

//         // Assuming the leaderboardData is an array of objects
//         leaderboardData.forEach((user) => {
//           const row = tableBody.insertRow();
//           const nameCell = row.insertCell(0);
//           const expenseCell = row.insertCell(1);

//           nameCell.textContent = user.name;
//           expenseCell.textContent = user.total_cost;
//         });

//         table.appendChild(tableBody);
//         table.classList.add("table", "table-bordered", "mt-3");
//         containerElement.appendChild(table);
//       } catch (error) {
//         console.error("Error fetching leaderboard data:", error);
//       }
//     } else {
//       // Clear the table when hiding it
//       tableBody.innerHTML = "";
//     }
//   });
// }

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

  // Set the crown icon properties
  crownIcon.src = "../src/assets/crown.png"; // Replace with the actual path to your crown icon
  crownIcon.alt = "Crown Icon";
  crownIcon.width = 60; // Set the desired width
  crownIcon.height = 60;
  crownIcon.classList.add("crown-icon", "me-2"); // Add a class for styling if needed

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

        // Clear previous table content
        tableBody.innerHTML = "";

        // Assuming the leaderboardData is an array of objects
        leaderboardData.forEach((user) => {
          const row = tableBody.insertRow();
          row.classList.add("text-center");
          const nameCell = row.insertCell(0);
          const expenseCell = row.insertCell(1);

          nameCell.textContent = user.name;
          expenseCell.textContent = user.total_cost;
        });

        table.appendChild(tableBody);
        table.classList.add("table", "table-bordered", "mt-3");
        containerElement.appendChild(colDiv);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    } else {
      // Clear the table when hiding it
      table.innerHTML = "";
    }
  });
}

// function showLeaderBoardToPremiumUsers() {
//   const leaderboardButton = document.createElement("button");
//   const containerElement = document.querySelector("#leaderboard");
//   const newDivElement = document.createElement("div");
//   let items = document.createElement("ul");
//   newDivElement.classList.add("text-center", "mt-3");
//   leaderboardButton.type = "button";
//   leaderboardButton.textContent = "Show Leaderboard"; // Set the button text
//   leaderboardButton.classList.add("btn", "btn-warning", "btn-lg"); // Add button classes
//   newDivElement.append(leaderboardButton);
//   containerElement.append(newDivElement);

//   const colDiv = document.createElement("div");
//   colDiv.classList.add("col-auto", "col-md-6","m-auto");
//   colDiv.append(items);
//   let isLeaderboardVisible = false;
//   leaderboardButton.addEventListener("click", async () => {
//     isLeaderboardVisible = !isLeaderboardVisible;

//     if (isLeaderboardVisible) {
//       // Make a GET request to fetch leaderboard data
//       try {
//         const leaderboardResponse = await axios.get(
//           "http://localhost:3000/premium/showleaderboard",
//           { headers: commonHeaders }
//         );

//         const leaderboardData = leaderboardResponse.data;

//         items.classList.add("list-group", "mt-3");
//         containerElement.append(colDiv);
//         // Assuming the leaderboardData is an array of objects
//         leaderboardData.forEach((user) => {
//           const leaderboardItem = document.createElement("li");
//           leaderboardItem.classList.add(
//             "list-group-item",
//             "list-group-item-warning",
//             "text-center"
//           );
//           leaderboardItem.textContent = `Name: ${user.name} - Total Expense: ${user.total_cost}`;
//           items.append(leaderboardItem);
//         });
//       } catch (error) {
//         console.error("Error fetching leaderboard data:", error);
//       }
//     } else {
//       // Clear the leaderboard when hiding it
//       items.innerHTML = "";
//     }
//   });
// }
