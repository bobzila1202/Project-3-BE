const bcrypt = require('bcrypt');

const client = require('../');
const codeSnippets = require('./codeSnippets');
const encounters = require('./encounters');

// Function to hash passwords
const hashPassword = async (password) => {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
};

const runDataInsertion = async () => {
    let admin1, admin2, member1, member2, emailVerify1, token1, bob_leaderboard;

    await client.connect();
    //console.log('Connected to MongoDB');

    // Initialize data
    admin1 = {
        username: 'admin',
        password: await hashPassword('admin'),
    };

    admin2 = {
        username: 'linux',
        password: await hashPassword('linux'),
    };

    member1 = {
        username: 'bob',
        password: await hashPassword('bob'),
        email: 'bob@bob.com',
        first_name: 'Bob',
        last_name: 'Bobson',
        phone_number: '+32145678',
        postal_code: 'NYC ITY',
        is_activated: true,
    };

    member2 = {
        username: 'jane',
        password: await hashPassword("jane"),
        email: 'jane@jane.com',
        first_name: 'Jane',
        last_name: 'Janerson',
        phone_number: '+1235678',
        postal_code: 'NEW ICE',
        is_activated: false,
    };

    emailVerify1 = {
        username: 'jane',
        token: 'jane_token',
    };

    token1 = {
        account_username: 'bob',
        token: 'bob_token',
        created_at: new Date(),
        // its always 30 minutes from now, as reflected in cookie session
        expires_at: new Date(Date.now() + 30 * 60 * 1000),

    };

    bob_leaderboard = {
        username: 'bob',
        score: 0,
    };

    // Insert data into collections
    const db = client.db('space_db');
    await db.collection('Admin').insertMany([admin1, admin2]);
    await db.collection('EmailVerify').insertMany([emailVerify1]);
    await db.collection('User').insertMany([member1, member2]);
    //await db.collection('Token').insertMany([token1]);
    await db.collection('Encounter').insertMany(encounters);
    await db.collection('Scoreboard').insertMany([bob_leaderboard]);
    await db.collection('CodeSnippet').insertMany(codeSnippets);
    //console.log('Data inserted successfully.');

};

// runDataInsertion().then();

module.exports = runDataInsertion;