# SoSha Toolkit Posts Viewer

## How to run

You've got to have npm installed first.

```bash
# NOTE THE --recursive. THIS IS FOR THE FONT-AWESOME SUBMODULE
git clone --recursive https://github.com/blagalucianflorin/SoSha-Toolkit-Posts-Viewer

# create a valid .env file
cp .env.example .env && vim .env

npm install
npm run dev -- --open
# OR
docker build -t sosha-toolkit-posts-viewer .
docker run --rm -p 3000:3000 sosha-toolkit-posts-viewer
```

