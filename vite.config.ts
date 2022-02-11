import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const path = require('path')

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/lib.js'),
			name: 'Vue Leaflet CovJSON',
			fileName: (format) => `vue-leaflet-covjson.${format}.js`,
			formats: ['es'],
		},
		rollupOptions: {
			// make sure to externalize deps that shouldn't be bundled
			// into your library
			external: ['vue', '@vue-leaflet/vue-leaflet', 'leaflet-coverage', 'covutils']
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	plugins: [vue()],
	css: {
		preprocessorOptions: {
			scss: {},
		},
	},
}))
