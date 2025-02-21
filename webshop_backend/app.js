const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const validator = require('validator');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { log, error } = require('console');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended:true }));
app.use(cors({
    origin: 'http://127.0.0.1:5500', 
    credentials: true
}));
app.use(cookieParser());

// az uploads mappában lévő fájlok elérése
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



dotenv.config();
const PORT = process.env.PORT;
const HOSTNAME = process.env.HOSTNAME;

const pool = mysql.createPool({
    host: process.env.DB_HOST,           
    user: process.env.DB_USER,           
    password: process.env.DB_PASSWORD,   
    database: process.env.DB_DATABASE,   
    timezone: 'Z',                       
    waitForConnections: true,            
    connectionLimit: 10,                 
    queueLimit: 0                        
});


const uploadDir = 'uploads/';
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir)
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const now = new Date().toISOString().split('T')[0];
        cb(null, `${now}-${file.originalname}`);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp|avif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if(extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Csak képformátumok megengedettek!'));       
        }
    }
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
        req.user = user;
        next();
    });
}


// API végpontok

// regisztráció
app.post('/api/register', (req, res) => {
    const { user_name, email, psw} = req.body;
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
            const sql = 'INSERT INTO users (user_id, user_name, email, psw, role) VALUES (NULL, ?, ?, ?, "user")';
            pool.query(sql, [user_name, email, hash], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Hiba az adatbázis művelet során!' });
                }                               
                
                // Új felhasználó user_id-ja
                const newUserId = result.insertId;
                
                // kosár létrehozása
                const sql2 = 'INSERT INTO carts (cart_id, user_id) VALUES (NULL, ?)';
                pool.query(sql2, [newUserId], (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: 'Hiba az új SQL-ben!' });
                    }
                    
                    res.status(201).json({ message: 'Sikeres regisztráció!, kosár létrehozva!' });
                });
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

                // Ellenőrizzük, hogy admin-e
                const { role } = user;
               


                const token = jwt.sign({ id: user.user_id, role: role }, JWT_SECRET, { expiresIn: '1y' });
                
                res.cookie('auth_token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                    maxAge: 1000 * 60 * 60 * 24 * 30 * 12
                });

                return res.status(200).json({ message: 'Sikeres bejelentkezés', role:role });
                
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




//admin fiók létrehozása
app.post('/api/adminRegister', (req, res) => {
    const { user_name, email, psw} = req.body;
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
            const sql = 'INSERT INTO users (user_id, user_name, email, psw, role) VALUES (NULL, ?, ?, ?, "admin")';
            pool.query(sql, [user_name, email, hash], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Hiba az adatbázis művelet során!' });
                }                               
            
                    
                res.status(201).json({ message: 'Admin fiók létrehozva!' });
            });
        });
    });
});



// az összes termék lekérdezése
app.get('/api/products', authenticateToken, (req, res) => {
    const sql = 'SELECT * FROM products';

    pool.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba az SQL-ben', err });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Nincs még termék' });
        }

        return res.status(200).json(result);
    });
});

// az összes kategoria lekérdezése
app.get('/api/categories', authenticateToken, (req, res) => {
    const sql = 'SELECT * FROM categories';

    pool.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba az SQL-ben', err });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Nincs még termék' });
        }

        return res.status(200).json(result);
    });
});


