<script lang="ts">
	import type { PostGroup } from '$lib/types';
	import { onMount } from 'svelte';

	type SelectablePostGroup = PostGroup & { selected: boolean; selected_network: number };
	type LayoutItem = { groupId: string; order: number };

	const { data } = $props();

	let postGroups: SelectablePostGroup[] = $state([]);
	let isGridView = $state(false);
	let selectedPostsCount = $state(0);
	let animatingPosts = new Set<SelectablePostGroup>();
	let draggingPost: SelectablePostGroup | undefined;

	function saveLayout(): void {
		const layout: LayoutItem[] = postGroups.map((post, index) => ({
			groupId: post.groupId,
			order: index,
		}));
		localStorage.setItem('post-grid-layout', JSON.stringify(layout));
	}

	function initializePostGroups(): void {
		const savedLayout = localStorage.getItem('post-grid-layout');
		const layout = savedLayout ? JSON.parse(savedLayout) : [];
		const initialPosts = data.postGroups.map((post: PostGroup) => ({
			...post,
			selected: false,
			selected_network: 0,
		}));

		const postsMap = new Map(initialPosts.map(post => [post.groupId, post]));
		const orderedPosts: SelectablePostGroup[] = [];

		layout.forEach((item: PostGroup) => {
			const post = postsMap.get(item.groupId);
			if (post) {
				orderedPosts.push(post);
				postsMap.delete(item.groupId);
			}
		});

		postsMap.forEach(post => {
			orderedPosts.push(post);
		});

		postGroups = orderedPosts;
	}

	function swapWith(post: SelectablePostGroup): void {
		if (!isGridView || draggingPost === post || animatingPosts.has(post)) return;
		if (!draggingPost) return;

		const draggedIndex = postGroups.indexOf(draggingPost);
		const targetIndex = postGroups.indexOf(post);

		postGroups.splice(draggedIndex, 1);
		postGroups.splice(targetIndex, 0, draggingPost);

		postGroups = postGroups;
		saveLayout();
	}

	function handleDragStart(event: DragEvent, post: SelectablePostGroup): void {
		if (!isGridView) {
			event.preventDefault();
			return;
		}
		draggingPost = post;

		if (event.dataTransfer) {
			const draggedEl = event.target as HTMLElement;
			const originalRect = draggedEl.getBoundingClientRect();

			const clone = draggedEl.cloneNode(true) as HTMLElement;
			clone.style.width = `${originalRect.width}px`;
			clone.style.height = `${originalRect.height}px`;
			clone.style.pointerEvents = 'none';
			clone.style.opacity = '0.8';

			document.body.appendChild(clone);

			const mouseX = event.clientX - originalRect.left;
			const mouseY = event.clientY - originalRect.top;

			event.dataTransfer.setDragImage(clone, mouseX, mouseY);

			setTimeout(() => {
				document.body.removeChild(clone);
			}, 0);
		}
	}

	function selectPost(post: SelectablePostGroup): void {
		post.selected = !post.selected;
		selectedPostsCount = postGroups.reduce((count, post) => count + (post.selected ? 1 : 0), 0);
	}

	onMount(() => {
		initializePostGroups();
	});
</script>

