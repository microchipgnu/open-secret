export type ProfileData = {
    accountId: string;
    name: string;
    description: string;
    linktree: {
        twitter: string;
        github: string;
        telegram: string;
        website: string;
    };
    image: {
        ipfs_cid?: string;
        nft?: {
            contractId: string;
            tokenId: string;
        };
    };
    backgroundImage: {
        ipfs_cid: string;
    };
    tags: {
        [key: string]: string;
    };
}