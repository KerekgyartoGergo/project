const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const validator = require('validator');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended:true }));
app.use(cors({
    origin: 'http://127.0.0.1:5500', 
    credentials: true
}));
app.use(cookieParser());


dotenv.config();
const PORT = process.env.PORT;
const HOSTNAME = process.env.HOSTNAME;

const pool = mysql.createPool({
    host: process.env.DB_HOST,           // Az adatbázis-szerver címe, környezeti változóként megadva.
    user: process.env.DB_USER,           // Az adatbázishoz való csatlakozáshoz használt felhasználónév, környezeti változóként megadva.
    password: process.env.DB_PASSWORD,   // Az adatbázishoz való csatlakozáshoz használt jelszó, környezeti változóként megadva.
    database: process.env.DB_DATABASE,   // Az adatbázis neve, környezeti változóként megadva.
    timezone: 'Z',                       // Az időzóna beállítása UTC-re ('Z').
    waitForConnections: true,            // Ha igaz, akkor várakozik a szabad kapcsolat elérhetővé válására, ha a medence elérte a maximális kapcsolat limitet.
    connectionLimit: 10,                 // A medencében egyszerre elérhető maximális kapcsolatok száma.
    queueLimit: 0                        // A várólistán lévő kérések maximális száma, ha eléri a maximális kapcsolat limitet. 0 esetén nincs korlátozás.
});



const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const token = req.cookies.auth_token;
    if (!token) {
        return res.status(403).json({ error: 'Nincs token' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Van token, csak épp nem érvényes' });
        }
        req.user_name = user;
        next();
    });
}


// API végpontok

// regisztráció
app.post('/api/register', (req, res) => {
    const { user_name, email, psw, role } = req.body;
    const errors = [];

    if (!validator.isEmail(email)) {
        errors.push({ error: 'Nem valós email cím!' });
    }

    if (validator.isEmpty(user_name)) {
        errors.push({ error: 'Töltsd ki a nevet!' });
    }

    if (!validator.isLength(psw, { min: 6 })) {
        errors.push({ error: 'A jelszónak legalább 6 karakternek kell lennie!' });
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const allowedRoles = ['user', 'admin'];
    if (!allowedRoles.includes(role)) {
        errors.push({ error: 'Érvénytelen szerepkör!' });
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }



    bcrypt.hash(psw, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba a hashelés során!' });
        }
    
        // Először ellenőrizzük, hogy az email már szerepel-e az adatbázisban
        const checkEmailSql = 'SELECT * FROM users WHERE email = ?';
        pool.query(checkEmailSql, [email], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Adatbázis hiba!' });
            }
            if (result.length > 0) {
                // Ha létezik már felhasználó ugyanazzal az emaillel
                return res.status(400).json({ error: 'Ez az email már regisztrálva van!' });
            }
    
            // Ha az email nem létezik, folytathatjuk a regisztrációval
            const sql = 'INSERT INTO users (user_id, user_name, email, psw, role) VALUES (NULL, ?, ?, ?, ?)';
            pool.query(sql, [user_name, email, hash, role], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Hiba az adatbázis művelet során!' });
                }
                res.status(201).json({ message: 'Sikeres regisztráció!' });
            });
        });
    });
});


// login
app.post('/api/login', (req, res) => {
    const { email, psw } = req.body;
    const errors = [];

    if (!validator.isEmail(email)) {
        errors.push({ error: 'Add meg az email címet '});
    }

    if (validator.isEmpty(psw)) {
        errors.push({ error: 'Add meg a jelszót' });
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const sql = 'SELECT * FROM users WHERE email LIKE ?';
    pool.query(sql, [email], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba az SQL-ben' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'A felhasználó nem találató' });
        }

        const user = result[0];
        bcrypt.compare(psw, user.psw, (err, isMatch) => {
            if (isMatch) {
                const token = jwt.sign({ id: user.user_id }, JWT_SECRET, { expiresIn: '1y' });
                
                res.cookie('auth_token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                    maxAge: 1000 * 60 * 60 * 24 * 30 * 12
                });

                return res.status(200).json({ message: 'Sikeres bejelentkezés' });
            } else {
                return res.status(401).json({ error: 'rossz a jelszó' });
            }
        });
    });
});

// logout
app.post('/api/logout', authenticateToken, (req, res) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });
    return res.status(200).json({ message: 'Sikeres kijelentkezés!' });
});

// tesztelés a jwt-re
app.get('/api/logintest', authenticateToken, (req, res) => {
    return res.status(200).json({ message: 'bent vagy' });
});







app.listen(PORT, HOSTNAME, () => {
    console.log(`IP: http://${HOSTNAME}:${PORT}`);
});