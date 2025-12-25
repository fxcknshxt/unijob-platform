import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Dashboard() {
    const [stats, setStats] = useState({});
    const [recentMessages, setRecentMessages] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [employers, setEmployers] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [
                    vacanciesRes, usersRes, skillsRes,
                    employersRes, messagesRes, resumesRes,
                    notificationsRes
                ] = await Promise.all([
                    axios.get('http://localhost:8080/api/vacancies'),
                    axios.get('http://localhost:8080/api/users'),
                    axios.get('http://localhost:8080/api/skills'),
                    axios.get('http://localhost:8080/api/employers'),
                    axios.get('http://localhost:8080/api/messages'),
                    axios.get('http://localhost:8080/api/resumes'),
                    axios.get('http://localhost:8080/api/notifications')
                ]);

                setStats({
                    vacancies: vacanciesRes.data.length,
                    users: usersRes.data.length,
                    skills: skillsRes.data.length,
                    employers: employersRes.data.length,
                    messages: messagesRes.data.length,
                    resumes: resumesRes.data.length,
                    notifications: notificationsRes.data.length
                });

                setRecentMessages(messagesRes.data.slice(-3).reverse());
                setNotifications(notificationsRes.data.slice(-5).reverse());
                setEmployers(employersRes.data);

            } catch (err) {
                console.error('Ошибка загрузки:', err);
            }
        };

        loadData();
    }, []);

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Панель управления UniJob Platform</h2>

            <div className="row mb-4">
                {[
                    { title: 'Вакансии', count: stats.vacancies || 0, color: 'primary', link: '/' },
                    { title: 'Пользователи', count: stats.users || 0, color: 'success', link: '#' },
                    { title: 'Навыки', count: stats.skills || 0, color: 'warning', link: '#' },
                    { title: 'Работодатели', count: stats.employers || 0, color: 'info', link: '#' },
                    { title: 'Сообщения', count: stats.messages || 0, color: 'secondary', link: '#' },
                    { title: 'Резюме', count: stats.resumes || 0, color: 'dark', link: '#' },
                    { title: 'Уведомления', count: stats.notifications || 0, color: 'danger', link: '#' }
                ].map((item, idx) => (
                    <div className="col-md-3 mb-3" key={idx}>
                        <div className={`card text-white bg-${item.color}`}>
                            <div className="card-body text-center">
                                <h5 className="card-title">
                                    {item.icon} {item.title}
                                </h5>
                                <h2 className="card-text">{item.count}</h2>
                                {item.link && (
                                    <Link to={item.link} className="text-white">
                                        <small>Перейти →</small>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Работодатели на платформе</h5>
                            <div className="list-group">
                                {employers.slice(0, 3).map(emp => (
                                    <div key={emp.id} className="list-group-item">
                                        <strong>{emp.companyName}</strong>
                                        {emp.website && (
                                            <div>
                                                <small>
                                                    <a href={emp.website} target="_blank" rel="noopener noreferrer">
                                                        {emp.website}
                                                    </a>
                                                </small>
                                            </div>
                                        )}
                                        {emp.user && (
                                            <small className="text-muted">
                                                Контакт: {emp.user.name} ({emp.user.email})
                                            </small>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Навыки пользователей (UserSkill)</h5>
                                <button className="btn btn-sm btn-outline-primary mb-3"
                                    onClick={() => {
                                        axios.get('http://localhost:8080/api/user-skills')
                                            .then(res => {
                                                alert(`Всего связей пользователь-навык: ${res.data.length}`);
                                                console.log('UserSkills:', res.data);
                                            });
                                    }}>
                                    Показать связи
                                </button>
                                <p className="card-text">
                                    <small>
                                        Связи Many-to-Many между User и Skill.<br/>
                                        Пользователь может иметь много навыков,<br/>
                                        навык может быть у многих пользователей.
                                    </small>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Навыки вакансий (VacancySkill)</h5>
                                <button className="btn btn-sm btn-outline-success mb-3"
                                    onClick={() => {
                                        axios.get('http://localhost:8080/api/vacancy-skills')
                                            .then(res => {
                                                alert(`Всего связей вакансия-навык: ${res.data.length}`);
                                                console.log('VacancySkills:', res.data);
                                            });
                                    }}>
                                    Показать связи
                                </button>
                                <p className="card-text">
                                    <small>
                                        Связи Many-to-Many между Vacancy и Skill.<br/>
                                        Вакансия требует много навыков,<br/>
                                        навык может требоваться в многих вакансиях.
                                    </small>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Последние уведомления</h5>
                            <div className="list-group">
                                {notifications.map(notif => (
                                    <div key={notif.id} className="list-group-item">
                                        <div className="d-flex justify-content-between">
                                            <small className={notif.read ? 'text-muted' : 'text-primary'}>
                                                {notif.read ? '✓ Прочитано' : 'Новое'}
                                            </small>
                                            <small className="text-muted">
                                                {new Date(notif.createdAt).toLocaleDateString()}
                                            </small>
                                        </div>
                                        <p className="mb-1">{notif.text}</p>
                                        {notif.user && (
                                            <small className="text-muted">
                                                Для: {notif.user.name}
                                            </small>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {recentMessages.length > 0 && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title">Последние сообщения</h5>
                        <div className="list-group">
                            {recentMessages.map(msg => (
                                <div key={msg.id} className="list-group-item">
                                    <div className="d-flex justify-content-between">
                                        <small className="text-muted">
                                            {new Date(msg.sentAt).toLocaleString()}
                                        </small>
                                        <small className="text-muted">
                                            ID: {msg.id}
                                        </small>
                                    </div>
                                    <p className="mb-1">
                                        <strong>{msg.sender?.name || 'Неизвестный'}:</strong>
                                        {msg.content}
                                    </p>
                                    <small className="text-muted">
                                        Кому: {msg.receiver?.name || 'Неизвестный'}
                                    </small>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">API Документация</h5>
                    <p>Все сущности имеют полное API:</p>
                    <div className="d-flex flex-wrap gap-2">
                        <a href="http://localhost:8080/swagger-ui.html"
                           target="_blank"
                           rel="noopener noreferrer"
                           className="btn btn-outline-primary">
                            Swagger UI
                        </a>
                        <button className="btn btn-outline-success" onClick={() => {
                            axios.get('http://localhost:8080/api/vacancies')
                                .then(res => alert(`Вакансий: ${res.data.length}`));
                        }}>
                            Тест API вакансий
                        </button>
                        <button className="btn btn-outline-info" onClick={() => {
                            axios.get('http://localhost:8080/api/employers')
                                .then(res => alert(`Работодателей: ${res.data.length}`));
                        }}>
                            Тест API работодателей
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;