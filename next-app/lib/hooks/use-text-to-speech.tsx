'use client'

import { useState, useEffect } from "react";

export function useTextToSpeech() {
    const [audioElement, setAudioElement] = useState(new Audio());
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const toggleAudio = async (text: string, voiceId = 'alloy') => {
        // If audio is already playing, stop and reset it
        if (isPlaying) {
            audioElement.pause();
            audioElement.currentTime = 0;
            setIsPlaying(false);
            return;
        }

        setIsLoading(true); // Set loading state to true when fetch begins

        // Fetch the audio file if it's not currently playing
        try {
            const response = await fetch('/api/text-to-speech', {
                method: 'POST',
                headers: {
                    'accept': "audio/mpeg",
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, voiceId })
            });

            if (!response.ok) {
                throw new Error('Error fetching audio');
            }

            const audioURL = URL.createObjectURL(await response.blob());
            audioElement.src = audioURL;

            // Revoke the object URL once the audio has ended to release memory
            audioElement.onended = () => {
                URL.revokeObjectURL(audioURL);
                setIsPlaying(false);
            };

            // Start playing the new audio file
            await audioElement.play();
            setIsPlaying(true);
        } catch (error) {
            console.error("Error generating or playing audio:", error);
            // Handle error appropriately here
        } finally {
            setIsLoading(false); // Set loading state to false when fetch is complete
        }
    };

    // Cleanup effect for when the component using this hook unmounts
    useEffect(() => {
        return () => {
            if (audioElement) {
                audioElement.pause(); // Pause any ongoing playback
                audioElement.src = ''; // Reset the audio source to prevent memory leaks
            }
        };
    }, [audioElement]);

    return { isPlaying, isLoading, toggleAudio };
}
