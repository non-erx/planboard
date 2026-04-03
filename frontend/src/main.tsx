import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useParams, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LandingPage } from './LandingPage';
import { BoardPage } from './App';
import './index.css';

function BoardRoute() {
  const { boardId } = useParams<{ boardId: string }>();
  if (!boardId) return <Navigate to="/" replace />;
  return <BoardPage boardId={boardId} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/board/:boardId" element={<BoardRoute />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
