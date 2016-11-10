{
    const yaml = require('js-yaml');
    const request = require('es6-request');

    const EVENTS_PATH = '_data/events.yml';
    const JOBS_PATH = '_data/jobs.yml';
    const GROUPS_PATH = '_data/groups.yml';

    getNewEventEntries = (req) => {
        return getNewEntries(req, EVENTS_PATH);
    };

    getNewJobEntries = (req) => {
        return getNewEntries(req, JOBS_PATH);
    };

    getNewGroupEntries = (req) => {
        return getNewEntries(req, GROUPS_PATH);
    }

    getNewEntries = (req, entryFilePath) => {
        return new Promise((fulfill, reject) => {
            if(!req.body || !req.body.before || !req.body.after) {
                throw 'Request is missing body.before and/or body.after commit hashes';
            }

            const previousCommit = req.body.before;
            const currentCommit = req.body.after;

            Promise.all([
                getEntries(previousCommit, entryFilePath),
                getEntries(currentCommit, entryFilePath),
            ]).then((values) => {
                const [previousEntries, currentEntries] = values;
                const newEntries = currentEntries.filter((currentEntry) => 
                    !previousEntries.some((previousEntry) => _objectsAreEqual(previousEntry, currentEntry)));
                fulfill(newEntries);
            });
        });
    }
    
    getEntries = (commit, ymlRelativePath) => {
        return new Promise((fulfill, reject) => {
            request.get(`https://raw.githubusercontent.com/${process.env.GITHUB_USERNAME}/dsmwebcollective.github.io/${commit}/${ymlRelativePath}`)
            .then((response) => {
                fulfill(yaml.safeLoad(response[0]) || []);
            });
        });
    };

    // Assumes the two objects share the same properties
    _objectsAreEqual = (obj1, obj2) => {
        return Object.keys(obj1).every((key) => obj1[key] === obj2[key]);
    };

    module.exports = {
        getNewEventEntries: getNewEventEntries,
        getNewJobEntries: getNewJobEntries,
        getNewGroupEntries: getNewGroupEntries,
        getNewEntries: getNewEntries,
        getEntries: getEntries
    }
}