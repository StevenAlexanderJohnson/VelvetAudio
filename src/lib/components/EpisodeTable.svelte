<script lang="ts">
	import DownloadSVG from '$lib/assets/download.svelte';
	import InfoSVG from '$lib/assets/info.svelte';
	import LockSVG from '$lib/assets/lock.svelte';
	import type { episodes as episodesSchema } from '$lib/server/db/schema';
	import { player } from '$lib/player';
	import { invalidateAll } from '$app/navigation';

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

	function handleKeyDown(e: KeyboardEvent, episode: Episode) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handlePlay(episode);
		}
	}

	async function toggleLock(episode: Episode) {
		try {
			const response = await fetch(`/api/episodes/${episode.id}/lock`, {
				method: 'PATCH'
			});
			if (response.ok) {
				await invalidateAll();
			} else {
				alert('Failed to toggle lock status');
			}
		} catch (err) {
			console.error('Error toggling lock:', err);
		}
	}

	async function handleDownload(episode: Episode) {
		try {
			const response = await fetch(`/api/episodes/${episode.id}/download`, {
				method: 'POST'
			});
			if (response.ok) {
				await invalidateAll();
			} else {
				const err = await response.json();
				alert(`Failed to download episode: ${err.message}`);
			}
		} catch (err) {
			console.error('Error downloading episode:', err);
		}
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
						onkeydown={(e) => handleKeyDown(e, episode)}
						role="button"
						tabindex="0"
						aria-label="Play {episode.title}"
						class="hover:bg-white/5 transition-colors group cursor-pointer {isCurrent ? 'bg-white/5' : ''} outline-hidden focus:bg-white/10"
					>
						<td class="px-8 py-5 text-on-surface-variant font-mono">
							<span class={isCurrent ? 'hidden' : 'group-hover:hidden'}>{i + 1}</span>
							<span class={isCurrent ? 'text-primary' : 'hidden group-hover:block text-primary'}>
								{$player.isPlaying && isCurrent ? '⏸' : '▶'}
							</span>
						</td>
						<td class="px-8 py-5">
							<div class="flex items-center gap-4">
								{#if episode.image}
									<img src={episode.image} alt="" class="w-10 h-10 rounded-lg object-cover bg-surface-elevated shrink-0" />
								{/if}
								<div class="flex flex-col min-w-0">
									<div class="flex items-center gap-2">
										<span class="font-bold truncate transition-colors {isCurrent ? 'text-primary' : 'text-on-surface group-hover:text-primary'}"
											>{episode.title}</span
										>
										{#if episode.exemptCleanup}
											<span class="text-primary" title="Exempt from cleanup">
												<div class="w-3.5 h-3.5">
													<LockSVG />
												</div>
											</span>
										{/if}
									</div>
									<span class="text-xs text-on-surface-variant mt-1"
										>GUID: {episode.guid.slice(0, 8)}...</span
									>
								</div>
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
							<div class="flex justify-end items-center gap-2">
								{#if episode.downloadedDate}
									<button
										title="Toggle Lock"
										class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors {episode.exemptCleanup ? 'text-primary' : 'text-on-surface-variant'}"
										onclick={(e) => { e.stopPropagation(); toggleLock(episode); }}
									>
										<LockSVG />
									</button>
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
									<button
										title="Download manually (locks from cleanup)"
										class="w-8 h-8 p-2 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-colors"
										onclick={(e) => { e.stopPropagation(); handleDownload(episode); }}
									>
										<DownloadSVG />
									</button>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
