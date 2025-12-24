import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import VacancyList from './VacancyList';
import VacancyPage from './VacancyPage';
import MyApplications from './MyApplication';
import './App.css';
import Dashboard from './Dashboard';
import Profile from './Profile';

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
        <div className="container">
          <Link className="navbar-brand" to="/">
             UniJob Platform
          </Link>

          <div className="navbar-nav">
            <Link className="nav-link" to="/">
              Главная
            </Link>
            <Link className="nav-link" to="/my-applications">
               Мои заявки
            </Link>
            <Link className="nav-link" to="/employer-dashboard">
               Для работодателей
            </Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<VacancyList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/vacancy/:id" element={<VacancyPage />} />
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/employer-dashboard" element={
            <div className="alert alert-info">
              <h4>Панель работодателя</h4>
              <p>Здесь будет управление вакансиями и откликами.</p>
              <p><em>Эта страница в разработке</em></p>
            </div>
          } />
        </Routes>
      </div>

      <footer className="footer mt-5 py-3 bg-light">
        <div className="container text-center">
          <span className="text-muted">© 2024 UniJob Platform. Университетский портал вакансий.</span>
        </div>
      </footer>
    </BrowserRouter>
  );
}

export default App;