<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import { page } from "$app/state";
	import { player } from "$lib/player.svelte";
	import { 
		Sidebar, 
		Header, 
		PlaybackBar, 
		UserModal, 
		PlaybackModal 
	} from "$lib";

	let { children } = $props();

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

	if (typeof window !== "undefined") {
		document.addEventListener("keydown", (e) => {
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			) {
				return; // Don't interfere with typing
			}

			switch (e.code) {
				case "Space":
					e.preventDefault();
					player.toggle();
					break;
				case "ArrowRight":
					player.skip(5);
					break;
				case "ArrowLeft":
					player.skip(-5);
					break;
				case "ArrowUp":
					e.preventDefault();
					player.setVolume(player.volume + 0.05);
					break;
				case "ArrowDown":
					e.preventDefault();
					player.setVolume(player.volume - 0.05);
					break;
				default:
					break;
			}
		});
	}

	let lastSyncedTime = 0;

	// Database progress sync
	$effect(() => {
		const currentTime = player.currentTime;
		const podcastId = player.podcastId;
		const episodeId = player.episodeId;

		// Sync every 5 seconds, or if significantly skipped, or if near end
		const isSignificantSkip = Math.abs(currentTime - lastSyncedTime) > 5;
		const isNearEnd = player.duration > 0 && currentTime / player.duration > 0.9;
		const shouldSync = isSignificantSkip || (currentTime % 5 < 0.3 && Math.abs(currentTime - lastSyncedTime) > 1);

		if (episodeId && podcastId && (isSignificantSkip || shouldSync)) {
			lastSyncedTime = currentTime;
			fetch(`/library/${podcastId}/episodes/${episodeId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					currentTime: currentTime,
					completed: isNearEnd,
				}),
			}).catch(err => console.error("Failed to sync progress:", err));
		}
	});
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

{#if !showChrome}
	{@render children()}
{:else}
	<div class="flex flex-col h-screen bg-background text-on-surface">
		<div class="flex flex-1 w-full overflow-hidden relative">
			<Sidebar 
				isSidebarOpen={isSidebarOpen} 
				onClose={() => isSidebarOpen = false} 
			/>

			<!-- Main Content -->
			<main class="flex-1 flex flex-col min-w-0">
				<Header 
					username={user?.username ?? ""} 
					onOpenSidebar={() => isSidebarOpen = true}
					onOpenUserModal={() => isUserModalOpen = true}
				/>

				<div class="flex-1 overflow-y-auto pb-24 md:pb-[96px]">
					{@render children()}
				</div>
			</main>
		</div>

		<!-- Floating Mobile Player Icon -->
		{#if player.audioUrl}
			<button
				onclick={() => (isPlaybackModalOpen = true)}
				class="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-primary shadow-2xl border-2 border-white/20 overflow-hidden flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-primary/40"
			>
				{#if player.image}
					<img
						src={player.image}
						alt=""
						class="w-full h-full object-cover"
					/>
				{:else}
					🎙️
				{/if}
			</button>
		{/if}

		<PlaybackBar />
	</div>

	<UserModal 
		isOpen={isUserModalOpen} 
		onClose={() => isUserModalOpen = false} 
		user={user!}
	/>

	<PlaybackModal 
		isOpen={isPlaybackModalOpen} 
		onClose={() => isPlaybackModalOpen = false}
	/>
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>
