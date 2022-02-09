import commonjs from 'rollup-plugin-commonjs'
import VuePlugin from 'rollup-plugin-vue'

export default {
	input: './src/lib.js',
	output: [
		{
			file: 'dist/vue-leaflet-covjson.esm.js',
			format: 'es',
			sourcemap: true,
		},
	],
	plugins: [
		commonjs(),
		VuePlugin({
			css: false,
		}),
	],
	external: [
		'vue',
		'leaflet/dist/leaflet-src.esm',
		'leaflet',
		'covutils',
		'@vue-leaflet/vue-leaflet/src/utils.js',
	],
}
