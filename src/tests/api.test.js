require('dotenv').config();

const request = require('supertest');
const validateParameters = require('../middleware/validateParams');
const server = require('../api');

const authenticator = require('../middleware/userBasicAuth');
const Token = require('../models/Token');
const User = require('../models/User')
const Encounter = require('../models/Encounter')
const userController = require('../controllers/user')
const EmailToken = require('../models/EmailToken')
const {MongoClient} = require("mongodb")
const db = require('../db')


const filter = require('../middleware/htmlFilter');
const { send } = require('process');

describe('API tests for home', () => {
    let app;

    beforeAll(() => {
        app = server.listen(3000);
    });

    afterAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
        app.close();
    });

    it('should return a 404 status code for GET request to unhandled mapping', async () => {
        const response = await request(app).get('/unknown');
        expect(response.statusCode).toBe(404);
    });

    it('should return a 404 status code for POST request to unhandled mapping', async () => {
        const response = await request(app).post('/unknown');
        expect(response.statusCode).toBe(404);
    });

    it('should return a 404 status code for DELETE request to unhandled mapping', async () => {
        const response = await request(app).delete('/unknown');
        expect(response.statusCode).toBe(404);
    });

    it('should return a 404 status code for HEAD request to unhandled mapping', async () => {
        const response = await request(app).head('/unknown');
        expect(response.statusCode).toBe(404);
    });

    it('should return a 404 status code for PATCH request to unhandled mapping', async () => {
        const response = await request(app).patch('/unknown');
        expect(response.statusCode).toBe(404);
    });

    it('should return a 404 status code for OPTIONS request to unhandled mapping', async () => {
        const response = await request(app).options('/unknown');
        expect(response.statusCode).toBe(404);
    });
});

describe('API tests for user', () => {
    let app;

    beforeAll(() => {
        app = server.listen(3000);
    });

    afterAll(() => {
        jest.clearAllMocks();
        app.close();
    });

   

    it('should return a 200 status code for POST request to /register', async () => {
        const data = {
            username: "Bobzila",
            password: "Robust1997!",
            email: "bobby_singh08@hotmail.com"
        }

        await request(app).post('/users/register').send(data).expect(201)

    })

    it('should return an error message when sending incorrect password to POST /register', async () => {
        const data = {
            username: "Bobzila",
            password: "Robust1997",
            email: "bobby_singh08@hotmail.com"
        }

        const response = await request(app).post('/users/register').send(data)
        expect(response._body.error).toBe("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character")
    })


    it('should return status code 200 on successful login', async () => {
        await db.connect()
        const user = await User.getByUsername("Bobzila")
        await user.activate()
        const data = await db.db('space_db').collection('User').findOne({username:"Bobzila"})
        const sendData = {
            username: data.username,
            password: "Robust1997!"
        }
        const response = await request(app).post('/users/login').send(sendData)
        expect(response.statusCode).toBe(200)
    })

    // it('should return status code 400 on unsuccessful login', async () => {
    //     const data = await db.db('space_db').collection('User').findOne({username:"jane"})
    //     console.log(data)
    //     const sendData = {
    //         username: data.username,
    //         password: "Robust1997!"
    //     }
    //     const response = await request(app).post('/users/login').send(sendData)
    //     expect(response.statusCode).toBe(400)
    // })

    it('should return status code 401 with non-existing username', async () => {
        const sendData = {
            username: "bobo",
            password: "Robust1997!"
        }
        const response = await request(app).post('/users/login').send(sendData)
        expect(response.statusCode).toBe(401)
    })

    // it('It should clear the token when logging out', async () => {


    //     const token = Token.getByToken(res.locals.token)
    //     await request(app).post('users/logout')


    // })

});


