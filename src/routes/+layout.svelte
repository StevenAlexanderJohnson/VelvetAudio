<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import logo from "$lib/assets/Velvet Audio Transparent.png";
	import { page } from "$app/state";
	import { player } from "$lib/player";
	import { Button, Modal } from "$lib";

	let { children } = $props();

	const navItems = [
		{ label: "Home", href: "/" },
		{ label: "Library", href: "/library" },
		{ label: "Search", href: "/search" },
	];

	let activeIndex = $derived(
		navItems.findIndex((item) =>
			item.href === "/"
				? page.url.pathname === "/"
				: page.url.pathname.startsWith(item.href),
		),
	);

	const user = $derived(page.data.user);
	const showChrome = $derived(!!user);

	// Responsive states
	let isSidebarOpen = $state(false);
	let isUserModalOpen = $state(false);
	let isPlaybackModalOpen = $state(false);

	// Close sidebar when navigating
	$effect(() => {
		if (page.url.pathname) {
			isSidebarOpen = false;
		}
	});

	// Audio state management
	let audio = $state<HTMLAudioElement | null>(null);
	let currentTime = $state(0);
	let duration = $state(0);
	let volume = $state(.5);

	$effect(() => {
		if (audio) {
			audio.volume = volume;
		}
	});

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

	document.addEventListener("keydown", (e) => {
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
			return; // Don't interfere with typing
		}

		switch (e.code) {
			case "Space":
				e.preventDefault();
				player.toggle();
				break;
			case "ArrowRight":
				if (audio) audio.currentTime = Math.min(audio.currentTime + 5, duration);
				break;
			case "ArrowLeft":
				if (audio) audio.currentTime = Math.max(audio.currentTime - 5, 0);
				break;
			case "ArrowUp":
				e.preventDefault();
				volume = Math.min(volume + 0.05, 1);
				break;
			case "ArrowDown":
				e.preventDefault();
				volume = Math.max(volume - 0.05, 0);
				break;
			default:
				break;
		}
	})

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
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}

	function seek(e: MouseEvent) {
		if (!audio || !duration) return;
		const div = e.currentTarget as HTMLDivElement;
		const rect = div.getBoundingClientRect();
		const percent = (e.clientX - rect.left) / rect.width;
		audio.currentTime = percent * duration;
	}

	function handleSeekKeyDown(e: KeyboardEvent) {
		if (!audio || !duration) return;
		const step = 5; // seconds
		if (e.key === "ArrowRight") {
			audio.currentTime = Math.min(audio.currentTime + step, duration);
		} else if (e.key === "ArrowLeft") {
			audio.currentTime = Math.max(audio.currentTime - step, 0);
		}
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

{#if !showChrome}
	{@render children()}
{:else}
	<div class="flex flex-col h-screen bg-background text-on-surface">
		<div class="flex flex-1 w-full overflow-hidden relative">
			<!-- Mobile Backdrop -->
			{#if isSidebarOpen}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
					onclick={() => (isSidebarOpen = false)}
				></div>
			{/if}

			<!-- Sidebar -->
			<aside
				class="fixed inset-y-0 left-0 z-40 w-sidebar bg-surface flex flex-col border-r border-white/5 transform {isSidebarOpen
					? 'translate-x-0'
					: '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0"
			>
				<div class="p-8 flex items-center justify-between">
					<a href="/" class="flex items-center gap-3">
						<img
							src={logo}
							alt="Velvet Audio Logo"
							class="w-14 h-14 rounded-lg size-fit object-cover"
						/>
						<h1 class="text-xl tracking-tight font-bold">Velvet</h1>
					</a>
					<button
						class="md:hidden p-2 hover:bg-white/5 rounded-full"
						onclick={() => (isSidebarOpen = false)}
					>
						✕
					</button>
				</div>

				<nav class="flex-1 px-4 py-2 space-y-1 relative">
					{#if activeIndex !== -1}
						<div
							class="absolute left-4 right-4 h-12 bg-linear-to-r from-white/10 to-transparent border-l-4 border-primary-container transition-all duration-300 ease-out z-0 pointer-events-none"
							style="transform: translateY({activeIndex *
								(48 + 4)}px)"
						></div>
					{/if}

					{#each navItems as item, i}
						{@const isActive = activeIndex === i}
						<a
							href={item.href}
							class="relative z-10 flex items-center gap-3 py-3 px-4 transition-colors duration-300 {isActive
								? 'text-primary'
								: 'text-on-surface-variant hover:text-on-surface'}"
						>
							<span>{item.label}</span>
						</a>
					{/each}
				</nav>

				<div class="p-6 mt-auto">
					<a
						href="/settings"
						class="relative z-10 flex items-center gap-3 py-3 px-4 transition-colors duration-300"
					>
						<span>Settings</span>
					</a>
				</div>
			</aside>

			<!-- Main Content -->
			<main class="flex-1 flex flex-col min-w-0">
				<header
					class="h-20 flex items-center justify-between px-4 md:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10 border-b border-white/5 md:border-none"
				>
					<div class="flex items-center gap-2 md:gap-4">
						<button
							class="md:hidden p-2 hover:bg-white/5 rounded-full"
							aria-label="Open menu"
							onclick={() => (isSidebarOpen = true)}
						>
							<span class="text-2xl">☰</span>
						</button>
						<div class="hidden sm:flex items-center gap-4">
							<button
								class="p-2 hover:bg-white/5 rounded-full transition-opacity cursor-pointer"
								aria-label="Back"
								onclick={() => window.history.back()}>←</button
							>
							<button
								class="p-2 hover:bg-white/5 rounded-full transition-opacity cursor-pointer"
								aria-label="Forward"
								onclick={() => window.history.forward()}
								>→</button
							>
						</div>
					</div>

					<div class="flex items-center gap-3 md:gap-6">
						<div
							class="flex items-center gap-3 md:gap-4 border-l border-white/10 pl-4 md:pl-6"
						>
							<button
								onclick={() => (isUserModalOpen = true)}
								class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary-container border border-white/10 flex items-center justify-center font-bold text-xs md:text-sm uppercase shadow-lg shadow-primary-container/20 hover:scale-105 transition-transform cursor-pointer"
								aria-label="User menu"
							>
								{user?.username.slice(0, 2)}
							</button>
						</div>
					</div>
				</header>

				<div class="flex-1 overflow-y-auto pb-24 md:pb-[96px]">
					{@render children()}
				</div>
			</main>
		</div>

		<!-- Floating Mobile Player Icon -->
		{#if $player.audioUrl}
			<button
				onclick={() => (isPlaybackModalOpen = true)}
				class="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-primary shadow-2xl border-2 border-white/20 overflow-hidden flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-primary/40"
			>
				{#if $player.image}
					<img src={$player.image} alt="" class="w-full h-full object-cover" />
				{:else}
					🎙️
				{/if}
			</button>
		{/if}

		<!-- Playback Bar -->
		<footer
			class="h-[96px] bg-surface border-t border-white/5 px-4 md:px-6 hidden md:flex items-center justify-between z-20"
		>
			<!-- Current Episode -->
			<div class="flex items-center gap-3 md:gap-4 w-1/4 md:w-1/3">
				<div
					class="w-10 h-10 md:w-16 md:h-16 bg-surface-elevated rounded-lg overflow-hidden shrink-0 border border-white/5 flex"
				>
					{#if $player.image}
						<img src={$player.image} alt="" class="w-full h-full object-cover" />
					{:else}
						<div
							class="w-full h-full bg-linear-to-br from-primary-container/20 to-black flex items-center justify-center text-lg md:text-2xl"
						>
							🎙️
						</div>
					{/if}
				</div>
				<div class="min-w-0">
					<h4 class="font-semibold truncate text-sm md:text-base">
						{$player.episodeTitle ?? "Select an episode"}
					</h4>
					<p
						class="text-xs md:text-sm text-on-surface-variant truncate"
					>
						{$player.podcastTitle ?? "Velvet Audio"}
					</p>
				</div>
			</div>

			<!-- Controls -->
			<div
				class="flex flex-col items-center gap-1 md:gap-2 w-1/2 md:w-1/3"
			>
				<div class="flex items-center gap-4 md:gap-6">
					<button
						class="text-on-surface-variant hover:text-on-surface transition-colors xs:block"
						onclick={() => audio && (audio.currentTime -= 15)}
						>⟲</button
					>
					<button
						disabled={!$player.audioUrl}
						onclick={() => player.toggle()}
						class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-on-surface text-background hover:scale-110 transition-transform disabled:opacity-50"
					>
						{$player.isPlaying ? "⏸" : "▶"}
					</button>
					<button
						class="text-on-surface-variant hover:text-on-surface transition-colors xs:block"
						onclick={() => audio && (audio.currentTime += 15)}
						>⟳</button
					>
				</div>
				<div class="w-full max-w-md flex items-center gap-2 md:gap-3">
					<span
						class="text-[10px] md:text-xs text-on-surface-variant font-mono"
						>{formatTime(currentTime)}</span
					>
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						onclick={seek}
						onkeydown={handleSeekKeyDown}
						role="slider"
						aria-valuemin={0}
						aria-valuemax={duration}
						aria-valuenow={currentTime}
						tabindex="0"
						aria-label="Seek progress"
						class="flex-1 h-1 bg-white/10 rounded-full group cursor-pointer relative outline-hidden focus:h-1.5 focus:bg-white/20"
					>
						<div
							class="h-full bg-primary-container rounded-full relative group-hover:h-1.5 transition-all"
							style="width: {(currentTime / (duration || 1)) *
								100}%"
						>
							<div
								class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
							></div>
						</div>
					</div>
					<span
						class="text-[10px] md:text-xs text-on-surface-variant font-mono"
						>{formatTime(duration)}</span
					>
				</div>
			</div>

			<!-- Volume/Extra -->
			<div class="flex items-center justify-end gap-3 w-1/4 md:w-1/3">
				<button 
					onclick={() => volume = volume === 0 ? 0.7 : 0}
					class="text-on-surface-variant hover:text-on-surface transition-colors text-sm hidden sm:block"
				>
					{volume > 0.5 ? '🔊' : volume > 0 ? '🔉' : '🔇'}
				</button>
				<div class="w-24 md:w-32 group flex items-center relative h-6">
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						onclick={(e) => {
							const rect = e.currentTarget.getBoundingClientRect();
							volume = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
						}}
						role="slider"
						aria-valuemin={0}
						aria-valuemax={1}
						aria-valuenow={volume}
						tabindex="0"
						aria-label="Volume"
						class="flex-1 h-1 bg-white/10 rounded-full group cursor-pointer relative outline-hidden focus:h-1.5 focus:bg-white/20"
					>
						<div
							class="h-full bg-primary-container rounded-full relative group-hover:h-1.5 transition-all"
							style="width: {volume * 100}%"
						>
							<div
								class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
							></div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	</div>

	<Modal
		isOpen={isUserModalOpen}
		onClose={() => (isUserModalOpen = false)}
		title="Account"
	>
		<div class="space-y-6">
			<div
				class="flex items-center gap-4 p-4 bg-surface-elevated rounded-2xl border border-white/5"
			>
				<div
					class="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center font-bold text-2xl uppercase shadow-xl"
				>
					{user?.username.slice(0, 2)}
				</div>
				<div class="min-w-0">
					<p class="text-xl font-bold truncate">{user?.username}</p>
					<p class="text-sm text-on-surface-variant truncate">
						{user?.email}
					</p>
				</div>
			</div>

			<div class="space-y-2">
				<form method="POST" action="/logout">
					<Button
						type="submit"
						class="w-full bg-error! text-white! hover:bg-error/80! py-3 font-bold uppercase tracking-widest text-xs"
					>
						Logout from Device
					</Button>
				</form>
				<Button
					variant="secondary"
					onclick={() => (isUserModalOpen = false)}
					class="w-full py-3"
				>
					Close
				</Button>
			</div>
		</div>
	</Modal>

	<Modal
		isOpen={isPlaybackModalOpen}
		onClose={() => (isPlaybackModalOpen = false)}
		title="Now Playing"
	>
		<div class="flex flex-col gap-8 py-2">
			<!-- Episode Header -->
			<div class="flex flex-col items-center gap-6">
				<div
					class="w-56 h-56 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-surface-elevated"
				>
					{#if $player.image}
						<img
							src={$player.image}
							alt=""
							class="w-full h-full object-cover"
						/>
					{:else}
						<div
							class="w-full h-full bg-linear-to-br from-primary-container/20 to-black flex items-center justify-center text-7xl"
						>
							🎙️
						</div>
					{/if}
				</div>
				<div class="text-center space-y-1 w-full px-4">
					<h3 class="text-xl font-bold line-clamp-2">
						{$player.episodeTitle}
					</h3>
					<p class="text-on-surface-variant font-medium">
						{$player.podcastTitle}
					</p>
				</div>
			</div>

			<!-- Progress Slider -->
			<div class="space-y-3 px-2">
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					onclick={seek}
					onkeydown={handleSeekKeyDown}
					role="slider"
					aria-valuemin={0}
					aria-valuemax={duration}
					aria-valuenow={currentTime}
					tabindex="0"
					aria-label="Seek progress"
					class="w-full h-2 bg-white/10 rounded-full cursor-pointer relative"
				>
					<div
						class="h-full bg-primary-container rounded-full relative"
						style="width: {(currentTime / (duration || 1)) * 100}%"
					>
						<div
							class="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
						></div>
					</div>
				</div>
				<div
					class="flex justify-between text-xs font-mono text-on-surface-variant"
				>
					<span>{formatTime(currentTime)}</span>
					<span>{formatTime(duration)}</span>
				</div>
			</div>

			<!-- Main Controls -->
			<div class="flex items-center justify-center gap-8">
				<button
					class="text-3xl text-on-surface-variant hover:text-on-surface transition-colors"
					onclick={() => audio && (audio.currentTime -= 15)}
				>
					⟲
				</button>
				<button
					disabled={!$player.audioUrl}
					onclick={() => player.toggle()}
					class="w-16 h-16 flex items-center justify-center rounded-full bg-on-surface text-background hover:scale-105 transition-transform disabled:opacity-50 text-2xl"
				>
					{$player.isPlaying ? "⏸" : "▶"}
				</button>
				<button
					class="text-3xl text-on-surface-variant hover:text-on-surface transition-colors"
					onclick={() => audio && (audio.currentTime += 15)}
				>
					⟳
				</button>
			</div>

			<!-- Volume Control -->
			<div
				class="flex items-center gap-4 px-4 py-4 bg-white/5 rounded-2xl"
			>
				<button
					onclick={() => (volume = volume === 0 ? 0.7 : 0)}
					class="text-on-surface-variant text-xl"
				>
					{volume > 0.5 ? "🔊" : volume > 0 ? "🔉" : "🔇"}
				</button>
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					onclick={(e) => {
						const rect = e.currentTarget.getBoundingClientRect();
						volume = Math.max(
							0,
							Math.min(1, (e.clientX - rect.left) / rect.width),
						);
					}}
					role="slider"
					aria-valuemin={0}
					aria-valuemax={1}
					aria-valuenow={volume}
					tabindex="0"
					aria-label="Volume"
					class="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer relative"
				>
					<div
						class="h-full bg-primary-container rounded-full relative"
						style="width: {volume * 100}%"
					>
						<div
							class="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
						></div>
					</div>
				</div>
			</div>
		</div>
	</Modal>
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>
