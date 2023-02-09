const express = require('express')
const db = require('../model')
const router = express.Router()
const formidable = require('formidable')
const fs = require('fs')
const path = require('path')

router.get('/', (req, res, next) => {
  if (!req.session.auth) {
    req.flash('login', 'Please log in!!!')
    res.redirect('/login')
  } else {
    res.render('pages/admin', {
      title: 'Admin page',
      msgskill: req.flash('skills')[0],
      msgfile: req.flash('products')[0],
    })
  }
})

router.post('/skills', (req, res, next) => {
  /*
  Saving a new object with skill block values:
    age - Age at which violin lessons started
    concerts - Number of concerts played
    cities - Maximum number of cities in the tour
    years - Years on stage as a violinist
  */

  let validationMsg = ''
  const skillsUpdate = db.get('skills').value()
  for (const [index, [key, value]] of Object.entries(
    Object.entries(req.body)
  )) {
    if (!parseInt(value, 10)) {
      validationMsg = `${key} not set`
    } else if (+value < 0) {
      validationMsg = `Invalid ${key} value`
    } else {
      skillsUpdate[index].number = value
    }

    if (validationMsg.length) {
      req.flash('skills', validationMsg)
      return res.redirect('/admin')
    }
  }

  db.set('skills', skillsUpdate).write()
  req.flash('skills', 'Data was updated successfully!')
  return res.redirect('/admin')
})

router.post('/upload', (req, res, next) => {
  /*
   Saving a product object on the server side with a product image and description:
    photo - Product image
    name - Product name
    price - Product price
  Currently, this information is stored in the data.json file in the products array
  */
  const form = new formidable.IncomingForm()
  const upload = path.join('./public', 'upload')
  if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload)
  }

  form.uploadDir = path.join(process.cwd(), upload)

  form.parse(req, (err, fields, files) => {
    if (err) {
      return next(err)
    }

    const valid = validation(fields, files)
    if (valid.err) {
      fs.unlinkSync(files.photo.filepath)
      req.flash('products', valid.status)
      return res.redirect('/admin')
    }

    const newFilePath = path.join(upload, files.photo.originalFilename)
    fs.rename(files.photo.filepath, newFilePath, (err) => {
      if (err) {
        console.error(err.message)
        return
      }

      const src = newFilePath.substring(newFilePath.indexOf('\\'))

      const productsUpdate = db.get('products').value()
      const { name, price } = fields
      productsUpdate[productsUpdate.length] = {
        src,
        name,
        price,
      }
      db.set('products', productsUpdate).write()
      req.flash('products', 'Product uploaded successfully')
      return res.redirect('/admin')
    })
  })

  const validation = (fields, files) => {
    if (files.photo.name === '' || files.photo.size === 0) {
      return { status: 'Image not loaded!', err: true }
    }

    if (!fields.name) {
      return { status: 'Product title not set', err: true }
    }
    if (!fields.price) {
      return { status: 'Product price not set', err: true }
    }
    if (
      !parseInt(fields.price, 10) ||
      (parseInt(fields.price, 10) && +fields.price < 0)
    ) {
      return { status: 'Invalid product price value', err: true }
    }

    return { status: 'Ok', err: false }
  }
})

module.exports = router
