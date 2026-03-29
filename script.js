// ================= UI SWITCH =================
function showRegister() {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("registerSection").style.display = "block";
    document.getElementById("title").innerText = "Register";
}

function showLogin() {
    document.getElementById("registerSection").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("title").innerText = "Login";
}

// ================= REGISTER =================
function register() {
    let username = document.getElementById("regUsername").value;
    let password = document.getElementById("regPassword").value;
    let shopName = document.getElementById("shopName").value;

    if (!username || !password || !shopName) {
        alert("Fill all fields");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    let exists = users.find(u => u.username === username);
    if (exists) {
        alert("Username already exists");
        return;
    }

    users.push({ username, password, shopName });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registered successfully!");
    showLogin();
}

// ================= LOGIN =================
function login() {
    let username = document.getElementById("loginUsername").value;
    let password = document.getElementById("loginPassword").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    let user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid credentials");
    }
}

// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

// ================= NAVIGATION =================
function goTo(page) {
    window.location.href = page;
}

// ================= LOAD USER =================
let user = JSON.parse(localStorage.getItem("currentUser"));

if (!user && !window.location.pathname.includes("index.html")) {
    window.location.href = "index.html";
}

// Set shop name
let title = document.getElementById("shopTitle");
if (title && user) {
    title.innerText = user.shopName;
}

// ================= INVENTORY =================

// Add item
function addItem() {
    let name = document.getElementById("itemName").value.trim();
    let capacity = document.getElementById("capacity").value.trim();
    let price = document.getElementById("price").value;
    let qty = Number(document.getElementById("quantity").value);
    let mfg = document.getElementById("mfgDate").value;
    let exp = document.getElementById("expDate").value;

    let received = new Date().toLocaleDateString();

    if (!name || !capacity || !price || !qty || !mfg || !exp) {
        alert("Fill all fields");
        return;
    }

    let items = JSON.parse(localStorage.getItem(user.username + "_items")) || [];
    let refill = JSON.parse(localStorage.getItem(user.username + "_refill")) || [];

    let existing = items.find(i =>
        i.name.toLowerCase() === name.toLowerCase() &&
        i.capacity.toLowerCase() === capacity.toLowerCase()
    );

    if (!existing) {
        items.push({
            name,
            capacity,
            price: Number(price),
            qty,
            mfg,
            exp,
            received
        });
    } else {
        refill.push({
            name,
            capacity,
            price: Number(price),
            qty,
            mfg,
            exp,
            received
        });
    }

    localStorage.setItem(user.username + "_items", JSON.stringify(items));
    localStorage.setItem(user.username + "_refill", JSON.stringify(refill));

    displayItems();
}

