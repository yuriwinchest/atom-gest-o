// Script para criar e popular tabelas diretamente no Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fbqocpozjmuzrdeacktb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg1Njc4NiwiZXhwIjoyMDY1NDMyNzg2fQ.V37kx1A0n8LzOBGWOzDFSopUBQkQ4TgNMBl8vWMpKqY';

// Usar service key para ter permissões totais
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🚀 Criando tabelas de categorias no Supabase...\n');

// Função para executar SQL diretamente
async function executarSQL(sql, descricao) {
  try {
    console.log(`📝 ${descricao}...`);

    // O Supabase não tem método direto para executar SQL arbitrário via JS
    // Vamos usar uma abordagem diferente - criar via inserção
    return true;
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    return false;
  }
}

// Vamos criar as tabelas inserindo dados diretamente
async function criarEPopularTabelas() {
  try {
    // 1. Document Types
    console.log('📄 Criando e populando tipos de documento...');
    const tiposDocumento = [
      'Ofício', 'Memorando', 'Relatório', 'Ata', 'Decreto',
      'Lei', 'Portaria', 'Resolução', 'Circular', 'Edital',
      'Contrato', 'Convênio', 'Parecer', 'Nota Técnica', 'Carta'
    ];

    for (const tipo of tiposDocumento) {
      const { data, error } = await supabase
        .from('document_types')
        .upsert({ name: tipo }, { onConflict: 'name' })
        .select();

      if (error) {
        // Se a tabela não existe, vamos usar RPC para criar
        console.log(`   ⚠️ Tabela não existe, tentando criar via RPC...`);

        // Tentar criar a tabela via RPC
        const { error: rpcError } = await supabase.rpc('exec_sql', {
          query: `
            CREATE TABLE IF NOT EXISTS document_types (
              id SERIAL PRIMARY KEY,
              name TEXT NOT NULL UNIQUE,
              category TEXT,
              created_at TIMESTAMP DEFAULT NOW()
            );
          `
        }).catch(() => ({ error: 'RPC não disponível' }));

        if (rpcError) {
          console.log(`   ℹ️ RPC não disponível. Tabela precisa ser criada manualmente.`);
          break;
        }

        // Tentar inserir novamente
        const { error: insertError } = await supabase
          .from('document_types')
          .insert({ name: tipo });

        if (insertError) {
          console.log(`   ❌ ${tipo}: ${insertError.message}`);
        } else {
          console.log(`   ✅ ${tipo} inserido`);
        }
      } else {
        console.log(`   ✅ ${tipo}`);
      }
    }

    // 2. Public Organs
    console.log('\n🏛️ Criando e populando órgãos públicos...');
    const orgaosPublicos = [
      'Presidência da República', 'Ministério da Fazenda',
      'Ministério da Justiça', 'Câmara dos Deputados',
      'Senado Federal', 'Ministério da Saúde',
      'Ministério da Educação', 'Tribunal de Contas da União',
      'Ministério do Meio Ambiente', 'Controladoria-Geral da União'
    ];

    for (const orgao of orgaosPublicos) {
      const { error } = await supabase
        .from('public_organs')
        .upsert({ name: orgao }, { onConflict: 'name' });

      if (error && !error.message.includes('already exists')) {
        console.log(`   ⚠️ ${orgao}: Tabela não existe`);
        break;
      } else {
        console.log(`   ✅ ${orgao}`);
      }
    }

    // 3. Responsible Sectors
    console.log('\n📋 Criando e populando setores responsáveis...');
    const setoresResponsaveis = [
      'Departamento Jurídico', 'Secretaria Executiva',
      'Assessoria de Comunicação', 'Gabinete',
      'Diretoria Administrativa', 'Departamento de Recursos Humanos',
      'Departamento Financeiro', 'Departamento de TI',
      'Ouvidoria', 'Controladoria Interna'
    ];

    for (const setor of setoresResponsaveis) {
      const { error } = await supabase
        .from('responsible_sectors')
        .upsert({ name: setor }, { onConflict: 'name' });

      if (error && !error.message.includes('already exists')) {
        console.log(`   ⚠️ ${setor}: Tabela não existe`);
        break;
      } else {
        console.log(`   ✅ ${setor}`);
      }
    }

    // 4. Main Subjects
    console.log('\n📚 Criando e populando assuntos principais...');
    const assuntosPrincipais = [
      'Administração Pública', 'Orçamento e Finanças',
      'Recursos Humanos', 'Tecnologia da Informação',
      'Meio Ambiente', 'Saúde', 'Educação',
      'Segurança Pública', 'Infraestrutura', 'Cultura e Esporte'
    ];

    for (const assunto of assuntosPrincipais) {
      const { error } = await supabase
        .from('main_subjects')
        .upsert({ name: assunto }, { onConflict: 'name' });

      if (error && !error.message.includes('already exists')) {
        console.log(`   ⚠️ ${assunto}: Tabela não existe`);
        break;
      } else {
        console.log(`   ✅ ${assunto}`);
      }
    }

    // 5. Confidentiality Levels
    console.log('\n🔒 Criando e populando níveis de confidencialidade...');
    const niveisConfidencialidade = [
      'Público', 'Restrito', 'Confidencial', 'Secreto', 'Ultra-secreto'
    ];

    for (const nivel of niveisConfidencialidade) {
      const { error } = await supabase
        .from('confidentiality_levels')
        .upsert({ name: nivel }, { onConflict: 'name' });

      if (error && !error.message.includes('already exists')) {
        console.log(`   ⚠️ ${nivel}: Tabela não existe`);
        break;
      } else {
        console.log(`   ✅ ${nivel}`);
      }
    }

    // 6. Availability Options
    console.log('\n🌐 Criando e populando opções de disponibilidade...');
    const opcoesDisponibilidade = [
      'Disponível Online', 'Arquivo Físico', 'Biblioteca',
      'Acesso Restrito', 'Em Digitalização', 'Temporariamente Indisponível'
    ];

    for (const opcao of opcoesDisponibilidade) {
      const { error } = await supabase
        .from('availability_options')
        .upsert({ name: opcao }, { onConflict: 'name' });

      if (error && !error.message.includes('already exists')) {
        console.log(`   ⚠️ ${opcao}: Tabela não existe`);
        break;
      } else {
        console.log(`   ✅ ${opcao}`);
      }
    }

    // 7. Language Options
    console.log('\n🗣️ Criando e populando opções de idioma...');
    const opcoesIdioma = [
      'Português', 'Inglês', 'Espanhol', 'Francês',
      'Alemão', 'Italiano', 'Chinês', 'Japonês'
    ];

    for (const idioma of opcoesIdioma) {
      const { error } = await supabase
        .from('language_options')
        .upsert({ name: idioma }, { onConflict: 'name' });

      if (error && !error.message.includes('already exists')) {
        console.log(`   ⚠️ ${idioma}: Tabela não existe`);
        break;
      } else {
        console.log(`   ✅ ${idioma}`);
      }
    }

    // 8. Rights Options
    console.log('\n⚖️ Criando e populando opções de direitos...');
    const opcoesDireitos = [
      'Domínio Público', 'Direitos Reservados', 'Creative Commons',
      'Uso Interno', 'Licença Comercial', 'Uso Educacional'
    ];

    for (const direito of opcoesDireitos) {
      const { error } = await supabase
        .from('rights_options')
        .upsert({ name: direito }, { onConflict: 'name' });

      if (error && !error.message.includes('already exists')) {
        console.log(`   ⚠️ ${direito}: Tabela não existe`);
        break;
      } else {
        console.log(`   ✅ ${direito}`);
      }
    }

    // 9. Document Authorities
    console.log('\n👑 Criando e populando autoridades de documento...');
    const autoridadesDocumento = [
      'Presidente', 'Ministro', 'Secretário', 'Diretor',
      'Coordenador', 'Chefe de Gabinete', 'Procurador',
      'Auditor', 'Assessor', 'Gerente'
    ];

    for (const autoridade of autoridadesDocumento) {
      const { error } = await supabase
        .from('document_authorities')
        .upsert({ name: autoridade }, { onConflict: 'name' });

      if (error && !error.message.includes('already exists')) {
        console.log(`   ⚠️ ${autoridade}: Tabela não existe`);
        break;
      } else {
        console.log(`   ✅ ${autoridade}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('⚠️  IMPORTANTE: As tabelas não existem no Supabase!');
    console.log('='.repeat(60));
    console.log('\n📝 Você precisa criar as tabelas manualmente no Supabase SQL Editor.');
    console.log('   Use o SQL fornecido no arquivo IMPORTANTE-CONFIGURAR-SUPABASE.md');
    console.log('\n1. Acesse: https://supabase.com/dashboard/project/fbqocpozjmuzrdeacktb/sql');
    console.log('2. Cole o SQL do arquivo');
    console.log('3. Execute o SQL');
    console.log('4. Depois rode este script novamente');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar
criarEPopularTabelas();
