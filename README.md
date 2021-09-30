# Nodejs Service Framework

## Usage

## Config

For App configuration we use the 'config' package.
You have to create a /config directory in you project root ( not your source directory ) and put your config files there
See more information about config here: https://www.npmjs.com/package/config

An example configuration would be the following:
```json 
{
    "webserver": {
        "host": string, // default: localhost
        "port": number, // default: 8080
    },
    "database": {
    
    }
}
```