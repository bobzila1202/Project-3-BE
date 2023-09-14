const {MongoClient} = require('mongodb');
require('dotenv').config()

describe('insert', () => {
    let connection;
    let db;

    beforeAll(async () => {
        connection = await MongoClient.connect(globalThis.process.env.DB_URL);
        db = await connection.db(globalThis.space_dungeons);
      });

      afterAll(async () => {
        await connection.close();
      });

      it('should insert data into admin', async () => {
        const admins = db.collection('Admin')

        const mockAdmin = {username: 'BobTest', password: 'BobTest1'}
        await admins.insertOne(mockAdmin)

        const insertedAdmin = await admins.findOne({username: 'BobTest'})
        expect(insertedAdmin).toEqual(mockAdmin)
      })

      it('should update username in admin', async () => {
        const admins = db.collection('Admin')
        const prevAdminData = await admins.findOne({username: 'BobTest'})
        const newAdmin = {username: 'JamesTest'}
        
        await admins.updateOne(prevAdminData, {$set: newAdmin})
        const newAdminData = await admins.findOne(newAdmin)
        expect(await admins.findOne(newAdmin)).toEqual(newAdminData)

      })

      it('should remove data from admin', async () => {
        const admins = db.collection('Admin')
        await admins.deleteOne({username: 'JamesTest'})

        expect(await admins.findOne({username: 'JamesTest'})).toEqual(null)
      })



})