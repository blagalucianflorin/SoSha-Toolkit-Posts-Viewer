<script lang="ts">
    import type { Toolkit } from '$lib/types';

    let { data } = $props();
    const toolkits: Toolkit[] = data.toolkits;
</script>

<div class="flex justify-center w-full">
    <div class="card w-11/12 max-w-3xl bg-base-100 shadow-xl mt-8 card-compact">
        <div class="card-body">
            <h2 class="card-title mb-4">Toolkits</h2>
            <div class="overflow-x-auto">
                <table class="table w-full">
                    <thead>
                    <tr>
                        <th class="bg-base-200">Name</th>
                        <th class="bg-base-200">Status</th>
                        <th class="bg-base-200"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {#each toolkits as toolkit}
                        <tr class="hover">
                            <td class="font-medium">
                                <div class="flex items-center gap-3">
                                    {toolkit.name}
                                </div>
                            </td>
                            <td>
                                <div class="flex flex-row items-center">
                                    {#if toolkit.status === 'published'}
                                        <div class="badge badge-success">Published</div>
                                    {:else}
                                        <div class="badge badge-warning">Draft</div>
                                    {/if}
                                </div>
                            </td>
                            <td class="text-right">
                                <a
                                  href="/toolkit/{toolkit.id}"
                                  class="btn btn-sm hover:btn-primary text-nowrap"
                                >
                                    Go to →
                                </a>
                            </td>
                        </tr>
                    {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>