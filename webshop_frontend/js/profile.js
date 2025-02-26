const btnLogout =document.getElementsByClassName ('icon-logout')[0];
const btnMenuLogo = document.getElementsByClassName('menu-logo')[0];
const btnCart =document.getElementsByClassName ('icon-cart')[0];


btnLogout.addEventListener('click', logout);
btnMenuLogo.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/home.html';
});

btnCart.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/cart.html';
});

//név módosítása
document.getElementById("saveName").addEventListener("click", function() {
    const name = document.getElementById("nameInput").value;

    // Ellenőrzés, hogy van-e név a bemenetben
    if (!name) {
        alert("Kérlek, add meg az új nevet!");
        return;
    }

    // POST kérés a backend felé a név módosításához
    fetch('http://127.0.0.1:3000/api/editProfileName', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            // Ha szükséges, itt adj hozzá egy Authorization fejlécet
            //'Authorization': 'Bearer ' + token
        },
        credentials: 'include',  // Az autentikációhoz szükséges sütik (cookies) átadása

        body: JSON.stringify({ name: name })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message); // Sikeres üzenet
        } else if (data.error) {
            alert(data.error); // Hibás üzenet
        }
    })
    .catch(error => {
        console.error('Hiba történt:', error);
        alert('Hiba történt a név módosítása közben.');
    });
});





document.getElementById('savePassword').addEventListener('click', function() {
    // Jelszavak validálása
    const password = document.getElementById('passwordInput').value;
    const confirmPassword = document.getElementById('confirmPasswordInput').value;

    if (password === '' || confirmPassword === '') {
        alert('Kérjük, töltsd ki mindkét jelszó mezőt!');
        return;
    }

    if (password !== confirmPassword) {
        alert('A jelszavak nem egyeznek!');
        return;
    }

    // API hívás
    const token = localStorage.getItem('authToken'); // vagy sessionStorage, ahol tárolod az auth tokent

    const data = { psw: password };

    fetch('http://127.0.0.1:3000/api/editProfilePsw', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',


        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert(data.message);
            logout();
                }
    })
    .catch(error => {
        console.error('Hiba történt:', error);
        alert('Hiba történt a jelszó módosítása során.');
    });
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