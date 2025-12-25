import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { Link } from 'react-router-dom';

function VacancyList() {
    const [vacancies, setVacancies] = useState([]);
    const [filteredVacancies, setFilteredVacancies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:8080/api/vacancies')
            .then(res => {
                console.log("Вакансии загружены:", res.data);
                setVacancies(res.data);
                setFilteredVacancies(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        let result = vacancies;

        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            result = result.filter(v =>
                v.title?.toLowerCase().includes(term) ||
                v.description?.toLowerCase().includes(term)
            );
        }

        if (typeFilter !== '') {
            result = result.filter(v => v.type === typeFilter);
        }

        setFilteredVacancies(result);
    }, [searchTerm, typeFilter, vacancies]);

    if (loading) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
                <p className="mt-2">Загрузка вакансий...</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <nav className="navbar navbar-light bg-light mb-4 rounded">
                <div className="container-fluid">
                    <a className="navbar-brand fw-bold" href="/">
                        UniJob Platform
                    </a>
                    <div className="d-flex">
                        <a href="/" className="btn btn-outline-primary btn-sm me-2">
                            Вакансии
                        </a>
                        <a href="/profile" className="btn btn-outline-success btn-sm me-2">
                            Мой профиль
                        </a>
                    </div>
                </div>
            </nav>

            <h1 className="mb-4">Вакансии кампуса</h1>

            <div className="row mb-4">
                <div className="col-md-6 mb-3">
                    <div className="input-group">
                        <span className="input-group-text"></span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Поиск по названию или описанию..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => setSearchTerm('')}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                <div className="col-md-4 mb-3">
                    <select
                        className="form-select"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">Все типы вакансий</option>
                        <option value="WORK">Работа</option>
                        <option value="INTERNSHIP">Стажировка</option>
                        <option value="RESEARCH">Исследование</option>
                        <option value="ASSISTANT">Ассистент</option>
                    </select>
                </div>

                <div className="col-md-2 mb-3">
                    <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => {
                            setSearchTerm('');
                            setTypeFilter('');
                        }}
                        disabled={!searchTerm && !typeFilter}
                    >
                        Сбросить фильтры
                    </button>
                </div>
            </div>

            <div className="alert alert-info d-flex justify-content-between align-items-center">
                <div>
                    Найдено вакансий: <strong>{filteredVacancies.length}</strong>
                    {vacancies.length !== filteredVacancies.length && (
                        <span className="text-muted ms-2">
                            (из {vacancies.length})
                        </span>
                    )}
                </div>
                <div>
                    {searchTerm && (
                        <span className="badge bg-primary me-2">
                            Поиск: "{searchTerm}"
                        </span>
                    )}
                    {typeFilter && (
                        <span className="badge bg-success">
                            Тип: {typeFilter}
                        </span>
                    )}
                </div>
            </div>

            {filteredVacancies.length === 0 ? (
                <div className="text-center py-5">
                    <div className="display-1 text-muted mb-3"></div>
                    <h4>Вакансии не найдены</h4>
                    <p className="text-muted">
                        {searchTerm || typeFilter ?
                            'Попробуйте изменить параметры поиска' :
                            'На данный момент нет доступных вакансий'
                        }
                    </p>
                    {(searchTerm || typeFilter) && (
                        <button
                            className="btn btn-primary mt-3"
                            onClick={() => {
                                setSearchTerm('');
                                setTypeFilter('');
                            }}
                        >
                            Показать все вакансии
                        </button>
                    )}
                </div>
            ) : (
                <div className="row">
                    {filteredVacancies.map(v => (
                        <div className="col-md-4 mb-3" key={v.id}>
                            <div className="card h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="card-title">{v.title}</h5>
                                        {v.type && (
                                            <span className="badge bg-secondary">
                                                {v.type}
                                            </span>
                                        )}
                                    </div>
                                    <p className="card-text text-muted" style={{
                                        fontSize: '0.9rem',
                                        height: '60px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {v.description || 'Описание отсутствует'}
                                    </p>
                                    <div className="mt-auto">
                                        {v.location && (
                                            <p className="mb-1">
                                                <small>{v.location}</small>
                                            </p>
                                        )}
                                        {v.createdAt && (
                                            <p className="mb-2">
                                                <small className="text-muted">
                                                    {new Date(v.createdAt).toLocaleDateString()}
                                                </small>
                                            </p>
                                        )}
                                        <Link
                                            to={`/vacancy/${v.id}`}
                                            className="btn btn-primary w-100"
                                        >
                                            Подробнее →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default VacancyList;