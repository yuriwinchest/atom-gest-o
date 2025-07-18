import { db } from "./db";
import { users, documents, news, features, systemStats } from "@shared/schema";

async function seedDatabase() {
  try {
    console.log("🌱 Iniciando população do banco de dados...");

    // Limpar dados existentes (opcional)
    await db.delete(systemStats);
    await db.delete(features);
    await db.delete(news);
    await db.delete(documents);
    await db.delete(users);

    // Inserir dados de exemplo
    console.log("📰 Inserindo notícias...");
    await db.insert(news).values([
      {
        title: "Sistema de Gestão Atualizado - Novas Funcionalidades",
        description: "Implementadas melhorias na busca e organização de documentos",
        content: "O sistema recebeu importantes atualizações que melhoram a experiência do usuário com novas funcionalidades de busca avançada e organização automática de documentos.",
        category: "Atualização",
        featured: true,
      },
      {
        title: "Nova Interface de Usuário Disponível",
        description: "Interface mais intuitiva e responsiva para todos os dispositivos",
        content: "A nova interface foi desenvolvida com foco na usabilidade e acessibilidade.",
        category: "Interface",
        featured: false,
      },
    ]);

    console.log("🎯 Inserindo funcionalidades...");
    await db.insert(features).values([
      {
        title: "Nova Funcionalidade: Busca Avançada",
        description: "Implementamos um sistema de busca mais inteligente que permite encontrar documentos rapidamente",
        imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "Novidade",
      },
      {
        title: "Digitalização do Acervo Histórico",
        description: "Concluída a digitalização de mais 150 documentos históricos do arquivo municipal",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "Digitalização",
      },
    ]);

    console.log("📄 Inserindo documentos...");
    await db.insert(documents).values([
      {
        title: "Relatório Anual de Atividades 2023",
        description: "Documento contendo o resumo das principais atividades realizadas durante o ano de 2023",
        content: "Este relatório apresenta um panorama completo das atividades realizadas pela organização durante o ano de 2023, incluindo projetos, resultados e metas alcançadas.",
        tags: ["relatório", "2023", "atividades"],
        category: "Relatórios",
        author: "Secretaria Municipal",
      },
      {
        title: "Manual de Procedimentos Administrativos",
        description: "Guia completo dos procedimentos administrativos da organização",
        content: "Este manual define os procedimentos padrão para todas as atividades administrativas, garantindo uniformidade e qualidade nos processos internos.",
        tags: ["manual", "procedimentos", "administração"],
        category: "Manuais",
        author: "Departamento de RH",
      },
      {
        title: "Plano Estratégico 2024-2026",
        description: "Documento com diretrizes estratégicas para o triênio 2024-2026",
        content: "Plano estratégico contendo visão, missão, objetivos e metas para os próximos três anos.",
        tags: ["planejamento", "estratégia", "2024", "2026"],
        category: "Planejamento",
        author: "Diretoria Executiva",
      },
    ]);

    console.log("📊 Inserindo estatísticas do sistema...");
    await db.insert(systemStats).values({
      documentsCount: 2547,
      usersCount: 1283,
      searchesPerMonth: 8924,
      totalDownloads: 15632,
    });

    console.log("✅ Banco de dados populado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao popular banco de dados:", error);
  }
}

export { seedDatabase };

// Executar se chamado diretamente
seedDatabase().then(() => process.exit(0));