import React from 'react';

// Define las propiedades que este componente de plantilla de contrato aceptará.
interface AgreementTemplateProps {
  clientName: string; // Nombre del cliente para el contrato
  date: string;       // Fecha en que se genera el contrato
}

// El componente funcional principal para la plantilla del contrato.
export const AgreementTemplate: React.FC<AgreementTemplateProps> = ({ clientName, date }) => {
  // Tu diseño HTML completo, listo para ser renderizado.
  // En React, no se debe retornar directamente <html>, <head> o <body>.
  // Estos deben ser manejados por el archivo HTML principal (index.html) de tu aplicación.
  // Los estilos y enlaces a fuentes se aplican globalmente o dentro del componente principal.
  return (
    <>
      {/* Carga las fuentes de Google Fonts. */}
      {/* Nota: En una aplicación React real, estos <link> tags irían en el index.html principal */}
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Poppins:ital,wght@0,400;0,700;1,400&family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet" />
      <style>
        {`
          /* Estilos globales y para el contenedor principal, ajustados para React */
          body { /* Estos estilos de body solo afectarán si se aplican a un elemento contenedor */
            /* En un entorno React, estos estilos de 'body' se aplicarían mejor a un div raíz
               o al body del HTML principal. Aquí los mantenemos dentro del <style> tag. */
            margin: 0;
            padding: 0;
            background-color: #f4f4f4; /* Un color de fondo suave para la página completa */
            display: flex;
            justify-content: center;
            align-items: flex-start; /* Alinea al principio para que el contenido no se centre verticalmente si es más corto */
            min-height: 100vh; /* Asegura que el cuerpo ocupe al menos la altura de la ventana */
            font-family: 'Poppins', sans-serif; /* Fuente principal por defecto */
          }
          .pdf-page-container {
            width: 210mm; /* Ancho estándar de una hoja A4 */
            min-height: 297mm; /* Altura estándar de una hoja A4 */
            position: relative;
            background-color: #e8e5df;
            background-image: url("https://www.transparenttextures.com/patterns/light-paper-fibers.png");
            font-family: 'Poppins', sans-serif; /* Fuente principal para el contenido */
            padding: 20mm;
            box-sizing: border-box;
            color: #333333;
            margin: 20px auto; /* Centra el contenedor y añade un poco de margen superior/inferior */
            display: block; /* Asegura que sea un bloque para el margin: auto */
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Sombra sutil para simular una hoja de papel */
          }
          .main-content-wrapper { padding-bottom: 70mm; position: relative; z-index: 5; }
          .signature-font { font-family: 'Dancing Script', cursive; }
          .fiverr-logo { position: absolute; top: 20mm; right: 20mm; width: 180px; height: auto; z-index: 10;
            filter: invert(40%) sepia(90%) saturate(1000%) hue-rotate(80deg) brightness(30%) contrast(100%);
          }
          .svg-graphics-corner { position: absolute; width: 200px; height: 200px; overflow: hidden; z-index: 0; }
          .top-left-graphics { top: 0; left: 0; transform: scaleY(-1); }
          .bottom-left-graphics { bottom: 0; left: 0; }
          .bottom-right-graphics { bottom: 0; right: 0; transform: scaleX(-1); }
          header { margin-top: 45mm; color: #105652; font-family: 'Montserrat', sans-serif; text-align: center; margin-bottom: 15mm; }
          header h1 { font-size: 30pt; font-weight: bold; margin: 0; letter-spacing: 1px; }
          header p { font-size: 12pt; margin-top: 5px; letter-spacing: 2px; color: #1d5a2d; }
          .main-divider { border: none; border-top: 1px solid #105652; margin: 15mm 0; }
          table { width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 15mm; }
          table td { padding: 8px 0; }
          .section-title { font-size: 13.2pt; color: #105652; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10mm; font-weight: bold; }
          .contract-intro { font-size: 9pt; line-height: 1.6; color: #555555; text-align: justify; }
          .contract-intro strong { color: #105652; }
          .terms-list p { margin-top: 8px; font-size: 9pt; color: #555555; }
          .contact-info { position: absolute; bottom: 55mm; left: 50%; transform: translateX(-50%); text-align: center; font-family: 'Poppins', sans-serif; font-size: 11pt; color: #555555; width: fit-content; z-index: 5; }
          .contact-info p { margin: 2px 0; }
          .signature-section { position: absolute; bottom: 20mm; left: 25mm; right: 25mm; display: flex; justify-content: space-between; font-size: 10pt; z-index: 5; }
          .signature-block { flex: 0 0 45%; text-align: center; }
          .signature-block hr { border: none; border-top: 1px solid #333; width: 80%; margin: 5px auto 0 auto; }
          .signature-block .signature-font { font-size: 40pt; margin: 0; line-height: 1; }
          .signature-block div { width: 150px; height: 50px; margin: 0 auto; }
        `}
      </style>

      {/* Contenedor principal para simular la página PDF */}
      <div className="pdf-page-container">
        <div className="svg-graphics-corner top-left-graphics"><svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 C 100 0, 200 100, 200 200 L 0 200 Z" fill="#1d5a2d" opacity="0.4"/><path d="M0 0 C 80 0, 160 80, 160 160 L 0 160 Z" fill="#105652" opacity="0.4"/><path d="M0 0 C 60 0, 120 60, 120 120 L 0 120 Z" fill="#588157" opacity="0.4"/></svg></div>
        <div className="svg-graphics-corner bottom-left-graphics"><svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 C 100 0, 200 100, 200 200 L 0 200 Z" fill="#1d5a2d" opacity="0.4"/><path d="M0 0 C 80 0, 160 80, 160 160 L 0 160 Z" fill="#105652" opacity="0.4"/><path d="M0 0 C 60 0, 120 60, 120 120 L 0 120 Z" fill="#588157" opacity="0.4"/></svg></div>
        <div className="svg-graphics-corner bottom-right-graphics"><svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 C 100 0, 200 100, 200 200 L 0 200 Z" fill="#1d5a2d" opacity="0.4"/><path d="M0 0 C 80 0, 160 80, 160 160 L 0 160 Z" fill="#105652" opacity="0.4"/><path d="M0 0 C 60 0, 120 60, 120 120 L 0 120 Z" fill="#588157" opacity="0.4"/></svg></div>
        <img src="https://cdn.worldvectorlogo.com/logos/fiverr-2.svg" alt="Fiverr Logo" className="fiverr-logo" />
        <div className="main-content-wrapper">
          <header>
            <h1 style={{fontSize: '30pt', fontWeight: 'bold', margin: '0', letterSpacing: '1px'}}>RIGHTS OF USE</h1>
            <h1 style={{fontSize: '30pt', fontWeight: 'bold', margin: '0', letterSpacing: '1px'}}>TRANSFER AGREEMENT</h1>
            <p style={{fontSize: '12pt', marginTop: '5px', letterSpacing: '2px', color: '#1d5a2d'}}>FIVERR INSTRUMENTAL REMAKE SERVICE</p>
          </header>
          <hr className="main-divider" /> {/* Se añadió la clase para usar el estilo definido */}
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginBottom: '15mm'}}><tbody><tr><td style={{padding: '8px 0'}}><strong>Services from</strong></td><td style={{padding: '8px 0'}}>@Danodals</td><td style={{padding: '8px 0'}}><strong>Contact</strong></td></tr><tr><td style={{padding: '8px 0'}}><strong>Date</strong></td><td style={{padding: '8px 0'}}>{date}</td><td style={{padding: '8px 0'}}>danodalbeats@gmail.com</td></tr></tbody></table>
          <h3 className="section-title">Digital Services Contract</h3> {/* Se añadió la clase para usar el estilo definido */}
          <p className="contract-intro">Rights of Use Transfer Agreement (Fiverr Remake Service @Danodals) Sebastián Mestre, with Fiverr username @Danodals, agree to transfer all exclusive usage rights of the music(s), instrumental(s), or beat(s) produced to <strong style={{color: '#105652'}}>@{clientName}</strong> under the following terms:</p>
          <div className="terms-list" style={{marginTop: '10mm', fontSize: '9pt', color: '#555555'}}><p style={{marginTop: '8px'}}><strong>• Purpose:</strong> This agreement aims to transfer the exclusive usage rights of the beat/instrumental created by Sebastián Mestre.</p><p style={{marginTop: '8px'}}><strong>• Scope of Transfer:</strong> The client acquires full commercial usage rights over the work, including the right to modify, distribute, and sell it without restrictions, while respecting the moral rights of the author (remove this if you prefer).</p><p style={{marginTop: '8px'}}><strong>• Exclusivity Guarantee:</strong> The beat/instrumental transferred is 100% exclusive to the client, ensuring it will not be resold or distributed to third parties by Sebastián Mestre.</p><p style={{marginTop: '8px'}}><strong>• Payment and Contract Completion:</strong> Upon full payment of the project on Fiverr, the client receives complete usage rights of the work.</p><p style={{marginTop: '8px'}}><strong>• Duration:</strong> The transfer of rights is indefinite, with no time or territory restrictions.</p></div>
        </div>
        <div className="contact-info"><p>fiverr.com</p><p>(+57) 3223238670</p><p>Bogotá, Colombia</p></div>
        <div className="signature-section"><div className="signature-block"><p className="signature-font">Dano</p><hr className="signature-hr" /><p style={{marginTop: '5px'}}>Danodals Beats</p></div><div className="signature-block"><div style={{width: '150px', height: '50px', margin: '0 auto'}}></div><hr className="signature-hr" /><p style={{marginTop: '5px'}}>CLIENT'S SIGNATURE</p></div></div>
      </div>
    </>
  );
};

// Componente principal que se exporta por defecto, requerido para el entorno de ejecución.
export default function App() {
  const exampleClientName = "JohnDoeClient"; // Nombre de cliente de ejemplo
  const exampleDate = "24 de Junio de 2025"; // Fecha de ejemplo

  return (
    <AgreementTemplate clientName={exampleClientName} date={exampleDate} />
  );
}
