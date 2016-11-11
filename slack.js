{
    const Slack = require('slack-node');

    postEventToSlack = (event) => {
        slack = new Slack();
        slack.setWebhook(process.env.SLACK_EVENTS_WEBHOOK_URI);

        slack.webhook({
            channel: process.env.SLACK_EVENTS_CHANNEL,
            username: process.env.SLACK_USERNAME,
            text: _getEventText(event)
        }, (err, response) => {
            if(err) throw err;
        });
    };

    _getEventText = (event) => {
        return `
*An event was added!*

*Title*:\t${event.title || '_Unknown_'}
*Group*:\t${event.group || '_Unknown_'}
*Location*:\t${event.location || '_Unknown_'}
*Details*:\t${event.details_url || '_Unknown_'}
*Date*:\t${event.date || '_Unknown_'}
*Time*:\t${event.time || '_Unknown_'}
        `;
    };

    postJobToSlack = (job) => {
        slack = new Slack();
        slack.setWebhook(process.env.SLACK_JOBS_WEBHOOK_URI);

        slack.webhook({
            channel: process.env.SLACK_JOBS_CHANNEL,
            username: process.env.SLACK_USERNAME,
            text: _getJobText(job)
        }, (err, response) => {
            if(err) throw err;
        });
    };

    _getJobText = (job) => {
        return `
*A job was added!*

*Title*:\t${job.title || '_Unknown_'}
*Company*:\t${job.company || '_Unknown_'}
*Url*:\t${job.url || '_Unknown_'}
        `;
    };

    module.exports = {
        postEventToSlack: postEventToSlack,
        postJobToSlack: postJobToSlack
    };
}