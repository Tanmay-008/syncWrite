import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { DocumentPage } from "./pages/DocumentPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/document/:docId" element={<DocumentPage />} />
      </Routes>
    </BrowserRouter>
  );
}