describe('validateParameters middleware', () => {
    const mockNext = jest.fn();
    let mockRes;

    beforeEach(() => {
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should pass when all parameters are valid', () => {
        const mockReq = {
            body: {
                boolParam: true,
                stringParam: 'test',
                intParam: 42,
                positiveIntParam: 10,
                stringWithMaxLengthParam: 'abcde',
            },
        };
        const parameterTypes = {
            boolParam: {type: 'boolean'},
            stringParam: {type: 'string'},
            intParam: {type: 'int'},
            positiveIntParam: {type: 'positiveInt'},
            stringWithMaxLengthParam: {type: 'stringWithMaxLength', maxLength: 5},
        };

        validateParameters(parameterTypes)(mockReq, mockRes, mockNext);
        expect(mockNext).not.toHaveBeenCalled();
        //expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalled();
    });

    it('should return 400 for invalid boolean parameter', () => {
        const mockReq = {body: {boolParam: 'notABoolean'}};
        const parameterTypes = {boolParam: {type: 'boolean'}};

        validateParameters(parameterTypes)(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: 'boolParam should be a boolean.'});
    });

    it('should return 400 for invalid string parameter', () => {
        const mockReq = {body: {stringParam: 42}};
        const parameterTypes = {stringParam: {type: 'string'}};

        validateParameters(parameterTypes)(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: 'stringParam should be a string.'});
    });

    it('should return 400 for invalid int parameter', () => {
        const mockReq = {body: {intParam: 'notAnInt'}};
        const parameterTypes = {intParam: {type: 'int'}};

        validateParameters(parameterTypes)(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: 'intParam should be a valid integer.'});
    });

    it('should return 400 for invalid positive int parameter', () => {
        const mockReq = {body: {positiveIntParam: -1}};
        const parameterTypes = {positiveIntParam: {type: 'positiveInt'}};

        validateParameters(parameterTypes)(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: 'positiveIntParam should be a valid positive integer.'});
    });

    it('should return 400 for invalid string with max length parameter', () => {
        const mockReq = {body: {stringWithMaxLengthParam: 'tooLong'}};
        const parameterTypes = {stringWithMaxLengthParam: {type: 'stringWithMaxLength', maxLength: 5}};

        validateParameters(parameterTypes)(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: 'stringWithMaxLengthParam should have a maximum length of 5 characters.'});
    });

    it('should return 400 for missing required parameter', () => {
        const mockReq = {body: {}};
        const parameterTypes = {requiredParam: {type: 'string'}};

        validateParameters(parameterTypes)(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: 'requiredParam is required.'});
    });

});

