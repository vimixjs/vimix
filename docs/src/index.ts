import React from 'react';
import { createRoot } from 'react-dom/client';
import Entry from './entry.client';

const container = document.getElementById('root') as HTMLDivElement;
const root = createRoot(container);

root.render(React.createElement(Entry));
