import { storage } from "./storage";

export async function seedContentData() {
  console.log("🌱 Inicializando dados de conteúdo...");

  try {
    // Verificar se informações de contato já existem
    const existingContact = await storage.getContactInfo();
    
    if (!existingContact) {
      console.log("📞 Criando informações de contato...");
      await storage.createContactInfo({
        email: "contato@gestaoarquivos.gov.br",
        phone: "(11) 3456-7890",
        address: "Rua da Administração, 123 - Centro - São Paulo/SP",
        business_hours: "Segunda a Sexta: 8h às 17h",
        description: "Preservando e disponibilizando o patrimônio histórico para as futuras gerações."
      });
      console.log("✅ Informações de contato criadas");
    }

    // Verificar se links do rodapé já existem
    const existingFooterLinks = await storage.getFooterLinks();
    
    if (existingFooterLinks.length === 0) {
      console.log("🔗 Criando links do rodapé...");
      
      await storage.createFooterLink({
        title: "Portal da Transparência",
        description: "Acesse informações sobre gastos públicos, licitações e contratos do governo federal de forma transparente e detalhada.",
        url: "https://transparencia.gov.br",
        is_active: true
      });

      await storage.createFooterLink({
        title: "Ouvidoria",
        description: "Canal direto para sugestões, reclamações e denúncias. Sua voz é importante para melhorarmos nossos serviços.",
        url: "https://ouvidoria.gov.br",
        is_active: true
      });

      await storage.createFooterLink({
        title: "Lei de Acesso à Informação",
        description: "Solicite informações públicas de forma gratuita e transparente através do portal oficial do governo.",
        url: "https://lai.gov.br",
        is_active: true
      });

      await storage.createFooterLink({
        title: "Política de Privacidade",
        description: "Conheça como protegemos seus dados pessoais e garantimos sua privacidade em nossos sistemas.",
        url: "/politica-privacidade",
        is_active: true
      });

      console.log("✅ Links do rodapé criados");
    }

    // Verificar se redes sociais já existem
    const existingSocialNetworks = await storage.getSocialNetworks();
    
    if (existingSocialNetworks.length === 0) {
      console.log("📱 Criando redes sociais...");
      
      await storage.createSocialNetwork({
        name: "LinkedIn",
        url: "https://linkedin.com/company/gestao-arquivos-gov",
        icon: "linkedin",
        is_active: true
      });

      await storage.createSocialNetwork({
        name: "YouTube",
        url: "https://youtube.com/@gestaoarquivos",
        icon: "youtube",
        is_active: true
      });

      await storage.createSocialNetwork({
        name: "Facebook",
        url: "https://facebook.com/gestaoarquivos",
        icon: "facebook",
        is_active: true
      });

      console.log("✅ Redes sociais criadas");
    }

    console.log("🎉 Dados de conteúdo inicializados com sucesso!");

  } catch (error) {
    console.error("❌ Erro ao inicializar dados de conteúdo:", error);
    throw error;
  }
}

// Executar seed se este arquivo for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedContentData()
    .then(() => {
      console.log("✅ Seed concluído com sucesso!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erro no seed:", error);
      process.exit(1);
    });
}