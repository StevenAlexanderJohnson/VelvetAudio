<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Input } from '$lib';

	let { data, form } = $props();
	let viewMode = $state<'grid' | 'list'>('grid');
	let isScanning = $state(false);
	let isAddModalOpen = $state(false);
	let isSubmitting = $state(false);
	let rssUrl = $state("");

	async function handleScan() {
		isScanning = true;
		try {
			const res = await fetch('/api/rss/scan');
			const result = await res.json();
			alert(result.message);
			await invalidateAll();
		} catch (e) {
			alert('Scan failed: ' + e);
		} finally {
			isScanning = false;
		}
	}
</script>

<div class="p-8 max-w-7xl mx-auto">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-4xl font-bold mb-2">Library</h1>
			<p class="text-on-surface-variant">Manage your subscribed podcasts and downloads.</p>
		</div>

		<div class="flex items-center gap-4">
			<button 
				onclick={() => isAddModalOpen = true}
				class="px-6 py-2.5 rounded-lg bg-surface-elevated border border-white/10 text-on-surface font-bold hover:bg-white/10 transition-all flex items-center gap-2"
			>
				<span class="text-xl">+</span>
				Add Podcast
			</button>

			<div class="flex bg-surface rounded-lg p-1 border border-white/5">
				<button 
					onclick={() => viewMode = 'grid'}
					class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors {viewMode === 'grid' ? 'bg-surface-elevated text-primary' : 'text-on-surface-variant hover:text-on-surface'}"
				>
					Grid
				</button>
				<button 
					onclick={() => viewMode = 'list'}
					class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors {viewMode === 'list' ? 'bg-surface-elevated text-primary' : 'text-on-surface-variant hover:text-on-surface'}"
				>
					List
				</button>
			</div>

			<button 
				onclick={handleScan}
				disabled={isScanning}
				class="px-6 py-2.5 rounded-lg bg-primary-container text-white font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2 shadow-lg shadow-primary-container/20"
			>
				{#if isScanning}
					<span class="animate-spin text-lg">↻</span>
					Scanning...
				{:else}
					<span>Scan Feeds</span>
				{/if}
			</button>
		</div>
	</div>

	{#if data.podcasts.length === 0}
		<div class="flex flex-col items-center justify-center py-24 bg-surface rounded-2xl border border-dashed border-white/10 text-center">
			<div class="w-20 h-20 bg-surface-elevated rounded-full flex items-center justify-center text-4xl mb-6 text-on-surface-variant/30">
				🎙️
			</div>
			<h2 class="text-2xl font-bold mb-2">No podcasts found</h2>
			<p class="text-on-surface-variant max-w-sm mb-8">You haven't added any RSS feeds yet. Start by adding a new podcast to your library.</p>
			<button 
				onclick={() => isAddModalOpen = true}
				class="px-8 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-semibold"
			>
				Add First Podcast
			</button>
			</div>
		{:else if viewMode === 'grid'}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each data.podcasts as pod}
				<a 
					href="/library/{pod.id}"
					class="group bg-surface rounded-2xl overflow-hidden border border-white/5 hover:bg-surface-elevated transition-all duration-300 hover:scale-[1.02] cursor-pointer"
				>
					<div class="aspect-square bg-linear-to-br from-primary-container/20 to-black relative">
						<div class="absolute inset-0 flex items-center justify-center text-6xl opacity-20 group-hover:opacity-40 transition-opacity">
							📻
						</div>
					</div>
					<div class="p-5">
						<h3 class="font-bold text-lg truncate mb-1">{pod.name}</h3>
						<p class="text-sm text-on-surface-variant truncate mb-4">{pod.rssUrl}</p>
						<div class="flex items-center justify-between text-xs text-on-surface-variant font-mono uppercase tracking-wider">
							<span>Max: {pod.maxDownloaded}</span>
							<span>Next: {new Date(pod.nextRunAt).toLocaleDateString()}</span>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div class="bg-surface rounded-2xl border border-white/5 overflow-hidden">
			<table class="w-full text-left">
				<thead>
					<tr class="border-b border-white/5 text-on-surface-variant text-xs font-bold uppercase tracking-widest">
						<th class="px-6 py-4">Podcast</th>
						<th class="px-6 py-4">RSS URL</th>
						<th class="px-6 py-4">Max Downloads</th>
						<th class="px-6 py-4">Next Scan</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-white/5">
					{#each data.podcasts as pod}
						<tr 
							onclick={() => window.location.href = `/library/${pod.id}`}
							class="hover:bg-white/5 transition-colors cursor-pointer group"
						>
							<td class="px-6 py-4">
								<div class="flex items-center gap-3">
									<div class="w-10 h-10 rounded bg-surface-elevated shrink-0"></div>
									<span class="font-bold group-hover:text-primary transition-colors">{pod.name}</span>
								</div>
							</td>
							<td class="px-6 py-4 text-on-surface-variant text-sm font-mono truncate max-w-xs">{pod.rssUrl}</td>
							<td class="px-6 py-4 text-on-surface-variant">{pod.maxDownloaded}</td>
							<td class="px-6 py-4 text-on-surface-variant text-sm">{new Date(pod.nextRunAt).toLocaleDateString()}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

{#if isAddModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-6">
		<!-- Backdrop -->
		<button 
			class="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-default" 
			onclick={() => isAddModalOpen = false}
			aria-label="Close modal"
		></button>
		
		<!-- Modal Content -->
		<div class="relative w-full max-w-lg bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
			<div class="p-8">
				<h2 class="text-2xl font-bold mb-2">Add New Podcast</h2>
				<p class="text-on-surface-variant mb-6 text-sm">Enter the RSS feed URL of the podcast you'd like to subscribe to.</p>
				
				<form 
					method="POST" 
					action="?/add" 
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result }) => {
							isSubmitting = false;
							if (result.type === 'success') {
								isAddModalOpen = false;
								rssUrl = "";
								invalidateAll();
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

					{#if form?.message}
						<div class="p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
							{form.message}
						</div>
					{/if}

					<div class="flex items-center gap-3 pt-2">
						<button 
							type="button" 
							onclick={() => isAddModalOpen = false}
							class="flex-1 px-6 py-3 rounded-xl hover:bg-white/5 transition-colors font-semibold text-on-surface-variant"
						>
							Cancel
						</button>
						<button 
							type="submit" 
							disabled={isSubmitting}
							class="flex-1 px-6 py-3 rounded-xl bg-primary-container text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
						>
							{isSubmitting ? 'Subscribing...' : 'Subscribe'}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
