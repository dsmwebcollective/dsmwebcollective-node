{
    const dotenv = require('dotenv');
    const bodyParser = require('body-parser');
    const express = require('express');
    const app = express();
    app.use(bodyParser.json());
    dotenv.load();

    const dsmGithub = require('./dsm-github');

    _postNewEventsToSlack = (req) => {
        dsmGithub.getNewEventEntries(req)
        .then((newEvents) => {
            console.log(`${newEvents.length} new events!`);
        })
        .catch((err) => {
            console.log(`An error occurred retrieving new events: ${err}`);
        });
    };

    app.post('/', (req, res) => {
        _postNewEventsToSlack(req);
        res.end();
    });

    const port = process.argv[2] || process.env.PORT || 8000;
    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
}