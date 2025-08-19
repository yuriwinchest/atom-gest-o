import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Folder,
  Menu,
  LogIn,
  User,
  LogOut,
  Users,
  FileText,
  ChevronDown,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "./LoginModal";
// Logo será carregado via URL direta

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const handleLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 bg-[#0e1df0e8]">
        <div className="flex justify-between items-center h-14 sm:h-16 min-w-0">
          {/* Logo do Sistema - responsivo */}
          <div className="flex items-center min-w-0">
            <div className="flex-shrink-0 bg-white rounded-lg p-2 shadow-sm border border-gray-200">
              <img
                src="/logosistema.jpg"
                alt="Logo IMPL - Instituto Memória do Poder Legislativo ALMT"
                className="h-6 w-auto sm:h-8 object-contain"
                onError={(e) => {
                  // Fallback para ícone se imagem não carregar
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-6 h-6 sm:w-8 sm:h-8 bg-brand-blue rounded flex items-center justify-center">
                <Folder className="text-amber-400 fill-current" size={14} />
              </div>
            </div>
          </div>

          {/* Navegação Principal - Desktop */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === "/" ? "text-amber-400" : "text-white"
              }`}
            >
              Início
            </Link>
            {isAuthenticated && (
              <Link
                href="/gestao-documentos"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === "/gestao-documentos" ? "text-amber-400" : "text-white"
                }`}
              >
                Gestão de Documentos
              </Link>
            )}
          </nav>

          {/* Ações do Usuário - responsivo */}
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-1 sm:space-x-2 bg-white/10 rounded-lg px-1 sm:px-3 py-1 sm:py-2 hover:bg-white/20 transition-colors min-w-0"
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs sm:text-sm font-bold">
                        {(user?.username || "admin").charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="hidden md:block text-left min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {user?.username || "admin"}
                      </p>
                      <p className="text-gray-200 text-xs truncate">
                        {user?.role === "admin" ? "Administrador" : "Usuário"}
                      </p>
                    </div>

                    <ChevronDown className="text-white h-3 w-3 sm:h-4 sm:w-4 ml-1 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="flex items-center" asChild>
                    <Link href="/meu-perfil">
                      <User className="mr-2 h-4 w-4 text-gray-600" />
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="flex items-center" asChild>
                    <Link href="/profile-management">
                      <User className="mr-2 h-4 w-4 text-purple-600" />
                      <span className="text-purple-600">Gerenciamento Avançado</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center" asChild>
                    <Link href="/admin/users">
                      <Users className="mr-2 h-4 w-4 text-blue-600" />
                      <span className="text-blue-600">Gerenciar Usuários</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center" asChild>
                    <Link href="/gerenciar-conteudo">
                      <FileText className="mr-2 h-4 w-4 text-orange-600" />
                      Gerenciar Conteúdo
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="flex items-center" asChild>
                    <Link href="/gestao-documentos-clean">
                      <FileText className="mr-2 h-4 w-4 text-green-600" />
                      <span className="text-green-600">Sistema Híbrido</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center bg-red-50" asChild>
                    <Link href="/test-category-save">
                      <span className="mr-2">🧪</span>
                      <span className="text-red-600 font-bold">TESTE DE CATEGORIAS</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleLogin}
                className="bg-white/10 text-white hover:bg-white/20 rounded-lg px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm min-w-0"
              >
                <LogIn className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">Entrar</span>
              </Button>
            )}

            {/* Menu Mobile - sempre visível em telas pequenas */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden bg-white/10 text-white hover:bg-white/20 p-1 sm:p-2"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Menu Mobile - quando expandido */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/20 mt-2 pt-2 pb-2">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/"
                className={`transition-colors duration-200 font-medium px-3 py-2 rounded ${
                  location === "/"
                    ? "text-yellow-300 bg-white/10 font-bold"
                    : "text-white hover:text-yellow-300 hover:bg-white/10"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Início
              </Link>
              {isAuthenticated && (
                <Link
                  href="/gestao-documentos"
                  className={`transition-colors duration-200 font-medium px-3 py-2 rounded ${
                    location === "/gestao-documentos"
                      ? "text-yellow-300 bg-white/10 font-bold"
                      : "text-white hover:text-yellow-300 hover:bg-white/10"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Gestão de Documentos
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Modal de Login */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
}
