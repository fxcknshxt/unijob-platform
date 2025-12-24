import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Profile() {
    const userId = 1;

    const [user, setUser] = useState(null);
    const [applications, setApplications] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [resume, setResume] = useState('');
    const [skills, setSkills] = useState([]);
    const [newSkillId, setNewSkillId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subscribeNewVacancies, setSubscribeNewVacancies] = useState(true);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                setLoading(true);

                const userRes = await axios.get(`http://localhost:8080/api/users/${userId}`);
                setUser(userRes.data);

                const appsRes = await axios.get('http://localhost:8080/api/applications');
                const userApps = appsRes.data.filter(app =>
                    app.student && app.student.id === userId
                );
                setApplications(userApps);

                try {
                    const notifRes = await axios.get(`http://localhost:8080/api/notifications/user/${userId}`);
                    setNotifications(notifRes.data);
                } catch (notifErr) {
                    console.warn('Уведомления не загружены:', notifErr);
                    setNotifications([]);
                }

                try {
                    const resumeRes = await axios.get(`http://localhost:8080/api/resumes/user/${userId}`);
                    console.log('Резюме ответ:', resumeRes.data);

                    let resumeText = '';
                    if (resumeRes.data) {
                        if (typeof resumeRes.data === 'string') {
                            resumeText = resumeRes.data;
                        } else if (resumeRes.data.text !== undefined) {
                            resumeText = resumeRes.data.text || '';
                        } else {
                            resumeText = resumeRes.data.text || '';
                        }
                    }
                    setResume(resumeText);
                } catch (resumeErr) {
                    console.warn('Резюме не загружено:', resumeErr);
                    setResume('');
                }

                try {
                    const skillsRes = await axios.get(`http://localhost:8080/api/user-skills/user/${userId}`);
                    setSkills(skillsRes.data || []);
                } catch (skillsErr) {
                    console.warn('Навыки не загружены:', skillsErr);
                }

                setLoading(false);
            } catch (err) {
                console.error('Ошибка загрузки данных:', err);
                setError('Не удалось загрузить данные профиля');
                setLoading(false);
            }
        };

        loadUserData();
    }, [userId]);

    const saveResume = async () => {
        try {
            await axios.post(`http://localhost:8080/api/resumes/user/${userId}`, { text: resume });
            alert('Резюме сохранено успешно!');
        } catch (err) {
            alert('Ошибка сохранения резюме: ' + err.message);
        }
    };

    const addNewSkill = async () => {
        if (!newSkillId.trim()) {
            alert('Введите ID навыка');
            return;
        }

        try {
            await axios.post('http://localhost:8080/api/user-skills', {
                userId: userId,
                skillId: parseInt(newSkillId)
            });

            alert('Навык добавлен!');
            setNewSkillId('');

            const skillsRes = await axios.get(`http://localhost:8080/api/user-skills/user/${userId}`);
            setSkills(skillsRes.data || []);
        } catch (err) {
            alert('Ошибка: ' + (err.response?.data || err.message));
        }
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            await axios.put(`http://localhost:8080/api/notifications/${notificationId}/read`);

            const updatedNotifications = notifications.map(notif =>
                notif.id === notificationId ? { ...notif, read: true } : notif
            );
            setNotifications(updatedNotifications);

            alert('✓ Уведомление отмечено как прочитанное');
        } catch (err) {
            console.error('Ошибка обновления уведомления:', err);
        }
    };

    if (loading) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
                <p className="mt-2">Загрузка профиля...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">
                    <h5>Ошибка</h5>
                    <p>{error}</p>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => window.location.reload()}>
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Личный кабинет студента</h2>
                <div>
                    <a href="/" className="btn btn-outline-primary btn-sm me-2">
                        ← К вакансиям
                    </a>
                    <a href="/dashboard" className="btn btn-outline-info btn-sm">
                        Статистика
                    </a>
                </div>
            </div>

            <div className="row">
                <div className="col-md-4 mb-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Мой профиль</h5>
                            {user ? (
                                <>
                                    <div className="mb-3">
                                        <p className="mb-1"><strong>Имя:</strong></p>
                                        <p className="ps-3">{user.name || 'Не указано'}</p>
                                    </div>
                                    <div className="mb-3">
                                        <p className="mb-1"><strong>Email:</strong></p>
                                        <p className="ps-3">{user.email || 'Не указан'}</p>
                                    </div>
                                    <div className="mb-3">
                                        <p className="mb-1"><strong>Роль:</strong></p>
                                        <p className="ps-3">
                                            <span className="badge bg-secondary">
                                                {user.role || 'STUDENT'}
                                            </span>
                                        </p>
                                    </div>
                                    {user.createdAt && (
                                        <div>
                                            <p className="mb-1"><strong>Регистрация:</strong></p>
                                            <p className="ps-3">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-muted">Данные профиля не загружены</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Статистика */}
                <div className="col-md-8 mb-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Моя статистика</h5>
                            <div className="row text-center">
                                <div className="col-md-3 mb-3">
                                    <div className="border rounded p-3">
                                        <h3 className="text-primary">{applications.length}</h3>
                                        <p className="mb-0">Заявок</p>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <div className="border rounded p-3">
                                        <h3 className="text-success">
                                            {applications.filter(app => app.status === 'ACCEPTED').length}
                                        </h3>
                                        <p className="mb-0">Принято</p>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <div className="border rounded p-3">
                                        <h3 className="text-warning">
                                            {applications.filter(app => app.status === 'PENDING').length}
                                        </h3>
                                        <p className="mb-0">На рассмотрении</p>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <div className="border rounded p-3">
                                        <h3 className="text-danger">
                                            {notifications.filter(n => !n.read).length}
                                        </h3>
                                        <p className="mb-0">Новых уведомлений</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">Мои заявки ({applications.length})</h5>
                        <a href="/" className="btn btn-sm btn-outline-primary">
                            + Новая заявка
                        </a>
                    </div>

                    {applications.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted">У вас пока нет заявок</p>
                            <a href="/" className="btn btn-primary">
                                Найти вакансии
                            </a>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Вакансия</th>
                                        <th>Статус</th>
                                        <th>Дата подачи</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map(app => (
                                        <tr key={app.id}>
                                            <td>#{app.id}</td>
                                            <td>
                                                <strong>{app.vacancy?.title || 'Неизвестная вакансия'}</strong>
                                                {app.coverLetter && (
                                                    <div>
                                                        <small className="text-muted">
                                                            "{app.coverLetter.length > 50 ?
                                                                app.coverLetter.substring(0, 50) + '...' :
                                                                app.coverLetter}"
                                                        </small>
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge bg-${
                                                    app.status === 'ACCEPTED' ? 'success' :
                                                    app.status === 'REJECTED' ? 'danger' :
                                                    'warning'
                                                }`}>
                                                    {app.status || 'PENDING'}
                                                </span>
                                            </td>
                                            <td>
                                                {app.appliedAt ?
                                                    new Date(app.appliedAt).toLocaleDateString() :
                                                    'Не указана'
                                                }
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-info"
                                                    onClick={() => {
                                                        alert(`Детали заявки #${app.id}\n\n` +
                                                              `Вакансия: ${app.vacancy?.title}\n` +
                                                              `Статус: ${app.status}\n` +
                                                              `Сопроводительное: ${app.coverLetter || 'нет'}`);
                                                    }}
                                                >
                                                    Подробнее
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Уведомления ({notifications.length})</h5>

                            <div className="mb-3">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="notifyNew"
                                        checked={subscribeNewVacancies}
                                        onChange={(e) => setSubscribeNewVacancies(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="notifyNew">
                                        Уведомлять о новых вакансиях
                                    </label>
                                </div>
                                <small className="text-muted">
                                    Получать email о новых вакансиях по вашим навыкам
                                </small>
                            </div>

                            <div className="list-group" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {notifications.length === 0 ? (
                                    <div className="text-center py-3 text-muted">
                                        Уведомлений нет
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`list-group-item list-group-item-action ${!notif.read ? 'list-group-item-primary' : ''}`}
                                            onClick={() => markNotificationAsRead(notif.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <span className={notif.read ? '' : 'fw-bold'}>
                                                        {notif.text}
                                                    </span>
                                                    {!notif.read && (
                                                        <span className="badge bg-warning ms-2">Новое</span>
                                                    )}
                                                </div>
                                                <div className="text-end">
                                                    <small className="text-muted d-block">
                                                        {notif.createdAt ?
                                                            new Date(notif.createdAt).toLocaleDateString() :
                                                            ''
                                                        }
                                                    </small>
                                                    <small className="text-primary">
                                                        {notif.read ? 'Прочитано' : 'Кликните чтобы прочитать'}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Моё резюме</h5>
                            <textarea
                                className="form-control mb-3"
                                rows="6"
                                value={resume}
                                onChange={(e) => setResume(e.target.value)}
                                placeholder="Расскажите о своих навыках, опыте, образовании..."
                                style={{ resize: 'vertical' }}
                            />
                            <div className="d-flex justify-content-between">
                                <button
                                    className="btn btn-primary"
                                    onClick={saveResume}
                                    disabled={!resume.trim()}
                                >
                                    Сохранить резюме
                                </button>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => {
                                        if (resume.trim()) {
                                            if (window.confirm('Очистить резюме?')) {
                                                setResume('');
                                            }
                                        }
                                    }}
                                >
                                    Очистить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">⚡ Мои навыки ({skills.length})</h5>

                    <div className="mb-3">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Введите ID навыка (например: 1, 2, 3...)"
                                value={newSkillId}
                                onChange={(e) => setNewSkillId(e.target.value)}
                            />
                            <button
                                className="btn btn-success"
                                onClick={addNewSkill}
                            >
                                + Добавить навык
                            </button>
                        </div>
                        <small className="text-muted">
                            ID навыков можно посмотреть в <a href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noopener noreferrer">Swagger</a> или в <a href="/dashboard">Dashboard</a>
                        </small>
                    </div>

                    {skills.length === 0 ? (
                        <div className="text-center py-3">
                            <p className="text-muted">У вас пока нет добавленных навыков</p>
                            <p>
                                <small>Примеры ID: 1 (Java), 2 (Python), 3 (Excel)</small>
                            </p>
                        </div>
                    ) : (
                        <div className="d-flex flex-wrap gap-2">
                            {skills.map(skill => (
                                <div key={skill.id} className="border rounded p-3" style={{ minWidth: '120px' }}>
                                    <div className="text-center">
                                        <div className="fw-bold mb-1">{skill.skillName || `Навык #${skill.skillId}`}</div>
                                        <small className="text-muted">ID: {skill.skillId}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-3">
                        <small className="text-muted">
                            Навыки влияют на рекомендации вакансий. Добавьте навыки, которые у вас есть.
                        </small>
                    </div>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Рекомендованные вакансии</h5>
                    <button className="btn btn-sm btn-outline-primary mb-3"
                        onClick={() => {
                            axios.get(`http://localhost:8080/api/recommendations/user/${userId}`)
                                .then(res => {
                                    if (res.data.length > 0) {
                                        const list = res.data.map(v =>
                                            `• ${v.title} (совпадение: ${v.matchPercentage}%)`
                                        ).join('\n');
                                        alert(`Рекомендации:\n\n${list}`);
                                    } else {
                                        alert('Нет рекомендаций. Добавьте навыки в профиль!');
                                    }
                                });
                        }}>
                        Получить рекомендации
                    </button>
                    <p className="card-text">
                        <small className="text-muted">
                            Система анализирует ваши навыки и рекомендует подходящие вакансии.
                            Чем больше навыков у вас указано, тем точнее рекомендации.
                        </small>
                    </p>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">Быстрые действия</h5>
                    <div className="d-flex flex-wrap gap-2">
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => window.location.href = '/'}
                        >
                            Поиск вакансий
                        </button>
                        <button
                            className="btn btn-outline-success"
                            onClick={() => {
                                axios.get('http://localhost:8080/api/skills')
                                    .then(res => {
                                        alert(`Доступные навыки:\n\n${
                                            res.data.map(s => `#${s.id}: ${s.name}`).join('\n')
                                        }`);
                                    });
                            }}
                        >
                            Посмотреть все навыки
                        </button>
                        <button
                            className="btn btn-outline-info"
                            onClick={() => window.open('http://localhost:8080/swagger-ui.html', '_blank')}
                        >
                            API Документация
                        </button>
                        <button
                            className="btn btn-outline-warning"
                            onClick={() => {
                                if (window.confirm('Обновить данные профиля?')) {
                                    window.location.reload();
                                }
                            }}
                        >
                            Обновить данные
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4 small text-muted">
                <details>
                    <summary>Отладочная информация (для разработки)</summary>
                    <pre className="mt-2 p-2 bg-light rounded" style={{ fontSize: '12px' }}>
                        User ID: {userId}
                        Заявок: {applications.length}
                        Уведомлений: {notifications.length}
                        Навыков: {skills.length}
                        User: {JSON.stringify(user, null, 2)}
                    </pre>
                </details>
            </div>
        </div>
    );
}

export default Profile;