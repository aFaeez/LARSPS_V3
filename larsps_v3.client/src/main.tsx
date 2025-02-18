import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import "./assets/scss/style.scss";
import App from './App.tsx';
import { ProjectProvider } from "./services/globalVariable";
import { SessionProvider } from './context/SessionContext';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter> {/* Wrap the App in BrowserRouter */}
            <SessionProvider>
                <ProjectProvider>
                    <App />
                </ProjectProvider>
            </SessionProvider>
        </BrowserRouter>
    </StrictMode>,
);