// Display items
function displayItems() {
    let table = document.getElementById("inventoryTable");
    if (!table) return;

    let items = JSON.parse(localStorage.getItem(user.username + "_items")) || [];
    let refill = JSON.parse(localStorage.getItem(user.username + "_refill")) || [];

    table.innerHTML = `
        <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Capacity</th>
            <th>Price</th>
            <th>Qty</th>
            <th>MFG</th>
            <th>EXP</th>
            <th>Received</th>
            <th>Refill Qty</th>
            <th>Refill Exp</th>
            <th>Actions</th>
        </tr>
    `;

    items.forEach((item, index) => {

        let refillItem = refill.find(r =>
            r.name.toLowerCase() === item.name.toLowerCase() &&
            r.capacity.toLowerCase() === item.capacity.toLowerCase()
        );

        table.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.capacity}</td>
                <td>${item.price}</td>
                <td>${item.qty}</td>
                <td>${item.mfg}</td>
                <td>${item.exp}</td>
                <td>${item.received || "-"}</td>
                <td>${refillItem ? refillItem.qty : "-"}</td>
                <td>${refillItem ? refillItem.exp : "-"}</td>
                <td>
                    <button class="edit-btn" onclick="editItem(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteItem(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}

// Delete item
function deleteItem(index) {
    let items = JSON.parse(localStorage.getItem(user.username + "_items")) || [];
    items.splice(index, 1);
    localStorage.setItem(user.username + "_items", JSON.stringify(items));
    displayItems();
}

// Edit item
function editItem(index) {
    let items = JSON.parse(localStorage.getItem(user.username + "_items")) || [];
    let item = items[index];

    document.getElementById("itemName").value = item.name;
    document.getElementById("capacity").value = item.capacity;
    document.getElementById("price").value = item.price;
    document.getElementById("quantity").value = item.qty;
    document.getElementById("mfgDate").value = item.mfg;
    document.getElementById("expDate").value = item.exp;

    deleteItem(index);
}

// Auto load inventory
if (window.location.pathname.includes("inventory.html")) {
    displayItems();
}

// ================= BILLING =================

let billItems = [];

// Add to bill
function addToBill() {
    let name = document.getElementById("billItem").value.trim().toLowerCase();
    let capacity = document.getElementById("billCapacity").value.trim().toLowerCase();
    let qty = parseInt(document.getElementById("billQty").value);

    if (!name || !capacity || !qty) {
        alert("Fill all fields");
        return;
    }

    let items = JSON.parse(localStorage.getItem(user.username + "_items")) || [];

    let product = items.find(i =>
        i.name.toLowerCase() === name &&
        i.capacity.toLowerCase() === capacity
    );

    if (!product) {
        alert("Item not found");
        return;
    }

    if (qty > product.qty) {
        alert("Not enough stock");
        return;
    }

    let total = qty * product.price;

    billItems.push({
        name: product.name,
        capacity: product.capacity,
        qty,
        price: product.price,
        total
    });

    displayBill();
}

// Display bill
function displayBill() {
    let table = document.getElementById("billTable");
    if (!table) return;

    let grandTotal = 0;

    table.innerHTML = `
        <tr>
            <th>S.No</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
        </tr>
    `;

    billItems.forEach((item, index) => {
        grandTotal += item.total;

        table.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name} (${item.capacity})</td>
                <td>${item.qty}</td>
                <td>${item.price}</td>
                <td>${item.total}</td>
            </tr>
        `;
    });

    document.getElementById("grandTotal").innerText = "Total: ₹" + grandTotal;
}

// Generate bill
function generateBill() {
    let items = JSON.parse(localStorage.getItem(user.username + "_items")) || [];
    let refill = JSON.parse(localStorage.getItem(user.username + "_refill")) || [];

    billItems.forEach(b => {
        let product = items.find(i =>
            i.name.toLowerCase() === b.name.toLowerCase() &&
            i.capacity.toLowerCase() === b.capacity.toLowerCase()
        );

        if (product) {
            product.qty -= b.qty;

            if (product.qty <= 0) {
                let refillIndex = refill.findIndex(r =>
                    r.name.toLowerCase() === product.name.toLowerCase() &&
                    r.capacity.toLowerCase() === product.capacity.toLowerCase()
                );

                if (refillIndex !== -1) {
                    let newStock = refill[refillIndex];

                    product.qty = newStock.qty;
                    product.exp = newStock.exp;
                    product.mfg = newStock.mfg;
                    product.received = newStock.received;

                    refill.splice(refillIndex, 1);
                }
            }
        }
    });

    saveToHistory(billItems);

    localStorage.setItem(user.username + "_items", JSON.stringify(items));
    localStorage.setItem(user.username + "_refill", JSON.stringify(refill));

    alert("Bill generated & saved to history!");

    billItems = [];
    displayBill();
}

// ================= HISTORY =================

// Save history
function saveToHistory(billItems) {
    let today = new Date().toLocaleDateString();

    let history = JSON.parse(localStorage.getItem(user.username + "_history")) || {};

    if (!history[today]) {
        history[today] = [];
    }

    history[today].push([...billItems]);

    localStorage.setItem(user.username + "_history", JSON.stringify(history));
}

// Load dates
function loadDates() {
    let history = JSON.parse(localStorage.getItem(user.username + "_history")) || {};

    let dateList = document.getElementById("dateList");
    if (!dateList) return;

    dateList.innerHTML = "";

    Object.keys(history).forEach(date => {
        dateList.innerHTML += `
            <button onclick="loadSales('${date}')">${date}</button>
        `;
    });
}

// Load sales
function loadSales(date) {
    let history = JSON.parse(localStorage.getItem(user.username + "_history")) || {};
    let table = document.getElementById("historyTable");

    table.innerHTML = `
        <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Total</th>
        </tr>
    `;

    history[date].forEach(bill => {
        bill.forEach(item => {
            table.innerHTML += `
                <tr>
                    <td>${item.name} (${item.capacity})</td>
                    <td>${item.qty}</td>
                    <td>${item.total}</td>
                </tr>
            `;
        });
    });
}

// Auto load history
if (window.location.pathname.includes("billing-history.html")) {
    loadDates();
}
// ================= BILLING DATE =================
if (window.location.pathname.includes("billing.html")) {
    let now = new Date();

    let date = now.toLocaleDateString();
    let day = now.toLocaleString('en-US', { weekday: 'long' });

    let dateDiv = document.getElementById("dateSection");

    if (dateDiv) {
        dateDiv.innerHTML = `
            <strong>${day}</strong><br>
            ${date}
        `;
    }
}