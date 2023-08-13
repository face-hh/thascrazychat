const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

const downloadsPath = 'C:/Users/User/Downloads'; // Replace this with your actual Downloads folder path
const whitelist = ['https://youtube.com', 'http://localhost:3000']
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

app.use(cors(corsOptions));

app.use(express.static(downloadsPath));

app.get('/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(downloadsPath, filename);

    res.sendFile(filePath, err => {
        if (err) {
            console.error(`Error sending file: ${err.message}`);
            res.status(err.status || 500).send('Internal Server Error');
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});