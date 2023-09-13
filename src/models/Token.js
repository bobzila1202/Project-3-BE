const {v4: uuidv4} = require("uuid");
const client = require('../db');
const tokens_db = client.db('space_db').collection('Token');

class Token {
    constructor({token_id, account_username, token, expires_at, created_at}) {
        this.token_id = token_id;
        this.account_username = account_username;
        this.token = token;
        this.expires_at = expires_at;
        this.created_at = created_at;
    }

    static async create(account_username) {
        await client.connect();

        const token = uuidv4();
        const created_at = new Date();
        const expires_at = new Date(Date.now() + 30 * 60 * 1000);

        await tokens_db.insertOne({
            account_username: account_username,
            token: token,
            created_at: created_at,
            expires_at: expires_at,
            session_encounters: [],
            session_code_snippets: [],
        });

        return new Token({
            account_username: account_username,
            token: token,
            created_at: created_at,
            expires_at: expires_at,
        });
    }

    static async getByToken(token) {
        await client.connect();

        const token_data = await tokens_db.findOne({token: token});

        if (!token_data) {
            throw new Error("Token not found");
        }

        return new Token(token_data);
    }

    static async delete(token) {
        await client.connect();

        await tokens_db.deleteOne({token: token});
    }

    static async deleteAllByUsername(username) {
        await client.connect();

        await tokens_db.deleteMany({account_username: username});
    }

    async isExpired() {
        await client.connect();

        const response = await tokens_db.findOne({token: this.token});

        if (!response) {
            throw new Error("Token not found");
        }

        return response.expires_at < new Date();
    }

    // session encounters for the currently logged-in user
    static async getSessionEncounters(username) {
        await client.connect();

        const response = await tokens_db.findOne({account_username: username});

        if (!response) {
            throw new Error("Token not found");
        }

        return response.session_encounters;
    }
    static async addSessionEncounter(username, encounter) {
        await client.connect();

        await tokens_db.updateOne(
            {account_username: username},
            {$push: {session_encounters: encounter}}
        );
    }

    static async addSessionCodeSnippet(username, encounter) {
        await client.connect();

        await tokens_db.updateOne(
            {account_username: username},
            {$push: {session_code_snippets: encounter}}
        );
    }

    // session used code snippets for the currently logged-in user
    static async getSessionCodeSnippets(username) {
        await client.connect();

        const response = await tokens_db.findOne({account_username: username});

        if (!response) {
            throw new Error("Token not found");
        }

        return response.session_code_snippets;
    }
}

module.exports = Token;