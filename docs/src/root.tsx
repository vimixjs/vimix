import React from 'react';
import { Outlet } from 'react-router-dom';

const Root: React.FC = () => {
  return (
    <div>
      ROOT
      <Outlet />
    </div>
  );
};

export default Root;
