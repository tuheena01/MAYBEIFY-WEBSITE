'use client';

import { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [isSubmitModalOpen, setSubmitModalOpen] = useState(false);

  return (
    <ModalContext.Provider value={{ isSubmitModalOpen, setSubmitModalOpen }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
