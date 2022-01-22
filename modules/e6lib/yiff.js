const fetch = require('node-fetch');
const auth = require('./helpers/auth.js');
const { RateLimiter } = require('limiter');

// All main class functions will return this class

class response {
    constructor(data, ok, status) {
        this.data = data;
        this.ok = ok;
        this.status = status;
    }
}

// Main class

class e621js {
    #headers;
    #limiter;

    constructor(username, apikey, agent) {
        if (!(apikey && username && agent)) {
            throw new Error('Missing Arguments');
        }

        this.#headers = {
            'User-Agent': agent,
            Authorization: auth(username, apikey)
        };
        this.end = 'https://e621.net/';

        this.#limiter = new RateLimiter({tokensPerInterval: 1, interval: 'second'});

        this.colours = [ 0xffb538, 0x012e57, 0x3673aa, 0xffffff ];
    }

    async #get(url) {
        const remainingRequests = await this.#limiter.removeTokens(1);
        const resp = fetch(this.end + url, {method: 'GET', headers: this.#headers});
        return resp;
    }

    async getpost(id) { // Get post from post id
        let url = `posts/${id}.json`;
        const resp = await this.#get(url);
        const data = await resp.json();
        return new response(data['post'], resp.ok, resp.status);
    }

    async search(tags, limit, page) { // Limit is how many per page and page is page
        let url = `posts.json?limit=${limit}&page=${page}&tags=${tags.join('+')}`;
        const resp = await this.#get(url);
        const data = await resp.json();
        return new response(data['posts'], resp.ok, resp.status);
    }

    async getuser(id) {
        let url = `users/${id}.json`;
        const resp = await this.#get(url);
        const data = await resp.json();
        return new response(data, resp.ok, resp.status);
    }

    async searchuser(name) {
        let url = `users.json?search[name_matches]=${name}`;
        const resp = await this.#get(url);
        const data = await resp.json();
        return new response(data, resp.ok, resp.status);
    }
}

module.exports = e621js;