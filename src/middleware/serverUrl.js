const os = require('os');

// Determine the protocol (http or https)
const protocol = process.env.ENV === 'production' ? 'https' : 'http';

// Determine the port (fallback to 8080)
const port = process.env.PORT || 8080;

// Construct the full URL, TODO: replace localhost with actual domain
const serverUrl = new URL(`${protocol}://localhost:${port}`);

module.exports = serverUrl;