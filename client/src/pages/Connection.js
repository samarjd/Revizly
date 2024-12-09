import React, { useState } from 'react';
import '../assets/css/Connection.css';
import avatar from '../assets/image/revizly.png';


const Connection = ({ onConnect }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Set loading state to true

    const endpoint = isRegistering ? '/signup' : '/login';

    try {
        const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        });

        if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData.error);
        alert(`${isRegistering ? 'Sign Up' : 'Login'} failed: ` + errorData.error);
        return;
        }

        const data = await response.json();
        console.log(data.message);

        if (!isRegistering) {
        // alert a hello message to the user
        alert(`Hello, ${formData.email}!`);
        localStorage.setItem('authToken', data.token);
        onConnect(true);
        } else {
        alert('Sign up successful! Please log in.');
        setIsRegistering(false);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing your request.');
    } finally {
        setIsSubmitting(false); // Reset loading state after submission
    }
    };

    return (
        <div className="connection-page">
            <div className="avatar" style={{ margin: 'auto', width: '100px', height: '100px'}}>
                <img src={avatar} alt="User avatar" style={{width: '100px', height: '100px'}} />
            </div>
            <h1>{isRegistering ? 'Create Account' : 'Log In'}</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : isRegistering ? 'Sign Up' : 'Log In'}
                </button>
            </form>
            <p onClick={() => setIsRegistering(!isRegistering)} className="toggle-link">
                {isRegistering
                    ? 'Already have an account? Log In'
                    : "Don't have an account? Create one"}
            </p>
        </div>
    );
};

export default Connection;
