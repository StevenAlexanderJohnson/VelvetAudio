<script lang="ts">
	import { Input, Button } from '$lib';
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let isSubmitting = $state(false);
</script>

<div class="p-8 max-w-3xl mx-auto">
	<div class="mb-12">
		<h1 class="text-4xl font-bold mb-2">Settings</h1>
		<p class="text-on-surface-variant">Configure your podcast library automation and preferences.</p>
	</div>

	<section class="bg-surface rounded-3xl border border-white/5 overflow-hidden">
		<div class="p-8 border-b border-white/5">
			<h2 class="text-xl font-bold mb-1">Automation</h2>
			<p class="text-sm text-on-surface-variant">Set the schedule for automatic RSS feed scans.</p>
		</div>

		<form 
			method="POST" 
			action="?/updateSchedule" 
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					isSubmitting = false;
					update();
				};
			}}
			class="p-8 space-y-6"
		>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
				<div class="space-y-4">
					<Input 
						name="schedule" 
						label="Cron Schedule Pattern" 
						value={data.schedule} 
						placeholder="0 * * * *" 
						required 
					/>
					<p class="text-xs text-on-surface-variant leading-relaxed">
						Standard cron syntax:<br/>
						<code class="text-primary">minute hour day month day-of-week</code><br/><br/>
						Examples:<br/>
						<span class="text-on-surface">0 * * * *</span> - Every hour (default)<br/>
						<span class="text-on-surface">*/30 * * * *</span> - Every 30 minutes<br/>
						<span class="text-on-surface">0 0 * * *</span> - Every day at midnight
					</p>
				</div>

				<div class="bg-surface-elevated p-6 rounded-2xl border border-white/5 space-y-3">
					<h3 class="text-xs font-bold uppercase tracking-widest text-primary">Pro Tip</h3>
					<p class="text-sm text-on-surface-variant leading-relaxed">
						Velvet uses an in-process worker. If your server restarts, the schedule will resume automatically from the database settings.
					</p>
				</div>
			</div>

			{#if form?.message}
				<div class="p-4 rounded-xl {form.success ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-error/10 border-error/20 text-error'} border text-sm">
					{form.message}
				</div>
			{/if}

			<div class="pt-4 flex justify-end">
				<Button 
					type="submit" 
					disabled={isSubmitting}
					class="px-12"
				>
					{isSubmitting ? 'Saving...' : 'Save Schedule'}
				</Button>
			</div>
		</form>
	</section>
</div>
