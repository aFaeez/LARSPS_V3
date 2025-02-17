import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import "./assets/scss/style.scss";
import App from './App.tsx';
import { ProjectProvider } from "./services/globalVariable";;

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter> {/* Wrap the App in BrowserRouter */}
            <ProjectProvider>
                <App />
            </ProjectProvider>
        </BrowserRouter>
    </StrictMode>,
);