// src/components/pdf/AgreementTemplate.tsx
import React from 'react';

interface AgreementTemplateProps {
  clientName: string;
  date: string;
}

export const AgreementTemplate: React.FC<AgreementTemplateProps> = ({ clientName, date }) => {
  return (
    // Estructura JSX que replica tu HTML original
    // Contenedor principal sin ancho fijo para que se ajuste a los márgenes del PDF
    <div className="bg-white text-[#333] p-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Poppins:ital,wght@0,400;0,700;1,400&family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet" />
      
        {/* Contenido principal del contrato */}
        <header>
            <h1 className="text-5xl font-bold m-0 text-purple-700" style={{ fontFamily: "'Montserrat', sans-serif" }}>RIGHTS OF USE</h1>
            <h2 className="text-4xl m-0 text-purple-500" style={{ fontFamily: "'Montserrat', sans-serif" }}>TRANSFER AGREEMENT</h2>
            <p className="text-sm text-gray-600 mt-2">FIVERR INSTRUMENTAL REMAKE SERVICE</p>
        </header>

        <main>
            <table className="w-full border-collapse text-sm mb-12">
                <tbody>
                  <tr>
                    <td className="py-2 pr-4 border-b border-gray-200 font-bold">Services from</td>
                    <td className="py-2 pl-4 border-b border-gray-200 text-right">@Danodals</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 border-b border-gray-200 font-bold">Date</td>
                    <td className="py-2 pl-4 border-b border-gray-200 text-right">{date}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-bold">Contact</td>
                    <td className="py-2 pl-4 text-right">danodalbeats@gmail.com</td>
                  </tr>
                </tbody>
            </table>

            <h3 className="text-lg font-bold text-[#333] border-b-2 border-purple-600 pb-2 mb-8">
                Digital Services Contract
            </h3>

            <p className="text-sm leading-relaxed text-gray-700 text-justify mb-8">
                Rights of Use Transfer Agreement (Fiverr Remake Service @Danodals) Sebastián Mestre, with Fiverr username @Danodals, agree to transfer all exclusive usage rights of the music(s), instrumental(s), or beat(s) produced to <strong className="font-bold text-purple-800">@{clientName}</strong> under the following terms:
            </p>

            <div className="space-y-4 text-sm text-gray-700">
                <div>
                    <h4 className="font-bold text-purple-700">• Purpose:</h4>
                    <p>This agreement aims to transfer the exclusive usage rights of the beat/instrumental created by Sebastián Mestre.</p>
                </div>
                <div>
                    <h4 className="font-bold text-purple-700">• Scope of Transfer:</h4>
                    <p>The client acquires full commercial usage rights over the work, including the right to modify, distribute, and sell it without restrictions.</p>
                </div>
                {/* ... El resto de los puntos del contrato ... */}
            </div>
        </main>
        
        <footer className="text-center text-xs text-gray-500 mt-24 pt-4">
            {/* CORRECCIÓN DE LA FIRMA APLICADA AQUÍ */}
            <div className="flex justify-between items-end">
                <div className="text-center w-[45%]">
                    <p className="leading-none" style={{ fontFamily: "'Dancing Script', cursive", fontSize: '40pt', marginBottom: '5px' }}>Dano</p>
                    <hr className="border-t-[1px] border-b-0 border-[#333] w-4/5 mx-auto" />
                    <p className="mt-1">Danodals Beats</p>
                </div>
                <div className="text-center w-[45%]">
                    <div className="w-[150px] h-[50px] mx-auto"></div>
                    <hr className="border-t-[1px] border-b-0 border-[#333] w-4/5 mx-auto" />
                    <p className="mt-1">CLIENT'S SIGNATURE</p>
                </div>
            </div>
        </footer>
    </div>
  );
};

