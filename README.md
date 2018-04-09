# Image Processing Service
This micro-service is used for processing images and then uploading the result to an S3 compliant endpoint.
Images are streamed to a file, transformed and then streamed to AWS to minimize memory usage during upload.
During retrieval streams have been used when downloading as well, again to minimize memory usage.

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