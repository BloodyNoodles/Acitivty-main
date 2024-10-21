import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './authcontext'; // Import the AuthProvider
import Registration from './Registration2.jsx';
import TaskManagementApp from './App.jsx';
import ProtectedRoute from './protectedRoute.jsx'; // Import the ProtectedRoute

const root = ReactDOM.createRoot(document.getElementById('root'));

function Main() {
    return (
        <AuthProvider> {/* Wrap your application with AuthProvider */}
            <Router>
                <Routes>
                    <Route path="/" element={<Registration />} /> {/* Login/Registration page */}
                    <Route path="/tasks" element={<ProtectedRoute element={<TaskManagementApp />} />} /> {/* Protected route for task management */}
                </Routes>
            </Router>
        </AuthProvider>
    );
}

root.render(<Main />);
