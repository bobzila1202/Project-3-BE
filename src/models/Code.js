const client = require('../db');
const {ObjectId} = require("mongodb");
const codes_db = client.db('space_db').collection('CodeSnippet');

class Code {
    constructor({_id, question, funcName, tests}) {
        this._id = _id;
        this.question = question;
        this.funcName = funcName;
        this.tests = tests;
    }

    static async getRandom(sessionObtained) {
        await client.connect();

        // filter out the encounters that are already in session
        const filter = {_id: {$nin: sessionObtained}};

        // get number of available encounters
        const availableCodeCount = await codes_db.countDocuments(filter);

        if (availableCodeCount === 0) {
            throw new Error("No encounters available!");
        }

        // get random index encounter excluding the ones in session
        const randomIndex = Math.floor(Math.random() * availableCodeCount);
        const randomCode = await codes_db.findOne(filter, {skip: randomIndex});

        if (!randomCode) {
            throw new Error("No encounters available!");
        }

        return new Code(randomCode);
    }

    static async getById(id) {
        await client.connect();
        return await codes_db.findOne({_id: new ObjectId(id)});
    }
}

module.exports = Code;