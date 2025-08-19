import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase - PROJETO CORRETO
const supabaseUrl = process.env.SUPABASE_URL || 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_CrgokHl7x1arwFyvuzLM5w_v9GEP6iK';

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Interface compatível com Drizzle ORM para compatibilidade
export const db = {
  select: (columns?: any) => ({
    from: (table: any) => ({
      where: (condition: any) => ({
        returning: async () => {
          // Implementar lógica de busca com Supabase
          const tableName = table.name || table;
          const { data, error } = await supabase
            .from(tableName)
            .select('*');

          if (error) throw error;
          return data || [];
        }
      }),
      returning: async () => {
        // Implementar lógica de busca simples
        const tableName = table.name || table;
        const { data, error } = await supabase
          .from(tableName)
          .select('*');

        if (error) throw error;
        return data || [];
      },
      orderBy: (...columns: any[]) => ({
        returning: async () => {
          // Implementar lógica de busca com ordenação
          const tableName = table.name || table;
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .order(columns.map(col => col.column || col).join(','));

          if (error) throw error;
          return data || [];
        }
      })
    }),


  }),

  insert: (table: any) => ({
    values: (data: any) => ({
      returning: async () => {
        const tableName = table.name || table;
        const { data: result, error } = await supabase
          .from(tableName)
          .insert(data)
          .select();

        if (error) throw error;
        return result || [];
      }
    })
  }),

  update: (table: any) => ({
    set: (data: any) => ({
      where: (condition: any) => ({
        returning: async () => {
          const tableName = table.name || table;
          const { data: result, error } = await supabase
            .from(tableName)
            .update(data)
            .select();

          if (error) throw error;
          return result || [];
        }
      })
    })
  }),

  delete: (table: any) => ({
    where: (condition: any) => ({
      returning: async () => {
        const tableName = table.name || table;
        const { data: result, error } = await supabase
          .from(tableName)
          .delete()
          .select();

        if (error) throw error;
        return result || [];
      }
    })
  }),

  execute: async (sql: any) => {
    // Fallback para queries SQL diretas
    console.log('⚠️ SQL direto não suportado, usando Supabase');
    return [];
  }
};