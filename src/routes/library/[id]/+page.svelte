<script lang="ts">
	import DownloadSVG from "$lib/assets/download.svelte";
	import InfoSVG from "$lib/assets/info.svelte";
	import { Input } from "$lib";
	let { data } = $props();

	let searchQuery = $state("");

	let filteredEpisodes = $derived(
		data.episodes.filter((episode) =>
			episode.title.toLowerCase().includes(searchQuery.toLowerCase()),
		),
	);
</script>

<div class="p-8 max-w-7xl mx-auto pb-24">
	<!-- Header -->
	<div class="flex flex-col md:flex-row gap-8 mb-12 items-start md:items-end">
		<div
			class="w-48 h-48 bg-surface-elevated rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-white/5"
		>
			<div
				class="w-full h-full bg-linear-to-br from-primary-container/40 to-black flex items-center justify-center text-6xl"
			>
				🎙️
			</div>
		</div>
		<div class="flex-1 min-w-0">
			<p
				class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3"
			>
				Podcast
			</p>
			<h1
				class="text-5xl md:text-6xl font-bold mb-4 tracking-tight truncate"
			>
				{data.podcast.name}
			</h1>
			<div
				class="flex items-center gap-4 text-on-surface-variant text-sm"
			>
				<span class="font-bold text-on-surface"
					>{data.episodes.length} Episodes</span
				>
				<span class="opacity-30">•</span>
				<span class="font-mono">{data.podcast.rssUrl}</span>
			</div>
		</div>
	</div>

	<!-- Action Bar -->
	<div class="flex items-center gap-6 mb-8">
		<button
			class="w-14 h-14 bg-primary-container text-white rounded-full flex items-center justify-center text-2xl shadow-xl hover:scale-105 transition-transform"
		>
			▶
		</button>
		<button
			class="p-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors"
		>
			<span class="text-xl">⋮</span>
		</button>
		<Input bind:value={searchQuery} placeholder="Search episodes..." />
	</div>

	<!-- Episodes List -->
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
					{#each filteredEpisodes as episode, i}
						<tr
							class="hover:bg-white/5 transition-colors group cursor-pointer"
						>
							<td
								class="px-8 py-5 text-on-surface-variant font-mono"
							>
								<span class="group-hover:hidden">{i + 1}</span>
								<span
									class="hidden group-hover:block text-primary"
									>▶</span
								>
							</td>
							<td class="px-8 py-5">
								<div class="flex flex-col">
									<span
										class="font-bold text-on-surface group-hover:text-primary transition-colors"
										>{episode.title}</span
									>
									<span
										class="text-xs text-on-surface-variant mt-1"
										>GUID: {episode.guid.slice(
											0,
											8,
										)}...</span
									>
								</div>
							</td>
							<td
								class="px-8 py-5 text-on-surface-variant text-sm"
							>
								{new Date(episode.pubDate).toLocaleDateString(
									undefined,
									{
										year: "numeric",
										month: "short",
										day: "numeric",
									},
								)}
							</td>
							<td class="px-8 py-5 text-right">
								<div class="flex justify-end">
									{#if episode.downloadedDate}
										<button
											title={`Downloaded on "${new Date(
												episode.downloadedDate,
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

	{#if data.episodes.length === 0}
		<div class="py-20 text-center text-on-surface-variant">
			<p>No episodes have been scanned or downloaded yet.</p>
			<button
				class="mt-4 text-primary hover:underline font-bold uppercase tracking-widest text-xs"
			>
				Scan Now
			</button>
		</div>
	{/if}
</div>
