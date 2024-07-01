const User = require('../../model/user/user')
// const validateUser = async (req, res, next) => {

//     const namePattern = /^[A-Za-z]+( [A-Za-z]+)*$/;
//     const emailPattern = /^[A-Za-z0-9._%+-]+@gmail\.com$/;
//     const phoneNoPattern = /^[1-9][0-9]{9}$/;
//     const passEmptyPattern = /^\S+$/;
//     const passwordPattern = /^(?!.*\s).{8,16}$/;

//     const { name, email, password, cpassword, phoneNo } = req.body;

//     let error_array = []
//     // Name Validation
//     if (!namePattern.test(name.trim())) {
//         error_array.push({ msg: 'Invalid name, Enter only alhpabets!', type: 'name' });
//     }else{
//         error_array.push({type: 'ok_name' , msg:'success'});
//     }

//     const data = req.body;
//     const isUser = await User.findOne({ email: data.email })
//     // Email validation
//     if (!emailPattern.test(email.toLocaleLowerCase().trim())) {
//         error_array.push({ msg: 'Invalid email, Enter the email of format abc@gmail.com!', type: 'email' });
//     }else if (isUser) {
//         error_array.push({ msg: "This email already exists!", type: 'email' })
//     }else{
//         error_array.push({type: 'ok_email', msg:'success' });
//     }

//     // PhoneNo validation
//     if (!phoneNoPattern.test(phoneNo.trim())) {
//         error_array.push({ msg: 'Invalid phone number, Enter a valid 10 digits phone number!', type: 'phoneNo' });
//     }else{
//         error_array.push({type: 'ok_phone' , msg:'success'});
//     }

//     // Password Validation if password is not undefined
//     if (!passEmptyPattern.test(password.trim())) {
//         error_array.push({ msg: 'Invalid password, Enter a strong password of length 8-16!', type: 'password' });
//     }else if (!passwordPattern.test(password.trim())) {
//         error_array.push({ msg: 'Invalid password, Enter a strong password of length 8-16!', type: 'password' });
//     }else if (email === password) {
//         error_array.push({ msg: 'Password shouldn\'t be same as email!', type: 'password' });
//     }else{
//         error_array.push({type: 'ok_p1' , msg:'success'});
//     }

//     // Password Validation foe confirm password

//     if (cpassword !== password) {
//         error_array.push({ msg: 'Password doesn\'t match!', type: 'cpassword' });
//     }
//     else{
//         error_array.push({type: 'ok_p2' , msg:'success'});
//     }
 

//     const newArry = error_array.filter((err)=>{return err.msg !== 'success'})

//     if(newArry.length > 0){
//         return res.status(401).json({type:'error', error_array})
//     }

//     next()
// }

// module.exports = validateUser;

const validateUser = async (req, res, next) => {

    const namePattern = /^[A-Za-z]+( [A-Za-z]+)*$/;
    const emailPattern = /^[A-Za-z0-9._%+-]+@gmail\.com$/;
    const phoneNoPattern = /^[1-9][0-9]{9}$/;
    const passEmptyPattern = /^\S+$/;
    const passwordPattern = /^(?!.*\s).{8,16}$/;

    const { name, email, password, cpassword, phoneNo } = req.body;


    // Name Validation
    if (!namePattern.test(name.trim())) {
        return res.status(401).json({ msg: 'Invalid name', type: 'name' });
    }

    const data = req.body;

    const isUser = await User.findOne({ email: data.email })
    if (isUser) {
        return res.status(401).json({ msg: "Email already exists", type: 'email' })
    }

    // Email validation
    if (!emailPattern.test(email.toLocaleLowerCase().trim())) {
        return res.status(401).json({ msg: 'Invalid email format', type: 'email' });
    }

    // PhoneNo validation
    if (!phoneNoPattern.test(phoneNo.trim())) {
        return res.status(401).json({ msg: 'Invalid phone number', type: 'phoneNo' });
    }

    // Password Validation if password is not undefined
    if (!passEmptyPattern.test(password.trim())) {
        return res.status(401).json({ msg: 'Invalid password', type: 'password' });
    }

    // Password Validation if password is not undefined
    if (!passwordPattern.test(password.trim())) {
        return res.status(401).json({ msg: 'Password length must be 8-16', type: 'password' });
    }

    if (email === password) {
        return res.status(401).json({ msg: 'Password shouldn\'t be same as email ', type: 'password' });
    }

    if (cpassword !== password) {
        return res.status(401).json({ msg: 'Password doesn\'t match', type: 'cpassword' });
    }

    next()
}

module.exports = validateUser;