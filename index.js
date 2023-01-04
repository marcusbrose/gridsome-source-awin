const axios = require('axios')
const csv = require('csv-stream')
const zlib = require('zlib')

const csvOptions = {
  delimiter: ',', // default is ,
  endLine: '\n', // default is \n,
  // columns, // by default read the first line and use values found as columns
  columnOffset: 2, // default is 0
  escapeChar: '"', // default is an empty string
  enclosedChar: '"' // default is an empty string
}

class AwinSource {
  constructor(api, { apiKey, apiEndpoint, fids, columns, language, adultcontent }) {
    this.apiKey = apiKey
    this.apiEndpoint = apiEndpoint || 'https://productdata.awin.com/datafeed/download/'
    this.language = language || 'de'
    this.adultcontent = adultcontent || '0'
    this.columns = columns || [
      'aw_deep_link',
      'product_name',
      'aw_product_id',
      'merchant_product_id',
      'merchant_image_url',
      'description',
      'merchant_category',
      'search_price',
    ]
    this.fids = fids

    api.loadSource(async ({ addCollection, addSchemaTypes }) => {
      return await this.loadCollections(addCollection, addSchemaTypes)
    })
  }

  async loadCollections(addCollection, addSchemaTypes) {

    const typeName = 'AwinProduct'
    const fid = this.fids.join(',')

    let schema = `
      type ${typeName} implements Node {
        id: ID!
        ${this.columns.map(c => `${c.replace(/:/g, '_').toLowerCase()}: String`)}
      }
    `

    addSchemaTypes(schema)

    const products = addCollection({
      typeName,
    })

    // todo: foreach fid
    const url = [
      this.apiEndpoint,
      'apikey/' + this.apiKey + '/',
      'language/' + this.language + '/',
      'fid/' + fid + '/',
      'adultcontent/' + this.adultcontent + '/',
      'columns/' + this.columns.join(',') + '/',
      'format/csv/delimiter/%2C/compression/gzip/',
    ].join('')

    return await new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url,
        responseType: 'stream',
        options: { headers: { 'Accept-Encoding': 'gzip,deflate' } },
      })
        .then(response => {
          let csvStream = csv.createStream({ ...csvOptions, columns: this.columns })
          response.data
            .pipe(zlib.createGunzip())
            .pipe(csvStream)
            .on('error', (error) => {
              console.error(error)
              reject(error)
            })
            .on('data', (product) => {
              product = Object.keys(product).reduce((acc, propKey) => {
                acc[propKey.replace(/:/g, '_').toLowerCase()] = product[propKey]
                return acc
              }, {})
              products.addNode({
                ...product
              })
            })
            .on('end', () => {
              resolve()
            })
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })
  }
}

module.exports = AwinSource