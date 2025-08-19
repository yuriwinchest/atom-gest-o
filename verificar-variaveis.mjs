import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis do arquivo específico
config({ path: resolve(process.cwd(), 'backblaze-credentials.env') });

console.log('🔍 Verificando variáveis de ambiente do Backblaze B2...\n');

console.log('📋 Variáveis carregadas:');
console.log('BACKBLAZE_B2_ACCOUNT_ID:', process.env.BACKBLAZE_B2_ACCOUNT_ID || '❌ NÃO CONFIGURADA');
console.log('BACKBLAZE_B2_APPLICATION_KEY_ID:', process.env.BACKBLAZE_B2_APPLICATION_KEY_ID || '❌ NÃO CONFIGURADA');
console.log('BACKBLAZE_B2_APPLICATION_KEY:', process.env.BACKBLAZE_B2_APPLICATION_KEY ? '✅ CONFIGURADA' : '❌ NÃO CONFIGURADA');
console.log('BACKBLAZE_B2_BUCKET_NAME:', process.env.BACKBLAZE_B2_BUCKET_NAME || '❌ NÃO CONFIGURADA');

console.log('\n💡 STATUS:');
if (process.env.BACKBLAZE_B2_ACCOUNT_ID &&
    process.env.BACKBLAZE_B2_APPLICATION_KEY_ID &&
    process.env.BACKBLAZE_B2_APPLICATION_KEY &&
    process.env.BACKBLAZE_B2_BUCKET_NAME) {

    if (process.env.BACKBLAZE_B2_ACCOUNT_ID === 'sua_account_id_aqui') {
        console.log('❌ PROBLEMA: As variáveis ainda contêm valores de exemplo!');
        console.log('🔧 SOLUÇÃO: Edite o arquivo .env.local com suas credenciais reais');
    } else {
        console.log('✅ Todas as variáveis estão configuradas!');
        console.log('🧪 Agora você pode testar com: node testar-backblaze.mjs');
    }
} else {
    console.log('❌ PROBLEMA: Algumas variáveis não estão configuradas!');
    console.log('🔧 SOLUÇÃO: Configure todas as variáveis no arquivo .env.local');
}

console.log('\n📁 Arquivos de ambiente encontrados:');
console.log('- .env.local:', process.env.NODE_ENV === 'production' ? '✅' : '⚠️');
console.log('- .env:', '✅');
console.log('- dotenv configurado:', '✅');
