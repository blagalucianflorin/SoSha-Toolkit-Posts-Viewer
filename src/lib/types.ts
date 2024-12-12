export interface Post {
	status: string,
	text: string,
	ai_generated: boolean
	social_networks: string[],
	group_id: string,
	captioned_link: undefined | {
		caption: string,
		link: string
	}
	media_groups: {
		preview: { preview_url: string }
	}[]
}

export interface PostGroup {
	groupId: string,
	posts: Post[]
}

export interface Toolkit {
	name: string,
	id: string
	status: 'published' | 'draft'
}