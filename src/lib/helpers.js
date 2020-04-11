const bcrypt  = require('bcryptjs');
const Helpers = {};

Helpers.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash(password, salt);
    return pass;
};

Helpers.validatePassword = async (password, savedPass) => {
    return await bcrypt.compare(password, savedPass);
};

module.exports = Helpers;