<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";

	let { children } = $props();
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

			<nav class="flex-1 px-4 py-2 space-y-1">
				<a href="/" class="flex items-center gap-3 py-3 px-4 transition-colors text-on-surface-variant border-l-4 border-transparent hover:bg-white/5">
					<span class="opacity-80">Home</span>
				</a>
				<a href="/library" class="flex items-center gap-3 py-3 px-4 bg-linear-to-r from-white/10 to-transparent text-primary border-l-4 border-primary-container">
					<span>Library</span>
				</a>
				<a href="#" class="flex items-center gap-3 py-3 px-4 hover:bg-white/5 transition-colors text-on-surface-variant border-l-4 border-transparent">
					<span>Search</span>
				</a>
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
					<button class="p-2 hover:bg-white/5 rounded-full">←</button>
					<button class="p-2 hover:bg-white/5 rounded-full">→</button>
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
				class="w-16 h-16 bg-surface-elevated rounded-lg overflow-hidden flex-shrink-0"
			>
				<div
					class="w-full h-full bg-gradient-to-br from-primary-container/20 to-black"
				></div>
			</div>
			<div class="min-w-0">
				<h4 class="font-semibold truncate">Select an episode</h4>
				<p class="text-sm text-on-surface-variant truncate">
					Velvet Audio
				</p>
			</div>
		</div>

		<!-- Controls -->
		<div class="flex flex-col items-center gap-2 w-1/3">
			<div class="flex items-center gap-6">
				<button
					class="text-on-surface-variant hover:text-on-surface transition-colors"
					>⟲</button
				>
				<button
					class="w-10 h-10 flex items-center justify-center rounded-full bg-on-surface text-background hover:scale-110 transition-transform"
				>
					▶
				</button>
				<button
					class="text-on-surface-variant hover:text-on-surface transition-colors"
					>⟳</button
				>
			</div>
			<div class="w-full max-w-md flex items-center gap-3">
				<span class="text-xs text-on-surface-variant font-mono"
					>0:00</span
				>
				<div
					class="flex-1 h-1 bg-white/10 rounded-full group cursor-pointer"
				>
					<div
						class="h-full bg-primary-container w-0 rounded-full relative group-hover:h-1.5 transition-all"
					>
						<div
							class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
						></div>
					</div>
				</div>
				<span class="text-xs text-on-surface-variant font-mono"
					>0:00</span
				>
			</div>
		</div>

		<!-- Volume/Extra -->
		<div class="flex items-center justify-end gap-4 w-1/3">
			<div class="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
				<div class="h-full bg-on-surface-variant w-2/3"></div>
			</div>
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
