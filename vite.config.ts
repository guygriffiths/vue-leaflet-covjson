import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const path = require('path')

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/index.js'),
			name: 'Vue Leaflet CovJSON',
			fileName: (format) => `vue-leaflet-covjson.${format}.js`,
		},
		rollupOptions: {
			// make sure to externalize deps that shouldn't be bundled
			// into your library
			external: ['vue'],
			output: {
				// Provide global variables to use in the UMD build
				// for externalized deps
				globals: {
					vue: 'Vue',
				},
			},
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
