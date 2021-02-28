# gridsome-source-awin

Uses [AWIN Create-a-Feed](https://wiki.awin.com/index.php/Downloading_feeds_using_Create-a-Feed)


## Install

```
yarn add gridsome-source-awin
```

## Configuration

Configure the plugin in you `gridsome.config.js` file. You can configure multiple feeds. The API Key and one feed with a valid fid are mandatory.

```
module.exports = {
  ...
  plugins: [
    ...
    {
      use: 'gridsome-source-awin',
      options: {
        apiKey: ...,
        feeds: [{
          typeName: ...,
          language: 'de',
          fid: ...,
          columns: [
            'aw_product_id',
            'aw_deep_link',
            'product_name',
            'merchant_image_url',
            'description',
            'search_price',
            'currency',
          ]
        }]
      }
    }
  ]
```