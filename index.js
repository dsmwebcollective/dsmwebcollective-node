const git = require('nodegit');
const yaml = require('js-yaml');
const dotenv = require('dotenv');
const fs = require('fs');
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

const getNewEvents = (req) => {
    const previousHead = req.body.before;
    const currentHead = req.body.after;
    git.clone(process.env.GIT_REPO, 'tmp')
    .then((repo) => Promise.all([
        repo.getCommit(previousHead),
        repo.getCommit(currentHead)]))
    .then((commits) => Promise.all(
        commits.map((commit) => commit.getEntry('_data/events.yml'))))
    .then((entries) => Promise.all(
        entries.map((entry) => entry.getBlob())))
    .then((files) => {
        const [previousEvents, currentEvents] = files.map((contents) => {
            return yaml.safeLoad(String(contents));
        });
        return currentEvents.filter((currentEvent) => {
            return !previousEvents.some((previousEvent) =>
                eventsAreTheSame(previousEvent, currentEvent));
        });
    });
};

const eventsAreTheSame = (event1, event2) => {
    return event1.title === event2.title &&
           event1.group === event2.group &&
           event1.location === event2.location &&
           event1.details_url === event2.details_url &&
           event1.date === event2.date &&
           event2.time === event2.time;
};

app.post('/', (req, res) => {
    if(fileWasModified(req, "_data/events.yml")) {
        getNewEvents(req)
        .then((events) => {
            if(events.length > 0) {
                console.log('An event was added!');
            } else {
                console.log('No events added!');
            }
        })
        .catch((err) => {
            console.log(error);
        });
    }
    res.end();
});

app.post('/test', (req, res) => {
    const fs = require('fs');
    const doc = yaml.safeLoad(fs.readFileSync('test.yml', 'utf8'));
    console.log(doc);
    res.end();
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});