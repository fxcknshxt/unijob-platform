import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MyApplications() {
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8080/api/applications')
            .then(res => setApplications(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="container mt-4">
            <h2>Мои заявки</h2>
            {applications.length === 0 ? (
                <p>У вас пока нет заявок</p>
            ) : (
                <div className="list-group">
                    {applications.map(app => (
                        <div key={app.id} className="list-group-item">
                            <h5>Заявка #{app.id}</h5>
                            <p>Статус: <strong>{app.status}</strong></p>
                            <p>Дата подачи: {new Date(app.appliedAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyApplications;