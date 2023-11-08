import { useState, useEffect } from 'react';

export function useProfile({ accountId }: { accountId: string }) {
    const [profileData, setProfileData] = useState(null); // Changed from posts to profileData
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const requestOptions: RequestInit = {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "keys": [`${accountId}/profile/**`],
                })
            };

            try {
                const response = await fetch("https://api.near.social/get", requestOptions);
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const data = await response.json();
                setProfileData(data[accountId].profile); // Changed from setPosts to setProfileData
            } catch (error: any) {
                setError(error?.message || "Something went wrong");
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [accountId]);

    return { profileData, isLoading, error }; // Changed from posts to profileData
};
