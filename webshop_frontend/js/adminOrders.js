window.addEventListener('DOMContentLoaded', getOrders);



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





// Rendelések lekérése
async function getOrders() {
    const res = await fetch('http://127.0.0.1:3000/api/orders', {
        method: 'GET',
        credentials: 'include'
    });

    const orders = await res.json();
    console.log(orders);
    renderOrders(orders);
}

function renderOrders(orders) {
    const tbody = document.querySelector('.ordersList');
    tbody.innerHTML = ''; // Töröljük a tartalmat, hogy ne duplikálódjanak az elemek

    orders.forEach((order) => {
        // Létrehozunk egy új sort a táblázatban
        const row = document.createElement('tr');

        // Rendelés azonosítója
        const orderIdCell = document.createElement('td');
        orderIdCell.textContent = order.order_id;
        row.appendChild(orderIdCell);

        // Felhasználó azonosítója
        const userIdCell = document.createElement('td');
        userIdCell.textContent = order.user_id;
        row.appendChild(userIdCell);

        // Felhasználó neve
        const userNameCell = document.createElement('td');
        userNameCell.textContent = order.user_name;
        row.appendChild(userNameCell);

        // Felhasználó email címe
        const emailCell = document.createElement('td');
        emailCell.textContent = order.email;
        row.appendChild(emailCell);

        // Termék azonosító
        const productIdCell = document.createElement('td');
        productIdCell.textContent = order.product_id;
        row.appendChild(productIdCell);

        // Termék neve
        const productNameCell = document.createElement('td');
        productNameCell.textContent = order.name;
        row.appendChild(productNameCell);

        // Raktárkészlet
        const stockCell = document.createElement('td');
        stockCell.textContent = order.stock;
        row.appendChild(stockCell);

        // Termék képe
        const imageCell = document.createElement('td');
        const image = document.createElement('img');
        image.src = `http://127.0.0.1:3000/uploads/${order.pic}`; // Ha rendeléshez is van kép
        image.alt = order.name;
        imageCell.appendChild(image);
        row.appendChild(imageCell);

        // Mennyiség
        const quantityCell = document.createElement('td');
        quantityCell.textContent = order.quantity;
        row.appendChild(quantityCell);

        // status
        const statusCell = document.createElement('td');
        statusCell.textContent = order.status;
        row.appendChild(statusCell);

        // Hozzáadunk egy legördülő menüt a státusz választásához
        const statusSelectCell = document.createElement('td');
        const statusSelect = document.createElement('select');
        const statuses = ['pending', 'completed', 'cancelled'];

        statuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status.charAt(0).toUpperCase() + status.slice(1); // Első betű nagy
            statusSelect.appendChild(option);
        });

        // Alapértelmezett státusz beállítása a rendelés aktuális státuszának megfelelően (példa: 'pending')
        statusSelect.value = order.status || 'pending'; // Ha nincs státusz, akkor alapértelmezett 'pending'

        // Status módosítása
        statusSelect.addEventListener('change', () => {
            const newStatus = statusSelect.value; // Kiválasztott új státusz

            // API hívás a rendelés státuszának frissítéséhez
            fetch(`http://127.0.0.1:3000/api/orders/${order.order_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Hitelesítési adatok automatikus küldése
                body: JSON.stringify({
                    status: newStatus, // Az új státusz, amit kiválasztottak
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('A rendelés státusza sikeresen frissítve!');
                    // Frissíthetjük a rendelést a táblázatban, ha szükséges
                    // Például: renderOrders() újra hívása a frissített lista betöltésére
                } else {
                    alert('Hiba a státusz frissítése közben');
                }
            })
            .catch(error => {
                console.error('Hiba történt a rendelés frissítése közben:', error);
                alert('Hiba történt a rendelés frissítése közben');
            });
        });

        // Hozzáadjuk a legördülő menüt a státusz cellához
        statusSelectCell.appendChild(statusSelect);
        row.appendChild(statusSelectCell);

        // Hozzáadjuk a sort a táblázathoz
        tbody.appendChild(row);
    });
}



