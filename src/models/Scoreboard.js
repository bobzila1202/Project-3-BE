const client = require('../db');
const scoreboard_db = client.db('space_db').collection('Scoreboard');

class Scoreboard{
    constructor({username, score}) {
        this.username = username;
        this.score = score;
    }

    static async getAll() {
        await client.connect();

        const response = await scoreboard_db
            .find({})
            .toArray();

        return response.map(user => new Scoreboard(user));
    }

    static async initEmpty(username) {
        await client.connect();

        return await scoreboard_db
            .insertOne({username, score: 0});
    }

    static async incrementScore(username) {
        await client.connect();

        return await scoreboard_db
            .updateOne({username}, {$inc: {score: 1}});
    }

    static async getByUsername(username) {
        await client.connect();

        return await scoreboard_db
            .findOne({username});
    }
}

module.exports = Scoreboard;