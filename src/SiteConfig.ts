export interface SiteConfigProps {
    cdnBaseURL: string;
    apiBaseURL: string;
}

const SiteConfig: SiteConfigProps = {
    cdnBaseURL: "/cdn",
    apiBaseURL: "http://localhost:3001"
};

export {SiteConfig};