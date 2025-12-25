import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'

function Profile() {
    const [currentUserId, setCurrentUserId] = useState(2);
    const [user, setUser] = useState(null);
    const [applications, setApplications] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [resume, setResume] = useState('');
    const [skills, setSkills] = useState([]);
    const [newSkillId, setNewSkillId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subscribeNewVacancies, setSubscribeNewVacancies] = useState(true);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [interviews, setInterviews] = useState([]);

    useEffect(() => {
        const loadAvailableUsers = async () => {
            try {
                const usersRes = await axios.get('http://localhost:8080/api/users');
                setAvailableUsers(usersRes.data);

                const defaultStudent = usersRes.data.find(u => u.role === 'STUDENT');
                if (defaultStudent) {
                    setCurrentUserId(defaultStudent.id);
                }
            } catch (err) {
                console.warn('Не удалось загрузить список пользователей:', err);
            }
        };

        loadAvailableUsers();
    }, []);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                setLoading(true);
                setError(null);

                const userRes = await axios.get(`http://localhost:8080/api/users/${currentUserId}`);
                setUser(userRes.data);

                try {
                    const appsRes = await axios.get('http://localhost:8080/api/applications');
                    const userApps = appsRes.data.filter(app =>
                        app.student && app.student.id === currentUserId
                    );
                    setApplications(userApps);
                } catch (appsErr) {
                    console.warn('Заявки не загружены:', appsErr);
                    setApplications([]);
                }

                try {
                    const notifRes = await axios.get(`http://localhost:8080/api/notifications/user/${currentUserId}`);
                    setNotifications(notifRes.data);
                } catch (notifErr) {
                    console.warn('Уведомления не загружены:', notifErr);
                    setNotifications([]);
                }

                try {
                    const resumeRes = await axios.get(`http://localhost:8080/api/resumes/user/${currentUserId}`);

                    let resumeText = '';
                    if (resumeRes.data) {
                        if (typeof resumeRes.data === 'string') {
                            resumeText = resumeRes.data;
                        } else if (resumeRes.data.text !== undefined) {
                            resumeText = resumeRes.data.text || '';
                        } else {
                            resumeText = JSON.stringify(resumeRes.data);
                        }
                    }
                    setResume(resumeText);
                } catch (resumeErr) {
                    console.warn('Резюме не загружено:', resumeErr);
                    setResume('');
                }

                try {
                    const skillsRes = await axios.get(`http://localhost:8080/api/user-skills/user/${currentUserId}`);
                    setSkills(skillsRes.data || []);
                } catch (skillsErr) {
                    console.warn('Навыки не загружены:', skillsErr);
                    setSkills([]);
                }

                setLoading(false);
            } catch (err) {
                console.error('Ошибка загрузки данных:', err);
                setError('Не удалось загрузить данные профиля');
                setLoading(false);
            }

            try {
                const interviewsRes = await axios.get(`http://localhost:8080/api/interviews/user/${currentUserId}`);
                setInterviews(interviewsRes.data || []);
            } catch (interviewsErr) {
                console.warn('Собеседования не загружены:', interviewsErr);
                setInterviews([]);
            }

        };

        if (currentUserId) {
            loadUserData();
        }
    }, [currentUserId]);

    const saveResume = async () => {
        try {
            await axios.post(`http://localhost:8080/api/resumes/user/${currentUserId}`, { text: resume });
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
                userId: currentUserId,
                skillId: parseInt(newSkillId)
            });

            alert('Навык добавлен!');
            setNewSkillId('');

            const skillsRes = await axios.get(`http://localhost:8080/api/user-skills/user/${currentUserId}`);
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

    const UserSwitcher = () => (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title mb-3">Переключение пользователей</h5>
                <div className="row">
                    <div className="col-md-8">
                        <div className="btn-group d-flex flex-wrap">
                            {availableUsers.map(u => (
                                <button
                                    key={u.id}
                                    className={`btn btn-sm m-1 ${currentUserId === u.id ? 'active' : ''}`}
                                    style={{
                                        backgroundColor: currentUserId === u.id ?
                                            (u.role === 'ADMIN' ? '#dc3545' :
                                             u.role === 'EMPLOYER' ? '#0dcaf0' : '#20c997') : 'transparent',
                                        color: currentUserId === u.id ? 'white' : '#333',
                                        border: `1px solid ${
                                            u.role === 'ADMIN' ? '#dc3545' :
                                            u.role === 'EMPLOYER' ? '#0dcaf0' : '#20c997'
                                        }`
                                    }}
                                    onClick={() => setCurrentUserId(u.id)}
                                >
                                    <div className="small">
                                        <strong>{u.name}</strong><br/>
                                        <small>
                                            {u.role === 'ADMIN' ? 'Админ' :
                                             u.role === 'EMPLOYER' ? 'Работодатель' : 'Студент'}
                                        </small>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="border rounded p-2">
                            <small className="text-muted">Текущий:</small>
                            <div>
                                <strong>{user?.name || 'Загрузка...'}</strong>
                            </div>
                            <div>
                                <span className={`badge bg-${
                                    user?.role === 'ADMIN' ? 'danger' :
                                    user?.role === 'EMPLOYER' ? 'info' : 'success'
                                }`}>
                                    {user?.role || 'STUDENT'}
                                </span>
                                <small className="ms-2">ID: {currentUserId}</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderRoleSpecificContent = () => {
        if (!user) return null;

        switch (user.role) {
            case 'STUDENT':
                return renderStudentContent();
            case 'EMPLOYER':
                return renderEmployerContent();
            case 'ADMIN':
                return renderAdminContent();
            default:
                return renderStudentContent();
        }
    };

    const renderStudentContent = () => (
        <>
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
                                        if (resume.trim() && window.confirm('Очистить резюме?')) {
                                            setResume('');
                                        }
                                    }}
                                >
                                    Очистить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

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
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Мои навыки ({skills.length})</h5>

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
                            ID навыков можно посмотреть в <a href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noopener noreferrer">Swagger</a>
                        </small>
                    </div>

                    {skills.length === 0 ? (
                        <div className="text-center py-3">
                            <p className="text-muted">У вас пока нет добавленных навыков</p>
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
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Рекомендованные вакансии</h5>
                    <button className="btn btn-sm btn-outline-primary mb-3"
                        onClick={() => {
                            axios.get(`http://localhost:8080/api/recommendations/user/${currentUserId}`)
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
                        </small>
                    </p>
                </div>
            </div>
        </>
    );

    const renderEmployerContent = () => (
        <div className="card">
            <div className="card-body">
                <h5 className="card-title">Панель работодателя</h5>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <div className="card h-100">
                            <div className="card-body">
                                <h6>Мои вакансии</h6>
                                <button className="btn btn-primary w-100 mb-2"
                                    onClick={() => alert('Форма создания вакансии')}>
                                    + Создать вакансию
                                </button>
                                <button className="btn btn-outline-secondary w-100"
                                    onClick={() => window.location.href = '/'}>
                                    Просмотреть все вакансии
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 mb-3">
                        <div className="card h-100">
                            <div className="card-body">
                                <h6>Заявки кандидатов</h6>
                                <button className="btn btn-info w-100"
                                    onClick={() => alert('Переход к заявкам')}>
                                    Просмотреть заявки ({applications.length})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="text-muted mt-3">
                    <small>Как работодатель вы можете создавать вакансии и просматривать заявки от студентов.</small>
                </p>
            </div>
        </div>
    );

    const renderAdminContent = () => (
        <div className="card">
            <div className="card-body">
                <h5 className="card-title">Панель администратора</h5>
                <div className="alert alert-warning">
                    <strong>Полные права доступа</strong>
                    <p className="mb-0">Вы имеете доступ ко всем функциям системы.</p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                    <a href="/admin-panel" className="btn btn-danger">
                        Перейти в админ-панель
                    </a>
                    <button className="btn btn-outline-dark"
                        onClick={() => window.open('http://localhost:8080/h2-console', '_blank')}>
                        H2 Console
                    </button>
                    <button className="btn btn-outline-info"
                        onClick={() => window.open('http://localhost:8080/swagger-ui.html', '_blank')}>
                        Swagger API
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
                <p className="mt-2">Загрузка профиля пользователя #{currentUserId}...</p>
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
                <h2>Личный кабинет</h2>
                <div>
                    <a href="/" className="btn btn-outline-primary btn-sm me-2">
                        ← К вакансиям
                    </a>
                </div>
            </div>

            <UserSwitcher />

            <div className="row mb-4">
                <div className="col-md-4 mb-3">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Профиль</h5>
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
                                            <span className={`badge bg-${
                                                user.role === 'ADMIN' ? 'danger' :
                                                user.role === 'EMPLOYER' ? 'info' : 'success'
                                            }`}>
                                                {user.role === 'ADMIN' ? 'Администратор' :
                                                 user.role === 'EMPLOYER' ? 'Работодатель' : 'Студент'}
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

                <div className="col-md-8 mb-3">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Статистика</h5>
                            <div className="row text-center">
                                <div className="col-md-3 mb-3">
                                    <div className="border rounded p-3">
                                        <h3 className="text-primary">{applications.length}</h3>
                                        <p className="mb-0">
                                            {user?.role === 'STUDENT' ? 'Заявок' :
                                             user?.role === 'EMPLOYER' ? 'Вакансий' : 'Пользователей'}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <div className="border rounded p-3">
                                        <h3 className="text-success">
                                            {user?.role === 'STUDENT' ?
                                                applications.filter(app => app.status === 'ACCEPTED').length :
                                                notifications.length
                                            }
                                        </h3>
                                        <p className="mb-0">
                                            {user?.role === 'STUDENT' ? 'Принято' : 'Уведомлений'}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <div className="border rounded p-3">
                                        <h3 className="text-warning">{skills.length}</h3>
                                        <p className="mb-0">Навыков</p>
                                    </div>
                                </div>

                                <div className="col-md-3 mb-3">
                                    <div className="border rounded p-3">
                                        <h3 className="text-info">{interviews.length}</h3>
                                        <p className="mb-0">Собеседований</p>
                                    </div>
                                </div>

                                <div className="col-md-3 mb-3">
                                    <div className="border rounded p-3">
                                        <h3 className="text-danger">
                                            {notifications.filter(n => !n.read).length}
                                        </h3>
                                        <p className="mb-0">Новых увед.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {renderRoleSpecificContent()}

            <div className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title">Быстрые действия</h5>
                    <div className="d-flex flex-wrap gap-2">
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => window.location.href = '/'}
                        >
                            Поиск вакансий
                        </button>
                        <Link to="/interviews" className="btn btn-outline-warning">
                                        Мои собеседования
                        </Link>
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
                            Все навыки
                        </button>
                        <button
                            className="btn btn-outline-info"
                            onClick={() => window.open('http://localhost:8080/swagger-ui.html', '_blank')}
                        >
                            API Документация
                        </button>
                        <button
                            className="btn btn-outline-warning"
                            onClick={() => window.location.reload()}
                        >
                            Обновить
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
    {interviews.length > 0 && (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title">Ближайшие собеседования</h5>
                <div className="list-group">
                    {interviews
                        .filter(i => i.status === 'SCHEDULED')
                        .slice(0, 3)
                        .map(interview => (
                            <div key={interview.id} className="list-group-item">
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <strong>{interview.application?.vacancy?.title}</strong>
                                        <div className="small">{interview.location}</div>
                                    </div>
                                    <div className="text-end">
                                        <div className="text-primary">
                                            {interview.interviewDate ?
                                                new Date(interview.interviewDate).toLocaleDateString() :
                                                'Дата не указана'}
                                        </div>
                                        <span className="badge bg-warning">{interview.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )}
}

export default Profile;