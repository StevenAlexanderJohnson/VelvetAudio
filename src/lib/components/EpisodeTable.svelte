<script lang="ts">
	import DownloadSVG from '$lib/assets/download.svelte';
	import InfoSVG from '$lib/assets/info.svelte';
	import type { episodes as episodesSchema } from '$lib/server/db/schema';
	import { player } from '$lib/player';

	type Episode = typeof episodesSchema.$inferSelect;

	interface Props {
		episodes: Episode[];
		podcastName: string;
	}

	let { episodes, podcastName }: Props = $props();

	function handlePlay(episode: Episode) {
		player.play(
			{ title: episode.title, audioUrl: episode.audioUrl },
			podcastName
		);
	}
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
					{@const isCurrent = $player.audioUrl === episode.audioUrl}
					<tr 
						onclick={() => handlePlay(episode)}
						class="hover:bg-white/5 transition-colors group cursor-pointer {isCurrent ? 'bg-white/5' : ''}"
					>
						<td class="px-8 py-5 text-on-surface-variant font-mono">
							<span class={isCurrent ? 'hidden' : 'group-hover:hidden'}>{i + 1}</span>
							<span class={isCurrent ? 'text-primary' : 'hidden group-hover:block text-primary'}>
								{$player.isPlaying && isCurrent ? '⏸' : '▶'}
							</span>
						</td>
						<td class="px-8 py-5">
							<div class="flex flex-col">
								<span class="font-bold transition-colors {isCurrent ? 'text-primary' : 'text-on-surface group-hover:text-primary'}"
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
										aria-label="Download Info"
										class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-on-surface-variant transition-colors"
										onclick={(e) => e.stopPropagation()}
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
