<script lang="ts">
	import { Modal, Button } from "$lib";
	import { player } from "$lib/player.svelte";

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	function formatTime(seconds: number) {
		if (isNaN(seconds)) return "0:00";
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}

	function handleVolumeClick(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
		const newVolume = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
		player.setVolume(newVolume);
	}

	function handleSeek(e: MouseEvent) {
		if (!player.duration) return;
		const div = e.currentTarget as HTMLDivElement;
		const rect = div.getBoundingClientRect();
		const percent = (e.clientX - rect.left) / rect.width;
		player.seek(percent * player.duration);
	}

	function handleSeekKeyDown(e: KeyboardEvent) {
		if (e.key === "ArrowRight") {
			player.skip(5);
		} else if (e.key === "ArrowLeft") {
			player.skip(-5);
		}
	}
</script>

<Modal
	isOpen={isOpen}
	onClose={onClose}
	title="Now Playing"
>
	<div class="flex flex-col gap-8 py-2">
		<!-- Episode Header -->
		<div class="flex flex-col items-center gap-6">
			<div
				class="w-56 h-56 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-surface-elevated"
			>
				{#if player.image}
					<img
						src={player.image}
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
					{player.episodeTitle}
				</h3>
				<p class="text-on-surface-variant font-medium">
					{player.podcastTitle}
				</p>
			</div>
		</div>

		<!-- Progress Slider -->
		<div class="space-y-3 px-2">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				onclick={handleSeek}
				onkeydown={handleSeekKeyDown}
				role="slider"
				aria-valuemin={0}
				aria-valuemax={player.duration}
				aria-valuenow={player.currentTime}
				tabindex="0"
				aria-label="Seek progress"
				class="w-full h-2 bg-white/10 rounded-full cursor-pointer relative"
			>
				<div
					class="h-full bg-primary-container rounded-full relative"
					style="width: {(player.currentTime / (player.duration || 1)) * 100}%"
				>
					<div
						class="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
					></div>
				</div>
			</div>
			<div
				class="flex justify-between text-xs font-mono text-on-surface-variant"
			>
				<span>{formatTime(player.currentTime)}</span>
				<span>{formatTime(player.duration)}</span>
			</div>
		</div>

		<!-- Main Controls -->
		<div class="flex items-center justify-center gap-8">
			<button
				class="text-3xl text-on-surface-variant hover:text-on-surface transition-colors"
				onclick={() => player.skip(-15)}
			>
				⟲
			</button>
			<button
				disabled={!player.audioUrl}
				onclick={() => player.toggle()}
				class="w-16 h-16 flex items-center justify-center rounded-full bg-on-surface text-background hover:scale-105 transition-transform disabled:opacity-50 text-2xl"
			>
				{player.isPlaying ? "⏸" : "▶"}
			</button>
			<button
				class="text-3xl text-on-surface-variant hover:text-on-surface transition-colors"
				onclick={() => player.skip(15)}
			>
				⟳
			</button>
		</div>

		<!-- Volume Control -->
		<div
			class="flex items-center gap-4 px-4 py-4 bg-white/5 rounded-2xl"
		>
			<button
				onclick={() => player.setVolume(player.volume === 0 ? 0.7 : 0)}
				class="text-on-surface-variant text-xl"
			>
				{player.volume > 0.5 ? "🔊" : player.volume > 0 ? "🔉" : "🔇"}
			</button>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				onclick={handleVolumeClick}
				role="slider"
				aria-valuemin={0}
				aria-valuemax={1}
				aria-valuenow={player.volume}
				tabindex="0"
				aria-label="Volume"
				class="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer relative"
			>
				<div
					class="h-full bg-primary-container rounded-full relative"
					style="width: {player.volume * 100}%"
				>
					<div
						class="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
					></div>
				</div>
			</div>
		</div>
	</div>
</Modal>
