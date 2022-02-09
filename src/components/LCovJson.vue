<script>
import { onMounted, ref, inject, nextTick, h, watch } from 'vue'
import {
	propsBinder,
	WINDOW_OR_GLOBAL,
	GLOBAL_LEAFLET_OPT,
} from '@vue-leaflet/vue-leaflet/src/utils.js'
import {
	props,
	setup as covJSONSetup,
	geoJsonFromCoverage,
} from '../functions/covJSON'
import { asTime, indexOfNearest } from 'covutils'

export default {
	props,
	setup(props, context) {
		const leafletRef = ref({})
		const ready = ref(false)

		const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT)
		const addLayer = inject('addLayer')

		const { methods, options } = covJSONSetup(props, leafletRef, context)

		const loadCovJsonLayer = async () => {
			if (!props.covjson || Object.keys(props.covjson).length === 0) {
				// No coverageJson to load
				return
			}

			const { geoJSON } = useGlobalLeaflet
				? WINDOW_OR_GLOBAL.L
				: await import('leaflet/dist/leaflet-src.esm')

			const geoJson = await geoJsonFromCoverage(
				props.covjson,
				props.parameter,
				props.palette,
				props.paletteExtent,
				props.time
			)

			leafletRef.value = geoJSON(geoJson, {
				...options,
				style: (feature) => ({
					color: feature.properties.color,
					fillOpacity: 1,
					stroke: false,
				}),
				onEachFeature: (feature, layer) => {
					layer.on('click', (e) => {
						e.index = feature.properties.index
						e.times = feature.properties.times
						e.values = feature.properties.values
						context.emit('click', e)
					})
				},
			})

			propsBinder(methods, leafletRef.value, props)
			addLayer({
				...props,
				...methods,
				leafletObject: leafletRef.value,
			})
			ready.value = true
			nextTick(() => context.emit('ready', leafletRef.value))
		}

		const setColours = () => {
			const layers = leafletRef.value.getLayers()
			for (let i in layers) {
				const times = layers[i].feature.properties.times
				const values = layers[i].feature.properties.values
				const tIndex = indexOfNearest(
					times.map((t) => asTime(t)),
					asTime(props.time)
				)
				console.log(tIndex)
				const value = values[tIndex]
				layers[i].setStyle({
					fillColor: props.palette.getColor(value, props.paletteExtent),
				})
			}
		}

		onMounted(async () => {
			await loadCovJsonLayer()

			watch(() => props.covjson, loadCovJsonLayer)
			watch(() => props.time, setColours)
			watch(() => props.palette, setColours)
			watch(() => props.paletteExtent, setColours)
		})

		return { ready, leafletObject: leafletRef }
	},
	render() {
		if (this.ready && this.$slots.default) {
			return h('div', { style: { display: 'none' } }, this.$slots.default())
		}
		return null
	},
}
</script>
