const client = require('../db');
const encounters_db = client.db('space_db').collection('Encounter');

class Encounter {
    constructor({_id, type, text, enemyStats, enemyType}) {
        this.type = type; // combat, traversal, checkpoint
        this.text = text; // description of encounter
        this.enemyStats = enemyStats; // only for combat
        this.enemyType = enemyType; // only for combat
        this._id = _id; // actual id of the encounter in mongodb
    }

    static async getRandom(sessionObtained) {
        await client.connect();

        // filter out the encounters that are already in session
        const filter = {_id: {$nin: sessionObtained}};

        // get number of available encounters
        const availableEncounterCount = await encounters_db.countDocuments(filter);

        if (availableEncounterCount === 0) {
            throw new Error("No encounters available!");
        }

        // get random index encounter excluding the ones in session
        const randomIndex = Math.floor(Math.random() * availableEncounterCount);
        const randomEncounter = await encounters_db.findOne(filter, {skip: randomIndex});

        if (!randomEncounter) {
            throw new Error("No encounters available!");
        }

        return new Encounter(randomEncounter);
    }
}

module.exports = Encounter;