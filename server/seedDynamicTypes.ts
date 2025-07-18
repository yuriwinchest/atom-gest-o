// Seed script para popular as tabelas de tipos dinâmicos
import { db } from "./db";
import { documentTypes, publicOrgans, responsibleSectors, mainSubjects, confidentialityLevels, availabilityOptions, languageOptions, rightsOptions, documentAuthorities } from "@shared/schema";

export async function seedDynamicTypes() {
  console.log("🌱 Iniciando seed das tabelas de tipos dinâmicos...");

  try {
    // Document Types
    const documentTypesToInsert = [
      { name: "Ata de Reunião", description: "Registro oficial de reunião" },
      { name: "Certificado", description: "Documento de certificação ou diploma" },
      { name: "Contrato", description: "Documento contratual oficial" },
      { name: "Decreto", description: "Ato administrativo de caráter normativo" },
      { name: "Edital", description: "Documento público de convocação" },
      { name: "Fatura", description: "Documento de cobrança de serviços" },
      { name: "Lei", description: "Norma jurídica de caráter geral" },
      { name: "Memorando", description: "Comunicação interna oficial" },
      { name: "Ofício", description: "Comunicação oficial externa" },
      { name: "Portaria", description: "Ato administrativo interno" },
      { name: "Relatório", description: "Documento informativo detalhado" },
      { name: "Resolução", description: "Ato administrativo normativo" }
    ];

    // Public Organs
    const publicOrgansToInsert = [
      { name: "Câmara Municipal", description: "Poder Legislativo Municipal" },
      { name: "Prefeitura Municipal", description: "Poder Executivo Municipal" },
      { name: "Secretaria de Administração", description: "Órgão administrativo municipal" },
      { name: "Secretaria de Educação", description: "Órgão responsável pela educação" },
      { name: "Secretaria de Saúde", description: "Órgão responsável pela saúde pública" },
      { name: "Secretaria de Obras", description: "Órgão responsável por obras públicas" },
      { name: "Secretaria de Meio Ambiente", description: "Órgão ambiental municipal" },
      { name: "Secretaria de Finanças", description: "Órgão financeiro municipal" },
      { name: "Secretaria de Transporte", description: "Órgão de transporte público" },
      { name: "Procuradoria Jurídica", description: "Órgão jurídico municipal" },
      { name: "Controladoria Geral", description: "Órgão de controle interno" },
      { name: "Departamento de Recursos Humanos", description: "Gestão de pessoal" }
    ];

    // Responsible Sectors
    const responsibleSectorsToInsert = [
      { name: "Arquivo Central", description: "Setor responsável pelo arquivamento" },
      { name: "Departamento Jurídico", description: "Setor jurídico institucional" },
      { name: "Departamento Financeiro", description: "Setor financeiro e contábil" },
      { name: "Departamento de Comunicação", description: "Setor de comunicação institucional" },
      { name: "Gabinete do Prefeito", description: "Gabinete executivo principal" },
      { name: "Mesa Diretora", description: "Mesa diretora da Câmara" },
      { name: "Setor de Protocolo", description: "Setor de protocolo e recepção" },
      { name: "Setor de Licitações", description: "Setor responsável por licitações" },
      { name: "Setor de Compras", description: "Setor de aquisições públicas" },
      { name: "Setor de Patrimônio", description: "Gestão patrimonial" },
      { name: "Setor de Tecnologia", description: "Tecnologia da informação" },
      { name: "Setor de Planejamento", description: "Planejamento estratégico" }
    ];

    // Main Subjects
    const mainSubjectsToInsert = [
      { name: "Administração Pública", description: "Gestão e administração governamental" },
      { name: "Educação", description: "Políticas e programas educacionais" },
      { name: "Saúde Pública", description: "Políticas e serviços de saúde" },
      { name: "Obras Públicas", description: "Infraestrutura e construção civil" },
      { name: "Meio Ambiente", description: "Políticas ambientais e sustentabilidade" },
      { name: "Finanças Públicas", description: "Orçamento e gestão financeira" },
      { name: "Recursos Humanos", description: "Gestão de pessoal e servidores" },
      { name: "Legislação", description: "Normas e regulamentações" },
      { name: "Licitações e Contratos", description: "Processos licitatórios e contratos" },
      { name: "Protocolo e Correspondência", description: "Documentação e comunicação oficial" },
      { name: "Patrimônio Público", description: "Gestão de bens públicos" },
      { name: "Transporte Público", description: "Sistema de transporte municipal" },
      { name: "Segurança Pública", description: "Políticas de segurança municipal" },
      { name: "Assistência Social", description: "Programas sociais e assistenciais" },
      { name: "Cultura e Esportes", description: "Atividades culturais e esportivas" },
      { name: "Desenvolvimento Urbano", description: "Planejamento e desenvolvimento da cidade" }
    ];

    // Inserir dados nas tabelas
    console.log("📄 Inserindo tipos de documento...");
    await db.insert(documentTypes).values(documentTypesToInsert).onConflictDoNothing();

    console.log("🏛️ Inserindo órgãos públicos...");
    await db.insert(publicOrgans).values(publicOrgansToInsert).onConflictDoNothing();

    console.log("📋 Inserindo setores responsáveis...");
    await db.insert(responsibleSectors).values(responsibleSectorsToInsert).onConflictDoNothing();

    console.log("📚 Inserindo assuntos principais...");
    await db.insert(mainSubjects).values(mainSubjectsToInsert).onConflictDoNothing();

    // Additional dynamic types
    const confidentialityLevelsToInsert = [
      { name: "Público", description: "Acesso livre ao público em geral" },
      { name: "Restrito", description: "Acesso restrito a pessoal autorizado" },
      { name: "Confidencial", description: "Acesso limitado a pessoas específicas" },
      { name: "Reservado", description: "Informação com grau de proteção" },
      { name: "Sigiloso", description: "Máximo grau de proteção" },
      { name: "Interno", description: "Uso interno da organização" }
    ];

    const availabilityOptionsToInsert = [
      { name: "Público", description: "Disponível publicamente" },
      { name: "Restrito", description: "Acesso restrito" },
      { name: "Sob Demanda", description: "Disponível mediante solicitação" },
      { name: "Temporário", description: "Disponibilidade limitada no tempo" },
      { name: "Permanente", description: "Disponibilidade permanente" }
    ];

    const languageOptionsToInsert = [
      { name: "Português", description: "Idioma português brasileiro" },
      { name: "Inglês", description: "Idioma inglês" },
      { name: "Espanhol", description: "Idioma espanhol" },
      { name: "Francês", description: "Idioma francês" },
      { name: "Italiano", description: "Idioma italiano" },
      { name: "Alemão", description: "Idioma alemão" }
    ];

    const rightsOptionsToInsert = [
      { name: "Domínio Público", description: "Livre uso e distribuição" },
      { name: "Uso Restrito", description: "Uso limitado e controlado" },
      { name: "Direitos Autorais", description: "Protegido por direitos autorais" },
      { name: "Creative Commons", description: "Licença Creative Commons" },
      { name: "Uso Interno", description: "Apenas para uso interno" },
      { name: "Licença Específica", description: "Sujeito a licença específica" }
    ];

    const documentAuthoritiesToInsert = [
      { name: "Prefeito", description: "Autoridade municipal máxima" },
      { name: "Secretário", description: "Secretário municipal" },
      { name: "Diretor", description: "Diretor de departamento" },
      { name: "Coordenador", description: "Coordenador de setor" },
      { name: "Chefe de Gabinete", description: "Chefe do gabinete" },
      { name: "Procurador", description: "Procurador jurídico" },
      { name: "Contador", description: "Contador responsável" },
      { name: "Engenheiro", description: "Engenheiro responsável" },
      { name: "Presidente da Câmara", description: "Presidente da Câmara Municipal" }
    ];

    console.log("🔒 Inserindo níveis de confidencialidade...");
    await db.insert(confidentialityLevels).values(confidentialityLevelsToInsert).onConflictDoNothing();

    console.log("🌐 Inserindo opções de disponibilidade...");
    await db.insert(availabilityOptions).values(availabilityOptionsToInsert).onConflictDoNothing();

    console.log("🗣️ Inserindo opções de idioma...");
    await db.insert(languageOptions).values(languageOptionsToInsert).onConflictDoNothing();

    console.log("⚖️ Inserindo opções de direitos...");
    await db.insert(rightsOptions).values(rightsOptionsToInsert).onConflictDoNothing();

    console.log("👑 Inserindo autoridades de documento...");
    await db.insert(documentAuthorities).values(documentAuthoritiesToInsert).onConflictDoNothing();

    console.log("✅ Seed de tipos dinâmicos concluído com sucesso!");
    
    // Verificar quantos registros foram inseridos
    const documentTypesCount = await db.select().from(documentTypes);
    const publicOrgansCount = await db.select().from(publicOrgans);
    const responsibleSectorsCount = await db.select().from(responsibleSectors);
    const mainSubjectsCount = await db.select().from(mainSubjects);
    const confidentialityLevelsCount = await db.select().from(confidentialityLevels);
    const availabilityOptionsCount = await db.select().from(availabilityOptions);
    const languageOptionsCount = await db.select().from(languageOptions);
    const rightsOptionsCount = await db.select().from(rightsOptions);
    const documentAuthoritiesCount = await db.select().from(documentAuthorities);

    console.log(`📊 Resumo do seed:`);
    console.log(`  - Tipos de documento: ${documentTypesCount.length}`);
    console.log(`  - Órgãos públicos: ${publicOrgansCount.length}`);
    console.log(`  - Setores responsáveis: ${responsibleSectorsCount.length}`);
    console.log(`  - Assuntos principais: ${mainSubjectsCount.length}`);
    console.log(`  - Níveis de confidencialidade: ${confidentialityLevelsCount.length}`);
    console.log(`  - Opções de disponibilidade: ${availabilityOptionsCount.length}`);
    console.log(`  - Opções de idioma: ${languageOptionsCount.length}`);
    console.log(`  - Opções de direitos: ${rightsOptionsCount.length}`);
    console.log(`  - Autoridades de documento: ${documentAuthoritiesCount.length}`);

  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
    throw error;
  }
}

// Execute seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDynamicTypes()
    .then(() => {
      console.log("🎉 Seed executado com sucesso!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Erro no seed:", error);
      process.exit(1);
    });
}