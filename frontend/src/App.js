import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import VacancyList from './VacancyList';
import VacancyPage from './VacancyPage';
import './App.css';

function App(){
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<VacancyList />} />
                <Route path="/vacancy/:id" element={<VacancyPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;