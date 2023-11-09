import { useState, useEffect } from 'react';
import { ProfileData } from '@/lib/types';

export function useProfile(accountId?: string) {
    if (!accountId) return ({ profileData: null, posts: null, isLoading: false });

    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const requestOptions: RequestInit = {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "keys": [`${accountId}/profile/**`],
                }),
            };

            try {
                const response = await fetch("https://api.near.social/get", requestOptions);
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const data = await response.json();
                const formattedData = accountId ? data[accountId].profile : data

                // append accountId to the profile data
                formattedData["accountId"] = accountId;

                setProfileData(formattedData);
            } catch (error: any) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [accountId]);

    return { profileData, isLoading };
}
