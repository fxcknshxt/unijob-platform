import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function VacancyPage(){
    const { id } = useParams();
    const [vacancy, setVacancy] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:8080/api/vacancies/${id}')
        .then(res => setVacancy(res.data))
        .catch(err => console.error(err));
    }, [id]);

    if (!vacancy) return <p>Загрузка...</p>;

    return (
        <div className="container mt-4">
            <h2>{vacancy.title}</h2>
            <p>{vacancy.description}</p>
            <button className="btn btn-success">Откликнуться</button>
        </div>
    );
}

export default VacancyPage;