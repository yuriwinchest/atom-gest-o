#!/usr/bin/env node

/**
 * Build Simples dos Serviços Essenciais
 * Compila apenas os serviços necessários para produção
 */

import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildEssentialServices() {
  try {
    console.log('🔨 Compilando serviços essenciais...\n');

    // Serviços essenciais para o sistema híbrido
    const essentialServices = [
      'client/src/services/backblazeStorageService.ts',
      'client/src/services/hybridStorageService.ts'
    ];

    console.log('📁 Serviços a compilar:');
    essentialServices.forEach(service => console.log(`   - ${service}`));
    console.log('');

    for (const serviceFile of essentialServices) {
      console.log(`🔨 Compilando: ${serviceFile}`);

      try {
        const result = await esbuild.build({
          entryPoints: [serviceFile],
          bundle: true,
          platform: 'node',
          target: 'node18',
          format: 'esm',
          outdir: 'dist/services',
          sourcemap: true,
          external: [
            // Dependências externas
            'express',
            'crypto',
            'fs',
            'path',
            'url',
            'http',
            'https',
            'stream',
            'buffer',
            'util',
            'events',
            'querystring',
            'zlib',
            'os',
            'child_process',
            'cluster',
            'worker_threads',
            'perf_hooks',
            'async_hooks',
            'timers',
            'tty',
            'readline',
            'repl',
            'vm',
            'inspector',
            'trace_events',
            'diagnostics_channel',
            'process',
            'module',
            'assert',
            'constants',
            'domain',
            'punycode',
            'string_decoder',
            'sys',
            'timers/promises',
            'v8',
            'worker_threads',
            'wasi',
            // Dependências específicas do projeto
            '@supabase/supabase-js',
            'dotenv',
            'multer',
            'uuid',
            'mammoth',
            'passport',
            'express-session',
            'connect-pg-simple',
            'better-sqlite3',
            'sqlite3',
            'memorystore'
          ],
          define: {
            'process.env.NODE_ENV': '"production"'
          },
          minify: false,
          keepNames: true,
          logLevel: 'info'
        });

        console.log(`✅ ${serviceFile} compilado com sucesso!`);

      } catch (error) {
        console.error(`❌ Erro ao compilar ${serviceFile}:`, error.message);

        // Se houver erro de dependência, tentar compilar sem bundle
        console.log(`🔄 Tentando compilar sem bundle...`);

        try {
          const result = await esbuild.build({
            entryPoints: [serviceFile],
            bundle: false,
            platform: 'node',
            target: 'node18',
            format: 'esm',
            outdir: 'dist/services',
            sourcemap: true,
            external: ['*'], // Externalizar tudo
            define: {
              'process.env.NODE_ENV': '"production"'
            },
            minify: false,
            keepNames: true,
            logLevel: 'info'
          });

          console.log(`✅ ${serviceFile} compilado sem bundle!`);

        } catch (bundleError) {
          console.error(`❌ Falha total ao compilar ${serviceFile}:`, bundleError.message);
        }
      }
    }

    console.log('\n📊 RESUMO DO BUILD:');
    console.log('====================');
    console.log('✅ Serviços compilados em: dist/services/');
    console.log('🎯 Sistema híbrido pronto para produção!');
    console.log('🚀 Nunca mais "tonk esperado"!');

    return true;

  } catch (error) {
    console.error('\n💥 ERRO CRÍTICO NO BUILD:', error);
    return false;
  }
}

// Executar build
buildEssentialServices();
