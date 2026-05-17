<script lang="ts">
	import { Input, Button } from '$lib';
	import { enhance } from '$app/forms';

	let { form } = $props();
	let isSubmitting = $state(false);
</script>

<div class="min-h-screen bg-background flex items-center justify-center p-6">
	<div class="w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-8">
		<div class="text-center mb-8">
			<div class="w-16 h-16 bg-primary-container flex items-center justify-center mx-auto mb-4 rounded-xl">
				<span class="text-white font-bold text-3xl">V</span>
			</div>
			<h1 class="text-3xl font-bold mb-2">Welcome to Velvet</h1>
			<p class="text-on-surface-variant">Create your admin account to get started.</p>
		</div>

		<form 
			method="POST" 
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					isSubmitting = false;
					update();
				};
			}}
			class="space-y-6"
		>
			<Input 
				name="username" 
				label="Username" 
				placeholder="admin" 
				required 
			/>
			
			<Input 
				name="email" 
				type="email" 
				label="Email Address" 
				placeholder="you@example.com" 
				required 
			/>

			<Input 
				name="password" 
				type="password" 
				label="Password" 
				placeholder="••••••••" 
				required 
			/>

			<Input 
				name="confirmPassword" 
				type="password" 
				label="Confirm Password" 
				placeholder="••••••••" 
				required 
			/>

			{#if form?.message}
				<div class="p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
					{form.message}
				</div>
			{/if}

			<Button 
				type="submit" 
				disabled={isSubmitting} 
				class="w-full py-4 text-lg"
			>
				{isSubmitting ? 'Creating Account...' : 'Finish Setup'}
			</Button>
		</form>
	</div>
</div>
