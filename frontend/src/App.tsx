import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { DocumentPage } from "./pages/DocumentPage";
import SignInForm from "./pages/forms/SignInFrom";
import SignupFormDemo from "./pages/forms/SignUpFrom";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/document/:docId" element={<DocumentPage />} />
        <Route
          path="/signin"
          element={
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
              <SignInForm />
            </div>
          }
        />
        <Route
          path="/login"
          element={
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
              <SignInForm />
            </div>
          }
        />
        <Route
          path="/signup"
          element={
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
              <SignupFormDemo />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}