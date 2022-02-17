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
		labelFormat: {
			type: Function,
			required: false
		},
		units: {
			type: String,
			required: false,
		},
		colorbarWidth: {
			type: String,
			default: '16px',
		},
		height: {
			type: String,
			default: '300px'
		}
	},
	computed: {
		colorbarGradient() {
			let gradient = []
			for (let i = 0; i < this.palette.steps; i++) {
				gradient.push(
					`rgb(${this.palette.red[i]}, ${
						this.palette.green[i]
					}, ${this.palette.blue[i]}) ${((i * 100) / this.palette.steps).toFixed(2)}%`
				)
			}
			return `linear-gradient(0deg, ${gradient.join(', ')})`
		},
		ticks() {
			const ticks = []
			for (let i = 0; i < this.nTicks; i++) {
				const value =
					this.paletteExtent[0] +
					((this.paletteExtent[1] - this.paletteExtent[0]) * i) /
						(this.nTicks - 1)
				let label
				if(this.labelFormat) {
					label = this.labelFormat(value)
				} else {
					label = `${value}`
				}
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
		<div class="covjson-legend" :style="{height: height}">
			<div
				class="colorbar"
				:style="{
					background: colorbarGradient,
					'flex-basis': colorbarWidth,
					width: colorbarWidth,
				}"
			></div>
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
	background-color: white;
	border-radius: 16px;
	padding: 8px;
	display: flex;
	flex-direction: row;
	align-items: stretch;
}

.covjson-legend .colorbar {
	margin-right: 8px;
	height: 100%;
	justify-self: stretch;
	border-radius: 8px;
	align-self: stretch;
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
	font-size: 0.8rem;
	color: black;
	margin: 0;
}
</style>
