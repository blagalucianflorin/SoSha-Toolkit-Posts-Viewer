<script lang="ts">
	import { onMount } from 'svelte';
	import type { PostGroup } from '$lib/types';

	type SelectablePostGroup = PostGroup & { selected: boolean ; selected_network: number };

	const { data } = $props();

	let posts: SelectablePostGroup[] = $state([]);
	let isGridView = $state(true);
	let selectedPostsCount = $state(0);
	let draggingIndex: number | undefined;


	function initializePostGroups(): void {
		const localStorageLayout = localStorage.getItem(`post-grid-layout-${data.toolkitId}`);
		const layout: PostGroup[] = localStorageLayout ? JSON.parse(localStorageLayout) : [];
		const initialPosts: SelectablePostGroup[] = data.postGroups as SelectablePostGroup[];

		for (const initialPost of initialPosts) {
			initialPost.selected = false;
			initialPost.selected_network = 0;
			initialPost.groupId = initialPost.posts[0].group_id;
		}

		for (const savedPost of layout) {
			let found: number | boolean = false;

			for (let i = 0; i < initialPosts.length; i++) {
				if (savedPost.groupId === initialPosts[i].groupId) {
					found = i;
					break;
				}
			}

			if (found !== false) {
				posts.push(initialPosts.splice(found, 1)[0]);
			}
		}

		for (const initialPost of initialPosts) {
			posts.push(initialPost);
		}
	}

	function saveLayout(): void {
		localStorage.setItem(`post-grid-layout-${data.toolkitId}`, JSON.stringify(posts));
	}

	function moveSelectedToStart(): void {
		let movePosition = 0;

		for (let i = 0; i < posts.length; i++) {
			if (posts[i].selected) {
				const temp = posts[i];
				posts[i] = posts[movePosition];
				posts[movePosition] = temp;
				movePosition++;
			}
		}

		saveLayout();
	}

	function clearSelection(): void {
		for (let post of posts) {
			post.selected = false;
		}
		selectedPostsCount = 0;
	}

	function swapPosts(postIndex: number): void {
		if (draggingIndex === undefined || draggingIndex === postIndex) return;

		const temp = posts[draggingIndex];
		posts[draggingIndex] = posts[postIndex];
		posts[postIndex] = temp;
		draggingIndex = postIndex;
	}

	function handleDragStart(event: DragEvent, postIndex: number): void {
		draggingIndex = postIndex;

		if (event.dataTransfer) {
			const draggedCard = event.target as HTMLElement;
			const originalRect = draggedCard.getBoundingClientRect();
			const clone = draggedCard.cloneNode(true) as HTMLElement;

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

	function selectPost(postIndex: number): void {
		posts[postIndex].selected = !posts[postIndex].selected;
		selectedPostsCount += posts[postIndex].selected ? 1 : -1;
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

		<div class="flex-grow flex justify-center items-center gap-2">
			<div class="btn-group max-sm:hidden">
				{#if posts.length !== 0}
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
				<div class="flex items-center gap-2">
					<p class="m-1">{selectedPostsCount} selected</p>
					<button
						class="btn btn-sm btn-primary"
						onclick={moveSelectedToStart}
						aria-label="move selected to start"
					>
						<i class="fa-solid fa-arrow-up-wide-short w-4 h-4"></i>
					</button>
					<button
						class="btn btn-sm btn-ghost"
						onclick={clearSelection}
						aria-label="clear selection"
					>
						<i class="fa-solid fa-xmark w-4 h-4"></i>
					</button>
				</div>
			{/if}
		</div>
	</div>

	{#if posts.length === 0}
		<div class="flex flex-col items-center justify-center p-8 text-center">
			<i class="fa-regular fa-folder-open text-gray-400 w-16 h-16 mb-4"></i>
			<h3 class="text-xl font-semibold text-gray-600 mb-2">No Posts Yet</h3>
		</div>
	{:else}
		<div class="w-full {isGridView ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'flex flex-col gap-4'}">
			{#each posts as postGroup, index (postGroup.groupId)}
				<div class="card card-compact bg-base-100 shadow-md border-[3px] relative
										{postGroup.selected ? 'border-primary' : 'border-transparent hover:border-gray-300'}
										{!isGridView ? 'h-auto' : 'h-full'}"
						 onclick={() => selectPost(index)}
						 onkeydown={(e) => e.key === 'Enter' && selectPost(index)}
						 tabindex="0"
						 role="button"
						 draggable={isGridView}
						 ondragstart={(e) => handleDragStart(e, index)}
						 ondragend={() => { draggingIndex = undefined; saveLayout(); }}
						 ondragenter={() => swapPosts(index)}
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
									<div class="badge badge-success max-sm:badge-sm gap-2 m-1">Published</div>
								{:else if postGroup.posts[0].status === "draft"}
									<div class="badge badge-warning max-sm:badge-sm gap-2 m-1">Draft</div>
								{/if}

								{#if postGroup.posts[0].ai_generated}
									<div class="tooltip {isGridView ? '' : 'tooltip-right'}" data-tip="This post has been generated by AI">
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
								{#if postGroup.posts[postGroup.selected_network].text}
									{#each postGroup.posts[postGroup.selected_network].text.split(/(#\w+)/g) as part}
										<span class="{part.startsWith('#') ? 'text-blue-500' : ''}">{part}</span>
									{/each}
								{/if}
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