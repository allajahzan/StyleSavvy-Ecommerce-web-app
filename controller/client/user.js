const User = require('../../model/user/user')
const Wallet = require('../../model/user/wallet')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodeMailer = require('../../mail/nodeMailer')
const config = require('../../config/uuid')

// get signinPage
exports.getSignInPage = async (req, res) => {
    if (req.session.signupData) {
        delete req.session.signupData
        delete req.session.referralCode
    }
    if (!req.session.user) {
        return res.render('login')
    }
    res.redirect('/home')
}

// get signUp page
exports.getSignUpPage = async (req, res) => {
    if (req.session.signupData) {
        delete req.session.signupData
    }
    if (!req.session.user) {
        const referralCode = req.query.referralCode
        if (referralCode !== undefined) {
            req.session.referralCode = referralCode
        }
        return res.render('signup')
    }
    res.redirect('/home')
}

// signUp user with email verification
// exports.signUp = async (req, res) => {

//     try {

//         const data = req.body;
//         // generate OTP
//         const otp = nodeMailer.generateOTP()

//         // store datas and otp in session
//         req.session.signupData = data
//         req.session.otp = otp

//         // send OTP to Email
//         nodeMailer.sendEmail(data.email, otp, function (error, info) {
//             if (error) {
//                 return res.status(500).end();
//             }
//         });

//         res.status(200).json({ type: 'success', email: data.email })
//     } catch (err) {
//         console.log(err);
//         res.status(500).end()
//     }
// }

exports.signUp = async (req, res) => {
    
    const data = req.body;

    // generate OTP
    const otp = nodeMailer.generateOTP()

    // store datas and otp in session
    req.session.signupData = data
    req.session.otp = otp

    // send OTP to Email
    nodeMailer.sendEmail(data.email, otp, function (error, info) {
        if (error) {
            return res.status(500).json({ error: "Failed to send email.", type: 'error' });
        }
    });

    res.status(200).json({ type: 'success', email: data.email })
}

// get verify email page

exports.getVerifyEmailPage = async (req, res) => {
    try {

        if (req.session.generatedUUID) {
            delete req.session.generatedUUID
        }

        if (!req.session.signupData) {
            return res.redirect('/signUp')
        }

        res.render('verifyEmail', { email: req.session.signupData.email })

    } catch (err) {
        console.log(err);
        res.render('500')
    }
}


// verify email here
exports.verifyEmail = async (req, res) => {

    // console.log(req.session.referralCode);

    if (!req.session.otp) {
        return res.status(401).json({ msg: "OTP Expired!", type: 'error' })
    }
    else if (Number(req.body.otp) !== req.session.otp) {
        return res.status(401).json({ msg: "Incorect OTP!", type: 'error' })
    } else {

        // store user data in MongoDB
        const data = req.session.signupData

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(data.password, salt)


        const user = new User({ name: data.name, email: data.email, password: hashedPassword, phoneNo: data.phoneNo })
        const newUser = await user.save()

        if (req.session.referralCode) {
            const referralCode = req.session.referralCode
            const user = await User.findOne({ referralCode: referralCode })
            if (user) {
                // wallet of user having the referral code
                let wallet = await Wallet.findOne({ customerId: user._id })
                if (wallet) {

                    wallet.transaction_history.push({
                        amount: 100,
                        type: 'Credited',
                        discription: 'Money added through refferal code'
                    });
                    wallet.balance += 100;
                    await wallet.save();

                } else {

                    wallet = new Wallet({
                        customerId: user._id,
                        transaction_history: [{
                            amount: 100,
                            type: 'Credited',
                            discription: 'Money added through refferal code'
                        }],
                        balance: 100
                    });
                    await wallet.save();
                }
            }

            // wallet for new user

            const wallet = new Wallet({
                customerId: newUser._id,
                transaction_history: [{
                    amount: 50,
                    type: 'Credited',
                    discription: 'Money added through refferal code'
                }],
                balance: 50
            });
            await wallet.save();
        }


        delete req.session.referralCode
        delete req.session.otp
        delete req.session.signupData

        res.status(200).json({ msg: 'Email verified successfully', type: 'success' })
    }

}


// delete OTP
exports.deleteOTP = async (req, res) => {
    delete req.session.otp;
    res.status(204).end()
}

// resend OTP
exports.resendOTP = async (req, res) => {

    try {

        if (!req.session.signupData) {
            return res.status(401).json({ type: 'error' })
        }
        const email = req.session.signupData.email

        // generate OTP
        const otp = nodeMailer.generateOTP()

        // store otp in session
        req.session.otp = otp

        // send OTP to Email
        nodeMailer.sendEmail(email, otp, function (error, info) {
            if (error) {
                return res.status(500).json({ error: "Failed to send email.", type: 'error' });
            }
        });

        res.status(200).json({ type: 'success' })
    } catch (err) {
        console.log(err);
        res.status(500).end()
    }

}

// signIn user
// exports.signIn = async (req, res) => {

//     try {

//         if (req.session.generatedUUID) {
//             delete req.session.generatedUUID
//         }

//         const { email, password } = req.body

