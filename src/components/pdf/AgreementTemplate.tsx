
// src/components/pdf/AgreementTemplate.tsx
import React from 'react';

// Define the properties that this contract template component will accept.
interface AgreementTemplateProps {
  clientName: string; // The client's name for the contract
  date: string;       // The date the contract is generated
}

// The main functional component for the contract template.
export const AgreementTemplate: React.FC<AgreementTemplateProps> = ({ clientName, date }) => {
  return (
    <div className="pdf-page-container">
      {/* The main content wrapper provides padding for the signature/footer area. */}
      <div className="main-content-wrapper">
        <header>
          {/* Header titles with inline styles for precise control */}
          <h1 style={{fontSize: '30pt', fontWeight: 'bold', margin: '0', letterSpacing: '1px'}}>RIGHTS OF USE</h1>
          <h1 style={{fontSize: '30pt', fontWeight: 'bold', margin: '0', letterSpacing: '1px'}}>TRANSFER AGREEMENT</h1>
          <p style={{fontSize: '12pt', marginTop: '5px', letterSpacing: '2px', color: '#1d5a2d'}}>FIVERR INSTRUMENTAL REMAKE SERVICE</p>
        </header>

        {/* Divider line */}
        <hr style={{border: 'none', borderTop: '1px solid #105652', margin: '15mm 0'}} />

        {/* Table for service and contact information */}
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginBottom: '15mm'}}>
          <tbody>
            <tr>
              <td style={{padding: '8px 0'}}><strong>Services from</strong></td>
              <td style={{padding: '8px 0'}}>@Danodals</td>
              <td style={{padding: '8px 0'}}><strong>Contact</strong></td>
            </tr>
            <tr>
              <td style={{padding: '8px 0'}}><strong>Date</strong></td>
              <td style={{padding: '8px 0'}}>{date}</td> {/* The date is dynamically inserted */}
              <td style={{padding: '8px 0'}}>danodalbeats@gmail.com</td>
            </tr>
          </tbody>
        </table>

        {/* Contract section title */}
        <h3 style={{fontSize: '13.2pt', color: '#105652', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10mm', fontWeight: 'bold'}}>
          Digital Services Contract
        </h3>

        {/* Introductory paragraph of the contract */}
        <p style={{fontSize: '9pt', lineHeight: 1.6, color: '#555555', textAlign: 'justify'}}>
          Rights of Use Transfer Agreement (Fiverr Remake Service @Danodals) Sebastián Mestre, with Fiverr username @Danodals, agree to transfer all exclusive usage rights of the music(s), instrumental(s), or beat(s) produced to <strong style={{color: '#105652'}}>@{clientName}</strong> under the following terms:
        </p>

        {/* List of contract terms */}
        <div style={{marginTop: '10mm', fontSize: '9pt', color: '#555555'}}>
            <p style={{marginTop: '8px'}}><strong>• Purpose:</strong> This agreement aims to transfer the exclusive usage rights of the beat/instrumental created by Sebastián Mestre.</p>
            <p style={{marginTop: '8px'}}><strong>• Scope of Transfer:</strong> The client acquires full commercial usage rights over the work, including the right to modify, distribute, and sell it without restrictions, while respecting the moral rights of the author.</p>
            <p style={{marginTop: '8px'}}><strong>• Exclusivity Guarantee:</strong> The beat/instrumental transferred is 100% exclusive to the client, ensuring it will not be resold or distributed to third parties by Sebastián Mestre.</p>
            <p style={{marginTop: '8px'}}><strong>• Payment and Contract Completion:</strong> Upon full payment of the project on Fiverr, the client receives complete usage rights of the work.</p>
            <p style={{marginTop: '8px'}}><strong>• Duration:</strong> The transfer of rights is indefinite, with no time or territory restrictions.</p>
        </div>
      </div>

      {/* Decorative SVG graphics in the corners */}
      <div className="svg-graphics-corner top-left-graphics">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 C 100 0, 200 100, 200 200 L 0 200 Z" fill="#1d5a2d" opacity="0.4"/>
          <path d="M0 0 C 80 0, 160 80, 160 160 L 0 160 Z" fill="#105652" opacity="0.4"/>
          <path d="M0 0 C 60 0, 120 60, 120 120 L 0 120 Z" fill="#588157" opacity="0.4"/>
        </svg>
      </div>
      <div className="svg-graphics-corner bottom-left-graphics">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 C 100 0, 200 100, 200 200 L 0 200 Z" fill="#1d5a2d" opacity="0.4"/>
          <path d="M0 0 C 80 0, 160 80, 160 160 L 0 160 Z" fill="#105652" opacity="0.4"/>
          <path d="M0 0 C 60 0, 120 60, 120 120 L 0 120 Z" fill="#588157" opacity="0.4"/>
        </svg>
      </div>
      <div className="svg-graphics-corner bottom-right-graphics">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 C 100 0, 200 100, 200 200 L 0 200 Z" fill="#1d5a2d" opacity="0.4"/>
          <path d="M0 0 C 80 0, 160 80, 160 160 L 0 160 Z" fill="#105652" opacity="0.4"/>
          <path d="M0 0 C 60 0, 120 60, 120 120 L 0 120 Z" fill="#588157" opacity="0.4"/>
        </svg>
      </div>
      
      {/* Contact information in the footer */}
      <div className="contact-info">
        <p>fiverr.com</p>
        <p>(+57) 3223238670</p>
        <p>Bogotá, Colombia</p>
      </div>

      {/* Signature section */}
      <div className="signature-section">
        <div className="signature-block">
          <p className="signature-font" style={{fontSize: '40pt', margin: '0 0 5px 0', lineHeight: 1}}>Dano</p>
          <hr />
          <p style={{marginTop: '5px'}}>Danodals Beats</p>
        </div>
        <div className="signature-block">
          <div style={{width: '150px', height: '50px', margin: '0 auto'}}></div>
          <hr />
          <p style={{marginTop: '5px'}}>CLIENT'S SIGNATURE</p>
        </div>
      </div>
    </div>
  );
};
