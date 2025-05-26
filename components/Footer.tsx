
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Gestor Financeiro Pessoal. Todos os direitos reservados.</p>
        <p className="text-xs mt-1 text-gray-400">Desenvolvido com React, Tailwind CSS & TypeScript</p>
      </div>
    </footer>
  );
};

export default Footer;
