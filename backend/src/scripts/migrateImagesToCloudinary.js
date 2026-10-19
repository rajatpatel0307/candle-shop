import {readFile,writeFile,readdir} from 'node:fs/promises';
import {resolve,relative,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getPool,sql} from '../config/database.js';
import {env} from '../config/env.js';
import {uploadImage} from '../modules/admin/admin.media.service.js';
const apply=process.argv.includes('--apply');
const root=resolve(fileURLToPath(new URL('../../../',import.meta.url)));
const publicRoot=resolve(root,'frontend/public');
const columns={Categories:['CategoryId','ImageUrl'],Brands:['BrandId','LogoUrl'],ProductImages:['ProductImageId','ImageUrl'],HomepageBanners:['HomepageBannerId','DesktopImageUrl','MobileImageUrl'],PromotionalSections:['PromotionalSectionId','ImageUrl','BackgroundImageUrl'],SeoMetadata:['SeoMetadataId','OgImageUrl'],ReviewImages:['ReviewImageId','ImageUrl'],Banners:['BannerId','ImageUrl','MobileImageUrl']};
const cache=new Map();let imported=0,updated=0,failed=0;
const cloudPrefix=`https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/`;
async function importUrl(url){
 if(url.startsWith(cloudPrefix))return url;
 if(cache.has(url))return cache.get(url);
 let image;
 if(url.startsWith('/')&&!url.startsWith('//')){
  const path=resolve(publicRoot,'.'+new URL(url,'http://localhost').pathname);
  if(relative(publicRoot,path).startsWith('..'))throw Error('Invalid local path');
  const mime={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.gif':'image/gif','.webp':'image/webp'}[extname(path).toLowerCase()];
  image=await uploadImage({file:await readFile(path),mime});
 }else image=await uploadImage({url});
 imported++;cache.set(url,image.url);return image.url;
}
try{const saved=JSON.parse(await readFile(resolve(root,'frontend/public/images/home/cloudinary.json'),'utf8'));for(const [path,url]of Object.entries(saved))if(url.startsWith(cloudPrefix))cache.set(path,url);}catch(error){if(error.code!=='ENOENT')throw error;}
const pool=await getPool();
try{
 for(const [table,[id,...fields]]of Object.entries(columns)){
  const schema=await pool.request().input('table',sql.NVarChar(100),table).query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='dbo' AND TABLE_NAME=@table");
  const present=new Set(schema.recordset.map(row=>row.COLUMN_NAME));if(!present.has(id))continue;
  for(const field of fields){
   if(!present.has(field))continue;
   const rows=(await pool.request().query(`SELECT [${id}] AS id,[${field}] AS url FROM dbo.[${table}] WHERE NULLIF(LTRIM(RTRIM([${field}])),'') IS NOT NULL`)).recordset;
   const pending=rows.filter(row=>!row.url.startsWith(cloudPrefix));
   console.log(`${table}.${field}: ${pending.length} images to import`);
   if(!apply)continue;
   for(const row of pending){try{const url=await importUrl(row.url);const result=await pool.request().input('id',row.id).input('old',sql.NVarChar(1000),row.url).input('url',sql.NVarChar(1000),url).query(`UPDATE dbo.[${table}] SET [${field}]=@url WHERE [${id}]=@id AND [${field}]=@old`);updated+=result.rowsAffected[0];}catch(error){failed++;console.error(`Could not import an image in ${table}.${field}: ${error.code||error.name}`);}}
  }
 }
 const photos=['candle-atmosphere.jpg','candle-detail.jpg','candle-ritual.jpg'];
 console.log(`Site editorial photos: ${photos.length}`);
 if(apply){
  for(const photo of photos)await importUrl('/images/home/'+photo);
  async function replaceSources(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,entry.name);if(entry.isDirectory())await replaceSources(path);else if(/\.(jsx|js|css)$/.test(entry.name)){const original=await readFile(path,'utf8');let source=original;for(const [old,url]of cache)if(old.startsWith('/images/home/'))source=source.replaceAll(old,url);const fallback=cache.get('/images/home/candle-atmosphere.jpg');if(fallback)source=source.replaceAll("!event.currentTarget.src.endsWith('candle-atmosphere.jpg')",`event.currentTarget.src!==${JSON.stringify(fallback)}`);if(source!==original)await writeFile(path,source);}}}
  await replaceSources(resolve(root,'frontend/src'));
  await writeFile(resolve(root,'frontend/public/images/home/cloudinary.json'),JSON.stringify(Object.fromEntries([...cache].filter(([path])=>path.startsWith('/images/home/'))),null,2)+'\n');
 }
 console.log(JSON.stringify({mode:apply?'apply':'dry-run',imported,updatedDatabaseFields:updated,failed}));
 if(failed)process.exitCode=1;
}finally{await pool.close();}
