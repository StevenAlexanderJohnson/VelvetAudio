<script lang="ts">
	import DownloadSVG from "$lib/assets/download.svelte";
	import InfoSVG from "$lib/assets/info.svelte";
	import LockSVG from "$lib/assets/lock.svelte";
	import type { episodes as episodesSchema } from "$lib/server/db/schema";
	import { player } from "$lib/player";
	import { invalidateAll } from "$app/navigation";
	import { Modal, Button } from "$lib";

	type Episode = typeof episodesSchema.$inferSelect;

	interface Props {
		episodes: Episode[];
		podcastName: string;
		podcastImage?: string | null;
	}

	let { episodes, podcastName, podcastImage }: Props = $props();

	// Modal & Progress States
	let isDownloadModalOpen = $state(false);
	let progressStage = $state<"downloading" | "success" | "error">(
		"downloading",
	);
	let progressMessage = $state("");
	let downloadProgress = $state({ current: 0, total: 0, episode: "" });
	let errorMessage = $state("");

	function handlePlay(episode: Episode) {
		player.play(episode, { name: podcastName, image: podcastImage });
	}

	function handleKeyDown(e: KeyboardEvent, episode: Episode) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			handlePlay(episode);
		}
	}

	async function toggleLock(episode: Episode) {
		try {
			const response = await fetch(`/api/episodes/${episode.id}/lock`, {
				method: "PATCH",
			});
			if (response.ok) {
				await invalidateAll();
			} else {
				alert("Failed to toggle lock status");
			}
		} catch (err) {
			console.error("Error toggling lock:", err);
		}
	}

	function startSSE(requestId: string) {
		const eventSource = new EventSource(
			`/api/rss/progress?id=${requestId}`,
		);

		eventSource.onmessage = (event) => {
			const data = JSON.parse(event.data);

			if (data.type === "downloading") {
				progressStage = "downloading";
				downloadProgress = {
					current: data.current,
					total: data.total,
					episode: data.episode,
				};
			} else if (data.type === "success") {
				progressStage = "success";
				progressMessage = data.message;
				eventSource.close();
				invalidateAll();
			} else if (data.type === "error") {
				progressStage = "error";
				errorMessage = data.message;
				eventSource.close();
			}
		};

		eventSource.onerror = () => {
			if (progressStage !== "success" && progressStage !== "error") {
				progressStage = "error";
				errorMessage = "Lost connection to server progress updates.";
			}
			eventSource.close();
		};
	}

	async function handleDownload(episode: Episode) {
		const requestId = crypto.randomUUID();
		isDownloadModalOpen = true;
		progressStage = "downloading";
		downloadProgress = { current: 0, total: 1, episode: episode.title };

		startSSE(requestId);

		try {
			const response = await fetch(
				`/api/episodes/${episode.id}/download?requestId=${requestId}`,
				{
					method: "POST",
				},
			);

			if (!response.ok) {
				const err = await response.json();
				progressStage = "error";
				errorMessage = err.message || "Failed to download episode.";
			}
		} catch (err) {
			console.error("Error downloading episode:", err);
			progressStage = "error";
			errorMessage = "An unexpected error occurred.";
		}
	}

	function resetModal() {
		isDownloadModalOpen = false;
		progressStage = "downloading";
		errorMessage = "";
		progressMessage = "";
	}
</script>

