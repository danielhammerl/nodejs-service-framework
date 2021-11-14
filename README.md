# Nodejs Service Framework

## Usage

## Config

For App configuration we use the 'config' package.
You have to create a /src/config directory in you project root ( not your source directory ) and put your config files there
See more information about config here: https://www.npmjs.com/package/config

An example configuration would be the following:

```json
{
    "webserver": {
        "host": string, // default: localhost
        "port": number | number[], // default: 8080
    },
    "serviceRegistry": {
        "forceConnect": boolean // forcing connection to service registry, if its false connection will only be etablished on production ( default is false )  
    }, 
    "database": {
        "type": string, // see mikroorm for supported types ( https://mikro-orm.io/docs/configuration/#driver )
        "url": string, // for example mysql://root:@localhost/test
    },
    "logging": {
        "loggingServiceUrl": string,
        "transports": [ // default is a console transport if you dont defined otherwise
            {
                "type": 'console', // there will be more in future
                "level": string // minimum log level ( critical, error, warning, info, framework, debug, silly ) // default is framework
            }
        ]
    }
}
```

## Debugging

you can set process.env to TEST_FRAMEWORK to debug some things, for example:

- it makes calls to logging service even its not production environment
