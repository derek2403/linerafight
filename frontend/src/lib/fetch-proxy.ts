
const PROXY_MAP: Record<string, string> = {
    'https://linera.pops.one': '/rpc/pops',
    'https://15.204.31.226.sslip.io': '/rpc/sslip',
    'https://linera-testnet.senseinode.com': '/rpc/sensei',
    'https://linera.blockscope.net': '/rpc/blockscope',
    'https://linera.everstake.one': '/rpc/everstake',
    'https://linera-testnet.stakefi.network': '/rpc/stakefi',
    'https://linera-testnet.chainbase.online': '/rpc/chainbase',
    'https://linera-testnet.runtime-client-rpc.com': '/rpc/runtime',
    'https://linera-testnet-validator.contributiondao.com': '/rpc/contributiondao',
    'https://linera.unitynodes.com': '/rpc/unitynodes',
    'https://tn.linera.stakingcabin.com': '/rpc/stakingcabin',
    'https://tnlinera.azurenode.xyz': '/rpc/azurenode',
    'https://linera-test.artifact.systems': '/rpc/artifact',
};

// Also handle dynamic ports if needed, but usually Linera standardizes on 443 for HTTPS.
// Some URLs in logs had :443 explicitly.

const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    let urlString: string;

    if (typeof input === 'string') {
        urlString = input;
    } else if (input instanceof URL) {
        urlString = input.toString();
    } else {
        urlString = input.url;
    }

    // Check if the URL matches any of our proxy targets
    for (const [targetOrigin, proxyPath] of Object.entries(PROXY_MAP)) {
        // We normalize the check by creating URL objects to correctly handle ports and protocols
        try {
            const requestUrl = new URL(urlString);
            const targetUrl = new URL(targetOrigin);

            // Match protocol and hostname. ignore port if it's default 443 for https
            const sameProtocol = requestUrl.protocol === targetUrl.protocol;
            const sameHostname = requestUrl.hostname === targetUrl.hostname;
            // Check if target has explicit port, otherwise match request port (maybe empty or 443)
            const portMatch = (targetUrl.port === requestUrl.port) ||
                (targetUrl.protocol === 'https:' && (requestUrl.port === '' || requestUrl.port === '443') && targetUrl.port === '') ||
                (targetUrl.protocol === 'https:' && requestUrl.port === '443' && targetUrl.port === '443');

            if (sameProtocol && sameHostname && portMatch) {
                // Construct the new URL
                // We keep the pathname and search from the requestUrl
                const newUrl = `${window.location.origin}${proxyPath}${requestUrl.pathname}${requestUrl.search}`;

                console.debug(`[Proxy] Redirecting ${urlString} -> ${newUrl}`);

                if (typeof input === 'object' && 'url' in input) {
                    const newRequest = new Request(newUrl, input);
                    return originalFetch(newRequest, init);
                }

                return originalFetch(newUrl, init);
            }
        } catch (e) {
            // Not a valid URL, ignore
        }
    }

    return originalFetch(input, init);
};

console.log("[Proxy] Fetch interceptor initialized for Linera validators.");
