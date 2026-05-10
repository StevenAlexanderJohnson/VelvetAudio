<script lang="ts">
	import DownloadSVG from '$lib/assets/download.svelte';
	import InfoSVG from '$lib/assets/info.svelte';

	interface Episode {
		id: number;
		podcastId: number;
		guid: string;
		title: string;
		link: string;
		description: string | null;
		pubDate: string;
		audioUrl: string;
		downloadedPath: string | null;
		downloadedDate: string | null;
		duration: string | null;
		fileSize: number | null;
		mimeType: string | null;
	}

	interface Props {
		episodes: Episode[];
	}

	let { episodes }: Props = $props();
</script>

<div class="bg-surface rounded-3xl border border-white/5 overflow-hidden">
	<div class="overflow-x-auto">
		<table class="w-full text-left border-collapse">
			<thead>
				<tr
					class="border-b border-white/5 text-on-surface-variant text-xs font-bold uppercase tracking-widest"
				>
					<th class="px-8 py-5 w-16">#</th>
					<th class="px-8 py-5">Title</th>
					<th class="px-8 py-5">Release Date</th>
					<th class="px-8 py-5 text-right">Status</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-white/5">
				{#each episodes as episode, i}
					<tr class="hover:bg-white/5 transition-colors group cursor-pointer">
						<td class="px-8 py-5 text-on-surface-variant font-mono">
							<span class="group-hover:hidden">{i + 1}</span>
							<span class="hidden group-hover:block text-primary">▶</span>
						</td>
						<td class="px-8 py-5">
							<div class="flex flex-col">
								<span class="font-bold text-on-surface group-hover:text-primary transition-colors"
									>{episode.title}</span
								>
								<span class="text-xs text-on-surface-variant mt-1"
									>GUID: {episode.guid.slice(0, 8)}...</span
								>
							</div>
						</td>
						<td class="px-8 py-5 text-on-surface-variant text-sm">
							{new Date(episode.pubDate).toLocaleDateString(undefined, {
								year: 'numeric',
								month: 'short',
								day: 'numeric'
							})}
						</td>
						<td class="px-8 py-5 text-right">
							<div class="flex justify-end">
								{#if episode.downloadedDate}
									<button
										title={`Downloaded on "${new Date(
											episode.downloadedDate
										).toLocaleDateString()}"`}
										aria-label="Download"
										class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-on-surface-variant transition-colors"
									>
										<InfoSVG />
									</button>
								{:else}
									<div
										class="w-8 h-8 p-2 rounded-full bg-primary/10 flex items-center justify-center text-on-surface-variant"
									>
										<DownloadSVG />
									</div>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
