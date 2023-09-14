require('dotenv').config();

const request = require('supertest');
const validateParameters = require('../middleware/validateParams');
const server = require('../api');

const authenticator = require('../middleware/userBasicAuth');
const Token = require('../models/Token');
const User = require('../models/User')
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

    // it('should return a 200 status code for GET request to /', async () => {
    //     const response = await request(app).get('/users');
    //     expect(response.statusCode).toBe(200);
    // });

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

// const User = require('../models/User');
// const EmailToken = require('../models/EmailToken');
// //const Suggestion = require('../models/Suggestion');

// jest.mock('../models/Token'); // Mock the Token class
// jest.mock('../models/User'); // Mock the User class

// describe('authenticator middleware', () => {
//     let next;
//     let req;
//     let res;

//     beforeEach(() => {
//         next = jest.fn();
//         req = {
//             headers: {
//                 cookie: 'token=validTokenHere',
//             },
//         };
//         res = {
//             redirect: jest.fn(), // Mock the redirect method
//             locals: {},
//         };
//     });

//     afterEach(() => {
//         jest.clearAllMocks();
//     });

//     it('should pass with a valid token', async () => {
//         const validTokenMock = {
//             account_username: 'testUser',
//             isExpired: jest.fn().mockResolvedValue(false),
//         };

//         const userMock = {
//             isActivated: jest.fn().mockResolvedValue(true),
//         };

//         Token.getByToken.mockResolvedValue(validTokenMock);
//         User.getByUsername.mockResolvedValue(userMock);

//         await authenticator(req, res, next);

//         expect(Token.getByToken).toHaveBeenCalledWith('validTokenHere');
//         expect(validTokenMock.isExpired).toHaveBeenCalled();
//         expect(User.getByUsername).toHaveBeenCalledWith('testUser');
//         expect(userMock.isActivated).toHaveBeenCalled();
//         expect(res.locals.token).toBe('validTokenHere');
//         expect(res.locals.user).toBe('testUser');
//         expect(next).toHaveBeenCalled();
//         expect(res.redirect).not.toHaveBeenCalled();
//     });

//     it('should redirect to "/" if token is empty', async () => {
//         req.headers.cookie = 'token=';

//         await authenticator(req, res, next);

//         expect(Token.getByToken).not.toHaveBeenCalled();
//         expect(res.redirect).toHaveBeenCalledWith('/');
//         expect(next).not.toHaveBeenCalled();
//     });

//     it('should redirect to "/" if an error occurs in token retrieval', async () => {
//         Token.getByToken.mockRejectedValue(new Error('Mocked token error'));

//         await authenticator(req, res, next);

//         expect(Token.getByToken).toHaveBeenCalledWith('validTokenHere');
//         expect(res.redirect).toHaveBeenCalledWith('/');
//         expect(next).not.toHaveBeenCalled();
//     });

//     it('should redirect to "/" if an error occurs in user retrieval', async () => {
//         // Mock valid token, but throw an error when retrieving the user
//         const validTokenMock = {
//             account_username: 'testUser',
//             isExpired: jest.fn().mockResolvedValue(false),
//         };

//         Token.getByToken.mockResolvedValue(validTokenMock);
//         User.getByUsername.mockRejectedValue(new Error('Mocked user error'));

//         await authenticator(req, res, next);

//         expect(Token.getByToken).toHaveBeenCalledWith('validTokenHere');
//         expect(User.getByUsername).toHaveBeenCalledWith('testUser');
//         expect(res.redirect).toHaveBeenCalledWith('/');
//         expect(next).not.toHaveBeenCalled();
//     });

//     it('should redirect to "/" if user is not activated', async () => {
//         const validTokenMock = {
//             account_username: 'testUser',
//             isExpired: jest.fn().mockResolvedValue(false),
//         };

//         const userMock = {
//             isActivated: jest.fn().mockResolvedValue(false), // User is not activated
//         };

//         Token.getByToken.mockResolvedValue(validTokenMock);
//         User.getByUsername.mockResolvedValue(userMock);

//         await authenticator(req, res, next);

//         expect(Token.getByToken).toHaveBeenCalledWith('validTokenHere');
//         expect(validTokenMock.isExpired).not.toHaveBeenCalled();
//         expect(User.getByUsername).toHaveBeenCalledWith('testUser');
//         expect(userMock.isActivated).toHaveBeenCalled();
//         expect(res.redirect).toHaveBeenCalledWith('/');
//         expect(next).not.toHaveBeenCalled();
//     });

//     it('should redirect to "/" if token is expired', async () => {
//         const validTokenMock = {
//             account_username: 'testUser',
//             isExpired: jest.fn().mockResolvedValue(true), // Token is expired
//         };

//         const mocked = {
//             isActivated: jest.fn().mockResolvedValue(true), // User is activated
//         };

//         Token.getByToken.mockResolvedValue(validTokenMock);
//         User.getByUsername.mockResolvedValue(mocked);

//         await authenticator(req, res, next);

//         expect(Token.getByToken).toHaveBeenCalledWith('validTokenHere');
//         expect(validTokenMock.isExpired).toHaveBeenCalled();
//         expect(User.getByUsername).toHaveBeenCalledWith('testUser');
//         expect(mocked.isActivated).toHaveBeenCalled();
//         expect(res.redirect).toHaveBeenCalledWith('/');
//         expect(next).not.toHaveBeenCalled();
//     });
// });



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


        // Add more tests for other instance methods
    });
});


// Mock the MongoDB collection methods


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

        // Add more tests for other static methods
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
                session_code_snippets: [],
            };

            mockCollection.updateOne.mockResolvedValue({});

            const token = new Token(mockTokenData);

            await token.addSessionCodeSnippet('new-snippet');

            expect(mockCollection.updateOne).toHaveBeenCalledWith(
                { account_username: 'testuser' },
                { $push: { session_code_snippets: 'new-snippet' } }
            );
        });

        it('should get session code snippets', async () => {
            const mockTokenData = {
                account_username: 'testuser',
                session_code_snippets: ['snippet1', 'snippet2'],
            };

            mockCollection.findOne.mockResolvedValue(mockTokenData);

            const token = new Token(mockTokenData);

            const sessionCodeSnippets = await token.getSessionCodeSnippets();

            expect(sessionCodeSnippets).toEqual(mockTokenData.session_code_snippets);
        });

        // Add more tests for other instance methods
    });
});



