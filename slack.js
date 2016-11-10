{
    const Slack = require('slack-node');

    postEventToSlack = (event) => {
        slack = new Slack();
        slack.setWebhook(process.env.SLACK_WEBHOOK_URI);

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

----------------------------------------------
        `;
    };

    module.exports = {
        postEventToSlack: postEventToSlack
    };
}