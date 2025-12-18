import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function VacancyPage(){
    const { id } = useParams();
    const [vacancy, setVacancy] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        axios.get(`http://localhost:8080/api/vacancies/${id}`)
        .then(res => setVacancy(res.data))
        .catch(err => console.error(err));
    }, [id]);

    const handleApply = async () => {
        try{
            await axios.post('http://localhost:8080/api/applications', {
                student: { id: 1 },
                vacancy: { id: id },
                status: 'PENDING'
            });
            setMessage('Заявка отправлена!');
        }
        catch (err) {
            setMessage('Ошибка при отправке');
        }
    };


    if (!vacancy) return <p>Загрузка...</p>;

    return (
        <div className="container mt-4">
            <h2>{vacancy.title}</h2>
            <p>{vacancy.description}</p>
            <button className="btn btn-success" onClick={handleApply}>Откликнуться</button>
            {message && <p className="mt-2">{message}</p>}
        </div>
    );
}

export default VacancyPage;