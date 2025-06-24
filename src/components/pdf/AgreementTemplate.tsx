// src/components/pdf/AgreementTemplate.tsx
import React from 'react';

interface AgreementTemplateProps {
  clientName: string;
  date: string;
}

export const AgreementTemplate: React.FC<AgreementTemplateProps> = ({ clientName, date }) => {
  return (
    <div style={{
      width: '210mm', height: '297mm', position: 'relative', overflow: 'hidden',
      backgroundColor: 'white', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
    }}>
      {/* Shapes Decorativas */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '200px', overflow: 'hidden', zIndex: 1 }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-150px', width: '400px', height: '300px', backgroundColor: '#28a745', transform: 'rotate(20deg)', borderRadius: '30%' }}></div>
        <div style={{ position: 'absolute', top: '-120px', right: '-130px', width: '400px', height: '300px', backgroundColor: '#218838', transform: 'rotate(25deg)', borderRadius: '30%', opacity: 0.8 }}></div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '200px', overflow: 'hidden', zIndex: 1 }}>
        <div style={{ position: 'absolute', bottom: '-100px', left: '-150px', width: '400px', height: '300px', backgroundColor: '#28a745', transform: 'rotate(20deg)', borderRadius: '30%' }}></div>
        <div style={{ position: 'absolute', bottom: '-120px', left: '-130px', width: '400px', height: '300px', backgroundColor: '#218838', transform: 'rotate(25deg)', borderRadius: '30%', opacity: 0.8 }}></div>
      </div>

      {/* Contenido Principal */}
      <div style={{ position: 'relative', zIndex: 2, padding: '25mm' }}>
        <div style={{ marginBottom: '20mm' }}>
            <div style={{ 
                width: '60px', height: '60px', backgroundColor: '#28a745', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '36px', fontWeight: 'bold', fontFamily: 'Arial Black, Gadget, sans-serif'
            }}>
                fi
            </div>
        </div>
        
        <div style={{ color: '#218838' }}>
            <h1 style={{ fontSize: '32pt', fontWeight: 'bold', margin: 0, letterSpacing: '1px' }}>RIGHTS OF USE</h1>
            <h1 style={{ fontSize: '32pt', fontWeight: 'bold', margin: 0, letterSpacing: '1px' }}>TRANSFER AGREEMENT</h1>
            <p style={{ fontSize: '14pt', marginTop: '5px', letterSpacing: '2px' }}>FIVERR INSTRUMENTAL REMAKE SERVICE</p>
        </div>
        
        <hr style={{ border: 'none', borderTop: '2px solid #218838', margin: '15mm 0' }} />

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginBottom: '15mm', color: '#333' }}>
            <thead><tr>
                <th style={{ textAlign: 'left', paddingBottom: '5px', color: '#218838' }}>Services from</th>
                <th style={{ textAlign: 'left', paddingBottom: '5px', color: '#218838' }}>Date</th>
                <th style={{ textAlign: 'left', paddingBottom: '5px', color: '#218838' }}>Contact</th>
            </tr></thead>
            <tbody><tr>
                <td style={{ paddingTop: '5px' }}>@Danodals</td>
                <td style={{ paddingTop: '5px' }}>{date}</td>
                <td style={{ paddingTop: '5px' }}>danodalbeats@gmail.com</td>
            </tr></tbody>
        </table>

        <h3 style={{ fontSize: '12pt', color: '#218838', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10mm' }}>
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
        
        <div style={{ position: 'absolute', bottom: '30mm', left: '25mm', right: '25mm', display: 'flex', justifyContent: 'space-between', fontSize: '10pt' }}>
            <div>
                <div style={{width: '150px', height: '50px'}}></div>
                <hr style={{border: 'none', borderTop: '1px solid #333', marginTop: '5px'}}/>
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
