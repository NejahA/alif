import React from 'react';
import TaskCount from './TaskCount';
import './Header.css';

function Header({ tasks }) {
  return (
    <header className="header">
      <h1 className="header-title">Task Manager</h1>
      <TaskCount tasks={tasks} />
    </header>
  );
}

export default Header;
