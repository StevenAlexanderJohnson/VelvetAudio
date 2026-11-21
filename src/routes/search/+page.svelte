<script lang="ts">
	import { refreshAll } from "$app/navigation";
	import { enhance } from "$app/forms";
	import { Input, Button, Modal } from "#lib";

	let { data } = $props();

	interface ItunesPodcast {
		collectionId: number;
		collectionName: string;
		artistName: string;
		feedUrl: string;
		artworkUrl600?: string;
		artworkUrl100?: string;
		primaryGenreName?: string;
		genres?: string[];
		trackCount?: number;
		collectionViewUrl?: string;
	}

	let searchQuery = $state("");
	let results = $state<ItunesPodcast[]>([]);
	let isSearching = $state(false);
	let hasSearched = $state(false);
	let searchError = $state("");

	// Selected podcast modal state
	let selectedPodcast = $state<ItunesPodcast | null>(null);
	let selectedDescription = $state<string | null>(null);
	let isLoadingDescription = $state(false);

	// Subscription progress state (matches manual upload flow)
	type ProgressStage =
		| "details"
		| "scanning"
		| "downloading"
		| "success"
		| "error";
	let progressStage = $state<ProgressStage>("details");
	let isSubmitting = $state(false);
	let progressMessage = $state("");
	let downloadProgress = $state({ current: 0, total: 0, episode: "" });
	let errorMessage = $state("");
	let newPodcastId = $state<number | null>(null);

	let searchTimeout: ReturnType<typeof setTimeout>;

	function handleSearchInput() {
		clearTimeout(searchTimeout);
		if (!searchQuery.trim()) {
			results = [];
			hasSearched = false;
			searchError = "";
			return;
		}
		searchTimeout = setTimeout(() => {
			performSearch();
		}, 350);
	}

	async function performSearch(e?: SubmitEvent) {
		e?.preventDefault();
		clearTimeout(searchTimeout);

		const term = searchQuery.trim();
		if (!term) return;

		isSearching = true;
		searchError = "";
		hasSearched = true;

		try {
			const res = await fetch(
				`https://itunes.apple.com/search?media=podcast&entity=podcast&term=${encodeURIComponent(term)}&limit=24`,
			);
			if (!res.ok) throw new Error("Failed to reach iTunes Search API");
			const json = await res.json();
			results = (json.results || []).filter(
				(item: ItunesPodcast) => !!item.feedUrl,
			);
		} catch (err: any) {
			console.error("iTunes search error:", err);
			searchError = err.message || "Failed to search podcasts.";
		} finally {
			isSearching = false;
		}
	}

	function findExistingPodcast(feedUrl: string) {
		return data.podcasts.find(
			(p) => p.rssUrl.toLowerCase() === feedUrl.toLowerCase(),
		);
	}

	async function openPodcastModal(pod: ItunesPodcast) {
		selectedPodcast = pod;
		progressStage = "details";
		selectedDescription = null;
		progressMessage = "";
		errorMessage = "";
		newPodcastId = null;
		downloadProgress = { current: 0, total: 0, episode: "" };

		if (pod.collectionViewUrl) {
			isLoadingDescription = true;
			try {
				const res = await fetch(
					`/api/search/description?url=${encodeURIComponent(pod.collectionViewUrl)}`,
				);
				if (res.ok) {
					const json = await res.json();
					if (selectedPodcast?.collectionId === pod.collectionId) {
						selectedDescription = json.description;
					}
				}
			} catch {
				// Ignore description fetch failures
			} finally {
				if (selectedPodcast?.collectionId === pod.collectionId) {
					isLoadingDescription = false;
				}
			}
		}
	}

	function closeModal() {
		selectedPodcast = null;
		selectedDescription = null;
		isLoadingDescription = false;
		progressStage = "details";
		progressMessage = "";
		errorMessage = "";
		newPodcastId = null;
		downloadProgress = { current: 0, total: 0, episode: "" };
	}

	function startSSE(requestId: string) {
		const eventSource = new EventSource(
			`/api/rss/progress?id=${requestId}`,
		);

		eventSource.onmessage = (event) => {
			const data = JSON.parse(event.data);

			if (data.type === "scanning") {
				progressStage = "scanning";
				progressMessage = data.message;
			} else if (data.type === "found_episodes") {
				progressMessage = `Found ${data.count} episodes. Starting downloads...`;
			} else if (data.type === "downloading") {
				progressStage = "downloading";
				downloadProgress = {
					current: data.current,
					total: data.total,
					episode: data.episode,
				};
			} else if (data.type === "success") {
				progressStage = "success";
				progressMessage = data.message;
				newPodcastId = data.podcastId;
				eventSource.close();
				refreshAll();
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
</script>

<div class="p-8 max-w-7xl mx-auto pb-24">
	<div class="mb-8">
		<h1 class="text-4xl font-bold mb-2">Search</h1>
		<p class="text-on-surface-variant">
			Discover and subscribe to podcasts from the global directory.
		</p>
	</div>

	<form onsubmit={performSearch} class="mb-8 flex gap-3">
		<div class="flex-1">
			<Input
				type="search"
				placeholder="Search for podcasts by title, host, or topic..."
				bind:value={searchQuery}
				oninput={handleSearchInput}
			/>
		</div>
		<Button type="submit" disabled={isSearching || !searchQuery.trim()}>
			{isSearching ? "Searching..." : "Search"}
		</Button>
	</form>

	{#if isSearching && results.length === 0}
		<div class="py-24 flex flex-col items-center justify-center text-center">
			<div
				class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"
			></div>
			<p class="text-on-surface-variant">Searching directory...</p>
		</div>
	{:else if searchError}
		<div
			class="p-6 rounded-2xl bg-error/10 border border-error/20 text-error text-center"
		>
			{searchError}
		</div>
	{:else if hasSearched && results.length === 0}
		<div
			class="py-20 text-center bg-surface rounded-3xl border border-dashed border-white/10"
		>
			<p class="text-on-surface-variant">
				No podcasts found matching "{searchQuery}".
			</p>
		</div>
	{:else if results.length > 0}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each results as pod (pod.collectionId)}
				{@const existing = findExistingPodcast(pod.feedUrl)}
				<button
					type="button"
					onclick={() => openPodcastModal(pod)}
					class="group text-left w-full bg-surface rounded-[24px] overflow-hidden border border-white/5 transition-all duration-300 hover:bg-surface-elevated hover:scale-[1.02] cursor-pointer flex flex-col"
				>
					<div
						class="aspect-square w-full relative overflow-hidden bg-linear-to-br from-primary-container/20 to-black"
					>
						{#if pod.artworkUrl600 || pod.artworkUrl100}
							<img
								src={pod.artworkUrl600 || pod.artworkUrl100}
								alt={pod.collectionName}
								class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
								loading="lazy"
							/>
						{:else}
							<div
								class="absolute inset-0 flex items-center justify-center text-6xl opacity-20"
							>
								🎙️
							</div>
						{/if}

						{#if existing}
							<div
								class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-primary text-background text-[10px] font-bold uppercase tracking-widest shadow-lg"
							>
								In Library
							</div>
						{/if}
					</div>

					<div class="p-5 space-y-1 flex-1 flex flex-col justify-between w-full">
						<div>
							<h3
								class="font-bold text-lg leading-tight truncate group-hover:text-primary transition-colors"
							>
								{pod.collectionName}
							</h3>
							<p
								class="text-xs text-on-surface-variant uppercase tracking-widest font-bold truncate mt-1"
							>
								{pod.artistName}
							</p>
						</div>

						<div
							class="pt-4 flex items-center justify-between text-[10px] text-on-surface-variant font-bold uppercase tracking-widest"
						>
							<span class="truncate max-w-[60%]"
								>{pod.primaryGenreName || "Podcast"}</span
							>
							{#if pod.trackCount}
								<span>{pod.trackCount} eps</span>
							{/if}
						</div>
					</div>
				</button>
			{/each}
		</div>
	{:else}
		<div
			class="py-24 text-center bg-surface rounded-3xl border border-dashed border-white/10"
		>
			<div
				class="w-20 h-20 bg-surface-elevated rounded-full flex items-center justify-center text-4xl mx-auto mb-6 text-on-surface-variant/30"
			>
				🔍
			</div>
			<h2 class="text-2xl font-bold mb-2">Find your next podcast</h2>
			<p class="text-on-surface-variant max-w-md mx-auto">
				Search above to browse podcasts and add them directly to your library.
			</p>
		</div>
	{/if}
</div>

<Modal
	isOpen={!!selectedPodcast}
	onClose={closeModal}
	title={progressStage === "details"
		? selectedPodcast?.collectionName || "Podcast Details"
		: "Subscribing..."}
>
	{#if selectedPodcast}
		{@const existing = findExistingPodcast(selectedPodcast.feedUrl)}

		{#if progressStage === "details"}
			<div class="space-y-6 mt-4">
				<div class="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
					<div
						class="w-32 h-32 rounded-2xl overflow-hidden shrink-0 bg-surface-elevated border border-white/10 shadow-xl"
					>
						{#if selectedPodcast.artworkUrl600 || selectedPodcast.artworkUrl100}
							<img
								src={selectedPodcast.artworkUrl600 ||
									selectedPodcast.artworkUrl100}
								alt={selectedPodcast.collectionName}
								class="w-full h-full object-cover"
							/>
						{:else}
							<div
								class="w-full h-full flex items-center justify-center text-4xl"
							>
								🎙️
							</div>
						{/if}
					</div>

					<div class="space-y-2 text-center sm:text-left min-w-0 flex-1">
						<p
							class="text-sm font-bold text-primary uppercase tracking-widest"
						>
							{selectedPodcast.artistName}
						</p>
						{#if selectedPodcast.genres && selectedPodcast.genres.length > 0}
							<div class="flex flex-wrap gap-1.5 justify-center sm:justify-start">
								{#each selectedPodcast.genres.filter((g) => g !== "Podcasts") as genre}
									<span
										class="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-on-surface-variant"
									>
										{genre}
									</span>
								{/each}
							</div>
						{/if}
						{#if selectedPodcast.trackCount}
							<p class="text-xs text-on-surface-variant font-mono pt-1">
								{selectedPodcast.trackCount} Episodes
							</p>
						{/if}
					</div>
				</div>

				<div class="bg-black/20 border border-white/5 rounded-xl p-4">
					<h4
						class="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2"
					>
						About
					</h4>
					{#if isLoadingDescription}
						<div class="space-y-2 animate-pulse py-1">
							<div class="h-3 bg-white/10 rounded w-full"></div>
							<div class="h-3 bg-white/10 rounded w-5/6"></div>
							<div class="h-3 bg-white/10 rounded w-4/6"></div>
						</div>
					{:else if selectedDescription}
						<p
							class="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto"
						>
							{selectedDescription}
						</p>
					{:else}
						<p class="text-sm text-on-surface-variant/60 italic">
							No description available from directory.
						</p>
					{/if}
				</div>

				<form
					method="POST"
					action="?/add"
					use:enhance={({ formData }) => {
						const requestId = crypto.randomUUID();
						formData.set("requestId", requestId);
						isSubmitting = true;
						progressStage = "scanning";
						progressMessage = "Connecting to progress stream...";

						startSSE(requestId);

						return async ({ result }) => {
							isSubmitting = false;
							if (result.type === "failure") {
								progressStage = "error";
								errorMessage =
									(result.data?.message as string) ||
									"Failed to add podcast.";
							}
						};
					}}
				>
					<input
						type="hidden"
						name="rssUrl"
						value={selectedPodcast.feedUrl}
					/>

					<div class="flex items-center gap-3 pt-2">
						<Button
							variant="secondary"
							onclick={closeModal}
							class="flex-1"
						>
							Close
						</Button>
						{#if existing}
							<a href="/library/{existing.id}" class="flex-1">
								<Button class="w-full">View in Library</Button>
							</a>
						{:else}
							<Button
								type="submit"
								disabled={isSubmitting}
								class="flex-1"
							>
								{isSubmitting ? "Adding..." : "+ Add Podcast"}
							</Button>
						{/if}
					</div>
				</form>
			</div>
		{:else if progressStage === "scanning"}
			<div class="py-8 flex flex-col items-center text-center">
				<div
					class="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"
				></div>
				<h3 class="text-xl font-bold mb-2">Scanning RSS Feed</h3>
				<p class="text-on-surface-variant">{progressMessage}</p>
			</div>
		{:else if progressStage === "downloading"}
			<div class="py-8">
				<div class="flex justify-between items-end mb-4">
					<div class="flex-1 min-w-0 mr-4">
						<h3 class="text-xl font-bold mb-1">
							Downloading Episodes
						</h3>
						<p class="text-sm text-on-surface-variant truncate">
							{downloadProgress.episode}
						</p>
					</div>
					<span
						class="text-sm font-mono text-primary font-bold whitespace-nowrap"
					>
						{downloadProgress.current} / {downloadProgress.total}
					</span>
				</div>

				<div
					class="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5"
				>
					<div
						class="h-full bg-primary-container transition-all duration-500 ease-out"
						style="width: {(downloadProgress.current /
							downloadProgress.total) *
							100}%"
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
				<h3 class="text-2xl font-bold mb-2">Podcast Added!</h3>
				<p class="text-on-surface-variant mb-8">{progressMessage}</p>

				<div class="flex gap-3">
					<Button
						variant="secondary"
						onclick={closeModal}
						class="flex-1"
					>
						Close
					</Button>
					{#if newPodcastId}
						<a href="/library/{newPodcastId}" class="flex-1">
							<Button class="w-full">View Podcast</Button>
						</a>
					{/if}
				</div>
			</div>
		{:else if progressStage === "error"}
			<div class="py-8 text-center">
				<div
					class="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
				>
					!
				</div>
				<h3 class="text-2xl font-bold mb-2">Something went wrong</h3>
				<p class="text-on-surface-variant mb-8">{errorMessage}</p>
				<Button
					variant="primary"
					onclick={() => (progressStage = "details")}
					class="w-full"
				>
					Try Again
				</Button>
			</div>
		{/if}
	{/if}
</Modal>
