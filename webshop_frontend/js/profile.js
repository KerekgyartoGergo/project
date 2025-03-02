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

    // Csoportosítjuk a rendeléseket rendelés ID alapján
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

    // Rendelésenként új kártyák létrehozása
    Object.entries(groupedOrders).forEach(([orderId, orderData]) => {
        // Kártya létrehozása
        const card = document.createElement('div');
        card.classList.add('order-card');

        // Fejléc a rendelés adataival (Rendelés ID és Státusz)
        const orderHeader = document.createElement('div');
        orderHeader.classList.add('order-header');
        orderHeader.innerHTML = `
            <span>Rendelés azonosító: ${orderId}</span>
            <span>
              Státusz: ${
                orderData.status === "pending"
                  ? "Függőben"
                  : orderData.status === "cancelled"
                  ? "Megszakítva"
                  : orderData.status === "completed"
                  ? "Kész"
                  : orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)
              }
            </span>        
        `;
        card.appendChild(orderHeader);

        // Termékek táblázata
        const productTable = document.createElement('table');
        productTable.innerHTML = `
            <thead>
                <tr>
                    <th>Termék Név</th>
                    <th>Kép</th>
                    <th>Mennyiség</th>
                    <th>Ár</th>
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
                <td>${product.name}</td>
                <td><img src="http://127.0.0.1:3000/uploads/${product.pic}" alt="${product.name}" width="50"></td>
                <td>${product.quantity}</td>
                <td>${product.price} Ft</td>
            `;
            productTableBody.appendChild(productRow);
        });

        card.appendChild(productTable);

        // Kérjük le a rendelés végösszegét az API-ból

fetch(`http://127.0.0.1:3000/api/getOrderTotal?order_id=${orderId}`, {
    method: 'GET',
    credentials: 'include'
})
    .then(response => response.json())
    .then(data => {
        if (data.total_price) {
            const totalCell = document.createElement('div');
            totalCell.classList.add('order-total');
            totalCell.innerHTML = `
                <span>Végösszeg: ${data.total_price} Ft</span>
            `;
            card.appendChild(totalCell);
        }
    })
    .catch(error => {
        console.error("Hiba a végösszeg lekérésekor:", error);
        const totalCell = document.createElement('div');
        totalCell.classList.add('order-total');
        totalCell.innerHTML = `
            <span>Végösszeg: Hiba történt</span>
        `;
        card.appendChild(totalCell);
    });

        // A kártya hozzáadása a fő listához
        tbody.appendChild(card);
    });
}
