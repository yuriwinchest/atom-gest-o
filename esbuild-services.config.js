import esbuild from 'esbuild';
import { glob } from 'glob';
import path from 'path';

async function buildServices() {
  try {
    console.log('🔨 Compilando serviços TypeScript...');

    // Encontrar todos os arquivos de serviço
    const serviceFiles = await glob('client/src/services/*.ts');

    console.log(`📁 Encontrados ${serviceFiles.length} arquivos de serviço:`);
    serviceFiles.forEach(file => console.log(`   - ${file}`));

    // Configuração do esbuild
    const buildOptions = {
      entryPoints: serviceFiles,
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outdir: 'dist/services',
      sourcemap: true,
      external: [
        // Dependências externas que não devem ser empacotadas
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
        'wasi'
      ],
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      minify: false, // Manter legível para debug
      keepNames: true,
      logLevel: 'info'
    };

    // Executar build
    const result = await esbuild.build(buildOptions);

    console.log('✅ Serviços compilados com sucesso!');
    console.log(`📦 Arquivos gerados em: dist/services/`);

    return result;

  } catch (error) {
    console.error('❌ Erro ao compilar serviços:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
console.log('🔍 Verificando se deve executar...');
console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);

// Comparar caminhos normalizados
const currentFile = new URL(import.meta.url).pathname.replace(/^\//, '');
const calledFile = process.argv[1].replace(/\\/g, '/');

console.log('currentFile:', currentFile);
console.log('calledFile:', calledFile);

if (currentFile === calledFile || import.meta.url.includes(process.argv[1])) {
  console.log('✅ Executando buildServices...');
  buildServices();
} else {
  console.log('❌ Não executando (não é o arquivo principal)');
}

export { buildServices };
