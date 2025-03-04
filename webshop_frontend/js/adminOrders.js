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
        const row = document.createElement('tr');

        // Rendelés azonosítója
        const orderIdCell = document.createElement('td');
        orderIdCell.textContent = orderId;
        row.appendChild(orderIdCell);

        // Felhasználó azonosítója
        const userIdCell = document.createElement('td');
        userIdCell.textContent = orderData.user_id;
        row.appendChild(userIdCell);

        // Felhasználó neve
        const userNameCell = document.createElement('td');
        userNameCell.textContent = orderData.user_name;
        row.appendChild(userNameCell);

        // Felhasználó email címe
        const emailCell = document.createElement('td');
        emailCell.textContent = orderData.email;
        row.appendChild(emailCell);

        // Termékek
        const productsCell = document.createElement('td');
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
            <tbody></tbody>
        `;
        const productTableBody = productTable.querySelector('tbody');

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

        productsCell.appendChild(productTable);
        row.appendChild(productsCell);

        // Műveletek oszlop csak egyszer per rendelés
        const actionsCell = document.createElement('td');
        const selectContainer = document.createElement('div');
        selectContainer.classList.add('select');

        const statusSelect = document.createElement('select');
        ['pending', 'completed', 'cancelled'].forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            statusSelect.appendChild(option);
        });
        statusSelect.value = orderData.status; // A rendelés szintjén lévő státuszt használjuk

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
                    getOrders();
                } else {
                    alert('Hiba a státusz frissítése közben');
                }
            })
            .catch(error => {
                console.error('Hiba történt:', error);
                alert('Hiba történt a rendelés frissítése közben');
            });
        });

        selectContainer.appendChild(statusSelect);
        actionsCell.appendChild(selectContainer);
        row.appendChild(actionsCell);

        tbody.appendChild(row);
    });
}
