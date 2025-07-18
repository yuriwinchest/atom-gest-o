import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  FileText, 
  ExternalLink,
  Facebook,
  Youtube,
  Linkedin
} from 'lucide-react';

const iconMap = {
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  mail: Mail,
  phone: Phone,
  mappin: MapPin,
  clock: Clock
};

export default function Contato() {
  // Buscar informações de contato
  const { data: contactInfo, isLoading: contactLoading } = useQuery({
    queryKey: ['/api/contact-info'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Buscar links do rodapé
  const { data: footerLinks, isLoading: footerLoading } = useQuery({
    queryKey: ['/api/footer-links'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Buscar redes sociais
  const { data: socialNetworks, isLoading: socialLoading } = useQuery({
    queryKey: ['/api/social-networks'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const contact = contactInfo as any || {};
  const footer = footerLinks as any || [];
  const social = socialNetworks as any || [];

  if (contactLoading || footerLoading || socialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Entre em Contato</h1>
              <p className="text-gray-600 mt-1">
                Estamos aqui para ajudar você com suas necessidades
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">
                Sistema de Gestão de Arquivos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informações de Contato */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Email */}
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p className="text-gray-600">{contact.email || 'contato@gestaoarquivos.gov.br'}</p>
                </div>
              </div>

              {/* Telefone */}
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Telefone</h3>
                  <p className="text-gray-600">{contact.phone || '(11) 3456-7890'}</p>
                </div>
              </div>

              {/* Endereço */}
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Endereço</h3>
                  <p className="text-gray-600">{contact.address || 'Rua da Administração, 123 - Centro - São Paulo/SP'}</p>
                </div>
              </div>

              {/* Horário */}
              <div className="flex items-start space-x-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Horário de Funcionamento</h3>
                  <p className="text-gray-600">{contact.business_hours || 'Segunda a Sexta: 8h às 17h'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sobre Nós */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Sobre Nosso Trabalho
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                {contact.description || 'Preservando e disponibilizando o patrimônio histórico para as futuras gerações.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Links Úteis */}
        {footer.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Links Úteis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {footer.map((link: any) => (
                <Card key={link.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{link.title}</h3>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {link.description}
                    </p>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Acessar →
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Redes Sociais */}
        {social.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Siga-nos nas Redes Sociais
            </h2>
            <div className="flex justify-center space-x-8">
              {social.map((network: any) => {
                const IconComponent = iconMap[network.icon as keyof typeof iconMap] || ExternalLink;
                return (
                  <a
                    key={network.id}
                    href={network.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <IconComponent className="h-6 w-6 text-blue-600" />
                    <span className="font-semibold text-gray-900">{network.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}