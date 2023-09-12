const client = require('../db');

// Placeholder for a Game model
class User {
    static async getAll() {
        await client.connect();
        return await client.db("space_db").collection("User").find().toArray();
    }
}

module.exports = User;