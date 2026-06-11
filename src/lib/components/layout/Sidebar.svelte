<script lang="ts">
	import logo from "$lib/assets/Velvet Audio Transparent.png";
	import { page } from "$app/state";

	interface Props {
		isSidebarOpen: boolean;
		onClose: () => void;
	}

	let { isSidebarOpen, onClose }: Props = $props();

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
</script>

<!-- Mobile Backdrop -->
{#if isSidebarOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
		onclick={onClose}
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
			onclick={onClose}
		>
			✕
		</button>
	</div>

	<nav class="flex-1 px-4 py-2 space-y-1 relative">
		{#if activeIndex !== -1}
			<div
				class="absolute left-4 right-4 h-12 bg-linear-to-r from-white/10 to-transparent border-l-4 border-primary-container transition-all duration-300 ease-out z-0 pointer-events-none"
				style="transform: translateY({activeIndex * (48 + 4)}px)"
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
			class="relative z-10 flex items-center gap-3 py-3 px-4 transition-colors duration-300 text-on-surface-variant hover:text-on-surface"
		>
			<span>Settings</span>
		</a>
	</div>
</aside>
