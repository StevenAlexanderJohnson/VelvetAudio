<script lang="ts">
	import { player } from "$lib/player.svelte";

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

<footer
	class="h-[96px] bg-surface border-t border-white/5 px-4 md:px-6 hidden md:flex items-center justify-between z-20"
>
	<!-- Current Episode -->
	<div class="flex items-center gap-3 md:gap-4 w-1/4 md:w-1/3">
		<div
			class="w-10 h-10 md:w-16 md:h-16 bg-surface-elevated rounded-lg overflow-hidden shrink-0 border border-white/5 flex"
		>
			{#if player.image}
				<img
					src={player.image}
					alt=""
					class="w-full h-full object-cover"
				/>
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
				{player.episodeTitle ?? "Select an episode"}
			</h4>
			<p
				class="text-xs md:text-sm text-on-surface-variant truncate"
			>
				{player.podcastTitle ?? "Velvet Audio"}
			</p>
		</div>
	</div>

	<!-- Controls -->
	<div
		class="flex flex-col items-center gap-1 md:gap-2 w-1/2 md:w-1/3"
	>
		<div class="flex items-center gap-4 md:gap-6">
			<button
				class="text-on-surface-variant hover:text-on-surface transition-colors"
				onclick={() => player.skip(-15)}
				>⟲</button
			>
			<button
				disabled={!player.audioUrl}
				onclick={() => player.toggle()}
				class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-on-surface text-background hover:scale-110 transition-transform disabled:opacity-50"
			>
				{player.isPlaying ? "⏸" : "▶"}
			</button>
			<button
				class="text-on-surface-variant hover:text-on-surface transition-colors"
				onclick={() => player.skip(15)}
				>⟳</button
			>
		</div>
		<div class="w-full max-w-md flex items-center gap-2 md:gap-3">
			<span
				class="text-[10px] md:text-xs text-on-surface-variant font-mono"
				>{formatTime(player.currentTime)}</span
			>
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
				class="flex-1 h-1 bg-white/10 rounded-full group cursor-pointer relative outline-hidden focus:h-1.5 focus:bg-white/20"
			>
				<div
					class="h-full bg-primary-container rounded-full relative group-hover:h-1.5 transition-all"
					style="width: {(player.currentTime / (player.duration || 1)) *
						100}%"
				>
					<div
						class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
					></div>
				</div>
			</div>
			<span
				class="text-[10px] md:text-xs text-on-surface-variant font-mono"
				>{formatTime(player.duration)}</span
			>
		</div>
	</div>

	<!-- Volume/Extra -->
	<div class="flex items-center justify-end gap-3 w-1/4 md:w-1/3">
		<button
			onclick={() => player.setVolume(player.volume === 0 ? 0.7 : 0)}
			class="text-on-surface-variant hover:text-on-surface transition-colors text-sm hidden sm:block"
		>
			{player.volume > 0.5 ? "🔊" : player.volume > 0 ? "🔉" : "🔇"}
		</button>
		<div class="w-24 md:w-32 group flex items-center relative h-6">
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
				class="flex-1 h-1 bg-white/10 rounded-full group cursor-pointer relative outline-hidden focus:h-1.5 focus:bg-white/20"
			>
				<div
					class="h-full bg-primary-container rounded-full relative group-hover:h-1.5 transition-all"
					style="width: {player.volume * 100}%"
				>
					<div
						class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
					></div>
				</div>
			</div>
		</div>
	</div>
</footer>
