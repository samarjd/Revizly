import React, { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import '../assets/css/SideMenu.css';

const SideMenu = ({ titles, onConversationSelect, onNewConversation, onDeleteConversation, onChangeTitle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef(null); // Reference to the input field

  // Detect clicks outside of the input field
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setEditingId(null); // Cancel editing
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const groupTitlesByDate = (titles) => {
    return titles.reduce((acc, item) => {
      const dateKey = moment(item.date).startOf('day').format('YYYY-MM-DD');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(item);
      return acc;
    }, {});
  };

  const sortedTitles = [...titles].sort((a, b) => new Date(b.date) - new Date(a.date));
  const groupedTitles = groupTitlesByDate(sortedTitles);
  const sortedDates = Object.keys(groupedTitles).sort((a, b) => new Date(b) - new Date(a));

  const toggleMenu = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleConversationClick = (conversationId) => {
    const items = document.querySelectorAll('.title-item');
    items.forEach(item => {
      if (item.id === conversationId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    onConversationSelect(conversationId);
  };

  const handleTitleDoubleClick = (id, currentTitle) => {
    setEditingId(id);
    setNewTitle(currentTitle);
  };

  const handleTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const handleTitleKeyPress = async (e, id) => {
    if (e.key === 'Enter') {
      if (newTitle.trim()) {
        await onChangeTitle(id, newTitle.trim());
        setEditingId(null); // Exit edit mode
      }
    }
  };

  const handleDeleteClick = async (conversationId) => {
    onDeleteConversation(conversationId);
  };

  return (
    <div className={`side-menu ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="navBrand">
        <h2 onClick={toggleMenu}>
          <span>Revizly</span>
        </h2>
        <button className="new-convo-btn" onClick={onNewConversation}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <ul>
          {sortedDates.map((date) => {
            const formattedDate = moment(date);
            const isToday = formattedDate.isSame(moment(), 'day');
            const isYesterday = formattedDate.isSame(moment().subtract(1, 'days'), 'day');
            const displayDate = isToday
              ? 'Today'
              : isYesterday
                ? 'Yesterday'
                : formattedDate.isAfter(moment().subtract(1, 'months'))
                  ? formattedDate.fromNow()
                  : formattedDate.format('D MMM YYYY');

            return (
              <li key={date} className="date-group">
                <div className="date">{displayDate}</div>
                <ul>
                  {groupedTitles[date].map((item) => (
                    <li id={item._id} key={item._id} className="title-item">
                      <div className="conversation-side">
                        {editingId === item._id ? (
                          <input
                            type="text"
                            value={newTitle}
                            onChange={handleTitleChange}
                            onKeyDown={(e) => handleTitleKeyPress(e, item._id)}
                            ref={inputRef}
                            autoFocus
                            className="edit-title-input"
                          />
                        ) : (
                          <div
                            className="title"
                            onClick={() => handleConversationClick(item._id)}
                            onDoubleClick={() => handleTitleDoubleClick(item._id, item.conversationTitle)}
                          >
                            {item.conversationTitle}
                          </div>
                        )}
                        <button className="delete-btn" onClick={() => handleDeleteClick(item._id)}>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 6H5H21"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SideMenu;
