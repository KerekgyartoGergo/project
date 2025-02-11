window.addEventListener('DOMContentLoaded',getUsers);
window.addEventListener('DOMContentLoaded', getProducts);



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

        const tdActions = document.createElement('td');
        
        const editButton = document.createElement('button');
        editButton.classList.add('edit');
        editButton.textContent = 'Szerkesztés';

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete');
        deleteButton.textContent = 'Törlés';

        tdActions.append(editButton, deleteButton);
        
        tr.append(tdIndex, tdName, tdEmail, tdRole, tdActions);
        tbody.appendChild(tr);
    });
}




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

        // Termék azonosítója (product.id)
        const idCell = document.createElement('td');
        idCell.textContent = product.product_id; // Itt a product.id-t használjuk
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
        descriptionCell.textContent = product.description || 'Nincs leírás'; // Ha nincs leírás, akkor "Nincs leírás" szöveg jelenik meg
        row.appendChild(descriptionCell);

        // Termék képe
        const imageCell = document.createElement('td');
        const image = document.createElement('img');
        image.src = `http://127.0.0.1:3000/uploads/${product.pic}`;
        image.alt = product.name;
        imageCell.appendChild(image);
        row.appendChild(imageCell);

        // Szerkesztés és törlés gombok
        const actionsCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Szerkesztés';
        editButton.classList.add('edit');
        editButton.addEventListener('click', () => {
            // Szerkesztés logika itt
            console.log('Szerkesztés:', product);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Törlés';
        deleteButton.classList.add('delete');
        deleteButton.addEventListener('click', () => {
            // Törlés logika itt
            console.log('Törlés:', product);
        });

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);

        // Hozzáadjuk a sort a táblázathoz
        tbody.appendChild(row);
    });
}