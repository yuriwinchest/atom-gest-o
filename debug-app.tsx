import { createRoot } from "react-dom/client";

// Teste básico do React
function DebugApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🔍 Debug React App</h1>
      <p>Se você vê este texto, o React está funcionando!</p>
      <div>
        <h2>Testes:</h2>
        <div>✅ React básico funcionando</div>
        <div>✅ DOM renderizando</div>
        <div>✅ JavaScript executando</div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<DebugApp />);