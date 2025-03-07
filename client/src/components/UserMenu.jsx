import React, { useState, useEffect, useRef } from 'react';
import '../assets/css/UserMenu.css';
import avatar from '../assets/image/revizly.png';

const UserMenu = ({ onLogout }) => { // Accept onLogout prop from parent
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const emailRef = useRef('');
  useEffect(() => {
    // get logged in user's name from jwt token
    const token = localStorage.getItem('authToken');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      emailRef.current = JSON.parse(window.atob(base64)).email || '';
    }
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Clear the auth token
    onLogout(false); // Call the onLogout function passed as a prop to update connection state
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <div className="avatar" onClick={toggleMenu}>
        <img src={avatar} alt="User avatar" />
      </div>
      {isOpen && (
        <div className="dropdown">
          <div>{emailRef.current}</div>
          <div onClick={handleLogout}>Logout</div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
