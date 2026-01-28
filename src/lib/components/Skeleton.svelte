<script lang="ts">
	let { class: className = '', height = 'h-4', width = 'w-full', rounded = 'rounded' } = $props();
</script>

<div
	class="animate-pulse bg-gray-200 dark:bg-gray-800 {height} {width} {rounded} {className}"
></div>
