#!/usr/bin/env node
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis do arquivo específico
config({ path: resolve(process.cwd(), 'backblaze-credentials.env') });

console.log('🔧 Configurando variáveis de ambiente do Backblaze B2...\n');

// Verificar se o arquivo existe
import { existsSync } from 'fs';
const envFile = resolve(process.cwd(), 'backblaze-credentials.env');

if (!existsSync(envFile)) {
  console.log('❌ Arquivo backblaze-credentials.env não encontrado!');
  console.log('📁 Crie o arquivo com suas credenciais primeiro.');
  process.exit(1);
}

console.log('✅ Arquivo encontrado:', envFile);
console.log('📋 Variáveis carregadas:');
console.log('BACKBLAZE_B2_ACCOUNT_ID:', process.env.BACKBLAZE_B2_ACCOUNT_ID || '❌ NÃO CONFIGURADA');
console.log('BACKBLAZE_B2_APPLICATION_KEY_ID:', process.env.BACKBLAZE_B2_APPLICATION_KEY_ID || '❌ NÃO CONFIGURADA');
console.log('BACKBLAZE_B2_APPLICATION_KEY:', process.env.BACKBLAZE_B2_APPLICATION_KEY ? '✅ CONFIGURADA' : '❌ NÃO CONFIGURADA');
console.log('BACKBLAZE_B2_BUCKET_NAME:', process.env.BACKBLAZE_B2_BUCKET_NAME || '❌ NÃO CONFIGURADA');

// Configurar process.env para outros scripts
if (process.env.BACKBLAZE_B2_ACCOUNT_ID &&
    process.env.BACKBLAZE_B2_APPLICATION_KEY_ID &&
    process.env.BACKBLAZE_B2_APPLICATION_KEY &&
    process.env.BACKBLAZE_B2_BUCKET_NAME) {

    if (process.env.BACKBLAZE_B2_ACCOUNT_ID === '701ac3f64965') {
        console.log('\n✅ CONFIGURAÇÃO CORRETA!');
        console.log('🎉 Todas as credenciais reais estão configuradas!');
        console.log('🚀 Agora você pode testar com: node testar-backblaze.mjs');
    } else {
        console.log('\n⚠️ Credenciais diferentes das esperadas');
        console.log('🔍 Verifique se são as credenciais corretas');
    }
} else {
    console.log('\n❌ PROBLEMA: Algumas variáveis não estão configuradas!');
    console.log('🔧 SOLUÇÃO: Verifique o arquivo backblaze-credentials.env');
}

// Exportar variáveis para outros scripts
export const BACKBLAZE_B2_ACCOUNT_ID = process.env.BACKBLAZE_B2_ACCOUNT_ID;
export const BACKBLAZE_B2_APPLICATION_KEY_ID = process.env.BACKBLAZE_B2_APPLICATION_KEY_ID;
export const BACKBLAZE_B2_APPLICATION_KEY = process.env.BACKBLAZE_B2_APPLICATION_KEY;
export const BACKBLAZE_B2_BUCKET_NAME = process.env.BACKBLAZE_B2_BUCKET_NAME;
