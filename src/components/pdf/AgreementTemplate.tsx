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
      backgroundColor: '#ffffff',
      padding: '25mm',
      boxSizing: 'border-box'
    }}>
      <div dangerouslySetInnerHTML={{ __html: googleFonts }} />

      {/* Logo de Fiverr desde URL externa */}
      <img src="https://worldvectorlogo.com/logo/fiverr-2" alt="Fiverr Logo" style={{ width: '80px', marginBottom: '20mm' }} crossOrigin="anonymous"/>

      <div style={{ color: '#1d5a2d', textAlign: 'center', marginBottom: '15mm' }}>
        <h1 style={{ fontSize: '32pt', fontWeight: 'bold', margin: 0 }}>RIGHTS OF USE</h1>
        <h1 style={{ fontSize: '32pt', fontWeight: 'bold', margin: 0 }}>TRANSFER AGREEMENT</h1>
        <p style={{ fontSize: '14pt', marginTop: '5px' }}>FIVERR INSTRUMENTAL REMAKE SERVICE</p>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginBottom: '15mm' }}>
        <tbody>
          <tr>
            <td style={{padding: '8px 0', borderBottom: '1px solid #eee'}}><strong>Services from</strong></td>
            <td style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>@Danodals</td>
          </tr>
          <tr>
            <td style={{padding: '8px 0', borderBottom: '1px solid #eee'}}><strong>Date</strong></td>
            <td style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>{date}</td>
          </tr>
          <tr>
            <td style={{padding: '8px 0'}}><strong>Contact</strong></td>
            <td style={{padding: '8px 0'}}>danodalbeats@gmail.com</td>
          </tr>
        </tbody>
      </table>
      
      <h3 style={{ fontSize: '12pt', color: '#1d5a2d', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10mm' }}>
        Digital Services Contract
      </h3>

      <p style={{ fontSize: '10pt', lineHeight: '1.6', color: '#555' }}>
        Rights of Use Transfer Agreement (Fiverr Remake Service @Danodals) Sebastián Mestre, with Fiverr username @Danodals, agree to transfer all exclusive usage rights of the music(s), instrumental(s), or beat(s) produced to <strong style={{color: '#1d5a2d'}}>@{clientName}</strong> under the following terms:
      </p>

      <div style={{ fontSize: '10pt', lineHeight: '1.6', color: '#555' }}>
          <p>• Purpose: This agreement aims to transfer the exclusive usage rights of the beat/instrumental created by Sebastián Mestre.</p>
          <p>• Scope of Transfer: The client acquires full commercial usage rights over the work, including the right to modify, distribute, and sell it without restrictions, while respecting the moral rights of the author.</p>
          <p>• Exclusivity Guarantee: The beat/instrumental transferred is 100% exclusive to the client, ensuring it will not be resold or distributed to third parties by Sebastián Mestre.</p>
          <p>• Payment and Contract Completion: Upon full payment of the project on Fiverr, the client receives complete usage rights of the work.</p>
          <p>• Duration: The transfer of rights is indefinite, with no time or territory restrictions.</p>
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
  );
};
