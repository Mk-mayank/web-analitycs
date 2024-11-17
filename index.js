const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

// Set up EJS as view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware for parsing JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Route to render the search page
app.get('/', (req, res) => {
    res.render('search', { title: 'Hotel Search' });
});

// Route to handle search queries
app.post('/search', (req, res) => {
    const searchQuery = req.body.query;

    // Save the search query to the database
    const sql = 'INSERT INTO search_logs (query) VALUES (?)';
    db.query(sql, [searchQuery], (err) => {
        if (err) {
            console.error('Error saving search query:', err);
            return res.status(500).send('Error saving search query');
        }
        console.log(`Search query saved: ${searchQuery}`);
        res.send('Search recorded');
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
