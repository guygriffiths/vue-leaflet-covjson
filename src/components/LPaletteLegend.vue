<script>
import { LControl } from '@vue-leaflet/vue-leaflet'

import { turboPalette } from '../lib/palettes'

export default {
	components: {
		LControl,
	},
	props: {
		paletteExtent: {
			type: Array,
			required: true,
		},
		palette: {
			type: Object,
			default: turboPalette,
		},
		nTicks: {
			type: Number,
			default: 5,
		},
		precision: {
			type: Number,
			default: 2,
		},
		units: {
			type: String,
			required: false,
		},
		colorbarWidth: {
			type: Number,
			default: 16,
		},
	},
	computed: {
		colorbarGradient() {
			return 'linear-gradient(#ff00ff, #00ff00);'
		},
		ticks() {
			const ticks = []
			for (let i = 0; i < this.nTicks; i++) {
				const value =
					this.paletteExtent[0] +
					((this.paletteExtent[1] - this.paletteExtent[0]) * i) /
						(this.nTicks - 1)
				const label = value.toPrecision(this.precision)
				ticks.push({
					value,
					label,
					index: i,
				})
			}
			return ticks
		},
	},
	data() {
		return {}
	},
	mounted() {},
}
</script>

<template>
	<LControl v-bind="$attrs">
		<div class="covjson-legend">
			<div class="colorbar" :style="`flex-basis: ${colorbarWidth}px; background-color: ${colorbarGradient}`"></div>
			<div class="labels">
				<p v-for="tick in ticks">{{ tick.label }}</p>
			</div>
			<div class="labels units" v-if="units">
				<p>{{ units }}</p>
			</div>
		</div>
	</LControl>
</template>

<style>
.covjson-legend {
	height: 400px;
	background-color: white;
	border-radius: 16px;
	padding: 8px;
	display: flex;
	flex-direction: row;
	align-items: center;
}

.covjson-legend .colorbar {
	flex-grow: 0;
	flex-shrink: 0;
	margin-right: 8px;
	height: 100%;
	justify-self: stretch;
}

.covjson-legend .labels {
	display: flex;
	flex-direction: column-reverse;
	justify-content: space-between;
	height: 100%;
}

.covjson-legend .labels.units {
	flex-direction: column;
	justify-content: space-around;
}

.covjson-legend .labels p {
	color: black;
}
</style>
