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
  constructor(api, { apiKey, apiEndpoint, feeds }) {
    this.apiKey = apiKey
    this.apiEndpoint = apiEndpoint || 'https://productdata.awin.com/datafeed/download/'
    this.feeds = feeds

    api.loadSource(async ({ addCollection, addSchemaTypes }) => {
      return await this.loadCollections(addCollection, addSchemaTypes)
    })
  }

  async loadCollections(addCollection, addSchemaTypes) {

    const typeName = 'Awin' + this.feeds[0].typeName || 'AwinProduct'
    const language = this.feeds[0].language || 'de'
    const fid = this.feeds[0].fid || 'de'
    const adultcontent = this.feeds[0].adultcontent || '0'
    const columns = this.feeds[0].columns || [
      'aw_product_id',
      'aw_deep_link',
      'product_name',
    ]

    let schema = `
      type ${typeName} implements Node {
        id: ID!
        ${columns.map(c => `${c}: String`)}
      }
    `
    // addSchemaTypes([
    //   schema.createObjectType({
    //     name: 'Post',
    //     interfaces: ['Node'],
    //     fields: {
    //       title: 'String'
    //     }
    //   })
    // ])

    addSchemaTypes(schema)

    const products = addCollection({
      typeName,
    })

    const url = [
      this.apiEndpoint,
      'apikey/' + this.apiKey + '/',
      'language/' + language + '/',
      'fid/' + fid + '/',
      'adultcontent/' + adultcontent + '/',
      'columns/' + columns.join(',') + '/',
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
          let csvStream = csv.createStream({ ...csvOptions, columns })
          response.data
            .pipe(zlib.createGunzip())
            .pipe(csvStream)
            .on('error', (err) => {
              console.error(err)
              reject(error)
            })
            .on('data', (product) => {
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