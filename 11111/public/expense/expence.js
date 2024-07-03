const expenseForm = document.getElementById("expenseForm");
const expenseTableBody = document.getElementById("expenseTableBody");
const pagination = document.getElementById("pagination");


document.addEventListener("DOMContentLoaded", async () => {
    checkPremium();
    const page = 1;
    const rowsPerPage = localStorage.getItem('rowsPerPage');
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://13.60.36.173:3000/user/expenses?page=${page}&rows=${rowsPerPage}`, {
        headers: { "Authorization": token }
    })
    // console.log(response);
    if (response) {
        response.data.expenses.forEach(expense => {
            addExpenseToTable(expense);
        })
    }
    showPagination(response.data.pagination);
});

async function setNoOfRows(e) {
    e.preventDefault();
    const rowsPerPage = document.querySelector('.rowsPerPage').value;
    // console.log(rowsPerPage);
    localStorage.setItem('rowsPerPage', rowsPerPage);
    page = 1;
    loadExpenses(page, rowsPerPage)
}

async function loadExpenses(page, rows) {
    try {
        expenseTableBody.innerHTML = '';
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://13.60.36.173:3000/user/expenses?page=${page}&rows=${rows}`, {
            headers: { "Authorization": token }
        })
        // console.log(response);
        if (response) {
            response.data.expenses.forEach(expense => {
                addExpenseToTable(expense);
            })
        }
        showPagination(response.data.pagination);
    } catch (err) {
        console.log(err);
    }
}

async function showPagination({ currentPage, hasPrevPage, hasNextPage, nextPage, previousPage, lastPage }) {
    pagination.innerHTML = '';
    const rows = localStorage.getItem('rowsPerPage');
    if (hasPrevPage) {
        const btn2 = document.createElement('button')
        btn2.innerHTML = previousPage
        btn2.addEventListener('click', () => loadExpenses(previousPage, rows))
        pagination.appendChild(btn2)
    }

    const btn1 = document.createElement('button')
    btn1.innerHTML = `<h3>${currentPage}</h3>`
    btn1.addEventListener('click', () => loadExpenses(currentPage, rows))
    pagination.appendChild(btn1)

    if (hasNextPage) {
        const btn3 = document.createElement('button')
        btn3.innerHTML = nextPage
        btn3.addEventListener('click', () => loadExpenses(nextPage, rows))
        pagination.appendChild(btn3)
    }
}


async function addExpenseToTable(expense) {
    try {

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${expense.expenseName}</td>
            <td>${expense.expenseAmount}</td>
            <td>${expense.discription}</td>
            <td><button class="deleteBtn" data-id="${expense.id}">Delete</button></td>
        `;
        row.querySelector(".deleteBtn").addEventListener("click", () => {
            deleteExpense(expense.id);
            row.remove();
        });
        expenseTableBody.appendChild(row);
    } catch (err) {
        console.log('problem while adding expence to the table');
    }
}

async function deleteExpense(id) {
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://13.60.36.173:3000/user/expense/${id}`, {
            headers: { "Authorization": token }
        });

        loadExpenses();
    } catch (error) {
        console.log(error);
    }
}

async function handleSubmit(event) {
    event.preventDefault();
    try {
        const expenseName = document.getElementById("expenseName").value;
        const expenseAmount = document.getElementById("expenseAmount").value;
        const discription = document.getElementById("discription").value;
        const expense = { expenseName, expenseAmount, discription };
        const token = localStorage.getItem('token');
        const response = await axios.post('http://13.60.36.173:3000/user/expense', expense, {
            headers: { "Authorization": token }
        });
        addExpenseToTable(response.data.newExpense);
        expenseForm.reset();
    } catch (err) {
        console.log(err);
    }
}

