import React from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import NotFound from './notFound';
import Home from './pages/index';
import Root from './root';

const About = React.lazy(() => import('./pages/about'));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />}>
      <Route index element={<Home />} />
      <Route
        path="about"
        element={
          <React.Suspense fallback={<>...</>}>
            <About />
          </React.Suspense>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);

const Entry: React.FC = () => {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
};

export default Entry;
