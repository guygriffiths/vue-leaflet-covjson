<script>
import { onMounted, onUnmounted, ref, inject, nextTick, watch } from 'vue'
import {
	remapEvents,
	propsBinder,
	WINDOW_OR_GLOBAL,
	GLOBAL_LEAFLET_OPT,
} from '@vue-leaflet/vue-leaflet/src/utils.js'
import { render } from '@vue-leaflet/vue-leaflet/src/functions/layer'

import * as C from 'leaflet-coverage'

import { turboPalette } from '../lib/palettes'

export const props = {
	covJson: {
		required: true,
	},
	parameter: {
		type: String,
		required: true,
	},
	paletteExtent: {
		type: Array,
		required: true,
	},
	palette: {
		type: Object,
		default: turboPalette,
	},
	saturateMin: {
		type: Boolean,
		default: true,
	},
	saturateMax: {
		type: Boolean,
		default: true,
	},
	time: {
		type: Date,
		required: false,
	},
	pane: {
		type: String,
		default: 'overlayPane',
	},
	attribution: {
		type: String,
		default: null,
	},
}

/**
 * CoverageJSON component, allows you to add CoverageJSON layers to a Leaflet map
 */
export default {
	name: 'LCovJson',
	props,
	setup(props, context) {
		const leafletRef = ref({})
		const ready = ref(false)

		// These are provided when this component is used in an LMap from `@vue-leaflet/vue-leaflet`
		const addLayer = inject('addLayer')
		const removeLayer = inject('removeLayer')

		const loadCovJsonLayer = () => {
			ready.value = false
			// If we have a layer already, remove it.
			if (Object.keys(leafletRef.value).length > 0) {
				removeLayer({ leafletObject: leafletRef.value })
			}
			if (props.covJson === null) {
				// If we don't have any coverage JSON, we can't plot it
				ready.value = true
				return
			}
			leafletRef.value = C.dataLayer(props.covJson, {
				parameter: props.parameter,
				paletteExtent: props.paletteExtent,
				palette: props.palette,
				extendMax: props.saturateMax,
				extendMin: props.saturateMin,
				time: props.time,
				attribution: props.attribution,
			})

			// TODO This should work, but it doesn't in my setup.
			// But this is true of *any* popup, so it's not specific to a time series plot.
			// leafletRef.value.bindPopup(new C.TimeSeriesPlot(props.covJson))

			const listeners = remapEvents(context.attrs)
			DomEventFunc.on(leafletRef.value, listeners)
			propsBinder({}, leafletRef.value, props)

			addLayer({
				...props,
				leafletObject: leafletRef.value,
			})
			ready.value = true
			nextTick(() => context.emit('ready', leafletRef.value))
		}

		const setTime = () => {
			if (Object.keys(leafletRef.value).length === 0) {
				return
			}
			leafletRef.value.time = props.time
		}

		let DomEventFunc = null
		const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT)
		onMounted(async () => {
			const { DomEvent } = useGlobalLeaflet
				? WINDOW_OR_GLOBAL.L
				: await import('leaflet/dist/leaflet-src.esm')
			DomEventFunc = DomEvent
			loadCovJsonLayer()

			watch(() => props.covJson, loadCovJsonLayer)
			watch(() => props.time, setTime)
		})

		onUnmounted(() => {
			if (Object.keys(leafletRef.value).length > 0) {
				removeLayer({ leafletObject: leafletRef.value })
			}
		})
		return { ready, leafletObject: leafletRef }
	},
	render() {
		return render(this.ready, this.$slots)
	},
}
</script>
