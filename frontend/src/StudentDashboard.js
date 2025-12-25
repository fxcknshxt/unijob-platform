import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function StudentDashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        applications: 0,
        accepted: 0,
        pending: 0,
        interviews: 0,
        recommendations: 0,
        notifications: 0
    });
    const [upcomingInterviews, setUpcomingInterviews] = useState([]);
    const [recommendedVacancies, setRecommendedVacancies] = useState([]);
    const [loading, setLoading] = useState(true);

    const userId = 3;

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);

                const userRes = await axios.get(`http://localhost:8080/api/users/${userId}`);
                setUser(userRes.data);

                const appsRes = await axios.get('http://localhost:8080/api/applications');
                const userApps = appsRes.data.filter(app =>
                    app.student && app.student.id === userId
                );

                const interviewsRes = await axios.get(`http://localhost:8080/api/interviews/user/${userId}`);
                setUpcomingInterviews(interviewsRes.data || []);

                const recRes = await axios.get(`http://localhost:8080/api/recommendations/user/${userId}`);
                setRecommendedVacancies(recRes.data.slice(0, 3) || []);

                const notifRes = await axios.get(`http://localhost:8080/api/notifications/user/${userId}`);

                setStats({
                    applications: userApps.length,
                    accepted: userApps.filter(app => app.status === 'ACCEPTED').length,
                    pending: userApps.filter(app => app.status === 'PENDING').length,
                    interviews: interviewsRes.data?.length || 0,
                    recommendations: recRes.data?.length || 0,
                    notifications: notifRes.data?.filter(n => !n.read).length || 0
                });

                setLoading(false);
            } catch (err) {
                console.error('Ошибка загрузки:', err);
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [userId]);

    if (loading) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
                <p className="mt-2">Загрузка панели управления...</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <nav className="navbar navbar-light bg-light mb-4 rounded">
                <div className="container-fluid">
                    <span className="navbar-brand fw-bold">UniJob Platform - Панель студента</span>
                    <div className="d-flex">
                        <Link to="/profile" className="btn btn-outline-primary btn-sm me-2">
                            Профиль
                        </Link>
                        <Link to="/" className="btn btn-outline-success btn-sm">
                            Поиск вакансий
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="alert alert-primary">
                <h4>Добро пожаловать, {user?.name || 'Студент'}!</h4>
                <p className="mb-0">На этой панели вы можете отслеживать свои заявки, собеседования и получать рекомендации.</p>
            </div>

            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <div className="card border-primary">
                        <div className="card-body text-center">
                            <h5 className="card-title">Заявки</h5>
                            <h2 className="text-primary">{stats.applications}</h2>
                            <div className="small">
                                <span className="text-success">{stats.accepted} принято</span><br/>
                                <span className="text-warning">{stats.pending} на рассмотрении</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card border-info">
                        <div className="card-body text-center">
                            <h5 className="card-title">Собеседования</h5>
                            <h2 className="text-info">{stats.interviews}</h2>
                            <Link to="/profile" className="btn btn-sm btn-outline-info mt-2">
                                Посмотреть
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card border-success">
                        <div className="card-body text-center">
                            <h5 className="card-title">Рекомендации</h5>
                            <h2 className="text-success">{stats.recommendations}</h2>
                            <button className="btn btn-sm btn-outline-success mt-2"
                                onClick={() => {
                                    if (recommendedVacancies.length > 0) {
                                        const list = recommendedVacancies.map(v =>
                                            `• ${v.title} (${v.matchPercentage}% совпадение)`
                                        ).join('\n');
                                        alert(`Рекомендованные вакансии:\n\n${list}`);
                                    } else {
                                        alert('Обновите навыки в профиле для получения рекомендаций!');
                                    }
                                }}>
                                Посмотреть
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card border-warning">
                        <div className="card-body text-center">
                            <h5 className="card-title">Уведомления</h5>
                            <h2 className="text-warning">{stats.notifications}</h2>
                            <Link to="/profile" className="btn btn-sm btn-outline-warning mt-2">
                                Посмотреть
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {upcomingInterviews.length > 0 && (
                <div className="card mb-4">
                    <div className="card-header bg-info text-white">
                        <h5 className="mb-0">Ближайшие собеседования</h5>
                    </div>
                    <div className="card-body">
                        <div className="list-group">
                            {upcomingInterviews.slice(0, 3).map(interview => (
                                <div key={interview.id} className="list-group-item">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <strong>{interview.application?.vacancy?.title || 'Собеседование'}</strong>
                                            <div className="small">
                                                {interview.location && `${interview.location}`}
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div className="text-primary fw-bold">
                                                {interview.interviewDate ?
                                                    new Date(interview.interviewDate).toLocaleDateString() :
                                                    'Дата не указана'}
                                            </div>
                                            <span className={`badge bg-${
                                                interview.status === 'SCHEDULED' ? 'warning' :
                                                interview.status === 'COMPLETED' ? 'success' : 'secondary'
                                            }`}>
                                                {interview.status || 'Неизвестно'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="card mb-4">
                <div className="card-header bg-light">
                    <h5 className="mb-0">Быстрые действия</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <Link to="/" className="btn btn-primary w-100">
                                Поиск вакансий
                            </Link>
                        </div>
                        <div className="col-md-4 mb-3">
                            <Link to="/profile" className="btn btn-success w-100">
                                Редактировать резюме
                            </Link>
                        </div>
                        <div className="col-md-3 mb-3">
                            <Link to="/interviews" className="btn btn-warning w-100">
                                Мои собеседования
                            </Link>
                        </div>
                        <div className="col-md-4 mb-3">
                            <button className="btn btn-info w-100"
                                onClick={() => {
                                    axios.get(`http://localhost:8080/api/recommendations/user/${userId}`)
                                        .then(res => {
                                            if (res.data.length > 0) {
                                                window.location.href = '/';
                                            } else {
                                                alert('Добавьте навыки в профиль для получения рекомендаций!');
                                                window.location.href = '/profile';
                                            }
                                        });
                                }}>
                                Получить рекомендации
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Мои последние заявки</h5>
                        <Link to="/profile" className="btn btn-sm btn-outline-primary">
                            Все заявки →
                        </Link>
                    </div>
                </div>
                <div className="card-body">
                    {stats.applications === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted">У вас пока нет заявок</p>
                            <Link to="/" className="btn btn-primary">
                                Найти первую вакансию
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Вакансия</th>
                                        <th>Статус</th>
                                        <th>Дата подачи</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const appsRes = [];
                                        return appsRes.slice(0, 3).map(app => (
                                            <tr key={app.id}>
                                                <td>
                                                    <strong>{app.vacancy?.title || 'Неизвестно'}</strong><br/>
                                                    <small className="text-muted">{app.vacancy?.type || ''}</small>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${
                                                        app.status === 'ACCEPTED' ? 'success' :
                                                        app.status === 'REJECTED' ? 'danger' : 'warning'
                                                    }`}>
                                                        {app.status || 'PENDING'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {app.appliedAt ?
                                                        new Date(app.appliedAt).toLocaleDateString() :
                                                        '-'}
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-info"
                                                        onClick={() => alert(`Заявка #${app.id}\nСтатус: ${app.status}`)}>
                                                        Подробнее
                                                    </button>
                                                </td>
                                            </tr>
                                        ));
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentDashboard;