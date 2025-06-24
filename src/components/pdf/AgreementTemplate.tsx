// src/components/pdf/AgreementTemplate.tsx
import React from 'react';
// Importamos el string Base64 desde nuestro archivo de datos
import { base64ContractBackground } from '@/lib/contractData';

interface AgreementTemplateProps {
  clientName: string;
  date: string;
}

export const AgreementTemplate: React.FC<AgreementTemplateProps> = ({ clientName, date }) => {
  return (
    <div style={{
      width: '210mm', height: '297mm', position: 'relative',
      backgroundImage: `url(${base64ContractBackground})`, // Usa la variable importada
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    }}>
      {/* Contenedor invisible para los textos dinámicos */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        
        {/* Fecha Dinámica */}
        <div style={{
          position: 'absolute',
          top: '84mm',      // Ajusta esta distancia desde arriba
          left: '70mm',     // Ajusta esta distancia desde la izquierda
          fontSize: '10pt',
          color: '#333',
        }}>
          {date}
        </div>

        {/* Párrafo Dinámico */}
        <div style={{
          position: 'absolute',
          top: '107mm',      // Ajusta esta distancia desde arriba
          left: '25mm',      // Margen izquierdo
          right: '25mm',     // Margen derecho
          fontSize: '10pt',
          lineHeight: '1.6',
          color: '#555',
        }}>
          Rights of Use Transfer Agreement (Fiverr Remake Service @Danodals) Sebastián Mestre, with Fiverr username @Danodals, agree to transfer all exclusive usage rights of the music(s), instrumental(s), or beat(s) produced to <strong style={{color: '#218838'}}>@{clientName}</strong> under the following terms:
        </div>

      </div>
    </div>
  );
};
