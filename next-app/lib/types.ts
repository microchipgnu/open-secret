interface Profile {
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
        ipfs_cid: string;
    };
    backgroundImage: {
        ipfs_cid: string;
    };
    tags: {
        [key: string]: string;
    };
}