//keresés atermékekben
app.get('/api/search/:searchQuery', authenticateToken, (req, res) => {
    const searchQuery = req.params.searchQuery;
    console.log(searchQuery);

    if (!searchQuery) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    const sqlQuery = `
        SELECT p.* 
        FROM products p
        JOIN categories c ON p.category_id = c.category_id
        WHERE p.name LIKE ? 
           OR p.description LIKE ? 
           OR c.name LIKE ? 
           OR c.description LIKE ?
    `;
    const values = [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`];

    pool.query(sqlQuery, values, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Database error' });
        }
        console.log(results);
        res.json(results);
    });
});




// kosár tartalmának lekérdezése és termékek megjelenítése
app.get('/api/getCartItems', authenticateToken, (req, res) => {
    const getCartIdQuery = 'SELECT cart_id FROM carts WHERE user_id = ?';

    pool.query(getCartIdQuery, [req.user.id], (err, cartResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Hiba az SQL lekérdezésben' });
        }

        if (!cartResult || cartResult.length === 0) {
            return res.status(404).json({ error: 'Nincs kosár a felhasználóhoz' });
        }

        const cart_id = cartResult[0].cart_id;

        const getCartItemsQuery = `
            SELECT 
                ci.cart_item_id, 
                ci.cart_id, 
                ci.product_id, 
                ci.quantity, 
                p.name AS product_name, 
                p.description, 
                p.price, 
                p.stock, 
                p.pic AS product_image, 
                c.category_id, 
                c.name AS category_name 
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.product_id
            JOIN categories c ON p.category_id = c.category_id
            WHERE ci.cart_id = ?`;

        pool.query(getCartItemsQuery, [cart_id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Hiba az SQL-ben', err });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: 'Nincsenek tételek a kosárban' });
            }

            return res.status(200).json(result);
        });
    });
});




//kosárhoz ad
app.post('/api/addCart/', authenticateToken, (req, res) => {
    if (req.user.role === 'admin') {
        return res.status(403).json({ error: 'Adminnak nincs kosara' });
    }

    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
        return res.status(400).json({ error: 'Minden mezőt ki kell tölteni' });
    }

    // Lekérdezzük a felhasználóhoz tartozó kosár azonosítót
    const getCartIdQuery = 'SELECT cart_id FROM carts WHERE user_id = ?';
    pool.query(getCartIdQuery, [req.user.id], (err, cartResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Hiba az SQL lekérdezésben' });
        }

        if (!cartResult || cartResult.length === 0) {
            return res.status(404).json({ error: 'Nincs kosár a felhasználóhoz' });
        }

        const cart_id = cartResult[0].cart_id;

        // Ellenőrizzük, hogy a termék már létezik-e a kosárban
        const checkProductQuery = 'SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?';
        pool.query(checkProductQuery, [cart_id, product_id], (err, productResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Hiba az SQL lekérdezésben' });
            }

            if (productResult.length > 0) {
                // Ha már van ilyen termék, növeljük a mennyiséget
                const newQuantity = productResult[0].quantity + quantity;
                const updateQuantityQuery = 'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?';

                pool.query(updateQuantityQuery, [newQuantity, cart_id, product_id], (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Hiba az SQL lekérdezésben' });
                    }
                    return res.status(200).json({ message: 'Termék mennyisége frissítve', product_id });
                });
            } else {
                // Ha nincs ilyen termék, beszúrjuk újként
                const insertCartItemQuery = 'INSERT INTO cart_items (cart_item_id, cart_id, product_id, quantity) VALUES (NULL, ?, ?, ?)';
                pool.query(insertCartItemQuery, [cart_id, product_id, quantity], (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Hiba az SQL lekérdezésben' });
                    }
                    return res.status(201).json({ message: 'Termék kosárhoz adva', product_id: result.insertId });
                });
            }
        });
    });
});


//törlés a kosárból
app.post('/api/deleteCart', authenticateToken, (req, res) => {
    if (req.user.role === 'admin') {
        return res.status(403).json({ error: 'Adminnak nincs kosara' });
    }

    const { product_id, quantity } = req.body;

    if (!product_id){
        return res.status(400).json({ error: 'Minden mezőt ki kell tölteni' });
    }

    // Lekérdezzük a felhasználóhoz tartozó kosár azonosítót
    const getCartId = 'SELECT cart_id FROM carts WHERE user_id = ?';
    pool.query(getCartId, [req.user.id], (err, cartResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Hiba az SQL lekérdezésben' });
        }
        console.log(req.user.id);
        
        // Ellenőrizzük, hogy van-e eredmény és hogy a cartResult nem üres tömb
        if (!cartResult || cartResult.length === 0) {
            return res.status(404).json({ error: 'Nincs kosár a felhasználóhoz' });
        }
    
        // Ellenőrizzük, hogy a cartResult[0] objektum tartalmazza-e a cart_id mezőt
        if (!cartResult[0].cart_id) {
            return res.status(500).json({ error: 'A kosár azonosítója nem található' });
        }
    
        const cart_id = cartResult[0].cart_id;

        // törlés
        const insertCartItemQuery = 'DELETE FROM cart_items WHERE cart_items.cart_id = ? AND cart_items.product_id = ?';
        pool.query(insertCartItemQuery, [cart_id, product_id, ], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Hiba az SQL lekérdezésben' });
            }

            return res.status(204).json({ message: 'Termék törölve a kosárból'});
        }); 
    });
});







//admin parancsok



// az összes felhasználó lekérdezése
app.get('/api/users', authenticateToken, (req, res) => {
    const sql = 'SELECT * FROM users';

        // Ellenőrizzük, hogy a felhasználó admin-e
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Nincs jogosultság a törléshez' });
        }

    pool.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba az SQL-ben', err });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Nincs még termék' });
        }

        return res.status(200).json(result);
    });
});



//felhasználó törlése
app.delete('/api/deleteUser', authenticateToken, (req, res) => {
    const { user_id } = req.body;

    // Ellenőrizzük, hogy a felhasználó admin-e
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Nincs jogosultság a törléshez' });
    }

    // SQL tranzakció indítása
    pool.getConnection((err, connection) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Adatbázis kapcsolat hiba' });
        }

        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                console.error(err);
                return res.status(500).json({ error: 'Tranzakciós hiba' });
            }

            // 1. Töröljük a felhasználóhoz tartozó rendelési tételeket
            connection.query('DELETE FROM order_items WHERE order_id IN (SELECT order_id FROM orders WHERE user_id = ?)', [user_id], (err) => {
                if (err) return rollbackTransaction(err, connection, res);
                console.log("Töröljük a felhasználóhoz tartozó rendelési tételeket");

                // 2. Töröljük a felhasználó rendeléseit
                connection.query('DELETE FROM orders WHERE user_id = ?', [user_id], (err) => {
                    if (err) return rollbackTransaction(err, connection, res);
                    console.log("Töröljük a felhasználó rendeléseit");

                    // 3. Töröljük a felhasználóhoz tartozó kosár elemeket
                    connection.query('DELETE FROM cart_items WHERE cart_id IN (SELECT cart_id FROM carts WHERE user_id = ?)', [user_id], (err) => {
                        if (err) return rollbackTransaction(err, connection, res);
                        console.log("Töröljük a felhasználóhoz tartozó kosár elemeket");

                        // 4. Töröljük a felhasználó kosarát
                        connection.query('DELETE FROM carts WHERE user_id = ?', [user_id], (err) => {
                            if (err) return rollbackTransaction(err, connection, res);
                            console.log("Töröljük a felhasználó kosarát");

                            // 5. Töröljük magát a felhasználót
                            connection.query('DELETE FROM users WHERE user_id = ?', [user_id], (err, result) => {
                                if (err) return rollbackTransaction(err, connection, res);
                                console.log("Töröljük magát a felhasználót");

                                if (result.affectedRows === 0) {
                                    return rollbackTransaction({ message: 'Felhasználó nem található' }, connection, res, 404);
                                }

                                // Ha minden sikeres, commit-oljuk a tranzakciót
                                connection.commit(err => {
                                    if (err) return rollbackTransaction(err, connection, res);
                                    connection.release();
                                    return res.status(204).send(); // Sikeres törlés
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
// Hibakezelő rollback függvény
function rollbackTransaction(err, connection, res, status = 500) {
    console.error(err);
    connection.rollback(() => {
        connection.release();
        res.status(status).json({ error: err.message || 'Hiba történt' });
    });
}


//user to admin
app.put('/api/updateUserRole', authenticateToken, (req, res) => {
    const { user_id } = req.body;

    // Ellenőrizzük, hogy a kérés indítója admin-e
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Nincs jogosultság a módosításhoz' });
    }

    const sqlGetRole = 'SELECT role FROM users WHERE user_id = ?';
    pool.query(sqlGetRole, [user_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Hiba az SQL lekérdezésben' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Felhasználó nem található' });
        }

        const currentRole = results[0].role;
        const newRole = currentRole === 'user' ? 'admin' : 'user';

        const sqlUpdateRole = 'UPDATE users SET role = ? WHERE user_id = ?';
        pool.query(sqlUpdateRole, [newRole, user_id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Hiba az SQL lekérdezésben' });
            }

            return res.status(200).json({ message: 'Szerepkör sikeresen frissítve', newRole });
        });
    });
});

//új kategoria hozzáadása
app.post('/api/addCategory', (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).json({ error: 'Minden mezőt ki kell tölteni' });
    }

    const sql = 'INSERT INTO categories (category_id, name, description) VALUES (NULL, ?, ?)';
    pool.query(sql, [name, description], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Hiba az SQL lekérdezésben' });
        }

        return res.status(201).json({ message: 'Kategória sikeresen hozzáadva', category_id: result.insertId });
    });
});



// új termek feltöltése
app.post('/api/upload', authenticateToken, upload.single('pic'), (req, res) => {


    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Nincs jogosultságod termék feltöltésére' });
    }

    const pic = req.file ? req.file.filename : null;

    if (pic === null) {
        return res.status(400).json({ error: 'Válassz ki egy képet' });
    }

    const { name, description, price, stock, category_id } = req.body;

    if (!name || !description || !price || !stock || !category_id) {
        return res.status(400).json({ error: 'Minden mezőt ki kell tölteni' });
    }

    const sql = 'INSERT INTO products (product_id, name, description, price, stock, category_id, pic) VALUES (NULL, ?, ?, ?, ?, ?, ?)';
    pool.query(sql, [name, description, price, stock, category_id, pic], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Hiba az SQL lekérdezésben' });
        }

        return res.status(201).json({ message: 'Termék sikeresen feltöltve', product_id: result.insertId });
    });
});


//termék törlése
app.delete('/api/deleteProduct/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Nincs jogosultságod termék törlésére' });
    }

    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Adja meg a törölni kívánt termék ID-jét' });
    }

    const sql = 'DELETE FROM products WHERE product_id = ?';
    pool.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Hiba az SQL lekérdezésben' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'A megadott ID-vel nem található termék' });
        }

        return res.status(200).json({ message: 'Termék sikeresen törölve' });
    });
});

//kategoria törlése
app.delete('/api/deleteCategory/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Nincs jogosultságod kategória törlésére' });
    }

    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Adja meg a törölni kívánt kategória ID-jét' });
    }

    const sql = 'DELETE FROM categories WHERE category_id = ?';
    pool.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Hiba az SQL lekérdezésben' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'A megadott ID-vel nem található kategória' });
        }

        return res.status(200).json({ message: 'Kategória sikeresen törölve' });
    });
});


//egy termék lekérdezése
app.get('/api/getItem/', authenticateToken, (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Az ID megadása kötelező' });
    }

    const sql = 'SELECT * FROM products WHERE product_id = ?';
    pool.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Hiba az SQL lekérdezésben' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'A termék nem található' });
        }

        return res.status(200).json(result[0]);
    });
});

//egy kategoria lekérdezése
app.get('/api/category/:categoryId', (req, res) => {
    const categoryId = req.params.categoryId;

    // SQL lekérdezés a kategória adatainak lekérésére
    const sql = 'SELECT category_id, name, description FROM categories WHERE category_id = ?';

    pool.query(sql, [categoryId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Hiba az SQL lekérdezésben' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Kategória nem található' });
        }

        return res.status(200).json({ category: result[0] });
    });
});


//termék szerkesztése
app.post('/api/updateItem', authenticateToken, upload.single('pic'), (req, res) => {


    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Nincs jogosultságod termék feltöltésére' });
    }

    const pic = req.file ? req.file.filename : null;


    
    const { name, description, price, stock, category_id, id } = req.body;
    
    if(!id){
        return res.status(403).json({ error: 'adj meg egy id-t' });

    }

    const sql = 'UPDATE products SET name = COALESCE(NULLIF(?, ""), name), description = COALESCE(NULLIF(?, ""), description), price = COALESCE(NULLIF(?, ""), price), stock = COALESCE(NULLIF(?, ""), stock), category_id = COALESCE(NULLIF(?, ""), category_id), pic = COALESCE(NULLIF(?, ""), pic) WHERE products.product_id = ?';

    pool.query(sql, [name, description, price, stock, category_id, pic, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Hiba az SQL lekérdezésben' });
        }

        return res.status(201).json({ message: 'Termék sikeresen frissítve', product_id: result.insertId });
    });
});
 //termék szerkesztése2
 app.post('/api/updateProductsInfo', authenticateToken,  (req, res) => {
    if (req.user.role !== 'admin') {
        console.log(req);
        return res.status(403).json({ error: 'Nincs jogosultságod termék frissítésére' });
    }

    

    const { Jelátvitel, Max_működési_idő, Hordhatósági_változatok, Termék_típusa, Kivitel, Bluetooth_verzió, Hangszóró_meghajtók, Szín, Csatlakozók, Bluetooth, Frekvenciaátvitel, Érzékenység, id } = req.body;

    if (!id) {
        return res.status(403).json({ error: 'Adj meg egy id-t' });
    }

    const sql = `
        UPDATE products
        SET 
            Jelátvitel = COALESCE(NULLIF(?, ""), Jelátvitel),
            Max. működési idő = COALESCE(NULLIF(?, ""), Max. működési idő),
            Hordhatósági változatok = COALESCE(NULLIF(?, ""), Hordhatósági változatok),
            Termék típusa = COALESCE(NULLIF(?, ""), Termék típusa),
            Kivitel = COALESCE(NULLIF(?, ""), Kivitel),
            Bluetooth verzió = COALESCE(NULLIF(?, ""), Bluetooth verzió),
            Hangszóró-meghajtók = COALESCE(NULLIF(?, ""), Hangszóró-meghajtók),
            Szín = COALESCE(NULLIF(?, ""), Szín),
            Csatlakozók = COALESCE(NULLIF(?, ""), Csatlakozók),
            Bluetooth = COALESCE(NULLIF(?, ""), Bluetooth),
            Frekvenciaátvitel = COALESCE(NULLIF(?, ""), Frekvenciaátvitel),
            Érzékenység = COALESCE(NULLIF(?, ""), Érzékenység),
            pic = COALESCE(NULLIF(?, ""), pic)
        WHERE products.product_id = ?`;

    pool.query(sql, [
        Jelátvitel, Max_működési_idő, Hordhatósági_változatok, Termék_típusa, Kivitel, 
        Bluetooth_verzió, Hangszóró_meghajtók, Szín, Csatlakozók, Bluetooth, 
        Frekvenciaátvitel, Érzékenység, pic, id
    ], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Hiba az SQL lekérdezésben' });
        }

        return res.status(200).json({ message: 'Termék sikeresen frissítve' });
    });
});



// Kategória szerkesztése
app.post('/api/updateCategory', authenticateToken, (req, res) => {
    console.log(req.body);
    const { cat_id, edit_categorie_name, edit_categorie_description } = req.body; 

    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Nincs jogosultságod kategória szerkesztésére' });
    }

    //const { name, description, id } = req.body;
    
    if (!cat_id) {
        return res.status(400).json({ error: 'Kategória ID szükséges' });
        
    }

    const sql = 'UPDATE categories SET name = COALESCE(NULLIF(?, ""), name), description = COALESCE(NULLIF(?, ""), description) WHERE category_id = ?';

    pool.query(sql, [edit_categorie_name, edit_categorie_description, cat_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Hiba az SQL lekérdezésben' });
        }

        return res.status(200).json({ message: 'Kategória sikeresen frissítve', category_id: result.insertId });
    });
});












//email küldés

const EMAIL_PSW = process.env.EMAIL_PSW;

app.post('/api/send-email', async (req, res) => {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
        return res.status(400).json({ error: 'Hiányzó mezők: to, subject, text' });
    }

    // Nodemailer konfiguráció
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'the.shop.orderinfo@gmail.com',
            pass: EMAIL_PSW 
        }
    });

    const mailOptions = {
        from: 'the.shop.orderinfo@gmail.com',
        to,
        subject,
        text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        res.json({ message: 'E-mail elküldve!', info });
    } catch (error) {
        res.status(500).json({ error: 'Hiba történt az e-mail küldésekor', details: error.message });
    }
});



app.listen(PORT, HOSTNAME, () => {
    console.log(`IP: http://${HOSTNAME}:${PORT}`);
});

