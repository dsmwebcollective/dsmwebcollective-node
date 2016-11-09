const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
app.use(bodyParser.json());

dotenv.load();

const fileWasModified = (req, path) => {
    return req.body.commits.some((commit) => {
        return commit.modified.includes(path);
    });
};

app.post('/', (req, res) => {
    if(fileWasModified(req, "_data/events.yml")) {
        console.log('events.yml was modified!');
    }
    res.end();
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});