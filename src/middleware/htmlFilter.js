// Disallows direct access to HTML files, unless mapped to a route.
module.exports = (req, res, next) => {
    const forbiddenExtensions = [".html", ".htm"]; // Add more extensions if needed

    const requestedPath = req.path;
    const extension = requestedPath.substring(requestedPath.lastIndexOf("."));

    if (forbiddenExtensions.includes(extension)) {
        res.status(403).redirect("/"); // Return a forbidden response
    } else {
        next(); // Continue to the next middleware
    }
};