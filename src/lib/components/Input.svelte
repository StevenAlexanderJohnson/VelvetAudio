<script lang="ts">
	interface Props {
		value: string;
		placeholder?: string;
		label?: string;
		type?: string;
		id?: string;
		name?: string;
		required?: boolean;
	}

	let { 
		value = $bindable(), 
		placeholder = "", 
		label, 
		type = "text", 
		id, 
		name, 
		required = false 
	} = $props<Props>();
</script>

<div class="flex flex-col gap-2 w-full">
	{#if label}
		<label 
			for={id || name} 
			class="px-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant"
		>
			{label}
		</label>
	{/if}
	
	<input
		{type}
		{id}
		{name}
		{placeholder}
		{required}
		bind:value
		class="w-full bg-background border border-white/10 rounded-xl px-4 py-3 
               text-on-surface placeholder:text-on-surface-variant/30
               focus:outline-hidden focus:border-primary-container focus:ring-1 focus:ring-primary-container 
               transition-all duration-200"
	/>
</div>
