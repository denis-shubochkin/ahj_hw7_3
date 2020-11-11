
const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const fs = require('fs');
const path = require('path');


const publicPath = path.join(__dirname, '/public');
const app = new Koa();

// app.use(koaStatic(publicF));
app.use(koaBody({
  urlencoded: true,
  multipart: true,
  json: true,
}));

const images = [];
let arr = [];
let indDel;

// eslint-disable-next-line consistent-return
app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    // eslint-disable-next-line no-return-await
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*' };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Allow-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Allow-Control-Request-Headers'));
    }
    ctx.response.status = 204;
  }
});


function getMaxId() {
  const arrId = [];
  console.log(images.length);
  if (images.length >= 1) {
    images.forEach((element) => {
      arrId.push(element.id);
    });
  } else {
    arrId.push(0);
  }
  return Math.max.apply(null, arrId) + 1;
}


app.use(async (ctx, next) => {
  ctx.response.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
  });


  const { method } = ctx.request.query;
  switch (method) {
    case 'allImages':
      arr = [];
      if (images.length > 0) {
        images.forEach((img) => {
          const file = fs.readFileSync(img.path);
          arr.push({ id: img.id, data: file });
        });
      } else {
        fs.readdirSync(publicPath).forEach((el) => {
          images.push(
            {
              id: getMaxId(),
              path: path.join(publicPath, el),
            },
          );
        });
        if (images.length > 0) {
          images.forEach((img) => {
            const file = fs.readFileSync(img.path);
            arr.push({ id: img.id, data: file });
          });
        } else {
          console.log(1);
          ctx.response.body = 'empty';
          return;
        }
      }
      ctx.response.body = JSON.stringify(arr);
      await next();
      return;
    case 'loadImage':
      if (ctx.request.files.img.size > 0) {
        const reader = fs.createReadStream(ctx.request.files.img.path);
        const dest = path.join(publicPath, `${ctx.request.files.img.size}.png`);
        images.push({
          id: getMaxId(),
          path: dest,
        });
        const stream = fs.createWriteStream(dest);
        reader.pipe(stream);
      }
      ctx.response.body = 'ok';
      await next();
      return;
    case 'delImage':
      images.forEach((el, i) => {
        if (el.id === Number(ctx.request.query.id)) {
          console.log(ctx.request.query.id);
          fs.unlink(el.path, (err) => {
            if (err) throw err;
            console.log(`${el.path} was deleted`);
          });
          indDel = i;
        }
      });
      console.log(indDel);
      images.splice(indDel, 1);
      ctx.response.body = 'ok';
      await next();
      return;
    default:
      ctx.response.body = 'error';
      ctx.response.status = 404;
  }
});

// eslint-disable-next-line no-unused-vars
const port = process.env.PORT || 7070;
// eslint-disable-next-line no-unused-vars
const server = http.createServer(app.callback()).listen(port);
