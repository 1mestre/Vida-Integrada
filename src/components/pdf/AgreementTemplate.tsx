// src/components/pdf/AgreementTemplate.tsx
import React from 'react';

interface AgreementTemplateProps {
  clientName: string;
  date: string;
}

export const AgreementTemplate: React.FC<AgreementTemplateProps> = ({ clientName, date }) => {
  // Importar la fuente para la firma
  const googleFonts = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Eyesome+Script&display=swap" rel="stylesheet">`;

  return (
    <div style={{
      width: '210mm', height: '297mm', position: 'relative', overflow: 'hidden',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      // NUEVO FONDO Y TEXTURA
      backgroundColor: '#ffffff', // Fondo blanco base para el contenido
      backgroundImage: "url('https://www.transparenttextures.com/patterns/black-felt.png')",
    }}>
      <div dangerouslySetInnerHTML={{ __html: googleFonts }} />
      
      {/* Formas Decorativas con CSS (se mantienen igual) */}
      <div style={{ position: 'absolute', top: '-80px', right: '-120px', width: '350px', height: '350px', backgroundColor: '#218838', transform: 'rotate(20deg)', borderRadius: '45%', opacity: 0.9 }}></div>
      <div style={{ position: 'absolute', top: '-90px', right: '-100px', width: '350px', height: '350px', backgroundColor: '#28a745', transform: 'rotate(25deg)', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: '0', height: '100px', overflow: 'hidden' }}>
         <div style={{position: 'absolute', bottom: '-80px', right: '200px', width: '300px', height: '200px', backgroundColor: '#28a745', transform: 'rotate(55deg)'}}></div>
         <div style={{position: 'absolute', bottom: '-60px', right: '-60px', width: '250px', height: '200px', backgroundColor: '#1d5a2d', transform: 'rotate(35deg)'}}></div>
      </div>
      
      {/* Contenido Principal */}
      <div style={{ position: 'relative', zIndex: 2, padding: '25mm', color: '#333' }}>
        {/* NUEVO Logo de Fiverr desde URL específica */}
        <img src="https://worldvectorlogo.com/logo/fiverr-2" alt="Fiverr Logo" style={{ width: '80px', marginBottom: '15mm' }} crossOrigin="anonymous"/>

        <div style={{ color: '#1d5a2d' }}>
          <h1 style={{ fontSize: '32pt', fontWeight: 'bold', margin: 0 }}>RIGHTS OF USE</h1>
          <h1 style={{ fontSize: '32pt', fontWeight: 'bold', margin: 0 }}>TRANSFER AGREEMENT</h1>
          <p style={{ fontSize: '14pt', marginTop: '5px' }}>FIVERR INSTRUMENTAL REMAKE SERVICE</p>
        </div>

        <hr style={{ border: 'none', borderTop: '2px solid #1d5a2d', margin: '15mm 0' }} />

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginBottom: '15mm', color: '#333' }}>
            <thead><tr>
                <th style={{ textAlign: 'left', paddingBottom: '5px', color: '#1d5a2d' }}>Services from</th>
                <th style={{ textAlign: 'left', paddingBottom: '5px', color: '#1d5a2d' }}>Date</th>
                <th style={{ textAlign: 'left', paddingBottom: '5px', color: '#1d5a2d' }}>Contact</th>
            </tr></thead>
            <tbody><tr>
                <td style={{ paddingTop: '5px' }}>@Danodals</td>
                <td style={{ paddingTop: '5px' }}>{date}</td>
                <td style={{ paddingTop: '5px' }}>danodalbeats@gmail.com</td>
            </tr></tbody>
        </table>

        <h3 style={{ fontSize: '12pt', color: '#1d5a2d', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10mm' }}>
            Contrato de servicios digitales
        </h3>

        <p style={{ fontSize: '10pt', lineHeight: '1.6', color: '#555' }}>
          Rights of Use Transfer Agreement (Fiverr Remake Service @Danodals) Sebastián Mestre, with Fiverr username @Danodals, agree to transfer all exclusive usage rights of the music(s), instrumental(s), or beat(s) produced to <strong style={{color: '#218838'}}>@{clientName}</strong> under the following terms:
        </p>

        <div style={{ marginTop: '10mm', fontSize: '10pt', color: '#555' }}>
            <p><strong>• Purpose:</strong> This agreement aims to transfer the exclusive usage rights of the beat/instrumental created by Sebastián Mestre.</p>
            <p style={{marginTop: '8px'}}><strong>• Scope of Transfer:</strong> The client acquires full commercial usage rights over the work, including the right to modify, distribute, and sell it without restrictions, while respecting the moral rights of the author.</p>
            <p style={{marginTop: '8px'}}><strong>• Exclusivity Guarantee:</strong> The beat/instrumental transferred is 100% exclusive to the client, ensuring it will not be resold or distributed to third parties by Sebastián Mestre.</p>
            <p style={{marginTop: '8px'}}><strong>• Payment and Contract Completion:</strong> Upon full payment of the project on Fiverr, the client receives complete usage rights of the work.</p>
            <p style={{marginTop: '8px'}}><strong>• Duration:</strong> The transfer of rights is indefinite, with no time or territory restrictions.</p>
        </div>
        
        {/* Firma y Datos de Contacto */}
        <div style={{ position: 'absolute', bottom: '30mm', left: '25mm', right: '25mm', display: 'flex', justifyContent: 'space-between', fontSize: '10pt' }}>
            <div>
                <p style={{ fontFamily: "'Eyesome Script', cursive", fontSize: '40pt', margin: 0, lineHeight: 1 }}>Dano</p>
                <hr style={{border: 'none', borderTop: '1px solid #333', marginTop: '-10px'}}/>
                <p>Danodals Beats</p>
            </div>
            <div>
                <div style={{width: '150px', height: '50px'}}></div>
                <hr style={{border: 'none', borderTop: '1px solid #333', marginTop: '5px'}}/>
                <p>CLIENT'S SIGNATURE</p>
            </div>
        </div>
      </div>
    </div>
  );
};
