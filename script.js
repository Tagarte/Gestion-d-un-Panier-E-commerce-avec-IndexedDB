// Lancer l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', getProducts);

//Question 2 : 
// récupérer les données des produits depuis l'API
let products =[];
function getProducts() {
    fetch('https://fake-coffee-api.vercel.app/api')
        .then(response =>  response.json())
        .then(data => {
            products =data;
            addProductsToDB(products);
            displayProducts(products); 
            })
        .catch(error => {
            console.error("Erreur lors de la récupération des produits:", error);
            loadProductsFormDB();
        });
}

//Question 3 : 
// Créer une carte de produit
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image_url}" alt="${product.title}"  >
        <h3>${product.name}</h3>
        <div class="product-info">
        <h4 class="price">${product.price}dh </h4>
        <p class="description">${product.description}</p>
        <button onclick="addToCart('${product.id}',products)" class="add-to-cart">+</button>
        </div>
    `;
    return card;
}

// Afficher les produits
function displayProducts(products) {
    const grid = document.querySelector('.product-content');
    grid.innerHTML = '';
    products.forEach(product => {
        grid.appendChild(createProductCard(product));
    });
}

//Question 4 :
// Mode view
// Ajouter les écouteurs d'événements aux icônes
document.getElementById('grid').addEventListener('click', setGridView);
document.getElementById('list').addEventListener('click', setListView);

// Fonction pour passer en vue grille
function setGridView() {
    document.querySelector('.product-content').style.display = 'grid';
    document.querySelector('.product-content').style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'center';
    });
}

// Fonction pour passer en vue liste
function setListView() {
    document.querySelector('.product-content').style.display = 'block';
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = 'flex';
        card.style.flexDirection = 'row';
        card.style.alignItems = 'flex-start';
        card.style.marginBottom = '10px';
    });
    document.querySelectorAll('.product-card img ').forEach(img => {
        img.style.maxWidth="200px";
    });
    document.querySelectorAll('.product-card button').forEach(btn => {
        btn.style.alignSelf  = 'flex-end';
    });
}

// Initialiser la vue par défaut (grille)
setGridView();

//Question 5:
// Fonction pour filtrer les produits
function filterProducts() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery)
    );
    displayProducts(filteredProducts);
}

// Écouteur d'événement pour le champ de recherche
document.getElementById('search-input').addEventListener('input', filterProducts);
//Tâche 1:Initialisation de la Base de Données
function openDB() {
    const dbRequest = indexedDB.open("CoffeeShopDB", 2); 
    
    dbRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("products")) {
            db.createObjectStore("products", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("cart")) {
            db.createObjectStore("cart", { keyPath: "id" });
        }
    };
    
    dbRequest.onerror = (event) => {
        console.error("Erreur d'ouverture de la base de données :", event.target.errorCode);
    };

    return dbRequest;
}

//Tâche 2: Modification de la Fonction getProducts()

//Tâche 3:
function addProductsToDB(products) {
    const dbRequest = openDB();

    dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const transaction = db.transaction("products", "readwrite");
        const store = transaction.objectStore("products");

        products.forEach(product => {
            store.put(product);
        });

        transaction.oncomplete = () => {
            console.log("Produits ajoutés dans la base de données avec succès.");
        };
        transaction.onerror = () => {
            console.error("Erreur lors de l'ajout des produits à IndexedDB.");
        };
    };

    dbRequest.onerror = (event) => {
        console.error("Erreur d'ouverture de la base de données :", event.target.errorCode);
    };
}

//Tâche 4:Validation de l'Implémentation
//Tâche 5 :Chargement des Produits en Mode Hors Ligne
function loadProductsFromDB() {
    const dbRequest = openDB();

    dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const transaction = db.transaction("products", "readonly");
        const store = transaction.objectStore("products");

        const request = store.getAll();  
        request.onsuccess = () => {
            const productsFromDB = request.result;
            displayProducts(productsFromDB);
        };

        request.onerror = () => {
            console.error("Erreur lors du chargement des produits depuis IndexedDB.");
        };
    };

    dbRequest.onerror = (event) => {
        console.error("Erreur d'ouverture de la base de données :", event.target.errorCode);
    };
}


//Tâche 6:Ajout au Panier
function addToCart(productId) {
    const productDetail = products.find(p => p.id == productId);
    if (!productDetail) {
        console.error("Produit non trouvé :", productId);
        return;
    }

    const dbRequest = openDB();

    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("cart", "readwrite");
        const store = transaction.objectStore("cart");

        const getRequest = store.get(productId);

        getRequest.onsuccess = (event) => {
            const item = event.target.result;
            if (item) {
                item.quantity += 1;
                store.put(item); 
            } else {
                store.put({
                    id: productId,
                    name: productDetail.name,
                    price: productDetail.price,
                    image_url: productDetail.image_url,
                    quantity: 1
                });
            }
        };

        getRequest.onerror = () => {
            console.error("Erreur lors de la récupération de l'article du panier.");
        };
    };
}

document.getElementById('cart-icon').addEventListener('click', function() {
    window.location.href = 'panier.html';
});

