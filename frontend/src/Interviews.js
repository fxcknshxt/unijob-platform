import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Interviews() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(1);
    const [viewMode, setViewMode] = useState('upcoming'); // upcoming, all, past

    useEffect(() => {
        loadInterviews();
    }, [userId]);

    const loadInterviews = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8080/api/interviews/user/${userId}`);
            setInterviews(response.data || []);
            setLoading(false);
        } catch (err) {
            console.error('Ошибка загрузки:', err);
            setLoading(false);
        }
    };

    const createTestInterview = async () => {
        try {
            const appsRes = await axios.get('http://localhost:8080/api/applications');
            const userApps = appsRes.data.filter(app =>
                app.student && app.student.id === userId
            );

            if (userApps.length === 0) {
                alert('Сначала создайте заявку!');
                return;
            }

            const response = await axios.post('http://localhost:8080/api/interviews', {
                applicationId: userApps[0].id,
                interviewDate: new Date(Date.now() + 86400000 * 2).toISOString(),
                location: "Главный корпус, аудитория 301",
                interviewType: "OFFLINE",
                notes: "Тестовое собеседование"
            });

            alert('Собеседование создано!');
            loadInterviews();
        } catch (err) {
            alert('Ошибка: ' + err.message);
        }
    };

    const updateStatus = async (interviewId, status) => {
        try {
            await axios.put(`http://localhost:8080/api/interviews/${interviewId}/status?status=${status}`);
            alert('Статус обновлён');
            loadInterviews();
        } catch (err) {
            alert('Ошибка: ' + err.message);
        }
    };

    const filteredInterviews = interviews.filter(interview => {
        const now = new Date();
        const interviewDate = new Date(interview.interviewDate);

        if (viewMode === 'upcoming') {
            return interviewDate > now && interview.status !== 'CANCELLED';
        } else if (viewMode === 'past') {
            return interviewDate < now || interview.status === 'COMPLETED';
        }
        return true; // all
    });

    if (loading) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
                <p className="mt-2">Загрузка собеседований...</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Календарь собеседований</h2>
                <div>
                    <Link to="/profile" className="btn btn-outline-primary btn-sm me-2">
                        ← В профиль
                    </Link>
                    <button className="btn btn-primary btn-sm" onClick={createTestInterview}>
                        + Новое собеседование
                    </button>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <h6>Тестовый переключатель:</h6>
                            <div className="btn-group">
                                <button className={`btn btn-sm ${userId === 1 ? 'btn-success' : 'btn-outline-success'}`}
                                        onClick={() => setUserId(1)}>
                                    Студент (ID:1)
                                </button>
                                <button className={`btn btn-sm ${userId === 2 ? 'btn-info' : 'btn-outline-info'}`}
                                        onClick={() => setUserId(2)}>
                                    Работодатель (ID:2)
                                </button>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <h6>Режим просмотра:</h6>
                            <div className="btn-group">
                                <button className={`btn btn-sm ${viewMode === 'upcoming' ? 'btn-warning' : 'btn-outline-warning'}`}
                                        onClick={() => setViewMode('upcoming')}>
                                    Предстоящие
                                </button>
                                <button className={`btn btn-sm ${viewMode === 'past' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                        onClick={() => setViewMode('past')}>
                                    Прошедшие
                                </button>
                                <button className={`btn btn-sm ${viewMode === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setViewMode('all')}>
                                    Все
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <div className="card border-primary">
                        <div className="card-body text-center">
                            <h5>Всего</h5>
                            <h2 className="text-primary">{interviews.length}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card border-warning">
                        <div className="card-body text-center">
                            <h5>Запланировано</h5>
                            <h2 className="text-warning">
                                {interviews.filter(i => i.status === 'SCHEDULED').length}
                            </h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card border-success">
                        <div className="card-body text-center">
                            <h5>Завершено</h5>
                            <h2 className="text-success">
                                {interviews.filter(i => i.status === 'COMPLETED').length}
                            </h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card border-danger">
                        <div className="card-body text-center">
                            <h5>Отменено</h5>
                            <h2 className="text-danger">
                                {interviews.filter(i => i.status === 'CANCELLED').length}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">
                        Список собеседований ({filteredInterviews.length})
                        <span className="badge bg-primary ms-2">{viewMode}</span>
                    </h5>
                </div>
                <div className="card-body">
                    {filteredInterviews.length === 0 ? (
                        <div className="text-center py-5">
                            <h4>Нет собеседований</h4>
                            <p className="text-muted">Создайте первое собеседование или дождитесь приглашения</p>
                            <button className="btn btn-primary" onClick={createTestInterview}>
                                Создать тестовое собеседование
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Вакансия</th>
                                        <th>Дата и время</th>
                                        <th>Место/Формат</th>
                                        <th>Статус</th>
                                        <th>Заметки</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInterviews.map(interview => {
                                        const interviewDate = new Date(interview.interviewDate);
                                        const isUpcoming = interviewDate > new Date();

                                        return (
                                            <tr key={interview.id} className={isUpcoming ? 'table-warning' : ''}>
                                                <td>#{interview.id}</td>
                                                <td>
                                                    <strong>
                                                        {interview.application?.vacancy?.title || 'Неизвестно'}
                                                    </strong>
                                                    {interview.application?.vacancy && (
                                                        <div className="small text-muted">
                                                            Заявка #{interview.application.id}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="fw-bold">
                                                        {interviewDate.toLocaleDateString()}
                                                    </div>
                                                    <div className="small">
                                                        {interviewDate.toLocaleTimeString()}
                                                    </div>
                                                    {!isUpcoming && (
                                                        <div className="small text-muted">
                                                            {interviewDate < new Date() ? 'Прошло' : 'Сегодня'}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <div>{interview.location}</div>
                                                    <span className={`badge bg-${interview.interviewType === 'ONLINE' ? 'info' : 'secondary'}`}>
                                                        {interview.interviewType || 'Не указан'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <select
                                                        className={`form-select form-select-sm border-${{
                                                            'SCHEDULED': 'warning',
                                                            'COMPLETED': 'success',
                                                            'CANCELLED': 'danger'
                                                        }[interview.status] || 'secondary'}`}
                                                        style={{width: '130px'}}
                                                        value={interview.status}
                                                        onChange={(e) => updateStatus(interview.id, e.target.value)}
                                                    >
                                                        <option value="SCHEDULED">Запланировано</option>
                                                        <option value="COMPLETED">Завершено</option>
                                                        <option value="CANCELLED">Отменено</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    {interview.notes ? (
                                                        <button
                                                            className="btn btn-sm btn-outline-info"
                                                            onClick={() => alert(`Заметки:\n\n${interview.notes}`)}
                                                        >
                                                            Показать
                                                        </button>
                                                    ) : (
                                                        <span className="text-muted">Нет заметок</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            className="btn btn-outline-primary"
                                                            onClick={() => {
                                                                const info = `
Вакансия: ${interview.application?.vacancy?.title}
Дата: ${interviewDate.toLocaleString()}
Место: ${interview.location}
Тип: ${interview.interviewType}
Статус: ${interview.status}
Заметки: ${interview.notes || 'Нет'}
                                                                `.trim();
                                                                alert(info);
                                                            }}
                                                        >
                                                            Подробнее
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger"
                                                            onClick={() => {
                                                                if (window.confirm('Удалить собеседование?')) {
                                                                    axios.delete(`http://localhost:8080/api/interviews/${interview.id}`)
                                                                        .then(() => {
                                                                            alert('Удалено!');
                                                                            loadInterviews();
                                                                        })
                                                                        .catch(err => alert('Ошибка: ' + err.message));
                                                                }
                                                            }}
                                                        >
                                                            Удалить
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <div className="card mt-4">
                <div className="card-header">
                    <h5 className="mb-0">Ближайшие даты собеседований</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        {interviews
                            .filter(i => i.status === 'SCHEDULED')
                            .slice(0, 5)
                            .map(interview => {
                                const date = new Date(interview.interviewDate);
                                return (
                                    <div key={interview.id} className="col-md-2 mb-3">
                                        <div className="card text-center">
                                            <div className="card-header bg-warning text-white">
                                                <small>{date.toLocaleDateString('ru-RU', { weekday: 'short' })}</small>
                                            </div>
                                            <div className="card-body">
                                                <div className="display-6">{date.getDate()}</div>
                                                <div className="small">
                                                    {date.toLocaleDateString('ru-RU', { month: 'short' })}
                                                </div>
                                                <div className="small text-muted">
                                                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Interviews;