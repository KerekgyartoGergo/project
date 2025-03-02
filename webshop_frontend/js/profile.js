const btnLogout =document.getElementsByClassName ('icon-logout')[0];
const btnMenuLogo = document.getElementsByClassName('menu-logo')[0];
const btnCart =document.getElementsByClassName ('icon-cart')[0];

window.addEventListener('DOMContentLoaded', getUserOrders);


btnLogout.addEventListener('click', logout);
btnMenuLogo.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/home.html';
});

btnCart.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/cart.html';
});


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






async function getUserOrders() {
    try {
        const res = await fetch('http://127.0.0.1:3000/api/my-orders', {
            method: 'GET',
            credentials: 'include'
        });

        if (!res.ok) {
            throw new Error('Nem sikerült lekérni a rendeléseket');
        }

        const orders = await res.json();
        console.log(orders);
        renderOrders(orders);
    } catch (error) {
        console.error('Hiba történt a rendelés lekérdezésekor:', error);
    }
}

function renderOrders(orders) {
    const tbody = document.querySelector('.ordersList');
    tbody.innerHTML = ''; // Töröljük a tartalmat, hogy ne duplikálódjanak az elemek

    const groupedOrders = {};

    orders.forEach(order => {
        if (!groupedOrders[order.order_id]) {
            groupedOrders[order.order_id] = {
                user_id: order.user_id,
                user_name: order.user_name,
                email: order.email,
                status: order.status, // Csak az első termék státuszát vesszük
                products: []
            };
        }
        groupedOrders[order.order_id].products.push(order);
    });

    Object.entries(groupedOrders).forEach(([orderId, orderData]) => {
        // Kártya létrehozása
        const card = document.createElement('div');
        card.classList.add('order-card');

        // Fejléc a rendelés adataival
        const orderHeader = document.createElement('div');
        orderHeader.classList.add('order-header');
        orderHeader.innerHTML = `
            <span>Rendelés ID: ${orderId}</span>
            <span>Felhasználó: ${orderData.user_name}</span>
        `;
        card.appendChild(orderHeader);

        // Termékek táblázata
        const productTable = document.createElement('table');
        productTable.innerHTML = `
            <thead>
                <tr>
                    <th>Termék ID</th>
                    <th>Termék Név</th>
                    <th>Raktárkészlet</th>
                    <th>Kép</th>
                    <th>Mennyiség</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        `;
        const productTableBody = productTable.querySelector('tbody');

        // Termékek hozzáadása a táblázathoz
        orderData.products.forEach(product => {
            const productRow = document.createElement('tr');
            productRow.innerHTML = `
                <td>${product.product_id}</td>
                <td>${product.name}</td>
                <td>${product.stock}</td>
                <td><img src="http://127.0.0.1:3000/uploads/${product.pic}" alt="${product.name}" width="50"></td>
                <td>${product.quantity}</td>
            `;
            productTableBody.appendChild(productRow);
        });

        card.appendChild(productTable);

        // Státusz módosító legördülő menü
        const actionsCell = document.createElement('div');
        actionsCell.classList.add('select');
        actionsCell.innerHTML = `
            <select>
                <option value="pending" ${orderData.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="completed" ${orderData.status === 'completed' ? 'selected' : ''}>Completed</option>
                <option value="cancelled" ${orderData.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
        `;
        
        // Event listener a státusz frissítésére
        const statusSelect = actionsCell.querySelector('select');
        statusSelect.addEventListener('change', () => {
            const newStatus = statusSelect.value;
            fetch(`http://127.0.0.1:3000/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('A rendelés státusza sikeresen frissítve!');
                    getOrders(); // Újra betöltjük a rendeléseket
                } else {
                    alert('Hiba a státusz frissítése közben');
                }
            })
            .catch(error => {
                console.error('Hiba történt:', error);
                alert('Hiba történt a rendelés frissítése közben');
            });
        });

        card.appendChild(actionsCell);

        // A kártya hozzáadása a fő listához
        tbody.appendChild(card);
    });
}

