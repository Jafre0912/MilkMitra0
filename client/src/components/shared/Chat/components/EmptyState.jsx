/* eslint-disable react/prop-types */
// src/components/chat/components/EmptyState.jsx
import { MessageCircle } from 'lucide-react';

const EmptyState = ({ title, description }) => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <MessageCircle size={60} className="mx-auto text-gray-300" />
        <h3 className="mt-4 text-xl font-medium text-gray-700">{title}</h3>
        <p className="mt-2 text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default EmptyState;

