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
	const posts: Post[]  = await postsResponse.json();

	console.log(posts);

	const groupedPosts = posts.reduce((groups: Map<string, Post[]>, post) => {
		const group = groups.get(post.group_id) || [];
		group.push(post);
		groups.set(post.group_id, group);
		return groups;
	}, new Map<string, Post[]>());

	const postGroups: PostGroup[] = Array.from(groupedPosts.entries()).map(([groupId, posts]) => ({
		groupId,
		posts
	}));

	return { postGroups, toolkitId: params.id };
};