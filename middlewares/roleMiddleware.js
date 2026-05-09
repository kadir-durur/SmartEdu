module.exports = (roles) => {
    return (req, res, next) => {
        const userRole = req.session.userRole;

        if (roles.includes(userRole)) {
            next();
        } else {
            return res.status(401).send('BUNU YAPMAYA YETKİNİZ YOK!');
        }
    }
}