import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css'
import Login from './components/Login'
import Register from './components/Register'
import Home from './components/Home'
import Dashboard from './components/Dashboard'
function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route
            path="/dashboard"
            element={<Navigate replace to="/dashboard/play" />}
          />
        </Routes>
      </Router>

    </>
  )
}

export default App
