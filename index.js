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
        dsmGithub.event.getNewEntries(req.body.before, req.body.after)
        .then((newEvents) => {
            if(newEvents.length > 0) {
                slack.postNewEventsToSlack(newEvents);
            }
        })
        .catch((err) => {
            console.log(`An error occurred posting events to Slack: ${err}`);
        });
    };

    _postNewJobsToSlack = (req) => {
        dsmGithub.job.getNewEntries(req.body.before, req.body.after)
        .then((newJobs) => {
            if(newJobs.length > 0) {
                slack.postNewJobsToSlack(newJobs);
            }
        })
        .catch((err) => {
            console.log(`An error occurred posting jobs to Slack: ${err}`);
        });
    };

    _handleEventsSlashCommand = () => {
        return new Promise((fulfill, reject) => {
            dsmGithub.event.getLatestEntries()
            .then((events) => {
                fulfill({
                    text: "Events",
                    attachments: events.map((event) => slack.buildEventAttachment(event))
                });
            });
        });
    };

    _handleJobsSlashCommand = () => {
        return new Promise((fulfill, reject) => {
            dsmGithub.job.getLatestEntries()
            .then((jobs) => {
                fulfill({
                    text: "Jobs",
                    attachments: jobs.map((job) => slack.buildJobAttachment(job))
                });
            });
        });
    };

    app.post('/', (req, res) => {
        if(!req.body || !req.body.before || !req.body.after) {
            res.send('Request is missing body.before and/or body.after commit hashes');
            return;
        }
        _postNewEventsToSlack(req);
        _postNewJobsToSlack(req);
        res.end();
    });

    app.get('/events', (req, res) => {
        _handleEventsSlashCommand()
        .then((response) => {
            res.send(response);
        })
        .catch((err) => {
            res.send('Oops.  Check http://dsmwebcollective.com/events for the current list of events.');
        });
    });

    app.get('/jobs', (req, res) => {
        _handleJobsSlashCommand()
        .then((response) => {
            res.send(response);
        })
        .catch((err) => {
            res.send('Oops.  Check http://dsmwebcollective.com/jobs for the current list of jobs.');
        });
    });

    const port = process.argv[2] || process.env.PORT || 8000;
    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
}