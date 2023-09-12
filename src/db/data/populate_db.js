const bcrypt = require('bcrypt');
const client = require('../');

// Function to hash passwords
const hashPassword = async (password) => {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
};

const runDataInsertion = async () => {
    let admin1, admin2, member1, member2, emailVerify1, token1;

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        // Initialize data
        admin1 = {
            username: 'admin',
            password: await hashPassword('$2b$12$SFKfbItlBxCaYp/OnMI/iOdC5AgJbuLC/fK0s2Dfr.CgyzwGLmMwy'),
        };

        admin2 = {
            username: 'linux',
            password: await hashPassword('$2b$12$A6wVaa5Hs09Ab3YKWTsqiObvXPCLTNebhOCGuFOLLaR4ngwoqAZDq'),
        };

        member1 = {
            username: 'bob',
            password: await hashPassword('$2b$12$edxyaKda4of6CrWzZ28m5eEel3PFXFWbfgxhARZpB7ELwjPNEq2Ca'),
            email: 'bob@bob.com',
            first_name: 'Bob',
            last_name: 'Bobson',
            phone_number: '+32145678',
            postal_code: 'NYC ITY',
            is_activated: true,
        };

        member2 = {
            username: 'jane',
            password: await hashPassword('$2b$12$3ZoSaOHW68Hpz7Pj4mf/h.nwp6e7uw5gE6.wUDknM/QrX1tt2Mb5y'),
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
        };

        // Insert data into collections
        const db = client.db('space_db');
        await db.collection('Admin').insertMany([admin1, admin2]);
        await db.collection('EmailVerify').insertMany([emailVerify1]);
        await db.collection('User').insertMany([member1, member2]);
        await db.collection('Token').insertMany([token1]);

        console.log('Data inserted successfully.');
    } catch (error) {} finally {
        await client.close();
    }
};

// runDataInsertion().then();

module.exports = runDataInsertion;