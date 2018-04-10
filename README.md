# Image Processing Service
This micro-service is used for calling [Sharp](https://github.com/lovell/sharp) pipelines on supplied images and then uploading the result to an S3 compliant endpoint.
Images are streamed to a file, transformed and then streamed to the endpoint to minimize memory usage during upload.

## Usage
To use this micro-service two variables **pipeline** and **image** need to be POST'ed to the route "/".
Starting this service and a minio instance for testing can be done using docker compose.
```bash
docker-compose up
```

Resize an image:
```bash
curl -F "pipeline=[ { \"resize\" : [ 20, 20 ]} ]" -F "image=@/Users/me/my-image.jpg" http://127.0.0.1:8080/
```

Convert an uploaded image to WEBP:
```bash
curl -F "pipeline=[ { \"webp\" : {} } ]" -F "image=@/Users/me/my-image.jpg" http://127.0.0.1:8080/
```

Multiple stages can be defined (as with Sharp), remember the order matters!
```bash
curl -F "pipeline=[ { \"resize\" : [ 200, 200 ]}, { \"rotate\": [90] }, { \"jpeg\" : { \"quality\" : 100 } } ]" -F "image=@/Users/me/my-image.jpg" http://127.0.0.1:8080/
```

The following Sharp methods are supported, usage can be found in the [Sharp docs](http://sharp.pixelplumbing.com/en/stable/):
 * resize
 * crop
 * embed
 * max
 * min
 * ignoreAspectRatio
 * withoutEnlargement
 * rotate
 * extract
 * flip
 * flop
 * sharpen
 * median
 * blur
 * extend
 * flatten
 * trim
 * gamma
 * negate
 * normalise
 * normalize
 * convolve
 * threshold
 * linear
 * background
 * greyscale
 * grayscale
 * toColourspace
 * toColorspace
 * jpeg
 * png
 * webp
 * tiff
 * raw

## Docker Environment Variables
| Variable  | Usage |
| ------------- | ------------- |
| *AWS_BUCKET*      | The S3 bucket images should be uploaded/downloaded from. |
| *AWS_KEY*         | AWS key.  |
| *AWS_SECRET*        | AWS Secret.  |
| *AWS_ENDPOINT*      | AWS S3 endpoint, for example http://127.0.0.1:9000  |
| *AWS_PATH_STYLE*    | Enable/disable force path style for AWS client, is required by some S3 compliant providers.  |
| *PORT*  | The port this service listens on.  |
| *UPLOAD_DIR*  | The directory within this container images are uploaded and transformed in.  |

## Performance/Resources
Testing using Apache jMeter with 100 threads, sending a 5MB file 100 times each showed the following:

| CPU | RAM | Storage | Requests/s |
| ------------- | ------------- | ------------- | ------------- |
|  2 cores of 2.9 GHz Intel Core i7 @ 100% | 100-200MB | 55B-200MB | 35~ |