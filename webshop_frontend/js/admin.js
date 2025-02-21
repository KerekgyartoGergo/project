window.addEventListener('DOMContentLoaded',getUsers);
window.addEventListener('DOMContentLoaded', getProducts);
window.addEventListener('DOMContentLoaded', getCategories);



const btnLogout =document.getElementsByClassName ('icon-logout')[0];

btnLogout.addEventListener('click', logout);

async function logout(){
    const res =await fetch('http://127.0.0.1:3000/api/logout',{
        method:'POST',
        credentials: 'include'
    });

    const data =await res.json();

    if(res.ok){
        alert(data.message);
        window.location.href='../webshop_frontend/index.html';
    }else{
        alert('Hiba a kijelentkezéskor!')
    }
}






async function getUsers () {
    const res = await fetch('http://127.0.0.1:3000/api/users', {
        method: 'GET',
        credentials: 'include'
    })


    const users= await res.json();
    console.log(users);
    renderUsers(users);
}






function renderUsers(users) {
    const tbody = document.querySelector('.usersList');
    tbody.innerHTML = '';

    users.forEach((user, index) => {
        const tr = document.createElement('tr');

        const tdIndex = document.createElement('td');
        tdIndex.textContent = user.user_id;

        const tdName = document.createElement('td');
        tdName.textContent = user.user_name;

        const tdEmail = document.createElement('td');
        tdEmail.textContent = user.email;

        const tdRole = document.createElement('td');
        tdRole.textContent = user.role;
        tdRole.id='role';

        const tdActions = document.createElement('td');
        const gombokDiv = document.createElement('div');
        gombokDiv.classList.add('gombok');

        
        const editButton = document.createElement('button');
        editButton.classList.add('edit');
        editButton.textContent = 'User <==> Admin';
        editButton.id='editbtn';
        editButton.addEventListener('click', () => editUser(user.user_id)); // Event listener a szerkeztéshez
        

        // Feltételes ellenőrzés a role és az editButton szövegének beállításához
        if (tdRole.textContent === 'user') {
            editButton.textContent = 'User <==> Admin';
        } else if (tdRole.textContent === 'admin') {
            editButton.textContent = 'Admin <==> User';
        }



        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete');
        deleteButton.textContent = 'Törlés';
        deleteButton.addEventListener('click', () => deleteUser(user.user_id)); // Event listener a törléshez

        tdActions.append(editButton, deleteButton);

        tdActions.appendChild(gombokDiv);
        gombokDiv.appendChild(editButton);
        gombokDiv.appendChild(deleteButton);

        
        tr.append(tdIndex, tdName, tdEmail, tdRole, tdActions);
        tbody.appendChild(tr);
    });
}


//felhasználó törlése
async function deleteUser(userId) {
    if (confirm('Biztosan törölni akarod a felhasználót?')) {
        try {
            const res = await fetch('http://127.0.0.1:3000/api/deleteUser', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: userId }),
                credentials: 'include' // Hitelesítési adatok automatikus küldése
            });

            // Naplózás a válasz előtt
            console.log('HTTP status:', res.status);
            
            // Megpróbáljuk beolvasni a válasz adatokat JSON formátumban
            let data;
            try {
                data = await res.json();
            } catch (err) {
                // Ha a JSON parsing hibát okoz, naplózunk és feltételezhetjük, hogy a válasz nem JSON formátumú
                console.error('JSON parsing error:', err);
                data = { error: 'Nem lehetett beolvasni a választ JSON formátumban' };
            }
            
            console.log(data);

            if (res.ok) {
                alert('Felhasználó sikeresen törölve');
                getUsers();
                // További műveletek, például a felhasználó eltávolítása a felületről
            } else if (data.error) {
                alert(data.error);
            } else {
                alert('Ismeretlen hiba');
            }
        } catch (error) {
            console.error('Hálózati hiba történt:', error);
            alert('Hálózati hiba történt');
        }
    } else {
        alert('A törlési művelet megszakítva');
    }
}

//felhasználó szerkeztése


async function editUser(userId) {
    try {
        const res = await fetch('http://127.0.0.1:3000/api/updateUserRole', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: userId }),
            credentials: 'include' // Hitelesítési adatok automatikus küldése
        });

        // Naplózás a válasz előtt
        console.log('HTTP status:', res.status);
        
        // Megpróbáljuk beolvasni a válasz adatokat JSON formátumban
        let data;
        try {
            data = await res.json();
        } catch (err) {
            // Ha a JSON parsing hibát okoz, naplózunk és feltételezhetjük, hogy a válasz nem JSON formátumú
            console.error('JSON parsing error:', err);
            data = { error: 'Nem lehetett beolvasni a választ JSON formátumban' };
        }
        
        console.log(data);

        if (res.ok) {
            alert('Szerepkör sikeresen frissítve');
            getUsers();
            // További műveletek, például a felhasználó szerepkörének frissítése a felületen
        } else if (data.error) {
            alert(data.error);
        } else {
            alert('Ismeretlen hiba');
        }
    } catch (error) {
        console.error('Hálózati hiba történt:', error);
        alert('Hálózati hiba történt');
    }
}





