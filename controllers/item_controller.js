const Item = require('../models/item')
const Category = require('../models/category')

let itemController = {
  new: (req, res, next) => {
    Category.find({})
            .populate('family')
            .exec(function (err, foundCategories) {
              if (err) {
                return next(err)
              }
              res.render('items/add', {
                allCategories: foundCategories,
                catId: req.query.catId,
                flash: req.flash('flash')[0]
              })
            })
  },

  create: (req, res, next) => {
    Item.create({
      name: req.body.name,
      quantity: req.body.quantity,
      budget: req.body.budget,
      remark: req.body.remark,
      category: req.body.id,
      postedBy: req.body.postedBy
    }, function (err, createdItem) {
      if (err) {
        if (err.name === 'ValidationError') {
          let errMessages = []
          for (field in err.errors) {
            errMessages.push(err.errors[field].message)
          }

          req.flash('flash', {
            type: 'danger',
            message: errMessages
          })
          res.redirect('/items/add')
        }

        return next(err)
      }

      Category.findByIdAndUpdate(req.body.id, {$push: {'items': createdItem}}, function (err) {
        if (err) {
          return next(err)
        }
      })

      res.redirect('/categories/' + req.body.id)
    })
  },

  show: (req, res, next) => {
    Item.findById(req.params.id)
        .populate('category')
        .populate('user')
        .exec(function (err, output) {
          if (err) {
            return next(err)
          }
          res.render('items/show', {item: output})
        })
  },

  edit: (req, res, next) => {
    // Category.find({}, function (err, foundCat) {
    //   if (err) {
    //     return next(err)
    //   }
    Item.findById(req.params.id)
          .populate('category')
          .populate('user')
          .exec(function (err, foundItem) {
            if (err) {
              return next(err)
            }
            res.render('items/edit', {
          // foundCat: foundCat,
              foundItem: foundItem

        // })
            })
          })
  },

  update: (req, res, next) => {
    Item.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      quantity: req.body.quantity,
      budget: req.body.budget,
      remark: req.body.remark,
      status: req.body.status
    },
      {
        new: true
      },
      function (err, foundItem) {
        if (err) {
          return next(err)
        }
        console.log(foundItem)
        res.redirect('/items/' + foundItem.id)
      })
  },

  status: (req, res, next) => {
    Item.findByIdAndUpdate(req.params.id, {
      status: req.query.status
    }, function (err, output) {
      if (err) {
        return next(err)
      }
      res.redirect('back')
    })
  },

  delete: (req, res, next) => {
    Item.findByIdAndRemove(req.params.id, function (err, output) {
      if (err) {
        return next(err)
      }

      Category.findById(output.category, function (err, foundCat) {
        if (err) res.send(err)
        foundCat.items.splice(foundCat.items.indexOf(output.category), 1)
        foundCat.save()
      })

      req.flash('flash', {
        type: 'warning',
        message: 'Deleted an item'
      })
      res.redirect('/categories/' + output.category)
    })
  }
}

module.exports = itemController