//         const user = await User.findOne({ email, isGoogleAuthenticated: false })

//         if (user) {
//             if (user.isBlocked) {
//                 return res.status(401).json({ msg: 'Your account has been blocked by administrator', type: 'blocked' })
//             }
//         }

//         if (!user) {
//             return res.status(401).json({ error_array: [{ msg: 'Incorrect email!', type: 'email' }, { msg: 'Incorrect password!', type: 'password' }], type: 'error' })
//         }

//         const isValidPassword = await bcrypt.compare(password, user.password)
//         if (!isValidPassword) {
//             return res.status(401).json({ error_array: [{ msg: 'Incorrect Password!', type: 'password' }, { type: 'ok_email' }], type: 'error' })
//         }

//         const token = jwt.sign({ id: user._id }, process.env.userSecretCode)
//         req.session.user = token
//         req.session.userName = user.name
//         res.status(200).json({ msg: 'Successfully logged-In', type: 'success' })
//     } catch (err) {
//         console.log(err);
//         res.status(500).end()
//     }
// }

// signIn user
exports.signIn = async (req, res) => {

    try {

        if (req.session.generatedUUID) {
            delete req.session.generatedUUID
        }

        const { email, password } = req.body

        const user = await User.findOne({ email , isGoogleAuthenticated:false})

        if (user) {
            if (user.isBlocked) {
                return res.status(401).json({ msg: 'Your account has been blocked by administrator', type: 'blocked' })
            }
        }

        if (!user) {
            return res.status(401).json({ msg: 'Incorrect email', type: 'email' })
        }


        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
            return res.status(401).json({ msg: 'Incorrect password', type: 'password' })
        }

        const token = jwt.sign({ id: user._id }, process.env.userSecretCode)
        req.session.user = token
        req.session.userName = user.name
        res.status(200).json({ msg: 'Successfully logged In', type: 'success' })
    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}


// google login 

exports.gooleLogin = async (req, res) => {
    try {

        const { email, name } = req.body

        const user = await User.findOne({ email: email, isGoogleAuthenticated: false })
        if (user) {
            return res.status(401).json({ msg: 'Email already exists', type: 'error' })
        }

        const isUser = await User.findOne({ email: email, isGoogleAuthenticated: true })
        if (!isUser) {
            const newUser = new User({ name: name, email: email, isGoogleAuthenticated: true })
            await newUser.save()

            const newU = await User.findOne({ email: email })

            const token = jwt.sign({ id: newU._id }, process.env.userSecretCode)
            req.session.user = token
            req.session.userName = newU.name

            return res.status(200).json({ msg: 'success', type: 'success' })
        }

        if (isUser.isBlocked) {
            return res.status(401).json({ msg: 'Your account has been blocked by administrator', type: 'error' })
        }

        const newU = await User.findOne({ email: email })

        const token = jwt.sign({ id: newU._id }, process.env.userSecretCode)
        req.session.user = token
        req.session.userName = newU.name

        res.status(200).json({ msg: 'success', type: 'success' })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}


// get forgot password page

exports.getForgotPasswordPage = async (req, res) => {
    try {

        if (req.session.generatedUUID) {
            delete req.session.generatedUUID
        }
        res.render('forgotPassword')

    } catch (err) {
        console.log(err);
        res.render('500')
    }
}

// for got password link send to email

exports.sendLinkToEmail = async (req, res) => {
    try {

        const email = req.body.email

        // Email validation
        const emailPattern = /^[A-Za-z0-9._%+-]+@gmail\.com$/;
        if (!emailPattern.test(email.toLocaleLowerCase().trim())) {
            return res.status(401).json({ msg: 'Invalid email format', type: 'email' });
        }
        
        const isUser = await User.findOne({ email: email, isGoogleAuthenticated: false })
        if (!isUser) {
            return res.status(401).json({ msg: 'This email does\'t exists', type: 'email' })
        }


        const generatedUUID = config
        // console.log(generatedUUID);

        req.session.generatedUUID = generatedUUID

        const link = `http://localhost:3000/resetpassword?token=${req.session.generatedUUID}`

        // send OTP to Email
        nodeMailer.resetPassword(email, link, function (error, info) {
            if (error) {
                return res.status(500).json({ error: "Failed to send email.", type: 'error' });
            }
        });

        req.session.resetPasswordEmail = email
        res.status(200).json({ msg: 'Password reset link has been sent to email' })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// reset password

exports.resetPassword = async (req, res) => {
    try {

        const generatedUUID = req.query.token
        if (req.session.generatedUUID !== generatedUUID) {
            delete req.session.generatedUUID
            return res.redirect('/signIn')
        }

        res.render('resetPassword')

    } catch (err) {
        console.log(err);
        res.render('500')
    }
}

// change password

exports.changePassword = async (req, res) => {
    try {

        const { newPassword, cPassword } = req.body

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        const user = await User.findOne({ email: req.session.resetPasswordEmail })
        user.password = hashedPassword
        await user.save()

        delete req.session.resetPasswordEmail

        res.status(200).json({ msg: 'Password changed successfully', type: 'success' })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}