//termékek lekérése
async function getProducts () {
    const res = await fetch('http://127.0.0.1:3000/api/products', {
        method: 'GET',
        credentials: 'include'
    })


    const products= await res.json();
    console.log(products);
    renderProducts(products);
}


function renderProducts(products) {
    const tbody = document.querySelector('.productsList');
    tbody.innerHTML = ''; // Töröljük a tartalmat, hogy ne duplikálódjanak az elemek

    products.forEach((product) => {
        // Létrehozunk egy új sort a táblázatban
        const row = document.createElement('tr');

        // Termék azonosítója
        const idCell = document.createElement('td');
        idCell.textContent = product.product_id;
        row.appendChild(idCell);

        // Termék neve
        const nameCell = document.createElement('td');
        nameCell.textContent = product.name;
        row.appendChild(nameCell);

        // Termék ára
        const priceCell = document.createElement('td');
        priceCell.textContent = `${product.price} HUF`;
        row.appendChild(priceCell);

        // Termék leírása
        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = product.description || 'Nincs leírás';
        row.appendChild(descriptionCell);

        // Készlet (Stock)
        const stockCell = document.createElement('td');
        stockCell.textContent = product.stock;
        row.appendChild(stockCell);

        // Kategória azonosító (Category ID)
        const categoryCell = document.createElement('td');
        categoryCell.textContent = product.category_id;
        row.appendChild(categoryCell);

        // Termék képe
        const imageCell = document.createElement('td');
        const image = document.createElement('img');
        image.src = `http://127.0.0.1:3000/uploads/${product.pic}`;
        image.alt = product.name;
        imageCell.appendChild(image);
        row.appendChild(imageCell);

        // Szerkesztés és törlés gombok
        const actionsCell = document.createElement('td');
        const gombokDiv = document.createElement('div');
        gombokDiv.classList.add('gombok');
        const editButton = document.createElement('button');
        editButton.textContent = 'Szerkesztés';
        editButton.classList.add('edit');
        editButton.addEventListener('click', () => {
            openEditModal(product);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Törlés';
        deleteButton.classList.add('delete');
        deleteButton.addEventListener('click', () => deleteItem(product.product_id));

        actionsCell.appendChild(gombokDiv);
        gombokDiv.appendChild(editButton);
        gombokDiv.appendChild(deleteButton);
        row.appendChild(actionsCell);

        // Hozzáadjuk a sort a táblázathoz
        tbody.appendChild(row);
    });
}




//termék törlése
async function deleteItem(productId) {
    if (confirm('Biztosan törölni akarod a terméket?')) {
        try {
            const res = await fetch('http://127.0.0.1:3000/api/deleteProduct/' + productId, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Hitelesítési adatok automatikus küldése
            });


            // Megpróbáljuk beolvasni a válasz adatokat JSON formátumban
            let data;
            try {
                data = await res.json();
            } catch (err) {
                // Ha a JSON parsing hibát okoz, naplózunk és feltételezhetjük, hogy a válasz nem JSON formátumú
                console.error('JSON parsing error:', err);
                data = { error: 'Nem lehetett beolvasni a választ JSON formátumban' };
            }

            console.log(data);

            if (res.ok) {
                alert('Termék sikeresen törölve');
                getProducts ();
            } else if (data.error) {
                alert(data.error);
            } else {
                alert('Ismeretlen hiba');
            }
        } catch (error) {
            console.error('Hálózati hiba történt:', error);
            alert('Hálózati hiba történt');
        }
    } else {
        alert('A törlési művelet megszakítva');
    }
}


// Termék szerkesztése
const modal = document.getElementById("editModal");
const span = document.getElementsByClassName("close")[0];
let currentProductId = null;

span.addEventListener('click', () => {
    modal.style.display = "none";
});

function openEditModal(product) {
    // Betöltjük a termék adatait a modalba
    document.getElementById('name').value = product.name;
    document.getElementById('price').value = product.price;
    document.getElementById('description').value = product.description || '';
    document.getElementById('stock').value = product.stock || '';
    document.getElementById('category_id').value = product.category_id || '';
    document.getElementById('pic').src = `http://127.0.0.1:3000/uploads/${product.pic}`;
    
    // Termék ID mentése egy változóba
    currentProductId = product.product_id;

    modal.style.display = "block";
}

document.getElementById("editForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    formData.append('id', currentProductId); // ID hozzáadása automatikusan

    try {
        const res = await fetch('http://127.0.0.1:3000/api/updateItem', {
            method: 'POST',
            body: formData,
            credentials: 'include' // Hitelesítési adatok automatikus küldése
        });
        
        console.log('HTTP status:', res.status);
        
        let data;
        try {
            data = await res.json();
        } catch (err) {
            console.error('JSON parsing error:', err);
            data = { error: 'Nem lehetett beolvasni a választ JSON formátumban' };
        }

        console.log(data);

        if (res.ok) {
            alert('Termék sikeresen frissítve');
            getProducts ();
            modal.style.display = "none";
            // További műveletek, például a termék frissítése a felületen
        } else if (data.error) {
            alert(data.error);
        } else {
            alert('Ismeretlen hiba');
        }
    } catch (error) {
        console.error('Hálózati hiba történt:', error);
        alert('Hálózati hiba történt');
    }
});

