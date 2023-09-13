const {v4: uuidv4} = require('uuid');
const base_url = require("../middleware/serverUrl");

const client = require('../db');
const tokens_db = client.db('space_db').collection('EmailVerify');

class EmailToken{
    constructor({username}) {
        this.username = username;
    }

    static async create(username) {
        await client.connect();
        const token = uuidv4();

        await tokens_db.insertOne({
            username: username,
            token: token,
        });

        // note the missing / at the start of the url
        return base_url + "users/verify/" + token;
    }

    static async getOneByToken(token) {
        await client.connect();

        const token_data = await tokens_db.findOne({token: token});

        if (!token_data) {
            throw new Error("Token has been expired or used");
        }

        return new EmailToken(token_data);
    }

    static async delete(token) {
        await client.connect();

        await tokens_db.deleteOne({token: token});
    }

    static async deleteAllByUsername(username) {
        await client.connect();

        await tokens_db.deleteMany({username: username});
    }
}

module.exports = EmailToken;