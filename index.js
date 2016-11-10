{
    const dotenv = require('dotenv');
    const bodyParser = require('body-parser');
    const express = require('express');
    const app = express();
    app.use(bodyParser.json());

    if(process.env.NODE_ENV !== 'production')
        dotenv.load();

    const dsmGithub = require('./dsm-github');
    const slack = require('./slack');

    _postNewEventsToSlack = (req) => {
        dsmGithub.getNewEventEntries(req)
        .then((newEvents) => {
            newEvents.forEach((event) => {
                slack.postEventToSlack(event);
            });
        })
        .catch((err) => {
            console.log(`An error occurred posting events to Slack: ${err}`);
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