<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button } from '$lib';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		title: string;
		description?: string;
		children?: Snippet;
	}

	let { isOpen, onClose, title, description, children }: Props = $props();

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-6">
		<!-- Backdrop -->
		<button
			class="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-default"
			onclick={handleBackdropClick}
			aria-label="Close modal"
		></button>

		<!-- Modal Content -->
		<div
			class="relative w-full max-w-xl max-h-[80vh] overflow-y-auto bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
		>
			<div class="p-8">
				<div class="flex items-center justify-between mb-2">
					<h2 class="text-2xl font-bold">{title}</h2>
					<Button variant="ghost" onclick={onClose} class="p-1! text-on-surface-variant hover:text-on-surface">
						✕
					</Button>
				</div>
				{#if description}
					<p class="text-on-surface-variant mb-6 text-sm">{description}</p>
				{/if}

				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
