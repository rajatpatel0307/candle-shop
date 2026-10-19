import { createHash } from 'node:crypto';
import { env } from '../../config/env.js';
import { AppError } from '../../common/errors/AppError.js';

export const MAX_IMAGE_BYTES=5*1024*1024;
export function validateImage(file,mime){
  if(!Buffer.isBuffer(file)||!file.length)throw new AppError(400,'IMAGE_REQUIRED','Choose an image to upload.');
  if(file.length>MAX_IMAGE_BYTES)throw new AppError(413,'IMAGE_TOO_LARGE','Choose an image smaller than 5 MB.');
  const valid={
    'image/jpeg':file[0]===0xff&&file[1]===0xd8&&file[2]===0xff,
    'image/png':file.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),
    'image/gif':['GIF87a','GIF89a'].includes(file.subarray(0,6).toString()),
    'image/webp':file.subarray(0,4).toString()==='RIFF'&&file.subarray(8,12).toString()==='WEBP',
  };
  if(!valid[mime])throw new AppError(400,'INVALID_IMAGE','Choose a valid JPG, PNG, WebP or GIF image.');
}
export function validateImageUrl(value){
  let url;
  try{url=new URL(value);}catch{throw new AppError(400,'INVALID_IMAGE_URL','Enter a full http or https image URL.');}
  if(value.length>1000||!['https:','http:'].includes(url.protocol)||url.username||url.password)throw new AppError(400,'INVALID_IMAGE_URL','Enter a public http or https image URL without credentials.');
  return url.href;
}
export async function uploadImage({file,mime,url},{config=env,fetchImpl=fetch}={}){
  if(file)validateImage(file,mime);else url=validateImageUrl(typeof url==='string'?url:'');
  if(!config.CLOUDINARY_CLOUD_NAME||!config.CLOUDINARY_API_KEY||!config.CLOUDINARY_API_SECRET)throw new AppError(503,'IMAGE_STORAGE_UNAVAILABLE','Image storage is not configured. Contact your administrator.');
  const params={allowed_formats:'jpg,png,webp,gif',folder:'candle-studio/uploads',timestamp:String(Math.floor(Date.now()/1000))};
  const signature=createHash('sha256').update(Object.keys(params).sort().map(key=>`${key}=${params[key]}`).join('&')+config.CLOUDINARY_API_SECRET).digest('hex');
  const form=new FormData();
  for(const [key,value]of Object.entries(params))form.append(key,value);
  form.append('signature',signature);form.append('api_key',config.CLOUDINARY_API_KEY);
  if(file)form.append('file',new Blob([file],{type:mime}),'image');else form.append('file',url);
  let response,result;
  try{response=await fetchImpl(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.CLOUDINARY_CLOUD_NAME)}/image/upload`,{method:'POST',body:form,signal:AbortSignal.timeout(45000)});result=await response.json();}
  catch{throw new AppError(502,'IMAGE_UPLOAD_FAILED','The image could not be uploaded. Please try again.');}
  if(!response.ok||!result.secure_url||result.resource_type!=='image')throw new AppError(502,'IMAGE_UPLOAD_FAILED','Cloudinary could not store this image. Check the image and try again.');
  return {url:result.secure_url,publicId:result.public_id,width:result.width,height:result.height};
}
