const jwt = require("jsonwebtoken");
const User = require("../schemas/user");
require("dotenv").config();
const { JWT_SECRET_KEY } = process.env;

module.exports = (req, res, next) => {
    const { authorization } = req.headers;

    const [tokenType, tokenValue] = authorization.split(" ");
    console.log(tokenType);
    console.log(tokenValue);

    if (tokenType !== "Bearer") {
        res.status(401).send({
            errorMessage: "로그인 후 사용하세요.",
        });

        return;
    }

    try {
        const { email } = jwt.verify(tokenValue, JWT_SECRET_KEY);
        User.findOne({ email })
            .exec()
            .then((user) => {
                res.locals.user = user;
                next();
            });
    } catch (error) {
        res.status(401).send({
            errorMessage: "로그인 후 사용하세요.",
        });
        return;
    }
};
