import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function VacancyPage() {
    const { id } = useParams();
    const [vacancy, setVacancy] = useState(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        axios.get(`http://localhost:8080/api/vacancies/${id}`)
            .then(res => setVacancy(res.data))
            .catch(err => console.error(err));
    }, [id]);

    const handleApply = async () => {
        try {
            const response = await axios.post('http://localhost:8080/api/applications', {
                student: { id: 1 },
                vacancy: { id: id },
                status: 'PENDING',
                coverLetter: coverLetter || 'Заинтересован в вакансии!'
            });

            setMessage(`${response.data.message}`);
        } catch (err) {
            setMessage('Ошибка при отправке: ' + (err.response?.data || err.message));
        }
    };

    <div className="mb-3">
        <h5>Требуемые навыки:</h5>
        <button className="btn btn-sm btn-outline-info mb-2"
            onClick={() => {
                axios.get(`http://localhost:8080/api/vacancy-skills/vacancy/${id}`)
                    .then(res => {
                        if (res.data.length > 0) {
                            const skillsList = res.data.map(s => s.skillName).join(', ');
                            alert(`Навыки для этой вакансии: ${skillsList}`);
                        } else {
                            alert('Для этой вакансии ещё не указаны навыки');
                        }
                    });
            }}>
            Показать навыки через VacancySkill API
        </button>
        <div className="d-flex flex-wrap gap-2">
        </div>
    </div>

    if (!vacancy) return <p>Загрузка...</p>;

    return (
        <div className="container mt-4">
            <h2>{vacancy.title}</h2>
            <p>{vacancy.description}</p>

            <div className="mb-3">
                <label htmlFor="coverLetter" className="form-label">
                    Сопроводительное письмо (необязательно):
                </label>
                <textarea
                    id="coverLetter"
                    className="form-control"
                    rows="3"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Расскажите, почему вы подходите на эту позицию..."
                />
            </div>

            <button className="btn btn-success" onClick={handleApply}>
                Откликнуться
            </button>

            {message && (
                <div className={`mt-3 alert ${message.includes() ? 'alert-success' : 'alert-danger'}`}>
                    {message}
                </div>
            )}
        </div>
    );
}

export default VacancyPage;