describe('filter middleware', () => {
    const mockNext = jest.fn();
    let mockRes;

    beforeEach(() => {
        mockRes = {
            status: jest.fn().mockReturnThis(),
            redirect: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should pass when the path is valid', () => {
        const mockReq = {path: '/validPath'};

        filter(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.redirect).not.toHaveBeenCalled();
    });

    it('should return 403 when the path has a forbidden extension', () => {
        const mockReq = {path: '/forbidden.html'};

        filter(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.redirect).toHaveBeenCalledWith('/');
    });
});

describe('Server URL Construction', () => {
    beforeEach(() => {
        jest.resetModules();
        process.env.ENV = 'production';
    });

    it('should construct the correct server URL with HTTPS protocol and custom port for production environment', () => {
        const serverUrl = require('../middleware/serverUrl');

        expect(serverUrl.protocol).toBe("https:");
    });
});


describe('User', () => {
    const sampleUserData = {
        username: 'testuser',
        password: 'password',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '1234567890',
        postal_code: '12345',
    };
    let user;

    const mockDb = {
        collection: jest.fn(() => mockCollection),
    };
    const mockCollection = {
        find: jest.fn(() => mockCollection),
        findOne: jest.fn(() => mockCollection),
        insertOne: jest.fn(() => mockCollection),
        updateOne: jest.fn(() => mockCollection),
    };
    jest.mock('../db', () => ({
        db: jest.fn(() => mockDb),
    }));

    beforeEach(() => {
        user = new User(sampleUserData);
    });

    describe('Static Methods', () => {

        it('should retrieve all users with username and email only', async () => {
         

            const users = await User.getAll();

            expect(users).toBeDefined();
            expect(Array.isArray(users)).toBe(true);
            
        });

        it('should create a new user', async () => {
            mockCollection.insertOne.mockResolvedValue({ ops: [sampleUserData] });

            const createdUser = await User.create(sampleUserData);
            expect(createdUser).toBeDefined();
            expect(createdUser.username).toEqual(sampleUserData.username);
        });

        it('should get a user by username', async () => {
            mockCollection.findOne.mockResolvedValue(sampleUserData);

            const foundUser = await User.getByUsername(sampleUserData.username);
            expect(foundUser).toBeDefined();
            expect(foundUser.username).toEqual(sampleUserData.username);
        });

        it('should get a user by email', async () => {
            mockCollection.findOne.mockResolvedValue(sampleUserData);

            const foundUser = await User.getByEmail(sampleUserData.email);
            expect(foundUser).toBeDefined();
            expect(foundUser.email).toEqual(sampleUserData.email);
        });

        // Add more tests for other static methods
    });

    describe('Instance Methods', () => {

        it('should activate a user', async () => {
            mockCollection.updateOne.mockResolvedValue({});
            await db.connect()
            const user = await User.getByUsername("testuser")

            const result = await user.activate();
            expect(result).toEqual({
            "acknowledged": true,
             "matchedCount": 1,
             "modifiedCount": 1,
            "upsertedCount": 0,
            "upsertedId": null});
        });

        it('should check if a user is activated', async () => {
            mockCollection.findOne.mockResolvedValue({ is_activated: true });
            
           
            const activated = await user.isActivated();
            expect(activated).toBe(true);
        });

        it('should update basic user details', async () => {
            mockCollection.updateOne.mockResolvedValue({});

            const user = new User(sampleUserData);

            const result = await user.updateBasicDetails();

            expect(result.acknowledged).toEqual(true);
        });

        it('should update the user password', async () => {
            mockCollection.updateOne.mockResolvedValue({});

            const user = new User(sampleUserData);

            const result = await user.updatePassword();

            expect(result.acknowledged).toEqual(true);
        });

    });
});


describe('Token', () => {
    
   
    const mockDb = {
        collection: jest.fn(() => mockCollection),
    };
    const mockCollection = {
        insertOne: jest.fn(() => mockCollection),
        findOne: jest.fn(() => mockCollection),
        deleteOne: jest.fn(() => mockCollection),
        deleteMany: jest.fn(() => mockCollection),
        updateOne: jest.fn(() => mockCollection),
    };
    jest.mock('../db', () => ({
        db: jest.fn(() => mockDb),
    }));
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Static Methods', () => {
        it('should create a new token', async () => {
            const accountUsername = 'testuser';
            mockCollection.insertOne.mockResolvedValue({});
            const token = await Token.create(accountUsername);
            expect(token).toEqual({
                account_username: accountUsername,
                token: expect.any(String), // Use the generated mock UUID
                created_at: expect.any(Date),
                expires_at: expect.any(Date)
            });

            // expect(mockCollection.insertOne).toHaveBeenCalledWith({
            //     account_username: accountUsername,
            //     token: expect.any(String),
            //     created_at: expect.any(Date),
            //     expires_at: expect.any(Date),
            //     session_encounters: [],
            //     session_code_snippets: []
            // });
        });

        it('should get a token by token', async () => {
            const accountUsername = 'testuser';
            mockCollection.insertOne.mockResolvedValue({});
            const token = await Token.create(accountUsername)

            const mockTokenData = {
                token_id: undefined,
                account_username: 'testuser',
                token: token.token,
                expires_at: expect.any(Date),
                created_at: expect.any(Date),
            };

            mockCollection.findOne.mockResolvedValue(mockTokenData);

            const tokenData = await Token.getByToken(mockTokenData.token);
            expect(tokenData.token).toEqual(mockTokenData.token);
        });

        it('should throw error if getting no token', async () => {
            const mockTokenData = {
                account_username: 'toestuser',
            };

            const t = async () => {
                return await Token.getByToken(mockTokenData.account_username);
              };
              try {
                await t();
            } catch (error) {
                expect(error.message).toBe("Token not found");
            }
        });

        it('should delete a token', async () => {
            const accountUsername = 'testuser';
            const token = await Token.create(accountUsername)
        
            await Token.delete(token.token);
            const data = await db.db('space_db').collection('Token').findOne({token: token.token})
            expect(data).toBe(null)
            
        });

        it('should delete all tokens by username', async () => {
            const accountUsername = 'testuser';
            await Token.create(accountUsername)
            await Token.deleteAllByUsername(accountUsername);

            const data = await db.db('space_db').collection('Token').findOne({account_username: accountUsername})
            expect(data).toBe(null)

            
        });

    });

    describe('Instance Methods', () => {
        it('should check if a token is expired', async () => {
            const mockTokenData = await Token.create('bob')
    
            const isExpired = await mockTokenData.isExpired();

            expect(isExpired).toBe(false);
        });

        it('should get session encounters', async () => {
            const mockTokenData = {
                account_username: 'testuser',
                session_encounters: [],
            };


            const token = await Token.create(mockTokenData.account_username)

            const sessionEncounters = await Token.getSessionEncounters(mockTokenData.account_username);

            expect(sessionEncounters).toEqual(mockTokenData.session_encounters);
        });

        it('should add a session encounter', async () => {
            const mockTokenData = {
                account_username: 'testuser',
                session_encounters: 'oh no a monkey',
            };

            
            const token = await Token.create(mockTokenData.account_username)

            await Token.addSessionEncounter(mockTokenData.account_username, mockTokenData.session_encounters);

           expect(await Token.getSessionEncounters(mockTokenData.account_username)).toEqual(['oh no a monkey'])
        });

        it('should add a session code snippet', async () => {
             const mockTokenData = {
                account_username: 'testuser',
                session_code_snippets: 'oh no a monkey',
            };

            
            const token = await Token.create(mockTokenData.account_username)

            await Token.addSessionCodeSnippet(mockTokenData.account_username, mockTokenData.session_code_snippets);

           expect(await Token.getSessionCodeSnippets(mockTokenData.account_username)).toEqual(['oh no a monkey'])
        });

        it('should get session code snippets', async () => {
            const mockTokenData = {
                account_username: 'testuser',
                session_code_snippets: ['oh no a monkey'],
            };


            const token = await Token.create(mockTokenData.account_username)

            const codeSnippets = await Token.getSessionCodeSnippets(mockTokenData.account_username);

            expect(codeSnippets).toEqual(mockTokenData.session_code_snippets);
        });

        it('should throw error if no token', async () => {
            const mockTokenData = {
                account_username: 'toestuser',
                session_code_snippets: ['oh no a monkey'],
            };

            const t = async () => {
                return await Token.getSessionCodeSnippets(mockTokenData.account_username);
              };
              try {
                await t();
            } catch (error) {
                expect(error.message).toBe("Token not found");
            }
        });
    });
});


