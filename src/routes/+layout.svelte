<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import { page } from '$app/state';
	import { player } from '$lib/player';

	let { children } = $props();

	const navItems = [
		{ label: 'Home', href: '/' },
		{ label: 'Library', href: '/library' },
		{ label: 'Search', href: '/search' }
	];

	let activeIndex = $derived(navItems.findIndex(item => 
		item.href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(item.href)
	));

	// Audio state management
	let audio = $state<HTMLAudioElement | null>(null);
	let currentTime = $state(0);
	let duration = $state(0);

	$effect(() => {
		if ($player.audioUrl && audio) {
			if ($player.isPlaying) {
				audio.play().catch(() => {
					player.toggle(); // Revert state if browser blocks autoplay
				});
			} else {
				audio.pause();
			}
		}
	});

	function handleTimeUpdate() {
		if (audio) currentTime = audio.currentTime;
	}

	function handleLoadedMetadata() {
		if (audio) duration = audio.duration;
	}

	function formatTime(seconds: number) {
		if (isNaN(seconds)) return "0:00";
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function seek(e: MouseEvent) {
		if (!audio || !duration) return;
		const div = e.currentTarget as HTMLDivElement;
		const rect = div.getBoundingClientRect();
		const percent = (e.clientX - rect.left) / rect.width;
		audio.currentTime = percent * duration;
	}
</script>

<svelte:head>
	<title>Velvet Audio</title>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		rel="preconnect"
		href="https://fonts.gstatic.com"
		crossorigin="anonymous"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<!-- Invisible Audio Engine -->
{#if $player.audioUrl}
	<audio
		bind:this={audio}
		src={$player.audioUrl}
		ontimeupdate={handleTimeUpdate}
		onloadedmetadata={handleLoadedMetadata}
		onended={() => player.toggle()}
	></audio>
{/if}

<div class="flex flex-col h-screen bg-background">
	<!-- Sidebar -->
	<div class="flex flex-1 w-full overflow-hidden">
		<aside
			class="w-sidebar bg-surface flex flex-col border-r border-white/5"
		>
			<div class="p-8 flex items-center gap-3">
				<div
					class="w-8 h-8 bg-primary-container flex items-center justify-center"
				>
					<span class="text-white font-bold">V</span>
				</div>
				<h1 class="text-xl tracking-tight">Velvet Audio</h1>
			</div>

			<nav class="flex-1 px-4 py-2 space-y-1 relative">
				{#if activeIndex !== -1}
					<div 
						class="absolute left-4 right-4 h-12 bg-linear-to-r from-white/10 to-transparent border-l-4 border-primary-container transition-all duration-300 ease-out z-0 pointer-events-none"
						style="transform: translateY({activeIndex * (48 + 4)}px)"
					></div>
				{/if}

				{#each navItems as item, i}
					{@const isActive = activeIndex === i}
					<a 
						href={item.href} 
						class="relative z-10 flex items-center gap-3 py-3 px-4 transition-colors duration-300 {isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}"
					>
						<span>{item.label}</span>
					</a>
				{/each}
			</nav>

			<div class="p-6 mt-auto">
				<div
					class="p-4 rounded-xl bg-surface-elevated border border-white/5"
				>
					<p
						class="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2"
					>
						Support
					</p>
					<p class="text-sm opacity-80">Enjoying the experience?</p>
				</div>
			</div>
		</aside>

		<!-- Main Content -->
		<main class="flex-1 flex flex-col min-w-0">
			<header
				class="h-20 flex items-center justify-between px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10"
			>
				<div class="flex items-center gap-4">
					<button class="p-2 hover:bg-white/5 rounded-full" aria-label="Back">←</button>
					<button class="p-2 hover:bg-white/5 rounded-full" aria-label="Forward">→</button>
				</div>
				<div class="flex items-center gap-4">
					<button
						class="px-6 py-2 rounded-full bg-primary-container text-white font-semibold hover:scale-105 transition-transform"
					>
						Upgrade
					</button>
					<div
						class="w-10 h-10 rounded-full bg-surface-elevated border border-white/10"
					></div>
				</div>
			</header>

			<div class="flex-1 overflow-y-auto pb-[96px]">
				{@render children()}
			</div>
		</main>
	</div>

	<!-- Playback Bar -->
	<footer
		class="h-[96px] bg-surface border-t border-white/5 px-6 flex items-center justify-between z-20"
	>
		<!-- Current Episode -->
		<div class="flex items-center gap-4 w-1/3">
			<div
				class="w-16 h-16 bg-surface-elevated rounded-lg overflow-hidden shrink-0 border border-white/5"
			>
				<div
					class="w-full h-full bg-linear-to-br from-primary-container/20 to-black flex items-center justify-center text-2xl"
				>
					🎙️
				</div>
			</div>
			<div class="min-w-0">
				<h4 class="font-semibold truncate">{$player.episodeTitle ?? 'Select an episode'}</h4>
				<p class="text-sm text-on-surface-variant truncate">
					{$player.podcastTitle ?? 'Velvet Audio'}
				</p>
			</div>
		</div>

		<!-- Controls -->
		<div class="flex flex-col items-center gap-2 w-1/3">
			<div class="flex items-center gap-6">
				<button
					class="text-on-surface-variant hover:text-on-surface transition-colors"
					onclick={() => audio && (audio.currentTime -= 15)}>⟲</button
				>
				<button
					disabled={!$player.audioUrl}
					onclick={() => player.toggle()}
					class="w-10 h-10 flex items-center justify-center rounded-full bg-on-surface text-background hover:scale-110 transition-transform disabled:opacity-50"
				>
					{$player.isPlaying ? '⏸' : '▶'}
				</button>
				<button
					class="text-on-surface-variant hover:text-on-surface transition-colors"
					onclick={() => audio && (audio.currentTime += 15)}>⟳</button
				>
			</div>
			<div class="w-full max-w-md flex items-center gap-3">
				<span class="text-xs text-on-surface-variant font-mono"
					>{formatTime(currentTime)}</span
				>
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					onclick={seek}
					class="flex-1 h-1 bg-white/10 rounded-full group cursor-pointer relative"
				>
					<div
						class="h-full bg-primary-container rounded-full relative group-hover:h-1.5 transition-all"
						style="width: {(currentTime / (duration || 1)) * 100}%"
					>
						<div
							class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
						></div>
					</div>
				</div>
				<span class="text-xs text-on-surface-variant font-mono"
					>{formatTime(duration)}</span
				>
			</div>
		</div>

		<!-- Volume/Extra -->
		<div class="flex items-center justify-end gap-4 w-1/3">
			<span class="text-xs text-on-surface-variant uppercase font-bold tracking-widest">MVP Player</span>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>
