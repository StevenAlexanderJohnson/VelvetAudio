<script lang="ts">
	import { Input, Button, PodcastHeader, EpisodeTable } from "$lib";
	let { data } = $props();

	let searchQuery = $state("");

	let filteredEpisodes = $derived(
		data.episodes.filter((episode) =>
			episode.title.toLowerCase().includes(searchQuery.toLowerCase()),
		),
	);
</script>

<div class="p-8 max-w-7xl mx-auto pb-24">
	<PodcastHeader 
		name={data.podcast.name} 
		rssUrl={data.podcast.rssUrl} 
		episodeCount={data.episodes.length} 
	/>

	<!-- Action Bar -->
	<div class="flex items-center gap-6 mb-8">
		<Button variant="play">▶</Button>
		<Button variant="icon">
			<span class="text-xl">⋮</span>
		</Button>
		<Input bind:value={searchQuery} placeholder="Search episodes..." />
	</div>

	<!-- Episodes List -->
	<EpisodeTable episodes={filteredEpisodes} />

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
