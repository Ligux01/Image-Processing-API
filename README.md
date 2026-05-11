# Image Processing API

A Node.js API built with Express and TypeScript that resizes images using the Sharp library. Resized images are cached so they don't get reprocessed on repeat requests.

## Setup

Install dependencies:
```
npm install
```

Add some `.jpg` images to the `images/full/` folder. The project was tested with the Udacity sample images (encenadaport, fjord, icelandwaterfall, palmtunnel, santamonica).

## Scripts

```
npm run build   - compiles TypeScript to JavaScript
npm start       - starts the server (run build first)
npm test        - runs all Jasmine tests
npm run lint    - checks for lint errors
npm run format  - formats code with Prettier
```

## Endpoints

**Resize an image:**
```
GET /api/images?filename=encenadaport&width=400&height=300
```
Returns the resized image. On first request it processes and saves the image to `images/thumb/`. On repeat requests it serves the cached version.

**List available images:**
```
GET /api/images/list
```
Returns a JSON list of all images in `images/full/`.

## Error handling

The API returns appropriate error codes and messages for:
- Missing filename, width, or height parameters (400)
- Invalid width/height values like letters or negative numbers (400)
- Image file not found (404)

## Caching

Processed images are saved to `images/thumb/` with the dimensions in the filename (e.g. `encenadaport_400x300.jpg`). The response header `X-Cache` will show `HIT` or `MISS` to indicate whether the cached version was used.
