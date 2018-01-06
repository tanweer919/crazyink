module.exports = function (req, res, next){
            req.checkBody('username', 'Username is required').notEmpty();
            req.checkBody('username', 'Username must be at least 5 characters long').isLength({min: 5});
            req.checkBody('email', 'Email is required').notEmpty();
            req.checkBody('email', 'Email is invalid').isEmail();
            req.checkBody('password', 'Password is required').notEmpty();
            req.checkBody('password', 'Password must be at least 5 characters long').isLength({min: 5});

            req.getValidationResult()
                .then(function (result){
                    const errors = result.array();
                    const messages = [];
                    errors.forEach(function (error) {
                        messages.push(error.msg);
                    })
                    req.flash('error', messages);
                    res.redirect("/signup")

            })
                .catch(function (err) {
                  return next();
                })
    }
