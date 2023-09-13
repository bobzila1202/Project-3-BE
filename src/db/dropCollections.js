// drop all custom collections
const client = require('../db');

module.exports = async () => {
    try {
        await client.connect();

        const db = client.db('space_db');
        // deleting all collections
        await db.collection('User').drop();
        await db.collection('EmailVerify').drop();
        await db.collection('Token').drop();
        await db.collection('Admin').drop();
        await db.collection('Encounter').drop();
        await db.collection('Scoreboard').drop();
        await db.collection('CodeSnippet').drop();
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }
}