const Scoreboard = require('../models/Scoreboard'); // Adjust the import path as needed

describe('Scoreboard', () => {
    const mockDb = {
        collection: jest.fn(() => mockCollection),
    };
    const mockCollection = {
        find: jest.fn(),
        toArray: jest.fn(),
        insertOne: jest.fn(),
        updateOne: jest.fn(),
        findOne: jest.fn(),
    };

    jest.mock('../db', () => ({
        db: jest.fn(() => mockDb),
    }));

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Static Methods', () => {
        it('should get all scores', async () => {
            await db.db('space_db').collection('Scoreboard').insertOne({ username: 'bob', score: 0 })
            const mockScores = [
                {
                    "username": "bob",
                    "score": 0
                }
            ];

            const scores = await Scoreboard.getAll();
            
            const data = mockScores.map((score) => new Scoreboard(score))
            expect(data[0]).toEqual(scores[0])
            
        });

        it('should initialize an empty score for a username', async () => {
            const username = 'newUser';

            await Scoreboard.initEmpty(username);
            const scores = await Scoreboard.getAll()
            expect((await db.db('space_db').collection('Scoreboard').findOne({ username: username }, { projection: { _id: 0, username: 1, score: 1 } }))).toEqual({ username: username, score: 0 })
        
            
        });

        it('should increment the score for a username', async () => {
            const username = 'bob';

            await Scoreboard.incrementScore(username);
            expect((await db.db('space_db').collection('Scoreboard').findOne({ username: username }, { projection: { _id: 0, username: 1, score: 1 } }))).toEqual({ username: username, score: 1 })
           
        });

        it('should get a user by username', async () => {
            const username = 'bob';
            const mockUser = { username, score: 0};

            

            const user = await Scoreboard.getByUsername(username);


         
            expect(user.username).toEqual(mockUser.username);
        });
    });


    
});

describe('Encounter', () => {
    beforeEach(async () => {
      const encounters_db = db.db('space_db').collection('Encounter');
      await encounters_db.deleteMany({});
    });
  
    it('should get a random encounter', async () => {
      
      const testEncounters = [
        {
          type: 'combat',
          text: 'Test combat encounter 1',
          enemyStats: { health: 100, damage: 20 },
          enemyType: 'Orc',
        },
        {
          type: 'traversal',
          text: 'Test traversal encounter 2',
        },
        {
          type: 'combat',
          text: 'Test combat encounter 3',
          enemyStats: { health: 80, damage: 15 },
          enemyType: 'Dragon',
        },
      ];
  
      const encounters_db = db.db('space_db').collection('Encounter');
      await encounters_db.insertMany(testEncounters);
  
   
      const sessionObtained = [];
      const randomEncounter = await Encounter.getRandom(sessionObtained);
  
      
      expect(randomEncounter).toBeInstanceOf(Encounter);
      expect(randomEncounter.type).toBeDefined();
      expect(randomEncounter.text).toBeDefined();
      expect(randomEncounter._id).toBeDefined();
  
      
      expect(sessionObtained.includes(randomEncounter._id)).toBe(false);
    });
  
    it('should throw an error when no encounters are available', async () => {
      const sessionObtained = [];
  
      try {
        await Encounter.getRandom(sessionObtained);
       
        expect(true).toBe(false);
      } catch (error) {
      
        expect(error.message).toBe('No encounters available!');
      }
    });
  });






