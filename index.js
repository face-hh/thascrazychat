const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'videos')));

app.listen(port, () => {
  console.log(`ThatsCrazyChat-Server is running on port ${port}`);
});
