<script lang="ts">
	interface Props {
		name: string;
		rssUrl: string;
		episodeCount: number;
		imagePlaceholder?: string;
	}

	let { name, rssUrl, episodeCount, imagePlaceholder = '🎙️' }: Props = $props();
</script>

<div class="flex flex-col md:flex-row gap-8 mb-12 items-start md:items-end">
	<div
		class="w-48 h-48 bg-surface-elevated rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-white/5"
	>
		<div
			class="w-full h-full bg-linear-to-br from-primary-container/40 to-black flex items-center justify-center text-6xl"
		>
			{imagePlaceholder}
		</div>
	</div>
	<div class="flex-1 min-w-0">
		<p class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Podcast</p>
		<h1 class="text-5xl md:text-6xl font-bold mb-4 tracking-tight truncate">
			{name}
		</h1>
		<div class="flex items-center gap-4 text-on-surface-variant text-sm">
			<span class="font-bold text-on-surface">{episodeCount} Episodes</span>
			<span class="opacity-30">•</span>
			<span class="font-mono truncate">{rssUrl}</span>
		</div>
	</div>
</div>
