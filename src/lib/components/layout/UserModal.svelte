<script lang="ts">
	import { Modal, Button } from "$lib";

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		user: { username: string, email: string };
	}

	let { isOpen, onClose, user }: Props = $props();
</script>

<Modal
	isOpen={isOpen}
	onClose={onClose}
	title="Account"
>
	<div class="space-y-6">
		<div
			class="flex items-center gap-4 p-4 bg-surface-elevated rounded-2xl border border-white/5"
		>
			<div
				class="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center font-bold text-2xl uppercase shadow-xl"
			>
				{user.username.slice(0, 2)}
			</div>
			<div class="min-w-0">
				<p class="text-xl font-bold truncate">{user.username}</p>
				<p class="text-sm text-on-surface-variant truncate">
					{user.email}
				</p>
			</div>
		</div>

		<div class="space-y-2">
			<form method="POST" action="/logout">
				<Button
					type="submit"
					class="w-full bg-error! text-white! hover:bg-error/80! py-3 font-bold uppercase tracking-widest text-xs"
				>
					Logout from Device
				</Button>
			</form>
			<Button
				variant="secondary"
				onclick={onClose}
				class="w-full py-3"
			>
				Close
			</Button>
		</div>
	</div>
</Modal>
