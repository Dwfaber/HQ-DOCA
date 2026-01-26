import { useState } from "react";
import { useLogto, useHandleSignInCallback } from "@logto/react";
import Sidebar from "./components/Sidebar";
import HubPage from "./pages/HubPage";
import PainelPage from "./pages/PainelPage";

export type PageId = "hub" | "painel" | "clients" | "users" | "llm" | "infra" | "finance";

function CallbackHandler() {
  const { isLoading } = useHandleSignInCallback(() => {
    window.location.href = '/';
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#ff6b2c] to-[#ff8f5a] flex items-center justify-center animate-pulse">
            <span className="text-2xl">🐙</span>
          </div>
          <p className="text-slate-500">Autenticando...</p>
        </div>
      </div>
    );
  }

  return null;
}

function LoginScreen() {
  const { signIn, isLoading } = useLogto();

  const handleSignIn = () => {
    signIn('https://hq.docaperformance.com.br/callback');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#ff6b2c] to-[#ff8f5a] flex items-center justify-center shadow-xl shadow-orange-500/30">
          <span className="text-4xl">🐙</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          DOC<span className="gradient-text">A</span> HQ
        </h1>
        <p className="text-slate-400 mb-8">Command Center</p>
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#ff6b2c] to-[#ff8f5a] text-white font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50"
        >
          {isLoading ? "Carregando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#ff6b2c] to-[#ff8f5a] flex items-center justify-center animate-pulse">
          <span className="text-2xl">🐙</span>
        </div>
        <p className="text-slate-500">Carregando DOCA HQ...</p>
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const [currentPage, setCurrentPage] = useState<PageId>("hub");

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main className="flex-1 ml-20">
        {currentPage === "hub" && <HubPage />}
        {currentPage === "painel" && <PainelPage />}
        {currentPage === "clients" && <PainelPage />}
        {currentPage === "users" && <PainelPage />}
        {currentPage === "llm" && <PainelPage />}
        {currentPage === "infra" && <PainelPage />}
        {currentPage === "finance" && <PainelPage />}
      </main>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useLogto();

  // Check if we're on the callback route
  if (window.location.pathname === '/callback') {
    return <CallbackHandler />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <AuthenticatedApp />;
}