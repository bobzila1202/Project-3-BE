require('dotenv').config();

const request = require('supertest');
const validateParameters = require('../middleware/validateParams');
const server = require('../api');

//const authenticator = require('../middleware/userBasicAuth');
//const Token = require('../models/Token');

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

    it('should return a 200 status code for GET request to /', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
    });

    it('should return a 200 status code for POST request to /', async () => {
        const response = await request(app).post('/');
        expect(response.statusCode).toBe(201);
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

    // it('should return a 404 status code for POST request to unhandled mapping', async () => {
    //     const response = await request(app).post('/unknown');
    //     expect(response.statusCode).toBe(404);
    // });

    // it('should return a 404 status code for ANY other request to unhandled mapping', async () => {
    //     const response = await request(app).put('/unknown');
    //     expect(response.statusCode).toBe(404);
    // });

    // it('should return a 404 status code for HEAD request to unhandled mapping', async () => {
    //     const response = await request(app).head('/unknown');
    //     expect(response.statusCode).toBe(404);
    // });

    // it('should handle invalid JSON format', async () => {
    //     const response = await request(server)
    //         .post('/test')
    //         .send('"json":"invalid-json"');

    //     expect(response.status).toBe(404);
    // });
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
    
    it('should return a 200 status code for GET request to /', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
    });

});
