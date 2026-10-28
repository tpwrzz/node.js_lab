const notifyCatalogChange = (req, entity, action, name) => {
    const io = req.app.get('io');
    if (!io) return;

    io.emit('catalogNotification', {
        entity,
        action,
        name,
        adminName: req.session.user?.name || 'Неизвестный пользователь',
        createdAt: new Date().toLocaleString('ru-RU')
    });
};

module.exports = { notifyCatalogChange };