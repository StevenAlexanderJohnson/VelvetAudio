<script lang="ts">
	import { player } from '$lib/player';
	import { Button } from '$lib';

	let { data } = $props();

	function handlePlay(episode: any) {
		player.play(
			{ title: episode.title, audioUrl: episode.audioUrl },
			episode.podcastName
		);
	}

	function getTimeGreeting() {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good Morning';
		if (hour < 18) return 'Good Afternoon';
		return 'Good Evening';
	}
</script>

<div class="p-8 max-w-7xl mx-auto pb-24">
	<div class="flex items-end justify-between mb-8">
		<div>
			<h2 class="text-4xl font-bold mb-2">{getTimeGreeting()}</h2>
			<p class="text-on-surface-variant">Here are your most recently downloaded episodes.</p>
		</div>
		<a href="/library">
			<Button variant="secondary" class="text-xs uppercase tracking-widest">
				View Library
			</Button>
		</a>
	</div>

	{#if data.recentEpisodes.length === 0}
		<div class="py-20 text-center bg-surface rounded-3xl border border-dashed border-white/10">
			<p class="text-on-surface-variant">No episodes downloaded yet.</p>
			<a href="/library" class="mt-4 inline-block text-primary hover:underline font-bold uppercase tracking-widest text-xs">
				Add your first podcast
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each data.recentEpisodes as episode}
				{@const isCurrent = $player.audioUrl === episode.audioUrl}
				<button 
					type="button"
					onclick={() => handlePlay(episode)}
					class="group text-left w-full bg-surface rounded-[24px] overflow-hidden border border-white/5 transition-all duration-300 hover:bg-surface-elevated hover:scale-[1.02] cursor-pointer"
				>
					<div class="aspect-square relative overflow-hidden bg-linear-to-br from-primary-container/20 to-black">
						{#if episode.image || episode.podcastImage}
							<img 
								src={episode.image || episode.podcastImage} 
								alt={episode.title} 
								class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
							/>
						{:else}
							<div class="absolute inset-0 flex items-center justify-center text-6xl opacity-20">🎙️</div>
						{/if}
						
						<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
							<div class="w-14 h-14 bg-primary-container text-white rounded-full flex items-center justify-center text-xl shadow-2xl hover:scale-110 transition-transform">
								{isCurrent && $player.isPlaying ? '⏸' : '▶'}
							</div>
						</div>
					</div>
					<div class="p-5 space-y-1">
						<h3 class="font-bold text-lg leading-tight truncate transition-colors {isCurrent ? 'text-primary' : ''}">
							{episode.title}
						</h3>
						<p class="text-sm text-on-surface-variant truncate">{episode.podcastName}</p>
						
						<div class="pt-4 flex items-center justify-between text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
							<span>Downloaded</span>
							<span>
								{new Date(episode.downloadedDate).toLocaleDateString(undefined, {
									month: 'short',
									day: 'numeric'
								})}
							</span>
						</div>
					</div>
				</button>
			{/each}
		</div>

		<section class="mt-16">
			<h3 class="text-2xl font-bold mb-6">Recent Activity</h3>
			<div class="bg-surface rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
				{#each data.recentEpisodes.slice(0, 4) as episode}
					{@const isCurrent = $player.audioUrl === episode.audioUrl}
					<button 
						type="button"
						onclick={() => handlePlay(episode)}
						class="flex items-center gap-4 p-4 w-full text-left hover:bg-white/5 transition-colors group cursor-pointer"
					>
						<div class="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-elevated">
							{#if episode.image || episode.podcastImage}
								<img src={episode.image || episode.podcastImage} alt="" class="w-full h-full object-cover" />
							{:else}
								<div class="w-full h-full flex items-center justify-center text-lg">🎙️</div>
							{/if}
						</div>
						<div class="flex-1 min-w-0">
							<h4 class="font-semibold truncate transition-colors {isCurrent ? 'text-primary' : 'group-hover:text-primary'}">
								{episode.title}
							</h4>
							<p class="text-xs text-on-surface-variant truncate">
								{episode.podcastName} • {new Date(episode.downloadedDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
							</p>
						</div>
						<div class="text-primary-container opacity-0 group-hover:opacity-100 transition-opacity">
							{isCurrent && $player.isPlaying ? 'Playing' : 'Play Now'}
						</div>
					</button>
				{/each}
			</div>
		</section>
	{/if}
</div>
