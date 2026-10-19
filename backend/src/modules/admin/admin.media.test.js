import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import request from 'supertest';
import app from '../../app.js';
import {createAccessToken} from '../auth/auth.token.service.js';
import {randomUUID} from 'node:crypto';
import {uploadImage,validateImage,validateImageUrl,MAX_IMAGE_BYTES} from './admin.media.service.js';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
const config={CLOUDINARY_CLOUD_NAME:'test-cloud',CLOUDINARY_API_KEY:'test-key',CLOUDINARY_API_SECRET:'test-secret'};
test('image uploads reject mismatched file bytes, unsupported formats and large files',()=>{
 assert.doesNotThrow(()=>validateImage(png,'image/png'));
 assert.throws(()=>validateImage(Buffer.from('<script/>'),'image/png'),{code:'INVALID_IMAGE'});
 assert.throws(()=>validateImage(png,'image/svg+xml'),{code:'INVALID_IMAGE'});
 assert.throws(()=>validateImage(Buffer.alloc(MAX_IMAGE_BYTES+1),'image/png'),{code:'IMAGE_TOO_LARGE'});
 for(const url of ['file:///private/image.png','data:image/png;base64,x','https://user:password@example.com/image.png','relative.png'])assert.throws(()=>validateImageUrl(url),{code:'INVALID_IMAGE_URL'});
});
test('device and URL uploads are signed on the server and return Cloudinary URLs',async()=>{
 for(const input of [{file:png,mime:'image/png'},{url:'https://example.com/image.png'}]){
 const image=await uploadImage(input,{config,fetchImpl:async(url,options)=>{
 assert.equal(url,'https://api.cloudinary.com/v1_1/test-cloud/image/upload');
 const form=options.body,params=['allowed_formats','folder','timestamp'].map(key=>`${key}=${form.get(key)}`).join('&');
 assert.equal(form.get('signature'),createHash('sha256').update(params+config.CLOUDINARY_API_SECRET).digest('hex'));
 assert.equal(form.get('api_key'),'test-key');
 if(input.file)assert.equal(await form.get('file').arrayBuffer().then(buffer=>Buffer.from(buffer).equals(png)),true);else assert.equal(form.get('file'),input.url);
 return {ok:true,json:async()=>({secure_url:'https://res.cloudinary.com/test-cloud/image/upload/test.png',public_id:'test',resource_type:'image',width:1,height:1})};
 }});assert.match(image.url,/^https:\/\/res.cloudinary.com\//);
 }
});
test('upload failures are explicit and do not expose provider secrets',async()=>{
 await assert.rejects(uploadImage({file:png,mime:'image/png'},{config:{}}),{code:'IMAGE_STORAGE_UNAVAILABLE'});
 await assert.rejects(uploadImage({file:png,mime:'image/png'},{config,fetchImpl:async()=>{throw Error('private credential');}}),{code:'IMAGE_UPLOAD_FAILED',message:'The image could not be uploaded. Please try again.'});
});
test('media endpoint requires staff access and validates raw image uploads',async()=>{
 const path='/api/v1/admin/media/images';
 assert.equal((await request(app).post(path).send({url:'https://example.com/image.png'})).status,401);
 const customer=createAccessToken({id:randomUUID(),roles:['CUSTOMER']},randomUUID());
 assert.equal((await request(app).post(path).set('Authorization',`Bearer ${customer}`).send({url:'https://example.com/image.png'})).status,403);
 const admin=createAccessToken({id:randomUUID(),roles:['ADMIN']},randomUUID());
 assert.equal((await request(app).post(path).set('Authorization',`Bearer ${admin}`).set('Content-Type','image/png').send(Buffer.from('not an image'))).status,400);
 assert.equal((await request(app).post(path).set('Authorization',`Bearer ${admin}`).send({url:'file:///private/image.png'})).status,400);
});
