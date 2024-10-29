import React from 'react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
  description?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  children, 
  onClose, 
  title,
  description 
}) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center modal-background"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-xl p-6 w-[300px] max-w-[90%] text-center modal">
        {title && <h2 className="text-xl font-bold mb-2">{title}</h2>}
        {description && (
          <p className="text-gray-600 mb-4">{description}</p>
        )}
        {children}
        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};














