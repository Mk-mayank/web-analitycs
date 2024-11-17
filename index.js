const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const UAParser = require('ua-parser-js');
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
    const parser = new UAParser(req.headers['user-agent']);
    const result = parser.getResult();

    // Determine device type
    let deviceType = 'Unknown';
    if (result.device.type) {
        deviceType = result.device.type;
    } else if (result.os.name === 'Android' || result.os.name === 'iOS') {
        deviceType = 'Mobile';
    } else if (/Windows|Mac OS|Linux/.test(result.os.name)) {
        deviceType = 'Desktop';
    }

    const deviceModel = result.device.model || result.os.name || 'Unknown';
    const browser = result.browser.name || 'Unknown';
    const os = result.os.name || 'Unknown';

    // Save the search query and user device details to the database
    const sql = 'INSERT INTO search_logs (query, device_type, device_model, browser, os) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [searchQuery, deviceType, deviceModel, browser, os], (err) => {
        if (err) {
            console.error('Error saving search query:', err);
            return res.status(500).send('Error saving search query');
        }
        console.log(`Search query saved: ${searchQuery}`);
        console.log(`User device: ${deviceType} (${deviceModel}), Browser: ${browser}, OS: ${os}`);
        res.send('Search recorded');
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});