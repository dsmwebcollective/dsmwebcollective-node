{
    const yaml = require('js-yaml');
    const request = require('es6-request');
    
    const util = require('./util');

    const EVENTS_PATH = '_data/events.yml';
    const JOBS_PATH = '_data/jobs.yml';
    const GROUPS_PATH = '_data/groups.yml';

    class Entry {
        constructor(ymlRelativePath) {
            this.ymlRelativePath = ymlRelativePath;
        }

        getEntries(commit) {
            return new Promise((fulfill, reject) => {
                request.get(this._getGithubUrl(process.env.GITHUB_USERNAME, commit, this.ymlRelativePath))
                .then((response) => {
                    fulfill(yaml.safeLoad(response[0]) || []);
                });
            });
        }

        getNewEntries(beforeCommit, afterCommit) {
            return new Promise((fulfill, reject) => {
                Promise.all([
                    this.getEntries(beforeCommit),
                    this.getEntries(afterCommit),
                ]).then((values) => {
                    const [previousEntries, currentEntries] = values;
                    const newEntries = currentEntries.filter((currentEntry) => 
                        !previousEntries.some((previousEntry) => util.objectsAreEqual(previousEntry, currentEntry)));
                    fulfill(newEntries);
                });
            });
        }

        getLatestEntries() {
            return this.getEntries('master');
        }

        _getGithubUrl(username, commit, file) {
            return `https://raw.githubusercontent.com/${username}/dsmwebcollective.github.io/${commit}/${file}`;
        }
    }

    class EventEntry extends Entry {
        constructor() {
            super(EVENTS_PATH);
        }
    }

    class JobEntry extends Entry {
        constructor() {
            super(JOBS_PATH);
        }
    }

    class GroupEntry extends Entry {
        constructor() {
            super(GROUPS_PATH);
        }
    }

    module.exports = {
        event: new EventEntry(),
        job: new JobEntry(),
        group: new GroupEntry()
    }
}