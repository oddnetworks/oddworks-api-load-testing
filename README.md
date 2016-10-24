Oddworks API Load Testing
=========================

Load test an Oddworks server implementation.

How It Works
------------
You configure a number of platforms (Apple TV, Android, Roku, etc) using a JSON file. The Oddworks load tester then creates an HTTP client representing each one. Then the Oddworks load tester hits the specified API endpoints with each of the configured platform clients at the specified rate of requests per minute up to the limit number of requests. CSV output is then printed to stdout.

### Example
Run the load tester:

```
bin/cli --config ~/path/to/my/config.json --rate 60 --limit 120
```

The command above will use config.json to configure platforms clients and the target endpoints. It will send HTTP requests to the endpoints at 60 requests per minute until 120 requests are made.

See [Example Config File](#example-config-file) below for more details on the config file.

### Usage

```
$ bin/cli --config <filepath> --rate <number> --limit <number>
```

Get help using

```
$ bin/cli --help
```

### Example Config File
```json
{
    "jwtSecret": "shuuuuuuush",
    "jwtIssuer": "urn:oddworks",
    "channel": "nasa",
    "baseUrl": "http://my-oddworks.host.com",
    "pathPrefix": "/v2",
    "authHeader": "Authorization",
    "platforms": [
        {
            "id": "android",
            "paths": [
                "/config",
                "/views/1ce943f48c184a57b8a7da4d6608c49d?include=carousel,rowlists",
                "/collections/res-series-57cb28afe9d9415a3c8b45db?include=entities",
                "/views/542caddceda94fbeb97fc200ecd6e6a7?include=collections"
            ]
        },
        {
            "id": "apple-tv",
            "paths": [
                "/config",
                "/collections/res-pv3-section-57c848bbe9d941f2278b475b?include=entities",
                "/collections/res-ooyala-series-57cb28afe9d9415a3c8b45db?include=entities",
                "/views/542caddceda94fbeb97fc200ecd6e6a7?include=collections",
                "/views/1ce943f48c184a57b8a7da4d6608c49d?include=carousel,rowlists"
            ]
        },
        {
            "id": "roku",
            "paths": [
                "/config",
                "/views/542caddceda94fbeb97fc200ecd6e6a7?include=collections",
                "/collections/res-pv3-section-57c848bbe9d941f2278b475b?include=entities",
                "/collections/res-ooyala-series-57cb28afe9d9415a3c8b45db?include=entities",
                "/views/1ce943f48c184a57b8a7da4d6608c49d?include=carousel,rowlists"
            ]
        }
    ]
}
```

License
-------
Apache 2.0 © [Odd Networks](http://oddnetworks.com)
