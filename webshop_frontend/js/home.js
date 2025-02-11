const btnLogout =document.getElementsByClassName ('icon-logout')[0];
const btnProfile =document.getElementsByClassName ('icon-user')[0];
const btnCart =document.getElementsByClassName ('icon-cart')[0];
const katElements = Array.from(document.getElementsByClassName('kat'));

window.addEventListener('DOMContentLoaded', getProducts)

katElements.forEach(kat => {
    kat.addEventListener('click', () => {
        window.location.href = '../webshop_frontend/kategoria.html';
    });
});



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
        price.textContent=`${product.price}`;


        const cart =document.createElement('div');
        cart.classList.add('cart');
        cart.textContent=`kosárhoz ad`;



        cardFooterDiv.append(markaDiv)
        cardFooterDiv.append(termek_nev);
        cardFooterDiv.append(price);
        cardFooterDiv.append(cart);


        cardDiv.append(cardHeaderDiv , cardBodyDiv, cardFooterDiv);
        console.log(cardDiv);

        row.append(cardDiv)
    }
}




async function logout(){
    const res =await fetch('http://localhost:3000/api/logout',{
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