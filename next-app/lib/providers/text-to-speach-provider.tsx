"use client"

import { createContext, useContext } from 'react';
import { useTextToSpeach } from '../hooks/use-text-to-speach';

// Create the context
const TextToSpeachContext = createContext(
    {} as ReturnType<typeof useTextToSpeach>
);

// Create a provider component
export const TextToSpeachProvider = ({ children }: { children: React.ReactNode }) => {
    const textToSpeachContext = useTextToSpeach()

    return <TextToSpeachContext.Provider value={textToSpeachContext}>{children}</TextToSpeachContext.Provider>;
};

// Export the context
export const useTextToSpeachContext = () => useContext(TextToSpeachContext);