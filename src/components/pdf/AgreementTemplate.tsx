// src/components/pdf/AgreementTemplate.tsx
import React from 'react';

interface AgreementTemplateProps {
  clientName: string;
  date: string;
}

export const AgreementTemplate: React.FC<AgreementTemplateProps> = ({ clientName, date }) => {
  return (
    // Contenedor principal con un padding que simula los márgenes de la página.
    // Usamos clases de Tailwind que se traducen a CSS simple.
    <div className="bg-white text-gray-800 p-8" style={{ width: '21cm', fontFamily: "'Poppins', sans-serif" }}>
      
      <header className="text-center mb-12 border-b-2 border-gray-300 pb-6">
        <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "'Montserrat', sans-serif" }}>RIGHTS OF USE</h1>
        <h2 className="text-3xl text-gray-700" style={{ fontFamily: "'Montserrat', sans-serif" }}>TRANSFER AGREEMENT</h2>
        <p className="text-sm text-gray-500 mt-2">FIVERR INSTRUMENTAL REMAKE SERVICE</p>
      </header>

      <main>
        <table className="w-full text-sm mb-10">
          <tbody>
            <tr>
              <td className="py-1 font-bold">Services from:</td>
              <td>@Danodals</td>
              <td className="py-1 font-bold">Contact:</td>
              <td>danodalbeats@gmail.com</td>
            </tr>
            <tr>
              <td className="py-1 font-bold">Date:</td>
              <td>{date}</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-lg font-bold text-gray-900 mb-6">Digital Services Contract</h3>

        <p className="text-sm leading-relaxed text-justify mb-8">
          Rights of Use Transfer Agreement (Fiverr Remake Service @Danodals) Sebastián Mestre, with Fiverr username @Danodals, agree to transfer all exclusive usage rights of the music(s), instrumental(s), or beat(s) produced to <strong className="font-bold">@{clientName}</strong> under the following terms:
        </p>

        <div className="space-y-3 text-sm">
          <p><strong>• Purpose:</strong> This agreement aims to transfer the exclusive usage rights of the beat/instrumental created by Sebastián Mestre.</p>
          <p><strong>• Scope of Transfer:</strong> The client acquires full commercial usage rights over the work, including the right to modify, distribute, and sell it without restrictions, while respecting the moral rights of the author.</p>
          <p><strong>• Exclusivity Guarantee:</strong> The beat/instrumental transferred is 100% exclusive to the client, ensuring it will not be resold or distributed to third parties by Sebastián Mestre.</p>
          <p><strong>• Payment and Contract Completion:</strong> Upon full payment of the project on Fiverr, the client receives complete usage rights of the work.</p>
          <p><strong>• Duration:</strong> The transfer of rights is indefinite, with no time or territory restrictions.</p>
        </div>
      </main>

      <footer className="mt-20 pt-10 text-xs">
        <div className="flex justify-between">
          <div className="text-center w-2/5">
            <p className="text-4xl" style={{ fontFamily: "'Dancing Script', cursive" }}>Dano</p>
            <hr className="mt-1 border-t-2 border-gray-800 w-full" />
            <p className="mt-2 font-bold">Danodals Beats</p>
          </div>
          <div className="text-center w-2/5">
            <div className="h-12"></div> {/* Espacio para la firma */}
            <hr className="mt-1 border-t-2 border-gray-800 w-full" />
            <p className="mt-2 font-bold">CLIENT'S SIGNATURE</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AgreementTemplate;
