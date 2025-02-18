const btnLogout =document.getElementsByClassName ('icon-logout')[0];
const btnProfile =document.getElementsByClassName ('icon-user')[0];
const btnCart =document.getElementsByClassName ('icon-cart')[0];
const katElements = Array.from(document.getElementsByClassName('kat'));
const card =document.getElementsByClassName('card')[0];



window.addEventListener('DOMContentLoaded', getProducts)

katElements.forEach(kat => {
    kat.addEventListener('click', () => {
        window.location.href = '../webshop_frontend/kategoria.html';
    });
});


card.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/teszt.html';
})


btnProfile.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/profile.html';
})

btnLogout.addEventListener('click', logout);


btnCart.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/cart.html';
});





async function getProducts () {
    const res = await fetch('http://127.0.0.1:3000/api/products', {
        method: 'GET',
        credentials: 'include'
    })


    const products= await res.json();
    console.log(products);
    Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Nem vagy bejelentkezve!",
        footer: '<a href="#">Why do I have this issue?</a>'
      });
    renderProducts(products);
}


function renderProducts(products){
    const row =document.getElementsByClassName('row')[0];
    //console.log(row);
    row.innerHTML ='';

    for (const product of products){
        //card div létrehozása
        const cardDiv =document.createElement('div');
        cardDiv.classList.add('card');

        //fejléc
        const cardHeaderDiv =document.createElement('div');
        cardHeaderDiv.classList.add('card-header');
        cardHeaderDiv.textContent = product.name;




        //cardbody
        const cardBodyDiv =document.createElement('div');
        cardBodyDiv.classList.add('card-body');

        const cardPic =document.createElement('div');
        cardPic.classList.add('pic-div');

        const cardBodyImg =document.createElement('img');
        cardBodyImg.src = `http://127.0.0.1:3000/uploads/${product.pic}`;




        cardPic.append(cardBodyImg);
        cardBodyDiv.append(cardPic)




        //cardfooter
        const cardFooterDiv =document.createElement('div');
        cardFooterDiv.classList.add('card-footer');

        const markaDiv =document.createElement('div');
        markaDiv.classList.add('marka');
        markaDiv.textContent=`${product.name}`;


        const termek_nev =document.createElement('div');
        termek_nev.classList.add('termek-nev');
        termek_nev.textContent=`${product.name}`;

        const price =document.createElement('div');
        price.classList.add('price');
        price.textContent=`${product.price} HUF`;


        const cart =document.createElement('div');
        cart.classList.add('cart');
        cart.textContent=`kosárhoz ad`;
        cart.addEventListener('click', () => addToCart(product.product_id, 1));




        cardFooterDiv.append(markaDiv)
        cardFooterDiv.append(termek_nev);
        cardFooterDiv.append(price);
        cardFooterDiv.append(cart);


        cardDiv.append(cardHeaderDiv , cardBodyDiv, cardFooterDiv);
        console.log(cardDiv);

        row.append(cardDiv)
    }
}







//termék kosárhoz adása
async function addToCart(product_id, quantity = 1) {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/addCart/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id, quantity })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Hiba történt a termék kosárba helyezésekor.');
        }

        Swal.fire({
            position: "center",
            icon: "success",
            title: data.message,
            showConfirmButton: false,
            timer: 1500,
            theme:'dark'
          });
    } catch (error) {
        console.error('Hiba a kosárhoz adás során:', error);
        alert(error.message);
    }
}





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