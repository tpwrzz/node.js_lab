
const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('notifications');
    if (!container) return;

    socket.on('courseCreated', (data) => {
        const notification = document.createElement('div');
        notification.className = 'course-notification';

        const title = document.createElement('strong');
        title.textContent = `Добавлен новый курс: ${data.title}`;

        const teacher = document.createElement('p');
        teacher.textContent = `Преподаватель: ${data.teacherName}`;

        const date = document.createElement('small');
        date.textContent = `Время добавления: ${data.createdAt}`;

        const close = document.createElement('button');
        close.type = 'button';
        close.textContent = 'Закрыть';
        close.addEventListener('click', () => notification.remove());

        notification.append(title, teacher, date, close);
        container.prepend(notification);

        setTimeout(() => notification.remove(), 8000);
    });
});
