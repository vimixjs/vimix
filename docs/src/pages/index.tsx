import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <Link to="/about">About</Link>
      <button type="button" onClick={() => setCount(count + 1)}>
        {count}
      </button>
      Hello World
    </div>
  );
};

export default Home;
