import { Elysia, t } from 'elysia';
import { uploadToCloudinary } from '../lib/upload-helper';

export const uploadRoutes = new Elysia({ prefix: '/api/upload' })
  .post('/', async ({ body }) => {
    const { file, folder } = body;
    
    try {
      const url = await uploadToCloudinary(file, folder || 'apartment_general');
      return { url };
    } catch (error: any) {
      return { error: error.message || 'Upload failed' };
    }
  }, {
    body: t.Object({
      file: t.File(),
      folder: t.Optional(t.String())
    })
  });
