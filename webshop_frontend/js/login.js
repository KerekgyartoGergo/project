const btnLogin =document.getElementsByClassName ('login')[0];


btnLogin.addEventListener('click', login);



document.addEventListener('keydown', function(event){
    if (event.key === 'Enter'){
        login();
    }
})


async function login() {
    const email = document.getElementById('email').value;
    const psw = document.getElementById('psw').value;

    console.log(email, psw);

    const res = await fetch('http://127.0.0.1:3000/api/login', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ email, psw }),
        credentials: 'include'
    });

    const data = await res.json();
    console.log(data);

    if (res.ok) {
        Swal.fire({
            icon:"success",
            theme:"dark",
            text:data.message,
            timer:500
        })
        
        // Ellenőrizzük a felhasználó szerepkörét
        if (data.role === 'admin') {
            window.location.href = '../webshop_frontend/admin.html';
        } else {
            window.location.href = '../webshop_frontend/home.html';
        }
    } else if (data.errors) {
        let errorMessage = '';
        for (let i = 0; i < data.errors.length; i++) {
            errorMessage += `${data.errors[i].error}\n`;
        }

        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: errorMessage,
            theme:"dark"
          });
    } else if (data.error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data.error,
            theme:"dark"
          });
    } else {
        alert('Ismeretlen hiba');
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong!"
          });
    }
}