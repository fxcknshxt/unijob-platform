import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function EmployerDashboard() {
    const [user, setUser] = useState(null);
    const [employer, setEmployer] = useState(null);
    const [stats, setStats] = useState({
        vacancies: 0,
        activeVacancies: 0,
        totalApplications: 0,
        newApplications: 0,
        scheduledInterviews: 0
    });
    const [vacancies, setVacancies] = useState([]);
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const userId = 2;

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);

                const userRes = await axios.get(`http://localhost:8080/api/users/${userId}`);
                setUser(userRes.data);

                const employersRes = await axios.get('http://localhost:8080/api/employers');
                const userEmployer = employersRes.data.find(e => e.user?.id === userId);
                setEmployer(userEmployer);

                if (userEmployer) {
                    const vacanciesRes = await axios.get(`http://localhost:8080/api/employers/${userEmployer.id}/vacancies`);
                    setVacancies(vacanciesRes.data);

                    const appsRes = await axios.get('http://localhost:8080/api/applications');
                    const employerApps = appsRes.data.filter(app =>
                        vacanciesRes.data.some(v => v.id === app.vacancy?.id)
                    );
                    setRecentApplications(employerApps.slice(0, 5));

                    setStats({
                        vacancies: vacanciesRes.data.length,
                        activeVacancies: vacanciesRes.data.filter(v => v.active).length,
                        totalApplications: employerApps.length,
                        newApplications: employerApps.filter(app => app.status === 'PENDING').length,
                        scheduledInterviews: 0
                    });
                }

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
                <div className="spinner-border text-info" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
                <p className="mt-2">Загрузка панели работодателя...</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <nav className="navbar navbar-dark bg-info mb-4 rounded">
                <div className="container-fluid">
                    <span className="navbar-brand fw-bold">UniJob Platform - Панель работодателя</span>
                    <div className="d-flex">
                        <Link to="/profile" className="btn btn-outline-light btn-sm me-2">
                            Профиль
                        </Link>
                        <Link to="/" className="btn btn-light btn-sm">
                            Просмотр вакансий
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="alert alert-info">
                <h4>Добро пожаловать, {employer?.companyName || user?.name}!</h4>
                <p className="mb-0">Здесь вы можете управлять вакансиями, просматривать заявки и общаться с кандидатами.</p>
            </div>

            <div className="row mb-4">
                <div className="col-md-4 mb-3">
                    <div className="card border-info">
                        <div className="card-body text-center">
                            <h5 className="card-title">Мои вакансии</h5>
                            <h2 className="text-info">{stats.vacancies}</h2>
                            <div className="small">
                                <span className="text-success">{stats.activeVacancies} активных</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-3">
                    <div className="card border-primary">
                        <div className="card-body text-center">
                            <h5 className="card-title">Заявки</h5>
                            <h2 className="text-primary">{stats.totalApplications}</h2>
                            <div className="small">
                                <span className="text-warning">{stats.newApplications} новых</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-3">
                    <div className="card border-success">
                        <div className="card-body text-center">
                            <h5 className="card-title">Собеседования</h5>
                            <h2 className="text-success">{stats.scheduledInterviews}</h2>
                            <Link to="/profile" className="btn btn-sm btn-outline-success mt-2">
                                Управлять
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-header bg-light">
                    <h5 className="mb-0">Быстрые действия</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-3 mb-3">
                            <button className="btn btn-info w-100"
                                onClick={() => alert('Форма создания вакансии - в разработке')}>
                                Создать вакансию
                            </button>
                        </div>
                        <div className="col-md-3 mb-3">
                            <Link to="/" className="btn btn-primary w-100">
                                Просмотреть заявки
                            </Link>
                        </div>
                        <div className="col-md-3 mb-3">
                            <button className="btn btn-success w-100"
                                onClick={() => alert('Календарь собеседований')}>
                                Календарь
                            </button>
                        </div>
                        <div className="col-md-3 mb-3">
                            <button className="btn btn-warning w-100"
                                onClick={() => window.open('http://localhost:8080/swagger-ui.html', '_blank')}>
                                API Документация
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-header bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Мои вакансии</h5>
                        <button className="btn btn-sm btn-info"
                            onClick={() => alert('Создание новой вакансии')}>
                            + Новая вакансия
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    {vacancies.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted">У вас пока нет созданных вакансий</p>
                            <button className="btn btn-info"
                                onClick={() => alert('Форма создания вакансии')}>
                                Создать первую вакансию
                            </button>
                        </div>
                    ) : (
                        <div className="list-group">
                            {vacancies.slice(0, 3).map(vacancy => (
                                <div key={vacancy.id} className="list-group-item">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="mb-1">{vacancy.title}</h6>
                                            <small className="text-muted">{vacancy.type} • {vacancy.location || 'Удалённо'}</small>
                                        </div>
                                        <div>
                                            <span className={`badge ${vacancy.active ? 'bg-success' : 'bg-secondary'}`}>
                                                {vacancy.active ? 'Активна' : 'Неактивна'}
                                            </span>
                                            <button className="btn btn-sm btn-outline-primary ms-2"
                                                onClick={() => window.location.href = `/vacancy/${vacancy.id}`}>
                                                Подробнее
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {recentApplications.length > 0 && (
                <div className="card">
                    <div className="card-header bg-light">
                        <h5 className="mb-0">Последние заявки</h5>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Кандидат</th>
                                        <th>Вакансия</th>
                                        <th>Статус</th>
                                        <th>Дата</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentApplications.map(app => (
                                        <tr key={app.id}>
                                            <td>
                                                <strong>{app.student?.name || 'Неизвестно'}</strong><br/>
                                                <small>{app.student?.email || ''}</small>
                                            </td>
                                            <td>{app.vacancy?.title || 'Неизвестно'}</td>
                                            <td>
                                                <span className={`badge bg-${
                                                    app.status === 'ACCEPTED' ? 'success' :
                                                    app.status === 'REJECTED' ? 'danger' : 'warning'
                                                }`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td>
                                                {app.appliedAt ?
                                                    new Date(app.appliedAt).toLocaleDateString() :
                                                    '-'}
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-info"
                                                    onClick={() => alert(`Заявка #${app.id}\nКандидат: ${app.student?.name}\nСтатус: ${app.status}`)}>
                                                    Подробнее
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmployerDashboard;