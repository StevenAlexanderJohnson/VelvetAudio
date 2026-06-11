<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import { page } from "$app/state";
	import { player } from "$lib/player";
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

	// Audio state management
	let audio = $state<HTMLAudioElement | null>(null);
	let currentTime = $state(0);
	let duration = $state(0);
	let volume = $state(0.5);
	let lastSyncedTime = 0;

	$effect(() => {
		if (audio) {
			audio.volume = volume;
		}
	});

	let currentEpisodeId = $state<number | null>(null);
	let shouldResume = false;

	$effect(() => {
		if ($player.audioUrl && audio) {
			if (currentEpisodeId !== $player.episodeId) {
				currentEpisodeId = $player.episodeId;
				shouldResume = true;
			}

			if ($player.isPlaying) {
				audio.play().catch(() => {
					player.toggle(); // Revert state if browser blocks autoplay
				});
			} else {
				audio.pause();
			}
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
					handleSkip(5);
					break;
				case "ArrowLeft":
					handleSkip(-5);
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
		});
	}

	async function handleTimeUpdate() {
		if (!audio) return;
		
		currentTime = audio.currentTime;

		// Sync every 5 seconds, or if significantly skipped, or if near end
		const isSignificantSkip = Math.abs(currentTime - lastSyncedTime) > 5;
		const isNearEnd = currentTime / duration > 0.9;
		const shouldSync = isSignificantSkip || (currentTime % 5 < 0.3 && Math.abs(currentTime - lastSyncedTime) > 1);

		if ($player.episodeId && $player.podcastId && (isSignificantSkip || shouldSync)) {
			lastSyncedTime = currentTime;
			try {
				await fetch(
					`/library/${$player.podcastId}/episodes/${$player.episodeId}`,
					{
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							currentTime: currentTime,
							completed: isNearEnd,
						}),
					},
				);
			} catch (err) {
				console.error("Failed to sync progress:", err);
			}
		}
	}

	function handleLoadedMetadata() {
		if (audio) {
			duration = audio.duration;
			if (shouldResume && $player.resumeTime) {
				audio.currentTime = $player.resumeTime;
				currentTime = $player.resumeTime;
				lastSyncedTime = $player.resumeTime;
				shouldResume = false;
			}
		}
	}

	function handleSkip(seconds: number) {
		if (!audio) return;
		audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
	}

	function handleSeek(e: MouseEvent) {
		if (!audio || !duration) return;
		const div = e.currentTarget as HTMLDivElement;
		const rect = div.getBoundingClientRect();
		const percent = (e.clientX - rect.left) / rect.width;
		audio.currentTime = percent * duration;
	}

	function handleSeekKeyDown(e: KeyboardEvent) {
		if (!audio || !duration) return;
		if (e.key === "ArrowRight") {
			handleSkip(5);
		} else if (e.key === "ArrowLeft") {
			handleSkip(-5);
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
		{#if $player.audioUrl}
			<button
				onclick={() => (isPlaybackModalOpen = true)}
				class="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-primary shadow-2xl border-2 border-white/20 overflow-hidden flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-primary/40"
			>
				{#if $player.image}
					<img
						src={$player.image}
						alt=""
						class="w-full h-full object-cover"
					/>
				{:else}
					🎙️
				{/if}
			</button>
		{/if}

		<PlaybackBar 
			currentTime={currentTime}
			duration={duration}
			volume={volume}
			onSeek={handleSeek}
			onSeekKeyDown={handleSeekKeyDown}
			onVolumeChange={(v) => volume = v}
			onSkip={handleSkip}
		/>
	</div>

	<UserModal 
		isOpen={isUserModalOpen} 
		onClose={() => isUserModalOpen = false} 
		user={user!}
	/>

	<PlaybackModal 
		isOpen={isPlaybackModalOpen} 
		onClose={() => isPlaybackModalOpen = false}
		currentTime={currentTime}
		duration={duration}
		volume={volume}
		onSeek={handleSeek}
		onSeekKeyDown={handleSeekKeyDown}
		onVolumeChange={(v) => volume = v}
		onSkip={handleSkip}
	/>
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>
