<script lang="ts">
	import { Input, Button, PodcastHeader, EpisodeTable, Modal } from "$lib";
	import { enhance } from "$app/forms";
	import { player } from "$lib/player";
	let { data } = $props();

	let searchQuery = $state("");
	let isMenuOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	let isInfoModalOpen = $state(false);
	let deleteConfirmName = $state("");

	let filteredEpisodes = $derived(
		data.episodes.filter((episode) =>
			episode.title.toLowerCase().includes(searchQuery.toLowerCase()),
		),
	);

	let isSyncing = $state(false);

	async function handleSync() {
		isSyncing = true;
		try {
			const response = await fetch(`/library/${data.podcast.id}/sync`, {
				method: "PUT",
			});
			if (response.ok) {
				const result = await response.json();
				alert(result.message);
			} else {
				alert("Failed to sync podcast.");
			}
		} catch (error) {
			alert("An unexpected error occurred while syncing the podcast.");
		} finally {
			isSyncing = false;
		}
	}

	let isNameMatch = $derived(deleteConfirmName === data.podcast.name);
</script>

<div class="p-8 max-w-7xl mx-auto pb-24 overflow-hidden">
	<PodcastHeader
		name={data.podcast.name}
		rssUrl={data.podcast.rssUrl}
		image={data.podcast.image}
		episodeCount={data.episodes.length}
	/>

	<!-- Action Bar -->
	<div class="flex flex-col lg:flex-row gap-4 mb-8">
		<div class="flex gap-4">
			<Button
				variant="play"
				onclick={() => {
					if (data.episodes.length > 0) {
						player.play(data.episodes[0], {
							name: data.podcast.name,
							image: data.podcast.image,
						});
					}
				}}
			>
				▶
			</Button>

			<div class="relative">
				<Button
					variant="icon"
					onclick={() => (isMenuOpen = !isMenuOpen)}
				>
					<span class="text-xl">⋮</span>
				</Button>

				{#if isMenuOpen}
					<div
						class="absolute top-full left-0 mt-2 w-48 bg-surface border border-white/10 rounded-xl shadow-2xl z-10 py-2"
					>
						<button
							onclick={() => {
								isInfoModalOpen = true;
								isMenuOpen = false;
							}}
							class="w-full text-left px-4 py-2 text-on-surface hover:bg-white/5 transition-colors flex items-center gap-2"
						>
							<span>ℹ️</span>
							Information
						</button>
						<button
							onclick={() => {
								isDeleteModalOpen = true;
								isMenuOpen = false;
							}}
							class="w-full text-left px-4 py-2 text-error hover:bg-error/10 transition-colors flex items-center gap-2"
						>
							<span>🗑️</span>
							Delete Podcast
						</button>
					</div>
				{/if}
			</div>
		</div>

		<div class="flex-1 flex items-center gap-4">
			<Input bind:value={searchQuery} placeholder="Search episodes..." />

			<Button
				variant={isSyncing ? "secondary" : "primary"}
				class="ml-auto"
				onclick={handleSync}
				disabled={isSyncing}
			>
				<span class="text-xl">{isSyncing ? "Syncing..." : "Sync"}</span>
			</Button>
		</div>
	</div>

	<!-- Episodes List -->
	<EpisodeTable episodes={filteredEpisodes} podcastName={data.podcast.name} podcastImage={data.podcast.image} />

	{#if data.episodes.length === 0}
		<div class="py-20 text-center text-on-surface-variant">
			<p>No episodes have been scanned or downloaded yet.</p>
			<button
				class="mt-4 text-primary hover:underline font-bold uppercase tracking-widest text-xs"
			>
				Scan Now
			</button>
		</div>
	{/if}
</div>

<!-- Information Modal -->
<Modal
	isOpen={isInfoModalOpen}
	onClose={() => (isInfoModalOpen = false)}
	title="Podcast Information"
>
	<div class="space-y-6">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<p
					class="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1"
				>
					Title
				</p>
				<p class="text-on-surface font-semibold">{data.podcast.name}</p>
			</div>
			<div>
				<p
					class="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1"
				>
					Max Downloaded
				</p>
				<p class="text-on-surface font-semibold">
					{data.podcast.maxDownloaded} Episodes
				</p>
			</div>
		</div>

		<div>
			<p
				class="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1"
			>
				RSS Feed URL
			</p>
			<p
				class="text-on-surface font-mono text-sm break-all p-3 bg-black/20 rounded-lg border border-white/5"
			>
				{data.podcast.rssUrl}
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<p
					class="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1"
				>
					Next Sync Scheduled
				</p>
				<p class="text-on-surface">
					{new Date(data.podcast.nextRunAt).toLocaleString(
						undefined,
						{
							dateStyle: "medium",
							timeStyle: "short",
						},
					)}
				</p>
			</div>
			<div>
				<p
					class="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1"
				>
					Library Stats
				</p>
				<p class="text-on-surface">
					{data.episodes.length} Total Episodes
				</p>
			</div>
		</div>

		<div class="pt-4 border-t border-white/5">
			<Button
				variant="secondary"
				onclick={() => (isInfoModalOpen = false)}
				class="w-full"
			>
				Close
			</Button>
		</div>
	</div>
</Modal>

<!-- Delete Modal -->
<Modal
	isOpen={isDeleteModalOpen}
	onClose={() => {
		isDeleteModalOpen = false;
		deleteConfirmName = "";
	}}
	title="Delete Podcast"
	description={`Are you sure you want to delete "${data.podcast.name}"? This will remove all episodes and cannot be undone.`}
>
	<form method="POST" action="?/delete" use:enhance class="space-y-6">
		<div class="space-y-2">
			<p
				class="text-xs font-bold uppercase tracking-widest text-on-surface-variant"
			>
				Type <span class="text-on-surface select-all font-mono"
					>{data.podcast.name}</span
				> to confirm
			</p>
			<Input
				bind:value={deleteConfirmName}
				placeholder="Confirm podcast name"
				required
			/>
		</div>

		<div class="flex items-center gap-3">
			<Button
				variant="secondary"
				onclick={() => {
					isDeleteModalOpen = false;
					deleteConfirmName = "";
				}}
				class="flex-1"
			>
				Cancel
			</Button>
			<Button
				type="submit"
				disabled={!isNameMatch}
				class="flex-1 bg-error! text-white! shadow-error/20!"
			>
				Delete Permanently
			</Button>
		</div>
	</form>
</Modal>
