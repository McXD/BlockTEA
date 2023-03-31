const mongoose = require('mongoose');

const connect = async () => {
    try {
        await mongoose.connect('mongodb://localhost/blocktea', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (err) {
        console.error(err);
    }
};

module.exports = connect;