<div class="p-4 w-full overflow-x-hidden">
	<div class="flex items-center justify-between mb-2">
		<a href='/' class="btn btn-sm bg-transparent hover:bg-transparent m-[1px] btn-square border-2 shadow border-base-300 hover:border-gray-500" aria-label="go home">
			<i class="fa-solid fa-house w-5 h-5"></i>
		</a>

		<div class="flex-grow flex justify-center items-center">
			<div class="btn-group max-sm:hidden">
				{#if postGroups.length !== 0}
				<button
					class="btn btn-sm m-[1px] btn-square border-2 shadow border-base-300 hover:border-gray-500 {isGridView ? 'btn-active' : 'bg-transparent'}"
					onclick={() => isGridView = true}
					aria-label="set-grid-view"
				>
					<i class="fa-solid fa-grip w-4 h-4"></i>
				</button>
				<button
					class="btn btn-sm m-[1px] btn-square border-2 shadow border-base-300 hover:border-gray-500 {!isGridView ? 'btn-active' : 'bg-transparent'}"
					onclick={() => isGridView = false}
					aria-label="set-list-view"
				>
					<i class="fa-solid fa-list w-4 h-4"></i>
				</button>
				{/if}
			</div>

			{#if selectedPostsCount > 0}
				<p class="m-1">{selectedPostsCount} selected</p>
			{/if}
		</div>
	</div>

	{#if postGroups.length === 0}
		<div class="flex flex-col items-center justify-center p-8 text-center">
			<i class="fa-regular fa-folder-open text-gray-400 w-16 h-16 mb-4"></i>
			<h3 class="text-xl font-semibold text-gray-600 mb-2">No Posts Yet</h3>
		</div>
	{:else}
		<div class="w-full {isGridView ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'flex flex-col gap-4'}">
			{#each postGroups as postGroup (postGroup.groupId)}
				<div class="card card-compact bg-base-100 shadow-md border-[3px] relative
													{postGroup.selected ? 'border-primary' : 'border-transparent hover:border-gray-300'}
													{!isGridView ? 'h-auto' : 'h-full'}"
						 onclick={() => selectPost(postGroup)}
						 onkeydown={(e) => e.key === 'Enter' && selectPost(postGroup)}
						 tabindex="0"
						 role="button"
						 draggable={isGridView}
						 ondragstart={(e) => handleDragStart(e, postGroup)}
						 ondragend={() => draggingPost = undefined}
						 ondragenter={() => swapWith(postGroup)}
						 ondragover={(e) => e.preventDefault()}
				>
					{#if isGridView}
						<div class="absolute top-2 right-2">
							<i class="fa-solid w-5 h-5 fa-grip-vertical text-gray-400 hover:text-gray-600 cursor-grab"></i>
						</div>
					{/if}

					<div class="card-body {!isGridView ? 'flex-row p-4' : ''}">
						<div class="{!isGridView ? 'w-1/5 flex flex-col gap-1 pr-4' : ''}">
							<div class="flex flex-row items-center flex-wrap">
								{#if postGroup.posts[0].status === "published"}
									<div class="badge badge-success max-sm:badge-sm gap-2">Published</div>
								{:else if postGroup.posts[0].status === "draft"}
									<div class="badge badge-warning max-sm:badge-sm gap-2 m-1">Draft</div>
								{/if}

								{#if postGroup.posts[0].ai_generated}
									<div class="tooltip" data-tip="This post has been generated by AI">
										<i class="fa-solid fa-robot w-5 h-5 text-primary m-1"></i>
									</div>
								{/if}
							</div>

							<div class="flex flex-row items-center flex-wrap">
								{#each postGroup.posts as variant, index}
									<button class="btn btn-sm bg-transparent hover:bg-transparent m-[1px] btn-square border-2 shadow-md
																								 {postGroup.selected_network === index ? 'border-primary hover:border-primary' : 'border-base-300 hover:border-gray-500'}"
													onclick={(e) => {e.stopPropagation(); postGroup.selected_network = index}}
									>
										{#if variant.social_networks[0] === 'instagram'}
											<i class="fa-brands fa-instagram text-[#f46040] w-5 h-5 m-1"></i>
										{:else if variant.social_networks[0] === 'facebook'}
											<i class="fa-brands fa-facebook text-[#2c64bc] w-5 h-5 m-1"></i>
										{:else if variant.social_networks[0] === 'threads'}
											<i class="fa-brands fa-threads text-[#000000] w-5 h-5 m-1"></i>
										{:else if variant.social_networks[0] === 'whatsapp'}
											<i class="fa-brands fa-whatsapp text-[#5dca46] w-5 h-5 m-1"></i>
										{:else if variant.social_networks[0] === 'linkedin'}
											<i class="fa-brands fa-linkedin text-[#2c64bc] w-5 h-5 m-1"></i>
										{:else if variant.social_networks[0] === 'twitter'}
											<i class="fa-brands fa-x-twitter text-[#000000] w-5 h-5 m-1"></i>
										{:else if variant.social_networks[0] === 'bluesky'}
											<i class="fa-brands fa-bluesky text-[#0385ff] w-5 h-5 m-1"></i>
										{:else if variant.social_networks[0] === 'all'}
											<i class="fa-solid fa-share-nodes text-[#fccc14] w-5 h-5 m-1"></i>
										{/if}
									</button>
								{/each}
							</div>
						</div>

						<div class="divider {isGridView ? '' : 'divider-horizontal'} p-0 m-0"></div>

						<div class="w-full overflow-hidden">
							<p class="break-words">
								{#each postGroup.posts[postGroup.selected_network].text.split(/(#\w+)/g) as part}
									<span class="{part.startsWith('#') ? 'text-blue-500' : ''}">{part}</span>
								{/each}
							</p>

							{#if postGroup.posts[0].captioned_link || postGroup.posts[0].media_groups.length !== 0}
								<div class="card {postGroup.posts[0].captioned_link ? 'bg-base-200 shadow-inner' : ''} card-compact my-1 max-w-2xl {isGridView ? '' : 'md:card-side'}">
									{#if postGroup.posts[0].media_groups.length !== 0}
										<figure class="bg-base-100 {!isGridView ? 'md:max-w-96 md:flex-shrink-0 flex justify-center' : 'rounded-t-xl'}">                                        <img
											class="rounded-t-xl bg-transparent object-cover h-full w-full max-w-96 {!postGroup.posts[0].captioned_link ? 'rounded-b-xl' : ''}"
											src="{postGroup.posts[0].media_groups[0].preview.preview_url}"
											alt="post preview"
											draggable="false"
										/>
										</figure>
									{/if}
									{#if postGroup.posts[0].captioned_link}
										<div class="card-body overflow-hidden {!isGridView ? 'max-w-xl' : ''}">
											<div>
												<p class="text-wrap break-words"><b>{postGroup.posts[0].captioned_link.caption}</b></p>
												<p class="text-gray-500 text-sm break-all">{postGroup.posts[0].captioned_link.link}</p>
											</div>
										</div>
									{/if}
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>