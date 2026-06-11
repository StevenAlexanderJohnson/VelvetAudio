<script lang="ts">
	interface Props {
		username: string;
		onOpenSidebar: () => void;
		onOpenUserModal: () => void;
	}

	let { username, onOpenSidebar, onOpenUserModal }: Props = $props();
</script>

<header
	class="h-20 flex items-center justify-between px-4 md:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10 border-b border-white/5 md:border-none"
>
	<div class="flex items-center gap-2 md:gap-4">
		<button
			class="md:hidden p-2 hover:bg-white/5 rounded-full"
			aria-label="Open menu"
			onclick={onOpenSidebar}
		>
			<span class="text-2xl">☰</span>
		</button>
		<div class="hidden sm:flex items-center gap-4">
			<button
				class="p-2 hover:bg-white/5 rounded-full transition-opacity cursor-pointer"
				aria-label="Back"
				onclick={() => window.history.back()}>←</button
			>
			<button
				class="p-2 hover:bg-white/5 rounded-full transition-opacity cursor-pointer"
				aria-label="Forward"
				onclick={() => window.history.forward()}
				>→</button
			>
		</div>
	</div>

	<div class="flex items-center gap-3 md:gap-6">
		<div
			class="flex items-center gap-3 md:gap-4 border-l border-white/10 pl-4 md:pl-6"
		>
			<button
				onclick={onOpenUserModal}
				class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary-container border border-white/10 flex items-center justify-center font-bold text-xs md:text-sm uppercase shadow-lg shadow-primary-container/20 hover:scale-105 transition-transform cursor-pointer"
				aria-label="User menu"
			>
				{username.slice(0, 2)}
			</button>
		</div>
	</div>
</header>
