import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { DocumentPage } from "./pages/DocumentPage";
import { HocuspocusProviderWebsocketComponent } from "@hocuspocus/provider-react";

export function App() {
  return (
    <HocuspocusProviderWebsocketComponent url="ws://localhost:4000">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/document/:docId" element={<DocumentPage />} />
        </Routes>
      </BrowserRouter>
    </HocuspocusProviderWebsocketComponent>
  );
}