//termék hozzáadása

const modal2 = document.getElementById("addModal");
const addProduct = document.getElementsByClassName('add')[0];
addProduct.addEventListener('click', () => {
    openAddModal();
});
const span2 = document.getElementsByClassName("close2")[0];

span2.addEventListener('click', () => {
    modal2.style.display="none";
});


function openAddModal() {
    document.getElementById('add_name').value = '';
    document.getElementById('add_price').value = '';
    document.getElementById('add_description').value = '';
    document.getElementById('add_stock').value = '';
    document.getElementById('add_category_id').value = '';
    document.getElementById('add_pic').value = '';  

    // Megjelenítjük a modalt
    const modal = document.getElementById('addModal');
    modal.style.display = "block";
}


//kategoria hozzáadása

const modal3 = document.getElementById("addCategorieModal");
const add_category= document.getElementsByClassName('add2')[0];
add_category.addEventListener('click', () => {
    openAddCategoryModal();
});
const span3 = document.getElementsByClassName("close3")[0];

span3.addEventListener('click', () => {
    modal3.style.display="none";
});


function openAddCategoryModal() {
    document.getElementById('add_categorie_name').value = '';
    document.getElementById('add_categorie_description').value = '';
  

    // Megjelenítjük a modalt
    const modal = document.getElementById('addCategorieModal');
    modal.style.display = "block";
}

// Form submit esemény kezelése
document.getElementById("addCategorrieForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    // FormData létrehozása a form adatok küldéséhez
    const formData = {
        name: document.getElementById('add_categorie_name').value,
        description: document.getElementById('add_categorie_description').value
    };

    try {
        const res = await fetch('http://127.0.0.1:3000/api/addCategory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
            credentials: 'include'  // Hitelesítési adatok automatikus küldése
        });

        
        let data;
        try {
            data = await res.json();
        } catch (err) {
            console.error('JSON parsing error:', err);
            data = { error: 'Nem lehetett beolvasni a választ JSON formátumban' };
        }

        console.log(data);

        if (res.ok) {
            alert('Kategória sikeresen hozzáadva');
             //getCategories();  // Frissítjük a kategórialistát
            const modal = document.getElementById('addCategorieModal');
            modal.style.display = "none";  // Bezárjuk a modalt
        } else if (data.error) {
            alert(data.error);
        } else {
            alert('Ismeretlen hiba');
        }
    } catch (error) {
        console.error('Hálózati hiba történt:', error);
        alert('Hálózati hiba történt');
    }
});






// Form submit esemény kezelése
document.getElementById("addForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    // FormData létrehozása a form adatok küldéséhez
    const formData = new FormData();
    formData.append('name', document.getElementById('add_name').value);
    formData.append('description', document.getElementById('add_description').value);
    formData.append('price', document.getElementById('add_price').value);
    formData.append('stock', document.getElementById('add_stock').value);
    formData.append('category_id', document.getElementById('add_category_id').value);
    formData.append('pic', document.getElementById('add_pic').files[0]); // Kép hozzáadása

    try {
        const res = await fetch('http://127.0.0.1:3000/api/upload', {
            method: 'POST',
            body: formData,
            credentials: 'include'  // Hitelesítési adatok automatikus küldése
        });

        console.log('HTTP status:', res.status);
        
        let data;
        try {
            data = await res.json();
        } catch (err) {
            console.error('JSON parsing error:', err);
            data = { error: 'Nem lehetett beolvasni a választ JSON formátumban' };
        }

        console.log(data);

        if (res.ok) {
            alert('Termék sikeresen hozzáadva');
            getProducts();  // Frissítjük a terméklistát
            const modal = document.getElementById('addModal');
            modal.style.display = "none";  // Bezárjuk a modalt
            // További műveletek, például a termék hozzáadása a felülethez
        } else if (data.error) {
            alert(data.error);
        } else {
            alert('Ismeretlen hiba');
        }
    } catch (error) {
        console.error('Hálózati hiba történt:', error);
        alert('Hálózati hiba történt');
    }
});



