import { supabase } from "./supabase";
import fs from 'fs';

async function createTestFile() {
  try {
    console.log("📤 Criando arquivo de teste no Supabase Storage...");
    
    // Conteúdo do arquivo de teste
    const testContent = `TESTE EXTRAÇÃO AUTOMÁTICA V2

Documento: Manual Técnico
Órgão: Secretaria de Tecnologia  
Setor: Centro de Inovação
Responsável: Sistema de Inteligência Artificial

Assunto Principal: Automação de Processos

Este é um arquivo de teste para verificar o funcionamento do sistema de visualização de documentos.

Dados do documento:
- Código de Referência: TEST-2025-002
- ID Digital: ATOM-AUTO-TEST-456
- Processo Relacionado: PROC-2025-789
- Nível de Confidencialidade: Público
- Base Legal: Decreto 789/2025

Informações de Digitalização:
- Data: 06/07/2025
- Local: São Paulo - SP
- Responsável: IA do Sistema
- Hash de Verificação: xyz789abc123

Status: Documento funcional para teste do sistema`;

    const fileBuffer = Buffer.from(testContent, 'utf8');
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload('test-arquivo.txt', fileBuffer, {
        contentType: 'text/plain',
        upsert: true
      });

    if (error) {
      console.error('❌ Erro no upload do arquivo de teste:', error);
      return;
    }

    console.log('✅ Arquivo de teste criado com sucesso:', data);
    
  } catch (error) {
    console.error('❌ Erro ao criar arquivo de teste:', error);
  }
}

async function seedSupabaseFiles() {
  try {
    console.log("🌱 Iniciando população da tabela files no Supabase...");

    // Limpar dados existentes (opcional)
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .neq('id', 0); // Delete all records

    if (deleteError && deleteError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.warn('Aviso ao limpar dados:', deleteError.message);
    }

    // Dados de exemplo para popular a tabela files
    const sampleFiles = [
      {
        name: "Relatório Anual de Atividades 2023",
        description: "Documento contendo o resumo das principais atividades realizadas durante o ano de 2023",
        file_type: "PDF",
        file_path: "/documents/relatorio-anual-2023.pdf",
        file_size: 2048576, // 2MB
        tags: ["relatório", "2023", "atividades"],
        is_active: true,
        environment: "production",
        metadata: {
          category: "Relatórios",
          author: "Secretaria Municipal",
          content: "Este relatório apresenta um panorama completo das atividades realizadas pela organização durante o ano de 2023, incluindo projetos, resultados e metas alcançadas."
        }
      },
      {
        name: "Manual de Procedimentos Administrativos",
        description: "Guia completo dos procedimentos administrativos da organização",
        file_type: "PDF",
        file_path: "/documents/manual-procedimentos.pdf",
        file_size: 1536000, // 1.5MB
        tags: ["manual", "procedimentos", "administração"],
        is_active: true,
        environment: "production",
        metadata: {
          category: "Manuais",
          author: "Departamento de RH",
          content: "Este manual define os procedimentos padrão para todas as atividades administrativas, garantindo uniformidade e qualidade nos processos internos."
        }
      },
      {
        name: "Plano Estratégico 2024-2026",
        description: "Documento com diretrizes estratégicas para o triênio 2024-2026",
        file_type: "PDF",
        file_path: "/documents/plano-estrategico-2024-2026.pdf",
        file_size: 3072000, // 3MB
        tags: ["planejamento", "estratégia", "2024", "2026"],
        is_active: true,
        environment: "production",
        metadata: {
          category: "Planejamento",
          author: "Diretoria Executiva",
          content: "Plano estratégico contendo visão, missão, objetivos e metas para os próximos três anos."
        }
      },
      {
        name: "Ata da Reunião de Diretoria - Janeiro 2024",
        description: "Registro das decisões tomadas na reunião mensal de diretoria",
        file_type: "DOCX",
        file_path: "/documents/ata-diretoria-jan-2024.docx",
        file_size: 512000, // 512KB
        tags: ["ata", "reunião", "diretoria", "janeiro"],
        is_active: true,
        environment: "production",
        metadata: {
          category: "Atas",
          author: "Secretária da Diretoria",
          content: "Registro detalhado das discussões e deliberações da reunião mensal de diretoria."
        }
      },
      {
        name: "Orçamento Anual 2024",
        description: "Planilha com a previsão orçamentária para o exercício de 2024",
        file_type: "XLSX",
        file_path: "/documents/orcamento-2024.xlsx",
        file_size: 1024000, // 1MB
        tags: ["orçamento", "2024", "financeiro"],
        is_active: true,
        environment: "production",
        metadata: {
          category: "Financeiro",
          author: "Departamento Financeiro",
          content: "Planilha detalhada com todas as previsões de receitas e despesas para o ano de 2024."
        }
      }
    ];

    console.log("📄 Inserindo documentos no Supabase...");
    
    const { data: insertedFiles, error: insertError } = await supabase
      .from('files')
      .insert(sampleFiles)
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir arquivos:', insertError);
      return;
    }

    console.log(`✅ ${insertedFiles?.length || 0} documentos inseridos com sucesso!`);

    // Verificar os dados inseridos
    const { data: allFiles, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('is_active', true);

    if (fetchError) {
      console.error('❌ Erro ao verificar arquivos:', fetchError);
      return;
    }

    console.log(`📊 Total de arquivos ativos: ${allFiles?.length || 0}`);
    
    if (allFiles && allFiles.length > 0) {
      console.log("\n📋 Documentos criados:");
      allFiles.forEach(file => {
        console.log(`  - ${file.name} (${file.file_type})`);
      });
    }

    console.log("\n✅ Supabase populado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao popular Supabase:", error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  Promise.all([
    createTestFile(),
    seedSupabaseFiles()
  ]).then(() => process.exit(0));
}

export { seedSupabaseFiles, createTestFile };