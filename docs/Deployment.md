# Deployment

### Deployment

ในหัวข้อนี้เราจะใช้ Docker ผ่าน Nx Container ในการ build โปรเจคของเรา ก่อนอื่นให้ทำการติดตั้งแพคเกจผ่านคำสั่ง `npm i -D @nx-tools/nx-container @nx-tools/container-metadata`

เราจะใช้ Nx Container ในการสร้าง Dockerfile โดยเริ่มจากโปรเจค leave ก่อนผ่านคำสั่งดังนี้

```powershell
$ npx nx g @nx-tools/nx-container:init leave
$ Which type of engine would you like to use? · docker
$ Which type of app you are building? · react-angular-spa
UPDATE apps/leave/project.json
CREATE apps/leave/Dockerfile
```

ทำการเพิ่มไฟล์ `apps/leave/nginx.conf` ดังนี้

```conf
server {
  listen 80;
  server_name localhost;
  location / {
    root   /usr/share/nginx/html;
    index  index.html index.htm;
    try_files $uri /index.html;
  }
}
```

เปิดไฟล์ `apps/leave/Dockerfile` แล้วทำการแก้ไขบรรทัดที่ 2 จากเดิมคือ

```Dockerfile
COPY  dist/apps/leave/* /usr/share/nginx/html/
```

เป็น

```Dockerfile
COPY  dist/apps/leave/ /usr/share/nginx/html/
COPY apps/leave/nginx.conf /etc/nginx/conf.d/default.conf
```

ทำการเพิ่มไฟล์ `apps/leave/.env.production` ดังนี้

```dotenv
NG_APP_ENV=production
NG_APP_API_URL=http://localhost:3333/v1
```

ทำการเปิดไฟล์ `apps/leave/project.json` แล้วจึงทำการแก้ไขส่วนของ container โดยการเปลี่ยนชื่อ images ดังนี้

```json
{
  "container": {
    "executor": "@nx-tools/nx-container:build",
    "dependsOn": ["build"],
    "options": {
      "engine": "docker",
      "metadata": {
        "images": ["absence-management/leave"],
        "load": true,
        "tags": ["type=schedule", "type=ref,event=branch", "type=ref,event=tag", "type=ref,event=pr", "type=sha,prefix=sha-"]
      }
    }
  }
}
```

จากนั้นให้ทำการ reload VSCode แล้วไปที่ Nx Console เลือก Project leave แล้วทำการรัน container

ภายหลังที่ขั้นตอนการ build เสร็จสิ้น เมื่อออกคำสั่ง `docker images` ควรพบ images ของเรา

```powershell
REPOSITORY                       TAG               IMAGE ID       CREATED          SIZE
absence-management/leave         main              c0def2e45c53   11 minutes ago   41.6MB
absence-management/leave         sha-90741aa       c0def2e45c53   11 minutes ago   41.6MB
```

สำหรับแอพ api นั้นอยู่บนการทำงานของ Node.js / Express.js ให้เราออกคำสั่งต่อไปนี้

```powershell
$ npx nx g @nx-tools/nx-container:init api

> Which type of engine would you like to use?: docker
> Which type of app you are building?: nest
```

จากนั้นทำการแก้ไขไฟล์ `apps/api/Dockerfile` เป็น

```dockerfile
FROM docker.io/node:19-alpine3.16

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN addgroup --system api && \
    adduser --system -G api api

COPY dist/apps/api/ .
RUN yarn install && \
    chown -R api:api .

CMD [ "node", "main.js" ]
```

แก้ไข `apps/api/project.json` ในส่วนของ build ด้วยการเพิ่ม generatePackageJson ดังนี้

```json
{
  "build": {
    "executor": "@nx/webpack:webpack",
    "outputs": ["{options.outputPath}"],
    "defaultConfiguration": "production",
    "options": {
      "target": "node",
      "compiler": "tsc",
      "outputPath": "dist/apps/api",
      "main": "apps/api/src/main.ts",
      "tsConfig": "apps/api/tsconfig.app.json",
      "assets": ["apps/api/src/assets"],
      "isolatedConfig": true,
      "webpackConfig": "apps/api/webpack.config.js",
      "generatePackageJson": true
    }
  }
}
```

จากนั้นให้ทำการ reload VSCode แล้วไปที่ Nx Console เลือก Project api แล้วทำการรัน container

ภายหลังที่ขั้นตอนการ build เสร็จสิ้น เมื่อออกคำสั่ง `docker images` ควรพบ images ของเรา

```powershell
REPOSITORY                       TAG               IMAGE ID       CREATED          SIZE
absence-management/api           main              3ba38507a667   13 seconds ago   177MB
absence-management/api           sha-90741aa       3ba38507a667   13 seconds ago   177MB
```

ทำการสร้างไฟล์ `docker-compose.yml` ดังนี้

```yml
version: '3.9'
services:
  api:
    image: 'absence-management/api:main'
    ports:
      - '3333:3000'
  leave:
    image: 'absence-management/leave:main'
    ports:
      - '3112:80'
  mongodb:
    image: mongo:6.0
    ports:
      - '27017:27017'
    volumes:
      - mongo_data:/data/db
volumes:
  mongo_data:
```

[&lt; Back To Auth API](Auth-API.md) | [Next To สไลด์เรื่อง Express &gt; ](Slide-Express.md)
