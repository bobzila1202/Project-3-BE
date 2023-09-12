// drop all custom collections
const client = require('../db');

module.exports = async () => {
    try {
        await client.connect();

        const db = client.db('space_db');

        await db.collection('User').drop();
        await db.collection('EmailVerify').drop();
        await db.collection('Token').drop();
        await db.collection('Admin').drop();
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }
}