const client = require('../db');
const users_db = client.db('space_db').collection('User');

class User {
    constructor({username, password, email, first_name, last_name, phone_number, postal_code}) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.first_name = first_name;
        this.last_name = last_name;
        this.phone_number = phone_number;
        this.postal_code = postal_code;
    }

    static getAll = async () => {
        await client.connect();
        // return username and email only
        return await users_db
            .find({}, {projection: {_id: 0, username: 1, email: 1}})
            .toArray();
    };

    static async create(data) {
        await client.connect();
        const {username, password, email} = data;

        // check if username or email already exists
        const user = await users_db.findOne({
            $or: [{username: username}, {email: email}],
        });

        if (user) {
            // unique constraint violated
            throw new Error("Username or email already exists");
        }

        // insertOne by using templated to prevent SQL injection
        await users_db.insertOne({
            username: username,
            password: password,
            email: email,
            is_activated: false,
            first_name: null,
            last_name: null,
            phone_number: null,
            postal_code: null,
        });

        // return the newly created user
        return await this.getByUsername(username);
    }

    static async getByUsername(username) {
        await client.connect();
        console.log()
        const response = await users_db
            .findOne({username: username});

        // return a new User instance
        return new User(response);
    }

    static async getByEmail(email) {
        await client.connect();
        return await users_db.findOne({email: email});
    }

    async isActivated() {
        await client.connect();

        const user = await users_db.findOne({username: this.username});

        return user.is_activated;
    }

    async activate() {
        await client.connect();

        return await users_db.updateOne(
            {username: this.username},
            {$set: {is_activated: true}}
        );
    }

    async updateBasicDetails() {
        await client.connect();

        return await users_db.updateOne(
            {username: this.username},
            {$set: {first_name: this.first_name, last_name: this.last_name, phone_number: this.phone_number, postal_code: this.postal_code}}
        );
    }

    async updatePassword() {
        await client.connect();

        return await users_db.updateOne(
            {username: this.username},
            {$set: {password: this.password}}
        );
    }
}

module.exports = User;