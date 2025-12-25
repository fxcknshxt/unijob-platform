import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminPanel() {
    const [stats, setStats] = useState({});
    const [vacancies, setVacancies] = useState([]);
    const [applications, setApplications] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statsRes, vacanciesRes, appsRes, usersRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/admin/dashboard'),
                    axios.get('http://localhost:8080/api/vacancies'),
                    axios.get('http://localhost:8080/api/applications'),
                    axios.get('http://localhost:8080/api/users')
                ]);

                setStats(statsRes.data);
                setVacancies(vacanciesRes.data);
                setApplications(appsRes.data);
                setUsers(usersRes.data);
                setLoading(false);
            } catch (err) {
                console.error('Ошибка загрузки:', err);
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const toggleVacancy = async (id) => {
        try {
            await axios.put(`http://localhost:8080/api/admin/vacancies/${id}/toggle`);
            alert('Статус вакансии изменён');
            window.location.reload();
        } catch (err) {
            alert('Ошибка: ' + err.message);
        }
    };

    const deleteVacancy = async (id) => {
        if (!window.confirm('Удалить вакансию?')) return;

        try {
            await axios.delete(`http://localhost:8080/api/admin/vacancies/${id}`);
            alert('Вакансия удалена');
            window.location.reload();
        } catch (err) {
            alert('Ошибка: ' + err.message);
        }
    };

    const updateApplicationStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:8080/api/admin/applications/${id}/status?status=${status}`);
            alert('Статус заявки обновлён');
            window.location.reload();
        } catch (err) {
            alert('Ошибка: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
                <p className="mt-2">Загрузка админ-панели...</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <nav className="navbar navbar-dark bg-dark rounded mb-4">
                <div className="container-fluid">
                    <span className="navbar-brand">Панель администратора</span>
                    <div className="d-flex">
                        <a href="/" className="btn btn-outline-light btn-sm me-2">
                            ← На сайт
                        </a>
                        <a href="/dashboard" className="btn btn-outline-info btn-sm">
                            Общая статистика
                        </a>
                    </div>
                </div>
            </nav>

            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dashboard')}>
                        Дашборд
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'vacancies' ? 'active' : ''}`}
                            onClick={() => setActiveTab('vacancies')}>
                        Вакансии ({vacancies.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'applications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('applications')}>
                        Заявки ({applications.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}>
                        Пользователи ({users.length})
                    </button>
                </li>
            </ul>

            <div className="tab-content">
                {activeTab === 'dashboard' && (
                    <div>
                        <h4 className="mb-4">Статистика системы</h4>
                        <div className="row">
                            {[
                                { title: 'Всего вакансий', value: stats.totalVacancies, color: 'primary' },
                                { title: 'Активных вакансий', value: stats.activeVacancies, color: 'success'},
                                { title: 'Всего заявок', value: stats.totalApplications, color: 'info'},
                                { title: 'Всего пользователей', value: stats.totalUsers, color: 'warning'},
                            ].map((item, idx) => (
                                <div className="col-md-3 mb-3" key={idx}>
                                    <div className={`card text-white bg-${item.color}`}>
                                        <div className="card-body text-center">
                                            <h5 className="card-title">{item.icon} {item.title}</h5>
                                            <h2 className="card-text">{item.value || 0}</h2>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {stats.applicationsByStatus && (
                            <div className="card mt-4">
                                <div className="card-body">
                                    <h5 className="card-title">Заявки по статусам</h5>
                                    <div className="row">
                                        {Object.entries(stats.applicationsByStatus).map(([status, count]) => (
                                            <div className="col-md-4 mb-2" key={status}>
                                                <div className="border rounded p-3">
                                                    <div className="d-flex justify-content-between">
                                                        <span className={`badge bg-${
                                                            status === 'ACCEPTED' ? 'success' :
                                                            status === 'REJECTED' ? 'danger' : 'warning'
                                                        }`}>
                                                            {status}
                                                        </span>
                                                        <strong>{count}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card mt-4">
                            <div className="card-body">
                                <h5 className="card-title">Быстрые действия</h5>
                                <div className="d-flex flex-wrap gap-2">
                                    <button className="btn btn-outline-primary"
                                        onClick={() => setActiveTab('vacancies')}>
                                        Управление вакансиями
                                    </button>
                                    <button className="btn btn-outline-success"
                                        onClick={() => setActiveTab('applications')}>
                                        Управление заявками
                                    </button>
                                    <button className="btn btn-outline-info"
                                        onClick={() => window.open('http://localhost:8080/swagger-ui.html', '_blank')}>
                                        API Документация
                                    </button>
                                    <button className="btn btn-outline-secondary"
                                        onClick={() => window.location.reload()}>
                                        Обновить данные
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'vacancies' && (
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4>Управление вакансиями</h4>
                            <button className="btn btn-success btn-sm"
                                onClick={() => alert('Форма создания вакансии - следующий этап разработки')}>
                                + Создать вакансию
                            </button>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Название</th>
                                        <th>Тип</th>
                                        <th>Статус</th>
                                        <th>Дата создания</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vacancies.map(v => (
                                        <tr key={v.id}>
                                            <td>#{v.id}</td>
                                            <td>
                                                <strong>{v.title}</strong>
                                                {v.description && (
                                                    <div className="text-muted small">
                                                        {v.description.length > 50 ?
                                                            v.description.substring(0, 50) + '...' :
                                                            v.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td>{v.type || '-'}</td>
                                            <td>
                                                <span className={`badge ${v.active ? 'bg-success' : 'bg-secondary'}`}>
                                                    {v.active ? 'Активна' : 'Неактивна'}
                                                </span>
                                            </td>
                                            <td>
                                                {v.createdAt ?
                                                    new Date(v.createdAt).toLocaleDateString() :
                                                    '-'}
                                            </td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <button className="btn btn-outline-primary"
                                                        onClick={() => window.location.href = `/vacancy/${v.id}`}>
                                                    </button>
                                                    <button className={`btn ${v.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                        onClick={() => toggleVacancy(v.id)}>
                                                        {v.active ? 'Деактив.' : 'Актив.'}
                                                    </button>
                                                    <button className="btn btn-outline-danger"
                                                        onClick={() => deleteVacancy(v.id)}>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div>
                        <h4 className="mb-4">Управление заявками</h4>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Студент</th>
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
                                                {app.student ?
                                                    <div>
                                                        <strong>{app.student.name}</strong><br/>
                                                        <small className="text-muted">{app.student.email}</small>
                                                    </div> :
                                                    'Неизвестно'}
                                            </td>
                                            <td>
                                                {app.vacancy ?
                                                    <div>
                                                        <strong>{app.vacancy.title}</strong><br/>
                                                        <small className="text-muted">{app.vacancy.type}</small>
                                                    </div> :
                                                    'Неизвестно'}
                                                {app.coverLetter && (
                                                    <div className="mt-1">
                                                        <small className="text-muted">
                                                            "{app.coverLetter.length > 30 ?
                                                                app.coverLetter.substring(0, 30) + '...' :
                                                                app.coverLetter}"
                                                        </small>
                                                    </div>
                                                )}
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
                                                <div className="btn-group btn-group-sm">
                                                    <select className="form-select form-select-sm"
                                                            style={{width: '120px'}}
                                                            defaultValue={app.status}
                                                            onChange={(e) => updateApplicationStatus(app.id, e.target.value)}>
                                                        <option value="PENDING">PENDING</option>
                                                        <option value="ACCEPTED">ACCEPTED</option>
                                                        <option value="REJECTED">REJECTED</option>
                                                    </select>
                                                    <button className="btn btn-outline-info"
                                                        onClick={() => {
                                                            alert(`Детали заявки #${app.id}\n\n` +
                                                                  `Студент: ${app.student?.name}\n` +
                                                                  `Вакансия: ${app.vacancy?.title}\n` +
                                                                  `Статус: ${app.status}\n` +
                                                                  `Сопроводительное: ${app.coverLetter || 'нет'}`);
                                                        }}>

                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div>
                        <h4 className="mb-4">Управление пользователями</h4>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Имя</th>
                                        <th>Email</th>
                                        <th>Роль</th>
                                        <th>Дата регистрации</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td>#{user.id}</td>
                                            <td><strong>{user.name}</strong></td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`badge bg-${
                                                    user.role === 'ADMIN' ? 'danger' :
                                                    user.role === 'EMPLOYER' ? 'info' : 'secondary'
                                                }`}>
                                                    {user.role || 'STUDENT'}
                                                </span>
                                            </td>
                                            <td>
                                                {user.createdAt ?
                                                    new Date(user.createdAt).toLocaleDateString() :
                                                    '-'}
                                            </td>
                                            <td>
                                                <button className="btn btn-outline-primary btn-sm"
                                                    onClick={() => {
                                                        alert(`Профиль пользователя #${user.id}\n\n` +
                                                              `Имя: ${user.name}\n` +
                                                              `Email: ${user.email}\n` +
                                                              `Роль: ${user.role}\n` +
                                                              `Зарегистрирован: ${user.createdAt ?
                                                                  new Date(user.createdAt).toLocaleDateString() :
                                                                  'неизвестно'}`);
                                                    }}>
                                                    Просмотр
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPanel;