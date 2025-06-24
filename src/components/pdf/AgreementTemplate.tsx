// Ruta del archivo: src/components/pdf/AgreementTemplate.tsx
import React from 'react';

// Estas son las "variables" que nuestro componente recibirá: el nombre del cliente y la fecha.
interface AgreementTemplateProps {
  clientName: string;
  date: string;
}

// Aquí definimos el componente
export const AgreementTemplate: React.FC<AgreementTemplateProps> = ({ clientName, date }) => {
  return (
    // 1. El DIV principal y contenedor de todo.
    <div style={{
      width: '210mm', // Tamaño de una hoja A4
      height: '297mm',
      position: 'relative', // Muy importante para posicionar los textos encima
      
      // 2. Aquí le decimos que use tu imagen como fondo
      backgroundImage: `url('/contract-background.png')`, // Next.js busca esto en la carpeta /public
      backgroundSize: '100% 100%', // Estira la imagen para que cubra todo el div
      backgroundRepeat: 'no-repeat',
      
      // 3. Definimos una fuente por defecto para el texto que pondremos encima
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    }}>

      {/* 
        AQUÍ DENTRO PONDREMOS LOS TEXTOS DINÁMICOS.
        Por ahora, está vacío, pero ya tienes la base.
      */}

    </div>
  );
};
