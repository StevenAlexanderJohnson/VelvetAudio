<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { enhance } from "$app/forms";
	import { Input, Button, Modal } from "$lib";

	let { data, form } = $props();
	let searchValue = $state("");
	let viewMode = $state<"grid" | "list">("grid");
	let isScanning = $state(false);

	// Add Modal States
	let isAddModalOpen = $state(false);
	let isSubmitting = $state(false);
	let rssUrl = $state("");

	let filteredPodcasts = $derived(
		data.podcasts.filter((pod) => pod.name.toLowerCase().includes(searchValue.toLowerCase()))
	);

	// Progress States
	type ProgressStage =
		| "input"
		| "scanning"
		| "downloading"
		| "success"
		| "error";
	let progressStage = $state<ProgressStage>("input");
	let progressMessage = $state("");
	let downloadProgress = $state({ current: 0, total: 0, episode: "" });
	let errorMessage = $state("");
	let newPodcastId = $state<number | null>(null);

	async function handleScan() {
		isScanning = true;
		try {
			const res = await fetch("/api/rss/scan");
			const result = await res.json();
			alert(result.message);
			await invalidateAll();
		} catch (e) {
			alert("Scan failed: " + e);
		} finally {
			isScanning = false;
		}
	}

	function resetAddModal() {
		isAddModalOpen = false;
		progressStage = "input";
		rssUrl = "";
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
</script>

<div class="p-8 max-w-7xl mx-auto">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-4xl font-bold mb-2">Library</h1>
			<p class="text-on-surface-variant">
				Manage your subscribed podcasts and downloads.
			</p>
		</div>

		<div class="flex items-center gap-4">
			<Button variant="secondary" onclick={() => (isAddModalOpen = true)}>
				<span class="text-xl">+</span>
				Add Podcast
			</Button>

			<div class="flex bg-surface rounded-lg p-1 border border-white/5">
				<button
					onclick={() => (viewMode = "grid")}
					class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors {viewMode ===
					'grid'
						? 'bg-surface-elevated text-primary'
						: 'text-on-surface-variant hover:text-on-surface'}"
				>
					Grid
				</button>
				<button
					onclick={() => (viewMode = "list")}
					class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors {viewMode ===
					'list'
						? 'bg-surface-elevated text-primary'
						: 'text-on-surface-variant hover:text-on-surface'}"
				>
					List
				</button>
			</div>

			<Button
				variant="primary"
				onclick={handleScan}
				disabled={isScanning}
			>
				{#if isScanning}
					<span class="animate-spin text-lg">↻</span>
					Scanning...
				{:else}
					<span>Scan Feeds</span>
				{/if}
			</Button>
		</div>
	</div>
	<div class="mb-6">
		<Input type="text" placeholder="Search podcasts..." bind:value={searchValue} />
	</div>

	{#if data.podcasts.length === 0}
		<div
			class="flex flex-col items-center justify-center py-24 bg-surface rounded-2xl border border-dashed border-white/10 text-center"
		>
			<div
				class="w-20 h-20 bg-surface-elevated rounded-full flex items-center justify-center text-4xl mb-6 text-on-surface-variant/30"
			>
				🎙️
			</div>
			<h2 class="text-2xl font-bold mb-2">No podcasts found</h2>
			<p class="text-on-surface-variant max-w-sm mb-8">
				You haven't added any RSS feeds yet. Start by adding a new
				podcast to your library.
			</p>
			<Button
				variant="secondary"
				onclick={() => (isAddModalOpen = true)}
				class="px-8 py-3 rounded-xl"
			>
				Add First Podcast
			</Button>
		</div>
	{:else if viewMode === "grid"}
		<div
			class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
		>
			{#each filteredPodcasts as pod}
				<a
					href="/library/{pod.id}"
					class="group bg-surface rounded-2xl overflow-hidden border border-white/5 hover:bg-surface-elevated transition-all duration-300 hover:scale-[1.02] cursor-pointer"
				>
					<div
						class="aspect-square bg-linear-to-br from-primary-container/20 to-black relative"
					>
						<div
							class="absolute inset-0 flex items-center justify-center text-6xl opacity-20 group-hover:opacity-40 transition-opacity"
						>
							📻
						</div>
					</div>
					<div class="p-5">
						<h3 class="font-bold text-lg truncate mb-1">
							{pod.name}
						</h3>
						<p
							class="text-sm text-on-surface-variant truncate mb-4"
						>
							{pod.rssUrl}
						</p>
						<div
							class="flex items-center justify-between text-xs text-on-surface-variant font-mono uppercase tracking-wider"
						>
							<span>Max: {pod.maxDownloaded}</span>
							<span
								>Next: {new Date(
									pod.nextRunAt,
								).toLocaleDateString()}</span
							>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div
			class="bg-surface rounded-2xl border border-white/5 overflow-hidden"
		>
			<table class="w-full text-left">
				<thead>
					<tr
						class="border-b border-white/5 text-on-surface-variant text-xs font-bold uppercase tracking-widest"
					>
						<th class="px-6 py-4">Podcast</th>
						<th class="px-6 py-4">RSS URL</th>
						<th class="px-6 py-4">Max Downloads</th>
						<th class="px-6 py-4">Next Scan</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-white/5">
					{#each data.podcasts as pod}
						<tr
							onclick={() =>
								(window.location.href = `/library/${pod.id}`)}
							class="hover:bg-white/5 transition-colors cursor-pointer group"
						>
							<td class="px-6 py-4">
								<div class="flex items-center gap-3">
									<div
										class="w-10 h-10 rounded bg-surface-elevated shrink-0"
									></div>
									<span
										class="font-bold group-hover:text-primary transition-colors"
										>{pod.name}</span
									>
								</div>
							</td>
							<td
								class="px-6 py-4 text-on-surface-variant text-sm font-mono truncate max-w-xs"
								>{pod.rssUrl}</td
							>
							<td class="px-6 py-4 text-on-surface-variant"
								>{pod.maxDownloaded}</td
							>
							<td
								class="px-6 py-4 text-on-surface-variant text-sm"
								>{new Date(
									pod.nextRunAt,
								).toLocaleDateString()}</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<Modal
	isOpen={isAddModalOpen}
	onClose={resetAddModal}
	title={progressStage === "input" ? "Add New Podcast" : "Subscribing..."}
>
	{#if progressStage === "input"}
		<p class="text-on-surface-variant mb-6 text-sm">
			Enter the RSS feed URL of the podcast you'd like to subscribe to.
		</p>

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
							(result.data?.message as string) || "Failed to add podcast.";
					}
				};
			}}
			class="space-y-6"
		>
			<Input
				bind:value={rssUrl}
				name="rssUrl"
				type="url"
				label="RSS Feed URL"
				placeholder="https://example.com/feed.xml"
				required
			/>

			{#if form?.message && progressStage === "input"}
				<div
					class="p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm"
				>
					{form.message}
				</div>
			{/if}

			<div class="flex items-center gap-3 pt-2">
				<Button
					variant="secondary"
					onclick={resetAddModal}
					class="flex-1"
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting} class="flex-1">
					{isSubmitting ? "Subscribing..." : "Subscribe"}
				</Button>
			</div>
		</form>
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
					<h3 class="text-xl font-bold mb-1">Downloading Episodes</h3>
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
					onclick={resetAddModal}
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
				onclick={() => (progressStage = "input")}
				class="w-full"
			>
				Try Again
			</Button>
		</div>
	{/if}
</Modal>
