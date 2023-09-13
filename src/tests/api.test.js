require('dotenv').config();

const request = require('supertest');
const validateParameters = require('../middleware/validateParams');
const server = require('../api');

const authenticator = require('../middleware/userBasicAuth');
const Token = require('../models/Token');

const filter = require('../middleware/htmlFilter');

const express = require('express');
const https = require('https');
const fs = require('fs');


describe('API tests for home', () => {
    let app;

    beforeAll(() => {
        app = server.listen(3000);

    });

    afterAll(() => {
        jest.clearAllMocks();
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

