import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {}
	},

	plugins: [typography, forms, daisyui],

	daisyui: {
		themes: [
			{
				"light": {
					...require("daisyui/src/theming/themes")["light"],
					"primary": "#280fa4",
					"primary-content": "#ccd3f0",
					"bg-base": "#f2f2f2",
					"success": "#30c48d",
					"warning": "#f98080"
				}
			},
			"dark"
		],
	},
} satisfies Config;
