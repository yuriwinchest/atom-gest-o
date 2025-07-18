import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { PrivateRoute } from "@/components/auth/PrivateRoute";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/home";
import GestaoDocumentos from "@/pages/gestao-documentos";
import GestaoArquivos from "@/pages/gestao-arquivos";
import DocumentDetails from "@/pages/document-details";
import SupabaseFileManager from "@/pages/supabase-file-manager";
import DocumentosPublicos from "@/pages/documentos-publicos";
import AdminPage from "@/pages/admin";
import UserSettings from "@/pages/user-settings";
import Profile from "@/pages/profile";
import ProfileManagement from "@/pages/profile-management";
import MeuPerfil from "@/pages/meu-perfil";
import GerenciarUsuarios from "@/pages/gerenciar-usuarios";
import GerenciamentoConteudo from "@/pages/gerenciamento-conteudo";
import Contato from "@/pages/contato";
import ValidacaoFormulario from "@/pages/validacao-formulario";
import ValidacaoAnotacoes from "@/pages/validacao-anotacoes";
import StorageMonitor from "@/pages/storage-monitor";
import FooterPageView from "@/pages/footer-page";
import NotFound from "@/pages/not-found";
import LoginMonitoringDashboard from "@/pages/login-monitoring";
import { TestFormDebug } from "@/pages/test-form-debug";
import TestMenu from "@/pages/test-menu";

function Router() {
  const [location] = useLocation();
  
  // RODAPÉ NÃO APARECE NAS PÁGINAS DE GESTÃO
  const shouldShowFooter = !location.startsWith('/gestao-documentos') && !location.startsWith('/gestao-arquivos');
  
  return (
    <>
      <Header />
      
      <div className="min-h-screen">
        <Switch>
          {/* ROTAS PÚBLICAS */}
          <Route path="/" component={Home} />
          <Route path="/documentos-publicos" component={DocumentosPublicos} />
          <Route path="/document/:id" component={DocumentDetails} />
          <Route path="/contato" component={Contato} />
          <Route path="/pages/:slug" component={FooterPageView} />
          <Route path="/test-menu" component={TestMenu} />
          
          {/* ROTAS PRIVADAS - APENAS USUÁRIOS AUTENTICADOS */}
          <Route path="/gestao-documentos">
            <PrivateRoute>
              <GestaoDocumentos />
            </PrivateRoute>
          </Route>
          
          <Route path="/gestao-arquivos">
            <PrivateRoute>
              <GestaoArquivos />
            </PrivateRoute>
          </Route>
          
          <Route path="/supabase-file-manager">
            <PrivateRoute>
              <SupabaseFileManager />
            </PrivateRoute>
          </Route>
          
          <Route path="/user/settings">
            <PrivateRoute>
              <UserSettings />
            </PrivateRoute>
          </Route>
          
          <Route path="/profile">
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          </Route>
          
          <Route path="/profile-management">
            <PrivateRoute>
              <ProfileManagement />
            </PrivateRoute>
          </Route>
          
          <Route path="/meu-perfil">
            <PrivateRoute>
              <MeuPerfil />
            </PrivateRoute>
          </Route>
          
          <Route path="/validacao-formulario">
            <PrivateRoute>
              <ValidacaoFormulario />
            </PrivateRoute>
          </Route>
          
          <Route path="/validacao-anotacoes">
            <PrivateRoute>
              <ValidacaoAnotacoes />
            </PrivateRoute>
          </Route>
          
          <Route path="/test-form-debug">
            <PrivateRoute>
              <TestFormDebug />
            </PrivateRoute>
          </Route>
          
          {/* ROTAS ADMINISTRATIVAS - APENAS ADMINISTRADORES */}
          <Route path="/admin">
            <PrivateRoute requireAdmin>
              <AdminPage />
            </PrivateRoute>
          </Route>
          
          <Route path="/admin/users">
            <PrivateRoute requireAdmin>
              <GerenciarUsuarios />
            </PrivateRoute>
          </Route>
          
          <Route path="/gerenciar-usuarios">
            <PrivateRoute requireAdmin>
              <GerenciarUsuarios />
            </PrivateRoute>
          </Route>
          
          <Route path="/gerenciar-conteudo">
            <PrivateRoute requireAdmin>
              <GerenciamentoConteudo />
            </PrivateRoute>
          </Route>
          
          <Route path="/admin/content">
            <PrivateRoute requireAdmin>
              <GerenciamentoConteudo />
            </PrivateRoute>
          </Route>
          
          <Route path="/storage-monitor">
            <PrivateRoute requireAdmin>
              <StorageMonitor />
            </PrivateRoute>
          </Route>
          
          <Route path="/login-monitoring">
            <PrivateRoute requireAdmin>
              <LoginMonitoringDashboard />
            </PrivateRoute>
          </Route>
          
          <Route component={NotFound} />
        </Switch>
      </div>

      {/* RODAPÉ DINÂMICO - APARECE EM TODAS AS PÁGINAS EXCETO GESTÃO DE DOCUMENTOS */}
      {shouldShowFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background-light">
            <main>
              <Router />
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