async function checkPremium() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://13.60.36.173:3000/user/checkPremium', {
            headers: { "Authorization": token }
        });
        if (response.data.isPremium) {
            showPremium();
        }
    } catch (error) {
        console.log(error);
    }

}
async function showPremium() {
    document.getElementById('rzp-button1').style.visibility = "hidden";
    document.getElementById('message').innerHTML = "you are a premium user";
    showLeaderbord();
}


async function showLeaderbord() {
    const inputElement = document.createElement("input");
    inputElement.type = "button";
    inputElement.value = "Show Leaderboard";
    inputElement.onclick = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://13.60.36.173:3000/premium/showLeaderBoard', {
                headers: { "Authorization": token }
            });
            // console.log(response);

            var leaderboardElem = document.getElementById("leaderboard");
            if (!leaderboardElem) {
                console.error('Element with ID "leaderboard" not found');
                return;
            }

            leaderboardElem.innerHTML = '<h1>Leader Board</h1>';
            response.data.forEach((userDetails) => {
                leaderboardElem.innerHTML += `<li>Name-${userDetails.userName} Total Expense-${userDetails.totalExpense || 0}</li>`;
            });
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            alert('Failed to load leaderboard');
        }
    };

    const messageElem = document.getElementById("message");
    if (!messageElem) {
        console.error('Element with ID "message" not found');
        return;
    }

    messageElem.appendChild(inputElement);
}


document.getElementById('rzp-button1').onclick = async function (e) {
    e.preventDefault();
    try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://13.60.36.173:3000/purchase/preminummembership', { headers: { "Authorization": token } });
        // console.log(response);
        var options = {
            "key": response.data.key_id,
            "order_id": response.data.order.id,
            "handler": async function (response) {
                await axios.post('http://13.60.36.173:3000/purchase/updatetransactionstatus', {
                    order_id: options.order_id,
                    payment_id: response.razorpay_payment_id,
                }, { headers: { "Authorization": token } });
                console.log('after handler');
                alert('you are premium user');
                showPremium();
            }
        }
        var rzp1 = new Razorpay(options);
        rzp1.open();
    } catch (err) {
        console.log(err)
    }
}


async function getReport() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://13.60.36.173:3000/premium/report', {
            headers: { "Authorization": token }
        });

        displayReport(response.data);
    } catch (error) {
        console.error(error);
    }
}

function displayReport(data) {
    const weekExpenses = document.getElementById("weekExpenses");
    const monthExpenses = document.getElementById("monthExpenses");
    const yearExpenses = document.getElementById("yearExpenses");

    weekExpenses.innerHTML = '';
    data.weekly.forEach(expense => {
        const li = document.createElement("li");
        li.textContent = `${expense.expenseName}: $${expense.expenseAmount}`;
        weekExpenses.appendChild(li);
    });

    monthExpenses.innerHTML = '';
    data.monthly.forEach(expense => {
        const li = document.createElement("li");
        li.textContent = `${expense.expenseName}: $${expense.expenseAmount}`;
        monthExpenses.appendChild(li);
    });

    yearExpenses.innerHTML = '';
    data.yearly.forEach(expense => {
        const li = document.createElement("li");
        li.textContent = `${expense.expenseName}: $${expense.expenseAmount}`;
        yearExpenses.appendChild(li);
    });
}


async function downloadExpense() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://13.60.36.173:3000/user/report', {
            headers: { "Authorization": token }
        });
        console.log(response.data.pastDownloads);
        if (response) {
            var a = document.createElement('a');
            a.href = response.data.fileURL;
            a.download = 'expense.csv';
            a.click();
            showFileUrls(response.data.pastDownloads)
        }
    } catch (err) {
        console.log(err);
    }

}
async function showFileUrls(data) {
    try {
        var fileUrlElem = document.getElementById("fileUrl");
        fileUrlElem.innerHTML = '<h1>Past Downloads</h1>';
        data.forEach((url) => {
            fileUrlElem.innerHTML += `<li>${url.fileURL}</li>`;
        })
    }
    catch (err) {
        console.log(err);
    }
}