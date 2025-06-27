// src/components/pdf/AgreementTemplate.tsx
import React from 'react';

interface AgreementTemplateProps {
  clientName: string;
  date: string;
}

const AgreementTemplate: React.FC<AgreementTemplateProps> = ({ clientName, date }) => {
  const styles = {
    pageContainer: {
      width: '210mm',
      height: '297mm',
      boxSizing: 'border-box' as 'border-box',
      margin: '0 auto',
      padding: '20mm',
      backgroundColor: '#e8e5df',
      color: '#333333',
      fontFamily: 'sans-serif',
      position: 'relative' as 'relative',
    },
    mainContent: {
      position: 'relative' as 'relative',
      zIndex: 5,
    },
    header: {
      marginTop: '35mm',
      color: '#105652',
      textAlign: 'center' as 'center',
      marginBottom: '15mm',
    },
    h1: {
      fontSize: '30pt',
      fontWeight: 'bold' as 'bold',
      margin: 0,
      letterSpacing: '1px',
    },
    headerP: {
      fontSize: '12pt',
      marginTop: '5px',
      letterSpacing: '2px',
      color: '#1d5a2d',
    },
    hr: {
      border: 'none',
      borderTop: '1px solid #105652',
      margin: '15mm 0',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as 'collapse',
      fontSize: '10pt',
      marginBottom: '15mm',
    },
    td: {
      padding: '8px 0',
    },
    h3: {
      fontSize: '15.18pt',
      color: '#105652',
      borderBottom: '1px solid #ccc',
      paddingBottom: '5px',
      marginBottom: '10mm',
      fontWeight: 'bold' as 'bold',
    },
    p: {
      fontSize: '9pt',
      lineHeight: 1.6,
      color: '#555555',
      textAlign: 'justify' as 'justify',
    },
    pStrong: {
      color: '#105652',
    },
    pointsDiv: {
      marginTop: '10mm',
      fontSize: '9pt',
      color: '#555555',
    },
    pointP: {
      marginTop: '8px',
    },
    contactInfo: {
      position: 'absolute' as 'absolute',
      bottom: '55mm',
      left: '50%',
      transform: 'translateX(-50%)',
      textAlign: 'center' as 'center',
      fontSize: '11pt',
      color: '#555555',
    },
    contactP: {
      margin: '2px 0',
    },
    signatureSection: {
      position: 'absolute' as 'absolute',
      bottom: '20mm',
      left: '25mm',
      right: '25mm',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '10pt',
    },
    signatureBlock: {
      flex: '0 0 45%',
      textAlign: 'center' as 'center',
    },
    signatureFont: {
      fontFamily: 'cursive',
      fontSize: '40pt',
      margin: '0 0 5px 0',
      lineHeight: 1,
    },
    signatureHr: {
      border: 'none',
      borderTop: '1px solid #333',
      width: '80%',
      margin: '0 auto',
    },
    signatureBlockP: {
      marginTop: '5px',
    },
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.mainContent}>
        <header style={styles.header}>
          <h1 style={styles.h1}>RIGHTS OF USE</h1>
          <h1 style={styles.h1}>TRANSFER AGREEMENT</h1>
          <p style={styles.headerP}>FIVERR INSTRUMENTAL REMAKE SERVICE</p>
        </header>
        <hr style={styles.hr} />
        <table style={styles.table}>
          <tbody>
            <tr>
              <td style={styles.td}><strong>Services from</strong></td>
              <td style={styles.td}>@danodals</td>
              <td style={styles.td}><strong>Contact</strong></td>
            </tr>
            <tr>
              <td style={styles.td}><strong>Date</strong></td>
              <td style={styles.td}>{date}</td>
              <td style={styles.td}>danodalbeats@gmail.com</td>
            </tr>
          </tbody>
        </table>
        <h3 style={styles.h3}>Digital Services Contract</h3>
        <p style={styles.p}>
          Rights of Use Transfer Agreement (Fiverr Remake Service @danodals) Sebastián Mestre, with Fiverr username @danodals, agree to transfer all exclusive usage rights of the music(s), instrumental(s), or beat(s) produced to <strong style={styles.pStrong}>@{clientName}</strong> under the following terms:
        </p>
        <div style={styles.pointsDiv}>
          <p style={styles.pointP}><strong>• Purpose:</strong> This agreement aims to transfer the exclusive usage rights of the beat/instrumental created by Sebastián Mestre.</p>
          <p style={styles.pointP}><strong>• Scope of Transfer:</strong> The client acquires full commercial usage rights over the work, including the right to modify, distribute, and sell it without restrictions, while respecting the moral rights of the author.</p>
          <p style={styles.pointP}><strong>• Exclusivity Guarantee:</strong> The beat/instrumental transferred is 100% exclusive to the client, ensuring it will not be resold or distributed to third parties by Sebastián Mestre.</p>
          <p style={styles.pointP}><strong>• Payment and Contract Completion:</strong> Upon full payment of the project on Fiverr, the client receives complete usage rights of the work.</p>
          <p style={styles.pointP}><strong>• Duration:</strong> The transfer of rights is indefinite, with no time or territory restrictions.</p>
        </div>
      </div>
      <div style={styles.contactInfo}>
        <p style={styles.contactP}>fiverr.com/danodals</p>
        <p style={styles.contactP}>(+57) 3223238670</p>
        <p style={styles.contactP}>Bogotá, Colombia</p>
      </div>
      <div style={styles.signatureSection}>
        <div style={styles.signatureBlock}>
          <p style={styles.signatureFont}>Dano</p>
          <hr style={styles.signatureHr} />
          <p style={styles.signatureBlockP}>Danodals Beats</p>
        </div>
        <div style={styles.signatureBlock}>
          <div style={{ width: '150px', height: '50px', margin: '0 auto' }}></div>
          <hr style={styles.signatureHr} />
          <p style={styles.signatureBlockP}>CLIENT'S SIGNATURE</p>
        </div>
      </div>
    </div>
  );
};

export default AgreementTemplate;
