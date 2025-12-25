import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import VacancyList from './VacancyList';
import VacancyPage from './VacancyPage';
import MyApplications from './MyApplication';
import Profile from './Profile';
import StudentDashboard from './StudentDashboard';
import EmployerDashboard from './EmployerDashboard';
import AdminPanel from './AdminPanel';
import './App.css';
import Interviews from './Interviews';
import CreateInterview from './CreateInterview';

function App() {
  return (
    <BrowserRouter>

      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            UniJob Platform
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Поиск вакансий
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/student-dashboard">
                  Панель студента
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/employer-dashboard">
                  Для работодателей
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin-panel">
                  Админ-панель
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/my-applications">
                  Мои заявки
                </Link>
              </li>
              <li className="nav-item">
                  <Link className="nav-link" to="/interviews">
                      Собеседования
                  </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/profile">
                  Профиль
                </Link>
              </li>
            </ul>

            <div className="navbar-text">
              <small className="text-light">
                Университетская платформа вакансий
              </small>
            </div>
          </div>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<VacancyList />} />
          <Route path="/interviews" element={<Interviews />} />
          <Route path="/create-interview" element={<CreateInterview />} />
          <Route path="/vacancy/:id" element={<VacancyPage />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/employer-dashboard" element={<EmployerDashboard />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-applications" element={<MyApplications />} />
        </Routes>
      </div>

      <footer className="footer mt-5 py-3 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h6>UniJob Platform</h6>
              <p className="text-muted small">
                Централизованная платформа для поиска работы и стажировок в университете.
              </p>
            </div>
            <div className="col-md-3">
              <h6>Ссылки</h6>
              <ul className="list-unstyled small">
                <li><Link to="/" className="text-muted">Главная</Link></li>
                <li><Link to="/student-dashboard" className="text-muted">Для студентов</Link></li>
                <li><Link to="/employer-dashboard" className="text-muted">Для работодателей</Link></li>
                <li><Link to="/profile" className="text-muted">Личный кабинет</Link></li>
                <li className="nav-item">
                  <Link className="nav-link" to="/interviews">
                    Собеседования
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-md-3">
              <h6>Контакты</h6>
              <p className="text-muted small">
                support@unijob.edu<br/>
                +7 (343) 123-45-67
              </p>
            </div>
          </div>
          <hr/>
          <div className="text-center text-muted">
            <small>© 2025 UniJob Platform. Все права защищены.</small>
          </div>
        </div>
      </footer>
    </BrowserRouter>
  );
}

export default App;