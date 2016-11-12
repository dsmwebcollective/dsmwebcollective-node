{
    const Slack = require('slack-node');

    buildEventAttachment = (event) => {
        return {
            title: event.title,
            title_link: event.details_url,
            text: `Group: ${event.group}\nLocation: ${event.location}\nDate: ${event.date}\nTime: ${event.time}`
        };
    };

    buildJobAttachment = (job) => {
        return {
            title: job.title,
            title_link: job.url,
            text: job.company
        };
    };

    postNewEventsToSlack = (events) => {
        _postToSlack(
            '#events',
            'One or more events were just added to http://dsmwebcollective.com/events!',
            events.map((event) => buildEventAttachment(event)),
            process.env.SLACK_USERNAME,
            process.env.SLACK_EVENTS_WEBHOOK_URI);
    };

    postNewJobsToSlack = (jobs) => {
        _postToSlack(
            '#jobs',
            'One or more jobs were just added to http://dsmwebcollective.com/jobs!',
            jobs.map((job) => buildJobAttachment(job)),
            process.env.SLACK_USERNAME,
            process.env.SLACK_JOBS_WEBHOOK_URI)
    };

    _postToSlack = (channel, title, attachments, username, webhookUri) => {
        slack = new Slack();
        slack.setWebhook(webhookUri);

        slack.webhook({
            channel: channel,
            username: username,
            text: title,
            attachments: attachments
        }, (err, response) => {
            if(err) throw err;
        });
    };

    module.exports = {
        postNewEventsToSlack: postNewEventsToSlack,
        postNewJobsToSlack: postNewJobsToSlack,
        buildEventAttachment: buildEventAttachment,
        buildJobAttachment: buildJobAttachment
    };
}