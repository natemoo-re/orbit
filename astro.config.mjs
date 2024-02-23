import { defineConfig } from 'astro/config';
import db, { defineWritableTable, column, NOW } from '@astrojs/db';

const Sites = defineWritableTable({
	columns: {
		url: column.text()
	}
})

// https://astro.build/config
export default defineConfig({
	integrations: [db()],
	db: {
		studio: true,
		collections: {
			Sites
		},
		async data({ seed }) {
			await seed(Sites, {
				url: 'https://nmoo.dev'
			})
			// await seed(Sites, [
			// 	{
			// 		url: 'https://nmoo.dev',
			// 		// createdAt: new Date('2023-10-10T21:48:25.786Z'),
			// 	},
			// 	{
			// 		url: 'https://erika.florist',
			// 		// createdAt: new Date('2023-10-10T21:49:18.685Z'),
			// 	},
			// 	{
			// 		url: 'https://matthewphillips.info',
			// 		// createdAt: new Date('2023-10-10T21:49:30.722Z'),
			// 	}
			// ])
		}
	},
});
