import { useState } from "react";
import { useLogto, useHandleSignInCallback } from "@logto/react";
import Sidebar from "./components/Sidebar";
import HubPage from "./pages/HubPage";
import PainelPage from "./pages/PainelPage";
import ClientsPage from "./pages/ClientsPage";
import UsersPage from "./pages/UsersPage";
import LLMUsagePage from "./pages/LLMUsagePage";
import InfraPage from "./pages/InfraPage";
import FinancePage from "./pages/FinancePage";

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
  const { signIn } = useLogto();
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
          DOC<span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">A</span> HQ
        </h1>
        <p className="text-slate-500 mb-8">Central de Comando</p>
        <button
          onClick={handleSignIn}
          className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all"
        >
          Entrar com Auth Center
        </button>
      </div>
    </div>
  );
}

function MainApp() {
  const [currentPage, setCurrentPage] = useState<PageId>("painel");
  // const { signOut } = useLogto();


  const renderPage = () => {
    switch (currentPage) {
      case "hub": return <HubPage />;
      case "painel": return <PainelPage />;
      case "clients": return <ClientsPage />;
      case "users": return <UsersPage />;
      case "llm": return <LLMUsagePage />;
      case "infra": return <InfraPage />;
      case "finance": return <FinancePage />;
      default: return <PainelPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage}  />
      <main className="flex-1 ml-16">
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useLogto();

  // Handle callback
  if (window.location.pathname === '/callback') {
    return <CallbackHandler />;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff6b2c] to-[#ff8f5a] flex items-center justify-center animate-pulse">
          <span className="text-2xl">🐙</span>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Main app
  return <MainApp />;
}
