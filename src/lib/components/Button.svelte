<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'ghost' | 'icon' | 'play';
	}

	let {
		variant = 'primary',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const variantStyles = {
		primary:
			'px-6 py-2.5 bg-primary-container text-white font-bold hover:scale-105 shadow-lg shadow-primary-container/20 rounded-lg',
		secondary:
			'px-6 py-2.5 bg-surface-elevated border border-white/10 text-on-surface font-bold hover:bg-white/10 rounded-lg',
		ghost: 'p-3 rounded-full hover:bg-white/5 transition-colors',
		icon: 'p-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors',
		play: 'w-14 h-14 bg-primary-container min-w-14 text-white rounded-full flex items-center justify-center text-2xl shadow-xl hover:scale-105 transition-transform'
	};
</script>

<button
	class="{variantStyles[variant]} transition-all duration-200 disabled:opacity-50 disabled:scale-100 {className}"
	{...rest}
>
	{@render children?.()}
</button>
