<script lang="ts">
	interface Props {
		name: string;
		rssUrl: string;
		episodeCount: number;
		image?: string | null;
		imagePlaceholder?: string;
	}

	let { name, rssUrl, episodeCount, image, imagePlaceholder = '🎙️' }: Props = $props();
</script>

<div class="flex flex-col sm:flex-row gap-8 mb-12 md:items-end">
	<div
		class="w-48 h-48 bg-surface-elevated rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-white/5"
	>
		{#if image}
			<img src={image} alt={name} class="w-full h-full object-cover" />
		{:else}
			<div
				class="w-full h-full bg-linear-to-br from-primary-container/40 to-black flex items-center justify-center text-6xl"
			>
				{imagePlaceholder}
			</div>
		{/if}
	</div>
	<div class="flex-1 min-w-0">
		<p class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Podcast</p>
		<h1 class="text-5xl md:text-6xl font-bold mb-4 tracking-tight truncate">
			{name}
		</h1>
		<div class="flex items-center gap-4 text-on-surface-variant text-sm">
			<span class="font-bold text-on-surface">{episodeCount} Episodes</span>
		</div>
	</div>
</div>
