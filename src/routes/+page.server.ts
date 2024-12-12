import { PRIVATE_COOKIE, PRIVATE_ORGANIZATION_ID } from '$env/static/private';
import { PUBLIC_BASE_DOMAIN } from '$env/static/public';
import type { Toolkit } from '$lib/types';

export const load = async () => {
    const options = {
        headers: {
            cookie: `x-sosha-session-token=${PRIVATE_COOKIE}`
        }
    };

    const toolkitsResponse = await fetch(`${PUBLIC_BASE_DOMAIN}/api/v1/organizations/${PRIVATE_ORGANIZATION_ID}/toolkits`, options);
    const toolkits = (await toolkitsResponse.json()).map((toolkit: Toolkit) => ({name: toolkit.name, id: toolkit.id, status: toolkit.status}));

    return { toolkits };
};