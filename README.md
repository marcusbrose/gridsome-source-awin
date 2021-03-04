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
        apiKey: 'YOUR_API_KEY',
        columns: [
          'aw_deep_link',
          'product_name',
          'aw_product_id',
          'merchant_product_id',
          'merchant_image_url',
          'description',
          'merchant_category',
          'search_price',
        ],
        language: 'de', // optional, default de
        adultcontent: '1', // optional, default 0
        fids: [
          // only the first fid is supportet now
          '12345', 
          // multiple fids coming soon
          '12346', 
          '12347',
        ]
      }
    }
  ]
}
```