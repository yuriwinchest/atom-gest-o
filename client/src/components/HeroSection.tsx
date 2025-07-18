import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useLocation } from "wouter";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Redireciona para a página de documentos públicos com o termo de busca na URL
      setLocation(`/documentos-publicos?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="relative bg-gray-900 overflow-hidden">
      {/* Background com overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2000&h=1000')"
        }}
      />
      <div className="absolute inset-0 bg-gray-900 bg-opacity-60" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
            Sistema de Gestão de Arquivos
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Encontre instituições, pessoas e acervos
          </p>
          
          {/* SearchBar Responsivo */}
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-xl shadow-xl p-1 sm:p-2 flex flex-col sm:flex-row items-center gap-2 sm:gap-0">
              <Input 
                type="text" 
                placeholder="Busque por nome ou palavras-chave..." 
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-500 border-0 rounded-lg sm:rounded-l-lg sm:rounded-r-none focus:outline-none focus:ring-0 focus-visible:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button 
                onClick={handleSearch}
                className="bg-brand-blue hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-l-none sm:rounded-r-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <Search size={16} className="flex-shrink-0" />
                <span className="sm:inline">
                  Buscar
                </span>
              </Button>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm mt-3 px-2">
              Pesquise por títulos, descrições, etiquetas ou palavras-chave nos documentos
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
