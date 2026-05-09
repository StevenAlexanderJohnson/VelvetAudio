<script lang="ts">
	const episodes = [
		{
			title: "The Future of Synthetic Sound",
			podcast: "Sonic Frontiers",
			duration: "45 min",
			progress: 65,
			image: "bg-gradient-to-br from-purple-500/20 to-black"
		},
		{
			title: "Deep Dive into Svelte 5 Runes",
			podcast: "Dev Talk",
			duration: "32 min",
			progress: 10,
			image: "bg-gradient-to-br from-blue-500/20 to-black"
		},
		{
			title: "The Minimalism Movement",
			podcast: "Design Systems",
			duration: "58 min",
			progress: 90,
			image: "bg-gradient-to-br from-pink-500/20 to-black"
		},
		{
			title: "AI and Audio Processing",
			podcast: "Tech Weekly",
			duration: "24 min",
			progress: 0,
			image: "bg-gradient-to-br from-emerald-500/20 to-black"
		}
	];
</script>

<div class="p-8 max-w-7xl mx-auto">
	<div class="flex items-end justify-between mb-8">
		<div>
			<h2 class="text-4xl font-bold mb-2">Good Evening</h2>
			<p class="text-on-surface-variant">Your library is updated with 12 new episodes.</p>
		</div>
		<button class="text-sm font-bold text-primary hover:underline uppercase tracking-widest">
			View All
		</button>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		{#each episodes as episode}
			<div class="group bg-surface rounded-[16px] overflow-hidden border border-white/5 transition-all duration-300 hover:bg-surface-elevated hover:scale-[1.02] cursor-pointer">
				<div class="aspect-square relative {episode.image}">
					<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
						<button class="w-14 h-14 bg-primary-container text-white rounded-full flex items-center justify-center text-xl shadow-2xl hover:scale-110 transition-transform">
							▶
						</button>
					</div>
				</div>
				<div class="p-4 space-y-1">
					<h3 class="font-semibold text-lg leading-tight truncate">{episode.title}</h3>
					<p class="text-sm text-on-surface-variant truncate">{episode.podcast}</p>
					
					<div class="pt-3 flex items-center justify-between text-xs text-on-surface-variant font-mono">
						<span>{episode.duration}</span>
						<span>{episode.progress}% complete</span>
					</div>
					
					<div class="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
						<div class="h-full bg-primary-container" style="width: {episode.progress}%"></div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<section class="mt-16">
		<h3 class="text-2xl font-bold mb-6">Recent Activity</h3>
		<div class="space-y-2">
			{#each episodes.slice(0, 3) as episode}
				<div class="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer">
					<div class="w-12 h-12 rounded-md {episode.image} shrink-0"></div>
					<div class="flex-1 min-w-0">
						<h4 class="font-semibold truncate group-hover:text-primary transition-colors">{episode.title}</h4>
						<p class="text-xs text-on-surface-variant truncate">{episode.podcast} • {episode.duration}</p>
					</div>
					<button class="opacity-0 group-hover:opacity-100 transition-opacity text-primary-container">
						Add to Queue
					</button>
				</div>
			{/each}
		</div>
	</section>
</div>
