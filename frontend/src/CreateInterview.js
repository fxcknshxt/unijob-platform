import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function CreateInterview() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        applicationId: '',
        interviewDate: '',
        location: '',
        interviewType: 'OFFLINE',
        notes: ''
    });

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadApplications = async () => {
            try {
                const userId = 1;
                const response = await axios.get('http://localhost:8080/api/applications');
                const userApps = response.data.filter(app =>
                    app.student && app.student.id === userId && app.status === 'ACCEPTED'
                );
                setApplications(userApps);

                if (userApps.length > 0) {
                    setFormData(prev => ({ ...prev, applicationId: userApps[0].id }));
                }
            } catch (err) {
                console.error('Ошибка загрузки заявок:', err);
            }
        };

        loadApplications();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const interviewData = {
                ...formData,
                interviewDate: new Date(formData.interviewDate).toISOString()
            };

            const response = await axios.post('http://localhost:8080/api/interviews', interviewData);

            alert('Собеседование успешно создано!');
            console.log('Ответ сервера:', response.data);

            navigate('/interviews');
        } catch (err) {
            console.error('Ошибка создания:', err);
            setError(err.response?.data?.error || err.message || 'Неизвестная ошибка');
        } finally {
            setLoading(false);
        }
    };

    const createQuickInterview = async () => {
        if (applications.length === 0) {
            alert('Нет принятых заявок для создания собеседования!');
            return;
        }

        const quickData = {
            applicationId: applications[0].id,
            interviewDate: new Date(Date.now() + 86400000).toISOString(),
            location: "Онлайн (Zoom)",
            interviewType: "ONLINE",
            notes: "Быстрое собеседование"
        };

        try {
            await axios.post('http://localhost:8080/api/interviews', quickData);
            alert('Быстрое собеседование создано!');
            navigate('/interviews');
        } catch (err) {
            alert('Ошибка: ' + err.message);
        }
    };

    return (
        <div className="container mt-4">
            <nav className="navbar navbar-light bg-light mb-4 rounded">
                <div className="container-fluid">
                    <span className="navbar-brand fw-bold">Создание собеседования</span>
                    <div className="d-flex">
                        <button className="btn btn-outline-primary btn-sm me-2" onClick={createQuickInterview}>
                            Быстрое создание
                        </button>
                        <Link to="/interviews" className="btn btn-outline-secondary btn-sm">
                            ← Назад к списку
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="row">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Форма создания</h5>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger">
                                    <strong>Ошибка:</strong> {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Заявка *</label>
                                    <select
                                        className="form-select"
                                        name="applicationId"
                                        value={formData.applicationId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Выберите заявку</option>
                                        {applications.map(app => (
                                            <option key={app.id} value={app.id}>
                                                #{app.id} - {app.vacancy?.title} (статус: {app.status})
                                            </option>
                                        ))}
                                    </select>
                                    <small className="text-muted">
                                        Можно выбрать только принятые заявки (ACCEPTED)
                                    </small>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Дата и время *</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        name="interviewDate"
                                        value={formData.interviewDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Место проведения *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Например: Главный корпус, ауд. 301 или Ссылка на Zoom"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Тип собеседования</label>
                                    <select
                                        className="form-select"
                                        name="interviewType"
                                        value={formData.interviewType}
                                        onChange={handleChange}
                                    >
                                        <option value="OFFLINE">Офлайн (встреча)</option>
                                        <option value="ONLINE">Онлайн (Zoom/Teams)</option>
                                        <option value="PHONE">Телефонное</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Заметки</label>
                                    <textarea
                                        className="form-control"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Дополнительная информация для кандидата..."
                                    />
                                </div>

                                <div className="d-flex justify-content-between">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Создание...' : 'Создать собеседование'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate('/interviews')}
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Информация</h5>
                        </div>
                        <div className="card-body">
                            <h6>Как работают собеседования:</h6>
                            <ul>
                                <li>Создаются на основе <strong>принятых заявок</strong></li>
                                <li>Автоматически отправляются уведомления участникам</li>
                                <li>Можно отслеживать статус: Запланировано → Завершено/Отменено</li>
                                <li>Появляются в календаре личного кабинета</li>
                            </ul>

                            <hr/>

                            <h6>Статистика:</h6>
                            <div className="row">
                                <div className="col-6">
                                    <div className="border rounded p-2 text-center">
                                        <div className="text-primary fw-bold">{applications.length}</div>
                                        <small>Принятых заявок</small>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="border rounded p-2 text-center">
                                        <div className="text-success fw-bold">0</div>
                                        <small>Будущих собеседований</small>
                                    </div>
                                </div>
                            </div>

                            <hr/>

                            <h6>Быстрые действия:</h6>
                            <div className="d-grid gap-2">
                                <button className="btn btn-sm btn-outline-info" onClick={createQuickInterview}>
                                    Создать быстрое собеседование
                                </button>
                                <Link to="/" className="btn btn-sm btn-outline-success">
                                    Найти вакансии
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateInterview;