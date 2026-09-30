module.exports = (req, res, next) => {
    const currentTime = new Date().toLocaleString('en-GB', {
        dateStyle: 'short',
        timeStyle: 'short'
    });

    console.log(`${req.method} | ${req.url} | ${currentTime}`);

    next();
};