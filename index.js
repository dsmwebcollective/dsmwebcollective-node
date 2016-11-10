const yaml = require('js-yaml');
const dotenv = require('dotenv');
const request = require('es6-request');
const fs = require('fs');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
app.use(bodyParser.json());

dotenv.load();

const EVENTS_PATH = '_data/events.yml';

getEntries = (commit, ymlRelativePath) => {
    return new Promise((fulfill, reject) => {
        request.get(`https://raw.githubusercontent.com/${process.env.GITHUB_USERNAME}/dsmwebcollective.github.io/${commit}/${ymlRelativePath}`)
        .then((response) => {
            fulfill(yaml.safeLoad(response[0]) || []);
        });
    });
};

// Assumes the two objects share the same properties
objectsAreEqual = (obj1, obj2) => {
    return Object.keys(obj1).every((key) => obj1[key] === obj1[key]);
};

getNewEntries = (req, entryFilePath) => {
    return new Promise((fulfill, reject) => {
        if(!req.body.before || !req.body.after) {
            throw 'Request is missing before and/or after commit hashes';
        }

        const previousCommit = req.body.before;
        const currentCommit = req.body.after;

        Promise.all([
            getEntries(previousCommit, entryFilePath),
            getEntries(currentCommit, entryFilePath),
        ]).then((values) => {
            const [previousEntries, currentEntries] = values;
            const newEntries = currentEntries.filter((currentEntry) => 
                !previousEntries.some((previousEntry) => objectsAreEqual(previousEntry, currentEntry)));
            fulfill(newEntries);
        });
    });
}

app.post('/', (req, res) => {
    getNewEntries(req, EVENTS_PATH)
    .then((newEvents) => {
        console.log(`${newEvents.length} new events!`);
    })
    .catch((err) => {
        console.log(`An error occurred retrieving new events: ${err}`);
    });

    res.end();
});

const port = process.argv[2] || process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});