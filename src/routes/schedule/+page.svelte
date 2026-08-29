<script>
	import ScheduleSection from '$lib/components/ScheduleSection.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Schedule | 桃山学院大学テック部</title>
	<meta
		name="description"
		content="桃山学院大学テック部の活動スケジュール。定例会、勉強会、イベントなどの日程一覧。"
	/>
</svelte:head>

<div class="min-h-screen pt-20 pb-16">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<ScheduleSection scheduleData={data.scheduleData} pastEventsByMonth={data.pastEventsByMonth} />
	</div>
</div>
