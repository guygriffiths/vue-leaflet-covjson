import { inject, provide, onUnmounted } from 'vue'
import {
	loadProjection,
	getHorizontalCRSComponents,
	asTime,
	indexOfNearest,
} from 'covutils'
import { turboPalette } from '../lib/palettes'

export const props = {
	covjson: {
		type: Object,
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
	visible: {
		type: Boolean,
		custom: true,
		default: true,
	},
	name: {
		type: String,
		custom: true,
		default: undefined,
	},
	layerType: {
		type: String,
		custom: true,
		default: undefined,
	},
}

export const setup = (props, leafletRef) => {
	const options = {
		attribution: props.attribution,
		pane: props.pane,
		...props,
	}
	const addLayer = inject('addLayer')
	const removeLayer = inject('removeLayer')
	const addThisLayer = () => addLayer({ leafletObject: leafletRef.value })
	const removeThisLayer = () => removeLayer({ leafletObject: leafletRef.value })

	const methods = {
		setAttribution(val, old) {
			const attributionControl = this.$parent.leafletObject.attributionControl
			attributionControl.removeAttribution(old).addAttribution(val)
		},
		setName() {
			removeThisLayer()
			if (props.visible) {
				addThisLayer()
			}
		},
		setLayerType() {
			removeThisLayer()
			if (props.visible) {
				addThisLayer()
			}
		},
		setVisible(isVisible) {
			if (leafletRef.value) {
				if (isVisible) {
					addThisLayer()
				} else {
					removeThisLayer()
				}
			}
		},
		bindPopup({ leafletObject }) {
			leafletRef.value.bindPopup(leafletObject)
		},
		bindTooltip({ leafletObject }) {
			leafletRef.value.bindTooltip(leafletObject)
		},
		unbindTooltip() {
			const tooltip = leafletRef.value ? leafletRef.value.getTooltip() : null
			if (tooltip) {
				tooltip.unbindTooltip()
			}
		},
		unbindPopup() {
			const popup = leafletRef.value ? leafletRef.value.getPopup() : null
			if (popup) {
				popup.unbindPopup()
			}
		},
		updateVisibleProp(value) {
			/**
			 * Triggers when the visible prop needs to be updated
			 * @type {boolean}
			 * @property {boolean} value - value of the visible property
			 */
			context.emit('update:visible', value)
		},
		addLayer(layer) {
			leafletRef.value.addLayer(layer.leafletObject)
		},
		removeLayer(layer) {
			leafletRef.value.removeLayer(layer.leafletObject)
		},
		// setGeojson(newVal) {
		// 	leafletRef.value.clearLayers()
		// 	leafletRef.value.addData(newVal)
		// },
		getGeoJSONData() {
			return leafletRef.value.toGeoJSON()
		},
		getBounds() {
			return leafletRef.value.getBounds()
		},
	}

	provide('bindPopup', methods.bindPopup)
	provide('bindTooltip', methods.bindTooltip)
	provide('unbindTooltip', methods.unbindTooltip)
	provide('unbindPopup', methods.unbindPopup)
	provide('addLayer', methods.addLayer)
	provide('removeLayer', methods.removeLayer)

	onUnmounted(() => {
		methods.unbindPopup()
		methods.unbindTooltip()
		removeThisLayer()
	})
	return { options, methods }
}

export const geoJsonFromCoverage = async (cov, parameter, palette, extent, time) => {
	const domain = await cov.loadDomain()
	const projection = await loadProjection(domain)
	const [projX, projY] = getHorizontalCRSComponents(domain)
	const ranges = await cov.loadRanges()
	const range = ranges.get(parameter)

	const unproject = projection.unproject
	const axis = domain.axes.get('composite')
	const ix = axis.coordinates.indexOf(projX)
	const iy = axis.coordinates.indexOf(projY)

	const polygonsLonLat = axis.values.map((polygon) =>
		polygon.map((ring) =>
			ring.map((coords) => {
				let { lat, lon } = unproject({ x: coords[ix], y: coords[iy] })
				return [lon, lat]
			})
		)
	)

	const tAxis = domain.axes.get('t')
	let tIndex = tAxis.values.length - 1
	const tVals = tAxis.values.map((v) => asTime(v))
	if (time) {
		tIndex = indexOfNearest(tVals, asTime(time))
	}

	const geoJson = []
	for (let i = 0; i < polygonsLonLat.length; i++) {
		const values = []
		for(let t = 0; t < tAxis.values.length; t++) {
			values.push(range.get({ t, composite: i }))
		}

		geoJson.push({
			type: 'Feature',
			properties: {
				index: i,
				color: palette.getColor(values[tIndex], extent),
				values,
				times: tVals.map(t => new Date(t)),
			},
			geometry: {
				type: 'Polygon',
				coordinates: polygonsLonLat[i],
			},
		})
	}
	return geoJson
}
