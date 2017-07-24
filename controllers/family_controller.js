const Family = require('../models/family')
const User = require('../models/user')

let familyController = {
  new: (req, res, next) => {
    res.render('families/new', {
      flash: req.flash('flash')[0]
    })
  },

  create: (req, res, next) => {
    Family.create({
      name: req.body.name,
      creator: req.body.creator
    }, function (err, output) {
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
          res.redirect('/families/new')
        }
        return next(err)
      }

      res.redirect('/families/list')
    })
  },

  list: (req, res, next) => {
    Family.find(function (err, output) {
      if (err) {
        return next(err)
      }
      if (res.locals.user.family.length > 1) {
        res.render('families/list', {families: output})
      } else if (res.locals.user.family.length === 0) {
        res.redirect('/families/new')
      } else {
        res.redirect('/categories/list')
      }
    })
  },

  show: (req, res, next) => {
    Family.findById(req.params.id)
          .populate('Family')
          .exec(function (err, output) {
            if (err) {
              return next(err)
            }
            User.find({family: req.params.id}, function (err, foundUsers) {
              if (err) return next(err)
              res.render('families/show', {
                family: output,
                users: foundUsers
              })
            })
          })
  },

  edit: (req, res, next) => {
    Family.findById(req.params.id, function (err, output) {
      if (err) {
        return next(err)
      }
      res.render('families/edit', {family: output})
    })
  },

  update: (req, res, next) => {
    Family.findOneAndUpdate(req.params.id, {
      name: req.body.name
    },
      {
        new: true
      },
      function (err, updatedFam) {
        if (err) {
          return next(err)
        }
        res.redirect('/families/' + updatedFam.id)
      })
  },

  delete: (req, res, next) => {
    Family.findByIdAndRemove(req.params.id, function (err, output) {
      if (err) {
        return next(err)
      }
      req.flash('flash', {
        type: 'warning',
        message: 'Deleted a family'
      })
      res.redirect('/families/list')
    })
  },

  members: (req, res, next) => {
    Family.findById(req.params.id, function (err, output) {
      if (err) return next(err)

      res.render('families/add', {
        family: output
      })
    })
  },

  addMember: (req, res, next) => {
    User.findOne({'local.email': req.body.userEmail}, function (err, foundUser) {
      if (err) res.send(err)

      Family.findById(req.params.id, function (err, foundFamily) {
        if (err) res.send(err)

        foundFamily.users.push(foundUser.id)
        foundFamily.save()
        foundUser.family.push(foundFamily.id)
        foundUser.save()
      })
      res.redirect(`/families/${req.params.id}`)
    })
  }
}

module.exports = familyController