//kategoriak
async function getCategories() {
    const res = await fetch('http://127.0.0.1:3000/api/categories', {
        method: 'GET',
        credentials: 'include'
    });

    const categories = await res.json();
    console.log(categories);
    renderCategories(categories);
}

function renderCategories(categories) {
    const tbody = document.querySelector('.categoriesList');
    tbody.innerHTML = '';

    categories.forEach((category) => {
        const tr = document.createElement('tr');

        const tdIndex = document.createElement('td');
        tdIndex.textContent = category.category_id;

        const tdName = document.createElement('td');
        tdName.textContent = category.name;

        const tdDescription = document.createElement('td');
        tdDescription.textContent = category.description;

        const tdActions = document.createElement('td');
        const gombokDiv = document.createElement('div');
        gombokDiv.classList.add('gombok');

        const editButton = document.createElement('button');
        editButton.classList.add('edit');
        editButton.textContent = 'Szerkesztés';
        editButton.addEventListener('click', () => openEditCategoryModal(category));

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete');
        deleteButton.textContent = 'Törlés';
        deleteButton.addEventListener('click', async () => {
            if (confirm('Biztosan törölni szeretnéd ezt a kategóriát?')) {
                await deleteCategory(category.category_id);
            }
        });

        tdActions.append(editButton, deleteButton);
        tdActions.appendChild(gombokDiv);
        gombokDiv.appendChild(editButton);
        gombokDiv.appendChild(deleteButton);

        tr.append(tdIndex, tdName, tdDescription, tdActions);
        tbody.appendChild(tr);
    });
}


async function deleteCategory(categoryId) {
    try {
        const res = await fetch(`http://127.0.0.1:3000/api/deleteCategory/${categoryId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await res.json();
        console.log(data);

        if (res.ok) {
            alert('Kategória sikeresen törölve');
            getCategories(); // Frissítjük a listát
        } else {
            alert(data.error || 'Hiba történt a törlés során');
        }
    } catch (error) {
        console.error('Hálózati hiba:', error);
        alert('Hálózati hiba történt');
    }
}




const modal4 = document.getElementById("editCategorieModal");
const span4 = document.getElementsByClassName("close4")[0];
let currentCategoryId = null;

span4.addEventListener('click', () => {
    modal4.style.display = "none";
});

function openEditCategoryModal(category) {
    console.log('Megnyitásra küldött kategória:', category, typeof category);

    if (typeof category !== "object" || category === null) {
        console.error("Hibás vagy hiányzó kategória adatok:", category);
        alert("Hiba: A kategória adatai nem érhetők el.");
        return;
    }
    console.log(category.name, category.description);

    document.getElementById('edit_categorie_name').value = category.name || '';
    document.getElementById('edit_categorie_description').value = category.description || '';

    currentCategoryId = category.category_id;

    console.log("Mentett category_id:", currentCategoryId);

    modal4.style.display = "block";
}


document.getElementById("editCategorrieForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    console.log('Elküldés előtt currentCategoryId:', currentCategoryId);

    const formData = new FormData(event.target);
    formData.append('id', currentCategoryId); // ID hozzáadása automatikusan


        // 🛠️ Ellenőrzés: kilogoljuk az összes adatot
        for (let [key, value] of formData.entries()) {
            console.log(`FormData tartalom: ${key} = ${value}`);
        }




    try {
        const res = await fetch('http://127.0.0.1:3000/api/updateCategory', {
            method: 'POST',
            body: formData,
            credentials: 'include' // Hitelesítési adatok automatikus küldése
        });
        
        console.log('HTTP status:', res.status);
        
        let data;
        try {
            data = await res.json();
        } catch (err) {
            console.error('JSON parsing error:', err);
            data = { error: 'Nem lehetett beolvasni a választ JSON formátumban' };
        }

        console.log(data);

        if (res.ok) {
            alert('Kategória sikeresen frissítve');
            getCategories(); // Frissítjük a kategóriák listáját
            modal4.style.display = "none";
            // További műveletek, például a kategória frissítése a felületen
        } else if (data.error) {
            alert(data.error);
        } else {
            alert('Ismeretlen hiba');
        }
    } catch (error) {
        console.error('Hálózati hiba történt:', error);
        alert('Hálózati hiba történt');
    }
});