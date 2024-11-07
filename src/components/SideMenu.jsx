import React, { useState } from 'react';
import moment from 'moment';
import '../assets/css/SideMenu.css';

const SideMenu = ({ titles }) => {
  const [isCollapsed, setIsCollapsed] = useState(false); // State to manage the collapse of the side menu

  // Function to group titles by date
  const groupTitlesByDate = (titles) => {
    return titles.reduce((acc, item) => {
      const dateKey = moment(item.date).startOf('day').format('YYYY-MM-DD'); // Group by formatted date
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(item);
      return acc;
    }, {});
  };

  // Sort titles by date in descending order
  const sortedTitles = [...titles].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Group titles
  const groupedTitles = groupTitlesByDate(sortedTitles);
  
  // Sort the grouped dates in descending order
  const sortedDates = Object.keys(groupedTitles).sort((a, b) => new Date(b) - new Date(a));

  // Toggle the side menu collapse state
  const toggleMenu = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`side-menu ${isCollapsed ? 'collapsed' : ''}`}>
      <h2 onClick={toggleMenu} style={{ cursor: 'pointer' }}>
        Revizly
      </h2>
      {!isCollapsed && ( // Render contents only if not collapsed
        <ul>
          {sortedDates.map((date) => {
            const formattedDate = moment(date);
            // Check if the date is today or yesterday
            const isToday = formattedDate.isSame(moment(), 'day');
            const isYesterday = formattedDate.isSame(moment().subtract(1, 'days'), 'day');

            // Format the date for display
            const displayDate = isToday 
              ? 'Today' 
              : isYesterday 
                ? 'Yesterday' 
                : formattedDate.isAfter(moment().subtract(1, 'months')) 
                  ? formattedDate.fromNow() 
                  : formattedDate.format('D MMM YYYY'); // Format for dates older than a month

            return (
              <li key={date} className="date-group">
                <div className="date">{displayDate}</div>
                <ul>
                  {groupedTitles[date].map((item) => (
                    <li key={item.id} className="title-item">
                      <div className="title">{item.title}</div>
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
