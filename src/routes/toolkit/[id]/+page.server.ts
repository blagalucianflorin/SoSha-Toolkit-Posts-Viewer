import type { Post, PostGroup } from '$lib/types';
import { PRIVATE_COOKIE, PRIVATE_ORGANIZATION_ID } from '$env/static/private';
import { PUBLIC_BASE_DOMAIN } from '$env/static/public';

export const load = async ({ params }) => {
	const options = {
		headers: {
			cookie: `x-sosha-session-token=${PRIVATE_COOKIE}`
		}
	};

	const postsResponse = await fetch(`${PUBLIC_BASE_DOMAIN}/api/v1/organizations/${PRIVATE_ORGANIZATION_ID}/toolkits/${params.id}/posts`, options);
	const posts: Post[] = await postsResponse.json();
	const postGroups: PostGroup[] = [];

	for (const post of posts) {
		let found: number = -1;

		for (let index = 0; index < postGroups.length; index++) {
			if (postGroups[index].groupId == post.group_id) {
				found = index;
				break;
			}
		}

		if (found != -1) {
			postGroups[found].posts.push(post)
		} else {
			postGroups.push({ groupId: post.group_id, posts: [ post ] })
		}
	}

	return { postGroups, toolkitId: params.id };
};