
const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('notifications');
    if (!container) return;

    socket.on('catalogNotification', (data) => {
        const notification = document.createElement('div');
        notification.className = 'book-notification';

        const messages = {
            created: 'Создано',
            updated: 'Изменено',
            deleted: 'Удалено'
        };

        const entityNames = {
            book: 'Книга',
            author: 'Автор',
            genre: 'Жанр'
        };

        const heading = document.createElement('strong');
        heading.textContent =
            `${entityNames[data.entity] || 'Объект'}: ` +
            `${messages[data.action] || data.action}`;

        const name = document.createElement('p');
        name.textContent = data.name || 'Без названия';
        const admin = document.createElement('p');
        admin.textContent = `Кто выполнил действие: ${data.adminName}`;
        const date = document.createElement('small');
        date.textContent = `Время: ${data.createdAt}`;

        const close = document.createElement('button');
        close.type = 'button';
        close.textContent = 'Закрыть';
        close.addEventListener('click', () => notification.remove());

        notification.append(heading, name, admin, date, close);
        container.prepend(notification);

        setTimeout(() => notification.remove(), 8000);
    });
});
