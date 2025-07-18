import React from 'react';

export function SimpleTestButton() {
  const handleClick = async () => {
    console.log("🔥 INICIANDO TESTE SIMPLES");
    
    try {
      const testData = { name: "TESTE_BOTAO_SIMPLES" };
      console.log("📤 Enviando:", testData);
      
      const response = await fetch('/api/document-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(testData)
      });
      
      console.log("📡 Status:", response.status);
      const text = await response.text();
      console.log("📥 Resposta:", text);
      
      if (response.ok) {
        const data = JSON.parse(text);
        console.log("✅ SUCESSO! ID:", data.id);
        alert(`✅ Criado com sucesso! ID: ${data.id}`);
      } else {
        console.error("❌ ERRO:", text);
        alert(`❌ Erro: ${text}`);
      }
    } catch (error) {
      console.error("💥 ERRO CRÍTICO:", error);
      alert(`💥 Erro: ${error.message}`);
    }
  };
  
  return (
    <button 
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '20px',
        zIndex: 9999,
        padding: '10px 20px',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}
    >
      TESTE CRIAR TIPO
    </button>
  );
}