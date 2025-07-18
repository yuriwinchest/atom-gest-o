import { FolderOpen, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { useQuery } from '@tanstack/react-query';

interface FooterPage {
  id: number;
  slug: string;
  title: string;
  description?: string;
  content: string;
  meta_description?: string;
  icon?: string;
  category: string;
  external_url?: string;
  is_active: boolean;
  order_index: number;
}

export default function Footer() {
  // Buscar páginas do rodapé
  const { data: footerPages = [] } = useQuery<FooterPage[]>({
    queryKey: ['/api/footer-pages'],
    queryFn: async () => {
      const response = await fetch('/api/footer-pages');
      if (!response.ok) return [];
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  // Filtrar páginas ativas por categoria
  const linksUteis = footerPages.filter(page => 
    page.is_active && page.category === 'links-uteis'
  ).sort((a, b) => a.order_index - b.order_index);

  const contatoPages = footerPages.filter(page => 
    page.is_active && page.category === 'contato'
  ).sort((a, b) => a.order_index - b.order_index);

  const redesSociais = footerPages.filter(page => 
    page.is_active && page.category === 'redes-sociais'
  ).sort((a, b) => a.order_index - b.order_index);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sistema de Gestão */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sistema de Gestão de Arquivos</h3>
            <p className="text-gray-300 text-sm mb-4">
              Sistema ideal de Arquivos - Preservando e organizando o patrimônio documental da nossa gestão
            </p>
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
                <FolderOpen className="text-white text-sm" size={16} />
              </div>
            </div>
          </div>

          {/* Links Úteis Dinâmicos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Úteis</h3>
            <ul className="space-y-2 text-sm">
              {linksUteis.length > 0 ? (
                linksUteis.map((page) => (
                  <li key={page.id}>
                    <a 
                      href={page.external_url || `/pages/${page.slug}`}
                      target={page.external_url ? "_blank" : "_self"}
                      rel={page.external_url ? "noopener noreferrer" : undefined}
                      className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2"
                    >
                      {page.icon && <span>{page.icon}</span>}
                      <span>{page.title}</span>
                    </a>
                  </li>
                ))
              ) : (
                // Links padrão se não houver páginas criadas
                <>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                      <span>🔍</span>
                      <span>Portal da Transparência</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                      <span>⚖️</span>
                      <span>Ouvidoria</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                      <span>ℹ️</span>
                      <span>Acesso à Informação</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                      <span>🛡️</span>
                      <span>Política de Privacidade</span>
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contato Dinâmico */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {contatoPages.length > 0 ? (
                contatoPages.map((page) => (
                  <li key={page.id}>
                    <a 
                      href={page.external_url || `/pages/${page.slug}`}
                      target={page.external_url ? "_blank" : "_self"}
                      rel={page.external_url ? "noopener noreferrer" : undefined}
                      className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2"
                    >
                      {page.icon && <span>{page.icon}</span>}
                      <span>{page.title}</span>
                    </a>
                  </li>
                ))
              ) : (
                // Informações de contato padrão
                <>
                  <li className="flex items-center space-x-2">
                    <Mail size={16} />
                    <span>contato@gestaoarquivos.gov.br</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Phone size={16} />
                    <span>(11) 3456-7890</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <MapPin size={16} className="mt-1" />
                    <span>
                      Rua da Administração, 123<br />
                      Centro - São Paulo/SP
                    </span>
                  </li>
                  <li>
                    <a href="/contato" className="text-brand-blue-light hover:text-blue-300 transition-colors duration-200 flex items-center space-x-2">
                      <MessageCircle size={16} />
                      <span>Página de Contato</span>
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Redes Sociais Dinâmicas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Redes Sociais</h3>
            <ul className="space-y-2 text-sm">
              {redesSociais.length > 0 ? (
                redesSociais.map((page) => (
                  <li key={page.id}>
                    <a 
                      href={page.external_url || `/pages/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2"
                    >
                      {page.icon && <span>{page.icon}</span>}
                      <span>{page.title}</span>
                    </a>
                  </li>
                ))
              ) : (
                // Links de redes sociais padrão
                <>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                      <span>📘</span>
                      <span>Facebook</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                      <span>🐦</span>
                      <span>Twitter</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                      <span>📺</span>
                      <span>YouTube</span>
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Sistema de Gestão de Arquivos. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}