import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string[];
    canonical?: string;
}

export const SEO = ({
    title = 'Typing Test | Check Your WPM & Practice Typing | Typer.world',
    description = 'Improve your typing speed with our fast, aesthetic, and distraction-free typing test. Track your WPM, accuracy, and detailed statistics. Practice coding, quotes, and literature.',
    keywords = [],
    canonical = 'https://typer.world/'
}: SEOProps) => {
    const siteTitle = 'Typer.world';
    const fullTitle = title === siteTitle ? siteTitle : `${title}`;

    // Aggressive keyword list for "Grey Hat" strategy
    const defaultKeywords = [
        'typing test', 'wpm test', 'typing speed test', 'fast typing',
        'typing practice', 'learn to type', 'touch typing',
        'coding typing test', 'programmer typing test',
        'aesthetic typing test', 'minimal typing test',
        'typing games', 'keyboard test', 'typing competition'
    ];

    const allKeywords = [...new Set([...defaultKeywords, ...keywords])].join(', ');

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={allKeywords} />
            <link rel="canonical" href={canonical} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonical} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:site_name" content={siteTitle} />
            {/* <meta property="og:image" content="https://typer.world/og-image.jpg" /> */}

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonical} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            {/* <meta property="twitter:image" content="https://typer.world/og-image.jpg" /> */}

            {/* <meta property="twitter:image" content="https://typer.world/og-image.jpg" /> */}
        </Helmet>
    );
};
