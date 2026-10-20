const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
fs.mkdirSync(logsDir, { recursive: true });

const logStream = fs.createWriteStream(
    path.join(logsDir, 'requests.log'),
    { flags: 'a' }
);

morgan.token('local-date', () => {
    return new Date().toLocaleString('ru-RU', {
        timeZone: 'Europe/Chisinau'
    });
});

const format = ':method :url | :status | :response-time ms | :local-date';

const requestLogger = morgan(format, { stream: logStream });

function logAdminAction(req, action, objectType, objectId) {
    const email = req.session?.user?.email || 'unknown';

    const timestamp = new Date().toLocaleString('ru-RU', {
        timeZone: 'Europe/Chisinau'
    });

    console.log(
        `ADMIN ACTION | ${email} | ${action} ${objectType} | ID: ${objectId} | ${timestamp}`
    );
}

module.exports = requestLogger;
module.exports.logAdminAction = logAdminAction;