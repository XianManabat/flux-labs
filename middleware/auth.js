function requireLogin( req , res , next ) {
    if (req.session.username) {
        next();
    } else {
        res.redirect('./index.html');
    }
}

module.exports = {requireLogin};