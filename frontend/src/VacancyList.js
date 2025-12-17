import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { Link } from 'react-router-dom';

function VacancyList() {
    const [vacancies, setVacancies] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8080/api/vacancies')
        .then(res => {
            console.log("", res.data);
            setVacancies(res.data);
        })
        .catch(err => console.error(err));
    }, []);

    return (
    <div className="container mt-4">
        <h1> Вакансии кампуса</h1>
            <div className="row">
                {vacancies.map(v => (
                    <div className="col-md-4 mb-3" key={v.id}>
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">{v.title}</h5>
                                <p className="card-text">{v.description}</p>
                                <Link to={`/vacancy/${v.id}`} className="btn btn-primary">
                                  Подробнее
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default VacancyList;