<div class="bg-surface rounded-3xl border border-white/5 overflow-hidden">
	<div class="overflow-x-auto">
		<table class="w-full text-left border-collapse">
			<thead>
				<tr
					class="border-b border-white/5 text-on-surface-variant text-xs font-bold uppercase tracking-widest"
				>
					<th class="px-8 py-5 w-16">#</th>
					<th class="px-8 py-5">Title</th>
					<th class="px-8 py-5">Release Date</th>
					<th class="px-8 py-5 text-right">Status</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-white/5">
				{#each episodes as episode, i}
					{@const isCurrent = $player.audioUrl === episode.audioUrl}
					<tr
						onclick={() => handlePlay(episode)}
						onkeydown={(e) => handleKeyDown(e, episode)}
						role="button"
						tabindex="0"
						aria-label="Play {episode.title}"
						class="hover:bg-white/5 transition-colors group cursor-pointer {isCurrent
							? 'bg-white/5'
							: ''} outline-hidden focus:bg-white/10"
					>
						<td class="px-8 py-5 text-on-surface-variant font-mono">
							<span
								class={isCurrent
									? "hidden"
									: "group-hover:hidden"}>{i + 1}</span
							>
							<span
								class={isCurrent
									? "text-primary"
									: "hidden group-hover:block text-primary"}
							>
								{$player.isPlaying && isCurrent ? "⏸" : "▶"}
							</span>
						</td>
						<td class="px-8 py-5">
							<div class="flex items-center gap-4">
								{#if episode.image}
									<img
										src={episode.image}
										alt={episode.title}
										class="w-10 h-10 rounded-lg object-cover bg-surface-elevated shrink-0"
										loading="lazy"
									/>
								{/if}
								<div class="flex flex-col min-w-0">
									<div class="flex items-center gap-2">
										<span
											class="font-bold truncate transition-colors {isCurrent
												? 'text-primary'
												: 'text-on-surface group-hover:text-primary'}"
										>
											{episode.title}
										</span>
										{#if episode.exemptCleanup}
											<span
												class="text-primary"
												title="Exempt from cleanup"
											>
												<div class="w-3.5 h-3.5">
													<LockSVG />
												</div>
											</span>
										{/if}
									</div>
									<span
										class="text-xs text-on-surface-variant mt-1"
										>GUID: {episode.guid.slice(
											0,
											8,
										)}...</span
									>
								</div>
							</div>
						</td>
						<td class="px-8 py-5 text-on-surface-variant text-sm">
							{new Date(episode.pubDate).toLocaleDateString(
								undefined,
								{
									year: "numeric",
									month: "short",
									day: "numeric",
								},
							)}
						</td>
						<td class="px-8 py-5 text-right">
							<div class="flex justify-end items-center gap-2">
								{#if episode.downloadedDate}
									<button
										title="Toggle Lock"
										class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors {episode.exemptCleanup
											? 'text-primary'
											: 'text-on-surface-variant'}"
										onclick={(e) => {
											e.stopPropagation();
											toggleLock(episode);
										}}
									>
										<LockSVG />
									</button>
									<button
										title={`Downloaded on "${new Date(
											episode.downloadedDate,
										).toLocaleDateString()}"`}
										aria-label="Download Info"
										class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-on-surface-variant transition-colors"
										onclick={(e) => e.stopPropagation()}
									>
										<InfoSVG />
									</button>
								{:else}
									<button
										title="Download manually (locks from cleanup)"
										class="w-8 h-8 p-2 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-colors"
										onclick={(e) => {
											e.stopPropagation();
											handleDownload(episode);
										}}
									>
										<DownloadSVG />
									</button>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<Modal
	isOpen={isDownloadModalOpen}
	onClose={resetModal}
	title="Downloading Episode"
>
	{#if progressStage === "downloading"}
		<div class="py-8">
			<div class="flex justify-between items-end mb-4">
				<div class="flex-1 min-w-0 mr-4">
					<h3 class="text-xl font-bold mb-1">Downloading...</h3>
					<p class="text-sm text-on-surface-variant truncate">
						{downloadProgress.episode}
					</p>
				</div>
			</div>

			<div
				class="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5"
			>
				<div
					class="h-full bg-primary-container animate-pulse"
					style="width: 100%"
				></div>
			</div>

			<p
				class="mt-6 text-center text-xs text-on-surface-variant uppercase tracking-widest font-bold"
			>
				Please keep this window open
			</p>
		</div>
	{:else if progressStage === "success"}
		<div class="py-8 text-center">
			<div
				class="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
			>
				✓
			</div>
			<h3 class="text-2xl font-bold mb-2">Download Complete!</h3>
			<p class="text-on-surface-variant mb-8">{progressMessage}</p>
			<Button variant="secondary" onclick={resetModal} class="w-full">
				Close
			</Button>
		</div>
	{:else if progressStage === "error"}
		<div class="py-8 text-center">
			<div
				class="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
			>
				!
			</div>
			<h3 class="text-2xl font-bold mb-2">Download Failed</h3>
			<p class="text-on-surface-variant mb-8">{errorMessage}</p>
			<Button variant="primary" onclick={resetModal} class="w-full">
				Close
			</Button>
		</div>
	{/if}
</Modal>
