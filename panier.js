
// Tâche 8 : Implémentation de l'Affichage du Panier 

function loadCart() {
    const dbRequest = indexedDB.open("CoffeeShopDB", 2);
    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("cart", "readonly");
        const store = transaction.objectStore("cart");

        store.getAll().onsuccess = (event) => {
            const cartItems = event.target.result;
            displayCartItems(cartItems);
            updateTotal(cartItems);
        };
    };
}

function displayCartItems(pr) {
    const cartTable = document.getElementById("cart-items");
    cartTable.innerHTML = ""; 

    pr.forEach(item => {
        const row = document.createElement("tr");

        const productCell = document.createElement("td");
        productCell.style.display = "flex";
        productCell.style.alignItems = "center";

        const productImage = document.createElement("img");
        productImage.src = item.image_url; 
        productImage.alt = item.name;
        productImage.style.width ='100px';  
        productImage.style.height ='100px'; 
        productCell.appendChild(productImage);

        const productName = document.createElement("span");
        productName.style.marginLeft = "10px"; 
        productName.textContent = item.name;
        productCell.appendChild(productName);

        const priceCell = document.createElement("td");
        priceCell.textContent = `${item.price} dh`;

        const quantityCell = document.createElement("td");
        quantityCell.innerHTML = `
            <button onclick="updateQuantity('${item.id}', -1)">-</button>
            <span id="quantity-${item.id}">${item.quantity}</span>
            <button onclick="updateQuantity('${item.id}', 1)">+</button>
        `;

        const totalCell = document.createElement("td");
        totalCell.innerHTML = `<span id="total-${item.id}">${(item.price * item.quantity).toFixed(2)} dh</span>`;

        const removeCell = document.createElement("td");

        removeCell.innerHTML = `<button class=delete onclick="removeFromCart('${item.id}')">×</button>`;

        row.appendChild(productCell); 
        row.appendChild(priceCell);   
        row.appendChild(quantityCell);
        row.appendChild(totalCell);   
        row.appendChild(removeCell);  

        cartTable.appendChild(row);
    });
}


// Tâche 9 : Implémentation des fonctions de mise à jour et de suppression des articles du panier 

function updateQuantity(itemId, newQuantity) {
    const dbRequest = indexedDB.open("CoffeeShopDB", 2);
    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("cart", "readwrite");
        const store = transaction.objectStore("cart");

        const getRequest = store.get(itemId);
        getRequest.onsuccess = (event) => {
            const item = event.target.result;
            if (item) {
                item.quantity += newQuantity;
                if (item.quantity < 1) item.quantity = 1; 
                store.put(item);
                document.getElementById(`quantity-${itemId}`).innerText = item.quantity;
                document.getElementById(`total-${itemId}`).innerText = (item.price * item.quantity).toFixed(2) + ' dh';
                updateTotal();
            }
        };
    };
}

function removeFromCart(itemId) {
    const dbRequest = indexedDB.open("CoffeeShopDB", 2);
    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("cart", "readwrite");
        const store = transaction.objectStore("cart");

        const deleteRequest = store.delete(itemId);
        deleteRequest.onsuccess = () => {
            loadCart(); 
        };
    };
}

function updateTotal() {
    const dbRequest = indexedDB.open("CoffeeShopDB", 2);
    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("cart", "readonly");
        const store = transaction.objectStore("cart");

        store.getAll().onsuccess = (event) => {
            const cartItems = event.target.result;
            const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            document.getElementById("total-price").innerText = total.toFixed(2) + ' dh';
        };
    };
}

document.addEventListener('DOMContentLoaded', loadCart);
