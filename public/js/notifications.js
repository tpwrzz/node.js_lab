
const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('notifications');
    if (!container) return;

    socket.on('bookCreated', (data) => {
        const notification = document.createElement('div');
        notification.className = 'book-notification';

        const title = document.createElement('strong');
        title.textContent = `Добавлен новый курс: ${data.title}`;

        const author = document.createElement('p');
        author.textContent = `Преподаватель: ${data.authorName}`;

        const date = document.createElement('small');
        date.textContent = `Время добавления: ${data.createdAt}`;

        const close = document.createElement('button');
        close.type = 'button';
        close.textContent = 'Закрыть';
        close.addEventListener('click', () => notification.remove());

        notification.append(title, author, date, close);
        container.prepend(notification);

        setTimeout(() => notification.remove(), 8000);
    });
});
