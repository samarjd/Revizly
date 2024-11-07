import React, { useState, useEffect, useRef } from 'react';
import '../assets/css/UserMenu.css';
import avatar from '../assets/image/revizly.png';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

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

  return (
    <div className="user-menu" ref={menuRef}>
      <div className="avatar" onClick={toggleMenu}>
        <img src={avatar} alt="User avatar" />
      </div>
      {isOpen && (
        <div className="dropdown">
          <div>Profile</div>
          <div>Settings</div>
          <div>Logout</div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
